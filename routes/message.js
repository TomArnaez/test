const express = require('express');
const router = express.Router();
const db = require('../database.js');
const generateUniqueId = require('generate-unique-id');
const email = require('./email.js');


/* GET Message page. */
router.get('/message', async (req,res) => {
    if(req.isAuthenticated()) {
        res.render('user_message', {message: await getUserMessage(req.user)});
    }
    else{
        res.render('login');
    }
});

/* GET Message Admin Panel. */
router.get('/admin/message', async (req,res) => {
    if(req.isAuthenticated()){

        res.render('admin_message', {message: await getMessages()});
    }
    else {
        res.render('login');
    }
});

/* GET all messages */
router.get('/admin/message/all', async (req,res) => {
    if(req.isAuthenticated()){

        res.render('admin_message', {message: await getAllMessages()});
    }
    else {
        res.render('login');
    }
});

/* Save messages in the database */
router.post('/message/send', (req,res) => {
    const customID = getUniqueID();
    const currentTime = getTime();

    db.query("INSERT INTO messages VALUE (DEFAULT,? ,? ,? ,? ,?,NULL,NULL, 0)",
        [req.user ,customID, `${req.body.title}`,`${req.body.message}`, currentTime ], (err, result)=> {
        if (err) {
            req.flash('error_msg', 'No database connection.');
            res.redirect("/message");
        }
        else{
            req.flash('success_msg', 'Your Message Has Been Sent, Your Unique ID is:  '.concat(customID));
            res.redirect("/message");
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
    let post = 0;
    if(`${req.body.post}` == 'post') post = 1;


    db.query("UPDATE messages SET response = ?, response_time = ?, is_public = ? WHERE custom_id = ?",
        [`${req.body.message}`, currentTime, post, `${req.body.id}`], (err, result)=>{
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
                            if(`${req.body.id}`== ''){
                                email.sendEmail(userEmail, 'Answer to your message: '.concat(`${req.body.id}`),
                                    `${req.body.message}`);
                            }
                            else
                            {
                                email.sendEmail(userEmail, 'Answer to your message: '.concat(`${req.body.id}`),
                                    `${req.body.message}`, `${req.body.ccEmail}`);
                            }
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