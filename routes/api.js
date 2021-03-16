var express = require('express');
var router = express.Router();

const posts = require('../controllers/post.controller.js');

router.get('/posts', posts.findAll);
router.get('/posts/:id', posts.findOne);

module.exports = router;