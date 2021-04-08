const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();
const config = require('../config/config.js');


/* Configuring the nodemailer setup */
let transporter = nodemailer.createTransport({
    // service: 'gmail',
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,

    auth: {
        user: config.email.username, //username
        pass: config.email.password  // password
    },
    tls:{
        rejectUnauthorized:false  //bypass the security in localhost
    }
});


/* GET Contact page. */
router.get('/contact', (req, res) =>{
  res.render('contact', {title: 'E-mail us', active:'contact'});
});

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* Contact Us page */
router.post('/contact/send', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const title = req.body.title;
    const messageBody = req.body.message;
    const regexEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    const regexPhone = /^[0-9]*\d$/

    if(name.length >= 5 && regexEmail.test(email) && regexPhone.test(phone) && title.length >= 5 && messageBody.length >= 20){
        const message = `
        <p>You have a new contact request</p>
        <h3>Contact Details</h3>
        <ul>
          <li>Name: ${name}</li>
          <li>Email: ${email}</li>
          <li>Phone: ${phone}</li>
        </ul>
        <h3>Message</h3>
        <h4>${title}</h4>
        <p>${messageBody}</p>
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
    }else{
        req.flash('error_msg', 'Invalid Input');
        res.redirect("/contact");
    }
});

/*
 * send confirmation email
 */
router.sendConfirmationEmail = function sendConfirmationEmail(name, receiver, resetLink){
    const message = `
    <h2>Hello ${name}.</h2>
    <h3>Welcome to INFORMATION HUB</h3>
    <h3>Please Set Your Password Using The Link Below:</h3>
    <p>${resetLink}</p>
  `;

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Information Hub" <informationhub.kings@gmail.com>', // sender address
        to: receiver,
        subject: 'Confirm Registration', // Subject
        text: 'Nothing for now!', // text body
        html: message // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) return console.log(error);

        console.log('Message has been sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        req.flash('success_msg', 'Your Message Has Been Sent!!!');
    });
}

/*
 *  Send email
 *  you can have a list of receivers in a string separated by ','
 *  you can use html as the message body
 *  you can also cc and bcc someone if you wish to
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
