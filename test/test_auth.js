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

const validUserCredentials = {
    username: 'tom',
    password: 'password'
}

const invalidUserCredentials = {
  username: 'tom',
  password: 'password2'
}

describe('Pages', () => {
    var authenticatedUser;
    var badLoginUser;
    before(function (done) {
        authenticatedUser = request.agent(app)
        authenticatedUser
            .post('/admin/login')
            .send(validUserCredentials)
            .end(function (err, res) {
              done();
            })
    });

    describe('Term Manager', () => {
        it("It should return status 200", (done) => {
            authenticatedUser
                .get('/admin/terms')
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                })

        })
    });

    describe('Ask Question', ()  => {
        it("It should return status 200", (done) => {
            authenticatedUser
                .get('/message')
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                })
        })
    });

    describe('New Post', ()  => {
        it("It should return status 200", (done) => {
            authenticatedUser
                .get('/edit/new')
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                })
        })
    });
    describe('Admin Dashboard', ()  => {
      it("It should return status 200", (done) => {
        authenticatedUser
            .get('/admin/dashboard')
            .end((err, res) => {
              res.should.have.status(200);
              done();
            })

      });
    });

    describe('Respond To Questions', ()  => {
        it("It should return status 200", (done) => {
            authenticatedUser
                .get('/admin/message')
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                })
        })
    });
    describe('Respond To Questions', ()  => {
        it("It should return status 200", (done) => {
            authenticatedUser
                .get('/message/new')
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                })
        })
    });
    describe('Media Manager', ()  => {
        it("It should return status 200", (done) => {
            authenticatedUser
                .get('/admin/media')
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                })
        })
    });
})

