var express = require('express');
var router = express.Router();
// const path = require('path');
const bodyParser = require('body-parser');
const expressHdl = require('express-handlebars');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/* GET Contact page. */
router.get('/contact', function(req, res) {
  res.render('test.html');
});



// View engine setup
app.engine('handlebars', expressHdl());
app.set('view engine', 'handlebars');


// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.post('/send', (req, res) => {
  const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>Name: ${req.body.name}</li>
      <li>Company: ${req.body.company}</li>
      <li>Email: ${req.body.email}</li>
      <li>Phone: ${req.body.phone}</li>
    </ul>
    <h3>Message</h3>
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
    from: '"Information Hub Contact Centre" <informationhub.kings@gmail.com>', // sender address
    to: 'test@test.com, informationhub.kings@gmail.com, info@shahrestani.co.uk', // list of receivers
    subject: 'Contact Form', // Subject
    text: 'Nothing for now!', // text body
    html: output // html body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return console.log(error);

    console.log('Message has been sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    res.render('contact', {msg:'Email has been sent'});
  });
});


module.exports = router;
