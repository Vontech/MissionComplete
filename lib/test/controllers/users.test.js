'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _chaiHttp = require('chai-http');

var _chaiHttp2 = _interopRequireDefault(_chaiHttp);

var _chaiAsPromised = require('chai-as-promised');

var _chaiAsPromised2 = _interopRequireDefault(_chaiAsPromised);

var _utils = require('../utils');

var _users = require('../../models/users.model');

var _users2 = _interopRequireDefault(_users);

var _tokens = require('../../models/tokens.model');

var _tokens2 = _interopRequireDefault(_tokens);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var expect = _chai2.default.expect,
    assert = _chai2.default.assert;

var should = _chai2.default.should();

_chai2.default.use(_chaiHttp2.default);
_chai2.default.use(_chaiAsPromised2.default);

describe('Users', function () {

    before(function (done) {
        (0, _utils.prepareServer)(done);
    });

    describe('user creation and auth flow', function () {

        it('POST /api/users', function (done) {
            _chai2.default.request(_utils.app).post('/api/users').send(_utils.testUser).end(function (err, res) {
                if (err) return done(err);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('User with username \'mocha\' has been created');
                _users2.default.find({ username: _utils.testUser.username }, function (err, res) {
                    if (err) return done(err);
                    res.length.should.be.equal(1);
                    done();
                });
            });
        });

        it('POST /api/users (duplicate error)', function (done) {
            _chai2.default.request(_utils.app).post('/api/users').send(_utils.testUser).end(function (err, res) {
                if (err) return done(err);
                res.should.have.status(409);
                res.body.should.be.a('object');
                res.body.should.have.property('message').contains('exists');
                done();
            });
        });

        it('POST /api/users (invalid email)', function (done) {
            var badUser = (0, _utils.getTestUserClone)();
            badUser['email'] = "yolo";
            _chai2.default.request(_utils.app).post('/api/users').send(badUser).end(function (err, res) {
                if (err) return done(err);
                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.have.property('message').contains('email');
                res.body.should.have.property('message').contains('valid');
                done();
            });
        });

        it('POST /api/users (mismatched passwords)', function (done) {
            var badUser = (0, _utils.getTestUserClone)();
            badUser['passwordConf'] = "yolo";
            _chai2.default.request(_utils.app).post('/api/users').send(badUser).end(function (err, res) {
                if (err) return done(err);
                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.have.property('message').contains('match');
                done();
            });
        });

        it('POST /api/users (missing fields)', function (done) {
            var badUser = (0, _utils.getTestUserClone)();
            delete badUser['email'];
            _chai2.default.request(_utils.app).post('/api/users').send(badUser).end(function (err, res) {
                if (err) return done(err);
                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.have.property('message').contains('email');
                done();
            });
        });

        it('POST /oauth/token', function (done) {
            _chai2.default.request(_utils.app).post('/oauth/token').set('content-type', 'application/x-www-form-urlencoded').set('Authorization', 'Basic ' + _utils.basicToken).send(_utils.testUserAuth).end(function (err, res) {
                if (err) return done(err);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('token_type').eql('Bearer');
                res.body.should.have.property('access_token');
                res.body.should.have.property('refresh_token');
                _tokens2.default.find({ accessToken: res.body.access_token }, function (err, res) {
                    if (err) return done(err);
                    res.length.should.be.equal(1);
                    done();
                });
            });
        });

        it('POST /oauth/token (invalid password)', function (done) {
            var badAuth = (0, _utils.getTestAuthClone)();
            badAuth['password'] = "yolo";
            _chai2.default.request(_utils.app).post('/oauth/token').set('content-type', 'application/x-www-form-urlencoded').set('Authorization', 'Basic ' + _utils.basicToken).send(badAuth).end(function (err, res) {
                if (err) return done(err);
                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.have.property('error_description');
                res.body.should.have.property('error_description').contains('invalid');
                done();
            });
        });

        it('POST /oauth/token (duplicate key)', function (done) {
            _chai2.default.request(_utils.app).post('/oauth/token').set('content-type', 'application/x-www-form-urlencoded').set('Authorization', 'Basic ' + _utils.basicToken).send(_utils.testUserAuth).end(function (err, res) {
                if (err) return done(err);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('token_type').eql('Bearer');
                res.body.should.have.property('access_token');
                res.body.should.have.property('refresh_token');
                _tokens2.default.find({ accessToken: res.body.access_token }, function (err, tres) {
                    if (err) return done(err);
                    tres.length.should.be.equal(1);
                    done();
                });
            });
        });
    });

    describe('user logout', function () {

        it('POST /api/s/logout', function (done) {
            (0, _utils.withLogin)(_chai2.default.request(_utils.app).post('/api/s/logout'), function (req) {
                req.end(function (err, res) {
                    if (err) return done(err);
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    _tokens2.default.find({ accessToken: req.accessToken }, function (err, res) {
                        if (err) return done(err);
                        res.length.should.be.equal(0);
                        done();
                    });
                });
            });
        });
    });

    after(function (done) {
        (0, _utils.teardownServer)('users', done);
    });
});