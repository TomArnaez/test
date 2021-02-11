var express = require('express');
var router = express.Router();
// const path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


// app.use(express.urlencoded({
//   extended: false
// }));
// app.use(express.json());

//
// app.post('/email', (req, res) => {
//   // send the email
//   res.json({message: 'WE GOT YOUR MESSAGE'})
// });



/* GET Messenger page. */
router.get('/messenger', function(req, res) {
  res.render('messenger');
});

module.exports = router;
