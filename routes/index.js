var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();
// const path = require('path');
// const path = require('path');


/* GET home page. */
router.get('/', function(req, res, next) {
  getDatabaseVersion().then(function (result){
    res.render('index', { title: 'Express' , databaseVersion: result });
  });
});


/* GET Contact page. */
router.get('/contact', function(req, res) {
  res.render('contact');
});



// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


router.post('/send', (req, res) => {
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

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'informationhub.kings@gmail.com', //username
      pass: 'cpointisthebest'  // password
    },
    tls:{
      rejectUnauthorized:false  //bypass the security in localhost
    }
  });

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

    res.render('index' , {title: 'Your Message Has Been Sent!!!'}); // to be changed
  });
});


module.exports = router;

function getDatabaseVersion() {
  var db = require('../database.js');
  return new Promise(function (resolve, reject){
    db.query("SELECT VERSION() as VER", function (err, result) {
      if (err) reject(err);
      resolve(result[0].VER);
    });
  });
}