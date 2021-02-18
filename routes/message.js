const express = require('express');
const router = express.Router();
const generateUniqueId = require('generate-unique-id');



/* GET Message page. */
router.get('/message', function(req, res) {
    res.render('message');
});

router.post('/message/send', function(req,res){
    res.render('message', { message: 'Your Message Has Been Sent' , refNumber: getUniqueID() });

    //store the message in the database
    //store the reference in the database
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



module.exports = router;

