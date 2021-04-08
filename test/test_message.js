//Make sure the env variable is set to test
process.env.NODE_ENV = 'test';

//Check app 'compiles' (Will fail if any syntax error in files)
let app = require('../app');

//Require the dev-dependencies
let request = require('supertest');
const generateUniqueId = require('generate-unique-id');

let chai = require('chai');
let chaiHttp = require('chai-http');

const should = chai.should();
chai.use(chaiHttp);


describe('Messages', ()  => {
  const credentials = {
    username: 'tom',
    password: 'password'
  }
  var user;
  before(function (done) {
    user = request.agent(app)
    user
        .post('/admin/login')
        .send(credentials)
        .end(function (err, res) {
          done();
        })
  });

  describe('/POST message', () => {
    const body = {
      title: "Teage",
      message: "Test Message Content Test Test  Test TEst Test TEst Test",
    }
    it("it should POST a single message", (done) => {
      user
          .post('/message/send')
          .send(body)
          .end((err, res) => {
            done();
          });
    })
  });
})