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

describe('Pages', () => {
    var authenticatedUser;
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
        })
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

describe('Terms', ()  => {
    let id = 0;
    describe('/POST term', () => {
        it("it should POST a single term", (done) => {
            const term = {
                termName: "testTag",
                termType: "category",
                description: "basic",
                termSlug: "basic-description"
            }
            chai.request(app)
                .post('/api/terms')
                .send(term)
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
    describe('/GET terms', () => {
        it("it should GET all the terms", (done) => {
            chai.request(app)
                .get('/api/terms')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array')
                    res.body[0].should.be.a('object');
                    res.body[0].should.have.property("posts");
                    done();
                })
        });
    });
    describe('/GET term', () => {
        it("it should GET a single term", (done) => {
            chai.request(app)
                .get('/api/terms/' + id)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property("posts");
                    done();
                })
        })
    });

    describe('/DELETE term', () => {
        it("it should DELETE a single term", (done) => {
            chai.request(app)
                .delete('/api/terms/' + id)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('data');
                    res.body.should.have.property('message');
                    res.body.should.have.property('statusType').eq('success');
                    done();
                })
        })
    });
})