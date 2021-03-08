const express = require('express');
const router = express.Router();
const db = require('../database.js');
const generateUniqueId = require('generate-unique-id');
let message = null;
const email = require('./email.js');


/* GET Message page. */
router.get('/message', function(req, res) {
    if(req.isAuthenticated()) {
        res.render('message', {user_id: req.user});
    }
    else{
        res.redirect('admin/login')
    }
});

/* GET Message Admin Panel. */
getMessages().then(()=>{
    router.get('/admin/message', async function(req,res)
    {
        if(req.isAuthenticated()){
            res.render('admin_message', {message: message});
        }
        else
        {
            res.render('login');
        }
    });
})

// save messages in the database
router.post('/message/send', function(req,res){
    const customID = getUniqueID();
    const currentTime = getTime();

    db.query("INSERT INTO messages VALUE (DEFAULT,? ,? ,? ,? ,?,NULL,NULL, 0)",
        [req.user ,customID, `${req.body.title}`,`${req.body.message}`, currentTime ], function (err, result){
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


router.post('/admin/message/send', function(req,res){
    const currentTime = getTime();
    let userEmail = '';
    let post = 0;
    if(`${req.body.post}` == 'post') post = 1;


    db.query("UPDATE messages SET response = ?, response_time = ?, is_public = ? WHERE custom_id = ?",
        [`${req.body.message}`, currentTime, post, `${req.body.id}`], function (err, result){
            if (err) {
                req.flash('error_msg', 'No database connection.');
                res.redirect("/admin/message");
            }
            else {
                db.query("SELECT user_email FROM messages JOIN users ON messages.user_id = users.id WHERE custom_id = ?", [`${req.body.id}`], function (err, result) {
                    if (err) {
                    } else {
                        userEmail = result[0].user_email;
                        if(userEmail == '')
                        {
                            req.flash('error_msg', `Email Wasn't sent :(`);
                        }else
                        {
                            email.sendEmail(userEmail, 'Answer to your message: '.concat(`${req.body.id}`), `${req.body.message}`);
                        }
                    }
                });

                req.flash('success_msg', 'Your Message Has Been Sent');
                res.redirect("/admin/message");
            }
        });
});


async function getMessages(){

    await db.query("SELECT * FROM messages WHERE response IS NULL", function(err, result)
    {
        if(err) throw err
        if(result.length > 0)
            message = result;
        else message = null;
    });
}

// generating unique id for the users
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
