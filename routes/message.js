const express = require('express');
const router = express.Router();
const db = require('../database.js');
const generateUniqueId = require('generate-unique-id');
let message = null;

/* GET Message page. */
router.get('/message', function(req, res) {
    res.render('message');
});

/* GET Message Admin Panel. */
getMessages().then(()=>{
    router.get('/admin/message', async function(req,res)
    {
        res.render('admin_message', {message: message});
    });
})

// save messages in the database
router.post('/message/send', function(req,res){
    const customID = getUniqueID();
    const currentTime = getTime();
    let email = null;
    if(`${req.body.email}` !== '') { email = `${req.body.email}`; }

    db.query("INSERT INTO messages VALUE (DEFAULT,? ,? ,? ,? ,?,NULL,NULL)",
        [customID, email, `${req.body.title}`,`${req.body.message}`, currentTime ], function (err, result){
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
