var express = require('express');
var router = express.Router();

const posts = require('../controllers/post.controller.js');

router.get('/posts', posts.findAll);

module.exports = router;