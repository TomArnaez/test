//Make sure the env variable is set to test
process.env.NODE_ENV = 'test';

//Check app 'compiles' (Will fail if any syntax error in files)
let app = require('../app');

//Require the dev-dependencies
let request = require('supertest');
let chai = require('chai');
let chaiHttp = require('chai-http');

const should = chai.should();
chai.use(chaiHttp);

describe('Posts', ()  => {
  let id = 0;
  describe('/POST term', () => {
    it("it should POST a single post", (done) => {
      const post = {
        title: "testTitle",
        html: "<p>Test</p>",
        description: "basic",
        author_id: 10,
        category: 2
      }
      chai.request(app)
          .post('/api/posts')
          .send(post)
          .end((err, res) => {
            res.should.have.status(201);
            res.body.should.have.property('data');
            res.body.should.have.property('message');
            res.body.should.have.property('statusType').eq('success');
            id = res.body.data.id;
            done();
          });
    })
  });

  describe('/PUT post', () => {
    it("it should update a single post's title, html and description", (done) => {
      const update = {
        id: id,
        title: "titleNewTitle",
        html: "<p>NewTest</p>",
        description: "heyaya",
      }
      chai.request(app)
          .put('/api/posts')
          .send(update)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.property('data');
            res.body.should.have.property('message');
            res.body.should.have.property('statusType').eq('success');
            res.body.data.should.property('title').eq(update.title);
            res.body.data.should.property('html').eq(update.html);
            res.body.data.should.property('description').eq(update.description);
            done();
          })
    })
  });

  describe('/DELETE post', () => {
    it("it should DELETE a single post", (done) => {
      chai.request(app)
          .delete('/api/posts/' + id)
          .end((err, res) => {
            console.log("post_id: " + id)
            res.should.have.status(200);
            res.body.should.have.property('data');
            res.body.should.have.property('message');
            res.body.should.have.property('statusType').eq('success');
            done();
          })
    })
  });
});