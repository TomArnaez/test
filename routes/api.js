var express = require('express');
var router = express.Router();

const posts = require('../controllers/post.controller.js');
const terms = require('../controllers/term.controller.js');

router.get('/posts', posts.findAll);
router.get('/posts/:id', posts.findOne);
router.delete('/posts/:id', posts.delete);
router.get('/terms/:id', terms.findOne);
router.get('/terms', terms.findAll);
router.post('/terms', terms.create);
router.delete('/terms/:id', terms.delete);

module.exports = router;