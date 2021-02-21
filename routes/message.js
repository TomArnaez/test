const express = require('express');
const router = express.Router();
const db = require('../database.js');
const generateUniqueId = require('generate-unique-id');


/* GET Message page. */
router.get('/message', function(req, res) {
    res.render('message');
});


router.post('/message/send', function(req,res){
    const customID = getUniqueID();
    const currentTime = getTime();
    let email = null;
    if(`${req.body.email}` !== '') { email = `${req.body.email}`; }

    db.query("INSERT INTO messages VALUE (DEFAULT,? ,? ,? ,?)",
        [customID, email, `${req.body.message}`, currentTime ], function (err, result){
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


// generating unique id for the users
function getUniqueID(){
    const reference = 'RE'
    const id = generateUniqueId({
        excludeSymbols: ['0'],
        length: 7,
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


module.exports = router
