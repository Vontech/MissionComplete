import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import {prepareServer, teardownServer, testUser, basicToken, testUserAuth, getTestUserClone, getTestAuthClone, withLogin, app} from '../utils';

import Users from '../../models/users.model';
import Tokens from '../../models/tokens.model';

const { expect, assert } = chai;
const should = chai.should();

chai.use(chaiHttp);
chai.use(chaiAsPromised);

describe('Users', () => {

    before((done) => { prepareServer(done); });

    describe('user creation and auth flow', () => {

        it('POST /api/users', (done) => {
            chai.request(app)
                .post('/api/users')
                .send(testUser)
                .end((err, res) => {
                    if (err) return done(err);
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('User with username \'mocha\' has been created');
                    Users.find({username: testUser.username}, (err, res) => {
                        if (err) return done(err);
                        res.length.should.be.equal(1);
                        done();
                    });
                  });
        });

        it('POST /api/users (duplicate error)', (done) => {
            chai.request(app)
                .post('/api/users')
                .send(testUser)
                .end((err, res) => {
                    if (err) return done(err);
                    res.should.have.status(409);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').contains('exists');
                    done();
                  });
        });

        it('POST /api/users (invalid email)', (done) => {
            let badUser = getTestUserClone();
            badUser['email'] = "yolo";
            chai.request(app)
                .post('/api/users')
                .send(badUser)
                .end((err, res) => {
                    if (err) return done(err);
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').contains('email');
                    res.body.should.have.property('message').contains('valid');
                    done();
                  });
        });

        it('POST /api/users (mismatched passwords)', (done) => {
            let badUser = getTestUserClone();
            badUser['passwordConf'] = "yolo";
            chai.request(app)
                .post('/api/users')
                .send(badUser)
                .end((err, res) => {
                    if (err) return done(err);
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').contains('match');
                    done();
                  });
        });

        it('POST /api/users (missing fields)', (done) => {
            let badUser = getTestUserClone();
            delete badUser['email'];
            chai.request(app)
                .post('/api/users')
                .send(badUser)
                .end((err, res) => {
                    if (err) return done(err);
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').contains('email');
                    done();
                  });
        });

        it('POST /oauth/token', (done) => {
            chai.request(app)
                .post('/oauth/token')
                .set('content-type', 'application/x-www-form-urlencoded')
                .set('Authorization', `Basic ${basicToken}`)
                .send(testUserAuth)
                .end((err, res) => {
                    if (err) return done(err);
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('token_type').eql('Bearer');
                    res.body.should.have.property('access_token');
                    res.body.should.have.property('refresh_token');
                    Tokens.find({accessToken: res.body.access_token}, (err, res) => {
                        if (err) return done(err);
                        res.length.should.be.equal(1);
                        done();
                    });
                  });
        });

        it('POST /oauth/token (invalid password)', (done) => {
            let badAuth = getTestAuthClone();
            badAuth['password'] = "yolo";
            chai.request(app)
                .post('/oauth/token')
                .set('content-type', 'application/x-www-form-urlencoded')
                .set('Authorization', `Basic ${basicToken}`)
                .send(badAuth)
                .end((err, res) => {
                    if (err) return done(err);
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error_description');
                    res.body.should.have.property('error_description').contains('invalid')
                    done();
                  });
        });

        it('POST /oauth/token (duplicate key)', (done) => {
            chai.request(app)
                .post('/oauth/token')
                .set('content-type', 'application/x-www-form-urlencoded')
                .set('Authorization', `Basic ${basicToken}`)
                .send(testUserAuth)
                .end((err, res) => {
                    if (err) return done(err);
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('token_type').eql('Bearer');
                    res.body.should.have.property('access_token');
                    res.body.should.have.property('refresh_token');
                    Tokens.find({accessToken: res.body.access_token}, (err, tres) => {
                        if (err) return done(err);
                        tres.length.should.be.equal(1);
                        done();
                    });
                  });
        });

    });

    describe('user logout', () => {

        it('POST /api/s/logout', (done) => {
            withLogin(chai.request(app).post('/api/s/logout'), req => {
                req.end((err, res) => {
                        if (err) return done(err);
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        Tokens.find({accessToken: req.accessToken}, (err, res) => {
                            if (err) return done(err);
                            res.length.should.be.equal(0);
                            done();
                        });
                    })
            });  
        });

    });

    after((done) => { teardownServer('users', done); });

});