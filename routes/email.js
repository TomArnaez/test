const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();
const config = require('../config/config.js');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.email.username, //username
        pass: config.email.password  // password
    },
    tls:{
        rejectUnauthorized:false  //bypass the security in localhost
    }
});

/* GET Contact page. */
router.get('/contact', function(req, res) {
    res.render('contact');
});

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



router.post('/contact/send', (req, res) => {
    const message = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>
      <li>Name: ${req.body.name}</li>
      <li>Email: ${req.body.email}</li>
      <li>Phone: ${req.body.phone}</li>
    </ul>
    <h3>Message</h3>
    <h4>${req.body.title}</h4>
    <p>${req.body.message}</p>
  `;

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Information Hub" <informationhub.kings@gmail.com>', // sender address
        to: 'informationhub.kings@gmail.com', // list of receivers
        subject: `${req.body.title}`, // Subject
        text: 'Nothing for now!', // text body
        html: message // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) return console.log(error);

        console.log('Message has been sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        req.flash('success_msg', 'Your Message Has Been Sent!!!');
        res.redirect("/contact");
    });
});



/*
 *  Send email
 *  in order to use this method, const email = require('./email.js'), then do email.sendEmail(a,b,c)
 *  where a is the list of receivers in a sting, b is the title of the message and c is the actual message
 *  you can use html as the message body
 * you can also cc someone if you wish
 */
router.sendEmail = function sendEmail(receiver, title, message, cc, bcc){

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Information Hub" <informationhub.kings@gmail.com>', // sender address
        to: receiver, // list of receivers
        cc: cc,
        bcc: bcc,
        subject: title, // Subject
        text: 'Nothing for now!', // text body
        html: message // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) return console.log(error);

        console.log('Message has been sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    });
}


module.exports = router;