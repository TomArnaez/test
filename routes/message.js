const express = require('express');
const router = express.Router();
const generateUniqueId = require('generate-unique-id');



/* GET Message page. */
router.get('/message', function(req, res) {
    res.render('message');
});

router.post('/message/send', function(req,res){
    var emailReceipt = '';
    if(`${req.body.email}` !== '') {
        emailReceipt = 'your email is: '.concat(`${req.body.email}`);
    }
    // res.render('message', { message: 'Your Message Has Been Sent' , refNumber: getUniqueID(), refEmail: emailReceipt });

    req.flash('success_msg', 'Message Sent!');
    res.redirect("/message");

    //store the reference in the database
    //store the email in the database
    //store the message in the database
    //store the time in the database

});

function getUniqueID(){
    const reference = 'RE'
    const id = generateUniqueId({
        excludeSymbols: ['0'],
        length: 7,
        useLetters: false
    }) ;
    return reference.concat(id);
}

function getTime() {
    var date = new Date();
    return date.getTime();
}


module.exports = router;

