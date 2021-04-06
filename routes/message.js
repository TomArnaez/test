const express = require('express');
const router = express.Router();
const db = require('../database.js');
const generateUniqueId = require('generate-unique-id');
const email = require('./email.js');


/* GET Message page. */
router.get('/message', async (req,res) => {
    if(req.isAuthenticated()) {
        res.render('user_message', {title: 'Your Questions', message: await getUserMessage(req.user), active:'your questions'});
    }
    else{
        res.render('login');
    }
});

// Gets page to display response to a message
router.get('/message/response/:custom_id', async (req, res) => {
  if(req.isAuthenticated()) {
    db.query("SELECT * FROM messages JOIN users ON messages.author_id = users.id WHERE ? IN (custom_id) LIMIT 1;", [req.params.custom_id], function(err, result) {
        //Error handling for database connection. Reroutes user to posts index (most likely the origin)
        if (err) {
          console.log('Error connecteing with database');
          req.flash('error_msg', 'Failed to connect to database: ' + err);
          res.redirect('/admin/message');
        } else {
          //Checks if post with provided ID exists in the database. If true, then renders edit page
          if (result.length != 0) {
            res.render('question_response', {title: 'View Response', question: result});

          //Redirects user to posts index if no post exists
          } else {
            console.log('No message with id: \'' + req.params.custom_id + '\' in database');
            res.redirect('/admin/message');
          }
        }
    })
  } else {
    res.redirect('admin/login');
  }
})

// Gets page for admin to forward question
router.get('/admin/respond/forward/:custom_id', async (req, res) => {
  if(req.isAuthenticated()) {
    db.query("SELECT * FROM messages WHERE ? IN (custom_id) LIMIT 1;", [req.params.custom_id], function(err, result) {
        //Error handling for database connection. Reroutes user to posts index (most likely the origin)
        if (err) {
          console.log('Error connecteing with database');
          req.flash('error_msg', 'Failed to connect to database: ' + err);
          res.redirect('/admin/message');
        } else {
          //Checks if post with provided ID exists in the database. If true, then renders edit page
          if (result.length != 0) {
            res.render('forward_message', {title: 'View Response', question: result, active: 'respond questions'});

          //Redirects user to posts index if no post exists
          } else {
            console.log('No message with id: \'' + req.params.custom_id + '\' in database');
            res.redirect('/admin/message');
          }
        }
    })
  } else {
    res.redirect('admin/login');
  }
})

// Gets page to create a new Questions
router.get('/message/new', async (req,res) => {
    if(req.isAuthenticated()) {
        res.render('message', {title: 'Send in a Question for Staff', message: await getUserMessage(req.user), post: null, active:'ask question'});
    }
    else{
        res.render('login');
    }
});

// Gets message response page, for admins to create a public post
router.get('/message/new/:post_id', async (req, res) => {
  if(req.isAuthenticated()) {
      db.query("SELECT * FROM posts WHERE ? IN (id) LIMIT 1;", [req.params.post_id], function(err, result) {
        if (err) {
          req.flash('error_msg', 'Error connecteing with database')
          res.redirect('/feed');
        } else {
          res.render('message', {title: 'Ask Staff about this post', post: result, active:'respond questions'});
        }
      });
  }
  else{
      req.flash('error_msg', 'You are not Authenticated');
      res.render('login');
  }
});

/* GET Message Admin Panel. */
router.get('/admin/message', async (req,res) => {
    if(req.isAuthenticated()){

        res.render('admin_message', {title:'User Questions', message: await getMessages(), active:'respond questions'});
    }
    else {
        res.render('login');
    }
});

// Renders page to allow private response to question
router.get('/admin/post_response/:message_id', async (req, res) => {
    if (req.isAuthenticated()) {

        db.query("SELECT title, message FROM messages WHERE ? IN (custom_id) LIMIT 1;", [req.params.message_id], function(err, result) {
            //Error handling for database connection. Reroutes user to posts index (most likely the origin)
            if (err) {
              console.log('Error connecting with database');
              res.redirect('/edit');
            } else {

              //Checks if post with provided ID exists in the database. If true, then renders edit page
              if (result.length != 0) {
                const doc = '<h2> Question: ' + result[0].message + '</h2> \n <br>';
                res.render('text_editor', {title: 'Post Response', postname: req.params.message_id, doc: doc, back: '/admin/message', active:'respond questions'});

              //Redirects user to posts index if no post exists
              } else {
                console.log('No message with id: \'' + req.params.message_id + '\' in database');
                res.redirect('/admin/message');
              }
            }
        })
    } else {
        res.redirect('admin/login');
    }
});


/* GET all messages */
router.get('/admin/message/all', async (req,res) => {
    if(req.isAuthenticated()){

        res.render('admin_message', {title: 'All Messages', message: await getAllMessages(), active:'all questions'});
    }
    else {
        res.render('login');
    }
});

/* Save messages in the database */
router.post('/message/send', (req,res) => {
    const customID = getUniqueID();
    const currentTime = getTime();
    let public123 = 0;
    if(`${req.body.public}` == 1) public123 = 1;

    db.query("INSERT INTO messages VALUE (DEFAULT,? ,? ,? ,? ,?,NULL,NULL,NULL, ?)",
        [req.user ,customID, `${req.body.title}`,`${req.body.message}`, currentTime, public123 ], (err, result)=> {
        if (err) {
            console.log(err , 'error');
            req.flash('error_msg', 'No database connection.');
            res.redirect("/message");
        }
        else{
            req.flash('success_msg', 'Your Message Has Been Sent, Your Unique ID is:  '.concat(customID));
            res.redirect("/message");
        }
    });
});

// posts a response to a question. from the content_editor page
router.post('/admin/post_response/:message_id', async (req,res) => {
    const currentTime = getTime();
    let userEmail = '';
    const content = req.body.content;
    const postname = req.body.filename;

    db.query("UPDATE messages SET response = ?, response_time = ?, is_public = ?, author_id = ? WHERE custom_id = ?",
        [content.replace( /(<([^>]+)>)/ig, ''), currentTime, 1, req.user, req.params.message_id], (err, result)=> {
            if (err) {
                req.flash('error_msg', 'No database connection.');
                res.redirect("/admin/message");
            } else {
                db.query("SELECT user_email, custom_id FROM messages JOIN users ON messages.user_id = users.id WHERE custom_id = ?",
                    [req.params.message_id], (err, result)=> {
                    if (err) {
                        req.flash('error_msg', 'No database connection.');
                        res.redirect("/admin/message");
                    } else {
                        userEmail = result[0].user_email;

                        if(userEmail == '') {
                            req.flash('error_msg', `Email Wasn't sent :(`);
                        } else {
                            email.sendEmail(userEmail, 'Answer to your message: ' + result[0].cusstom_id,
                                content.replace( /(<([^>]+)>)/ig, ''));

                        }
                    }
                });
            }
        });

        db.query("INSERT INTO posts (title, html, author_id) VALUES (?, ?, ?);", [postname, content, req.user], function(err, result) {

            //Error handling for database connection
            if (err){
              req.flash('error_msg', 'Error connecting to database: ' + err);
              console.log('error connecting for posts: '+ err);
              res.render('text_editor', {title: 'Post Response', postname: postname, doc: content});

            //Redirects user to posts index if upload was successful
            } else {
                req.flash('success_msg', 'Successfully saved post to database');
                console.log('successfully publically posted');
                res.redirect('/admin/message');
            }
        });



});

//Views message and page to send private response back to user.
router.get('/admin/respond/:custom_id', (req, res) => {
    if (req.isAuthenticated()) {
        db.query("SELECT title, message FROM messages WHERE ? IN (custom_id) LIMIT 1;", [req.params.custom_id], function(err, result) {
            //Error handling for database connection. Reroutes user to posts index (most likely the origin)
            if (err) {
              console.log('Error connecting with database');
              res.redirect('/admin/message');
            } else {

              //Checks if post with provided ID exists in the database. If true, then renders edit page
              if (result.length != 0) {
                res.render('message-response', {title: 'Private Response', question:result[0].message, back: '/admin/message', active:'respond questions'});

              //Redirects user to posts index if no post exists
              } else {
                console.log('No message with id: \'' + req.params.custom_id + '\' in database');
                res.redirect('/admin/message');
              }
            }
        })
    } else {
        res.redirect('/admin/login');
    }

})


//for posting private response to a message
router.post('/admin/respond/:custom_id', (req,res) => {
    const currentTime = getTime();
    let userEmail = '';
    console.log('custom id = ' + req.params.custom_id);

    db.query("UPDATE messages SET response = ?, response_time = ?, author_id = ?, is_public =? WHERE custom_id = ?;",
        [req.body.message, currentTime, req.user, 0, req.params.custom_id], (err, result)=>{
            if (err) {
                req.flash('error_msg', 'No database connection.');
                console.log('error coneccting: ' + err);
                res.redirect("/admin/message");
            }
            else {
                db.query("SELECT user_email, custom_id FROM messages JOIN users ON messages.user_id = users.id WHERE custom_id = ?",
                    [req.params.custom_id], (err, result)=> {
                    if (err) {
                      console.log('error conecting second part: ' + err);
                    } else {
                        userEmail = result[0].user_email;

                        if(userEmail == '')
                        {
                            req.flash('error_msg', `Email Wasn't sent :(`);
                            console.log('e-mail failed to send');
                        }else
                        {
                            email.sendEmail(userEmail, 'Answer to your message: '.concat(result[0].title) + ` (${req.params.custom_id})`,
                                `${req.body.message}`, `${req.body.ccEmail}`);

                        }
                    }
                });

                req.flash('success_msg', 'Your Message Has Been Sent');
                console.log('nailed it');
                res.redirect("/admin/message");
            }
        });
});

/*
* Update database with new response result
* and sends email to to author of the message
*/
router.post('/admin/message/send', (req,res) => {
    const currentTime = getTime();
    let userEmail = '';


    db.query("UPDATE messages SET response = ?, response_time = ? WHERE custom_id = ?",
        [req.body.message, currentTime, req.body.id], (err, result)=>{
            if (err) {
                req.flash('error_msg', 'No database connection.');
                res.redirect("/admin/message");
            }
            else {
                db.query("SELECT user_email FROM messages JOIN users ON messages.user_id = users.id WHERE custom_id = ?",
                    [`${req.body.id}`], (err, result)=> {
                    if (err) {
                    } else {
                        userEmail = result[0].user_email;

                        if(userEmail == '')
                        {
                            req.flash('error_msg', `Email Wasn't sent :(`);
                        }else
                        {
                            email.sendEmail(userEmail, 'Answer to your message: '.concat(result[0].title) + ` (${req.body.id})`,
                                `${req.body.message}`, `${req.body.ccEmail}`);

                        }
                    }
                });

                req.flash('success_msg', 'Your Message Has Been Sent');
                res.redirect("/admin/message");
            }
        });
});

/* Gets unresponded messages from database */
function getMessages(){
    return new Promise((resolve, reject)=>{
        db.query("SELECT * FROM messages WHERE response IS NULL", (err, result)=> {
            if (err) throw err
            if (result.length > 0)
                resolve(result);
            else resolve(null);
        });
    });
}

/* Gets all the messages from database */
function getAllMessages(){
    return new Promise((resolve, reject)=>{
        db.query("SELECT * FROM messages", (err, result)=> {
            if (err) throw err
            if (result.length > 0)
                resolve(result);
            else resolve(null);
        });
    });
}

/* Gets the messages for a specific user */
function getUserMessage(userID){
    return new Promise((resolve,reject)=>{
        db.query("SELECT * FROM messages WHERE user_id = ?",[userID], (err, result)=> {
            if(err) throw err
            if(result.length > 0)
            resolve(result);
            else resolve(null);
        });
    });
}

// generating unique id for the messages
function getUniqueID(){
    const reference = 'RE'
    const id = generateUniqueId({
        excludeSymbols: ['0'],
        length: 8,
        useLetters: false
    }) ;
    return reference.concat(id);
}

// getting the current time and converting it to 'datetime' format for MYSQL
function getTime() {
    const date = new Date();
    return date.getFullYear()
            + '-' +
            date.getMonth()
            + '-' +
            date.getDate()
            + ' ' +
            date.getHours()
            + ':' +
            date.getMinutes()
            + ':' +
            date.getSeconds();

}

module.exports = router;
