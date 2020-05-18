'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.basicToken = exports.testUserAuth = exports.testUser = exports.app = undefined;
exports.prepareServer = prepareServer;
exports.teardownServer = teardownServer;
exports.getTestUserClone = getTestUserClone;
exports.getTestAuthClone = getTestAuthClone;
exports.dropDB = dropDB;
exports.withLogin = withLogin;

var _assert = require('assert');

var _users = require('../models/users.model');

var _users2 = _interopRequireDefault(_users);

var _tokens = require('../models/tokens.model');

var _tokens2 = _interopRequireDefault(_tokens);

var _clients = require('../models/clients.model');

var _clients2 = _interopRequireDefault(_clients);

var _config = require('../setup/config');

var _config2 = _interopRequireDefault(_config);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _db = require('../setup/db');

var _server = require('../../server');

var _server2 = _interopRequireDefault(_server);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mongoose = require('mongoose');

// This is the app reference that all tests will use

console.log("STARTING TEST SERVER...");
_server2.default.finished = async function () {
    await dropDB();
};
if (_server2.default.alreadyStarted) {
    _server2.default.finished();
}
exports.app = _server2.default;
var testUser = exports.testUser = {
    username: 'mocha',
    email: 'mocha@tester.com',
    password: 'mediummochaicedlattewithwholemilk',
    passwordConf: 'mediummochaicedlattewithwholemilk'
};

var testUserAuth = exports.testUserAuth = {
    username: 'mocha',
    password: 'mediummochaicedlattewithwholemilk',
    grant_type: 'password'
};

var testUserHashed = {
    email: 'mocha@tester.com',
    username: 'mocha',
    password: '$2b$08$VQ3HMRKQVkH.qvPKL7vzwui.BXrgNVXf04H7.yw0sUYwA76SOst7a'
};

var basicToken = exports.basicToken = 'dGFzc2stY2xpZW50Ojk3SDdGNEZENzJKRjdCUFFMMEdBQ1ox';

function prepareServer(done) {
    _server2.default.finished = async function () {
        await dropDB();
        await (0, _db.createBaseClient)();
        done();
    };
    if (_server2.default.alreadyStarted) {
        _server2.default.finished();
    }
}

var testsToFinish = {
    'users': false,
    'tasks': false
};

function teardownServer(test, done) {

    testsToFinish[test] = true;

    if (Object.values(testsToFinish).reduce(function (prev, current) {
        return prev && current;
    })) {
        console.log("\nTEARING DOWN TEST SERVER");
        _server2.default.server.close();
        mongoose.connection.close(done);
        done();
    } else {
        done();
    }
}

function getTestUserClone() {
    return Object.assign({}, testUser);
}

function getTestAuthClone() {
    return Object.assign({}, testUserAuth);
}

async function dropDB() {
    if (_config2.default.dbName == 'mission-complete') {
        console.error('STOPPING TESTS - PROD DB IN USE');
        process.exit(1);
    }
    await mongoose.connection.db.dropDatabase();
}

function withLogin(request, done) {

    var token = {
        accessToken: 'aaaaa',
        accessTokenExpiresAt: (0, _moment2.default)().add(7, 'days').toDate(),
        client: null,
        clientId: _config2.default.clientId,
        refreshToken: 'bbbbb',
        refreshTokenExpiresAt: (0, _moment2.default)().add(7, 'days').toDate(),
        user: null,
        userId: null
    };

    var auth = function auth(user) {
        _clients2.default.findOne({ clientId: _config2.default.clientId, clientSecret: _config2.default.clientSecret }, function (err, client) {
            token['client'] = client;
            token['user'] = user;
            token['userId'] = user._id;
            _tokens2.default.create(token).then(function (res) {
                request.set('content-type', 'application/x-www-form-urlencoded');
                request.set('Authorization', 'Bearer ' + res.accessToken);
                request.accessToken = res.accessToken;
                request.user = user;
                done(request);
            });
        });
    };

    _users2.default.find({ email: testUserHashed.email, username: testUserHashed.username }, function (err, res) {
        if (res.length == 0) {
            _users2.default.create(testUserHashed, function (err, doc) {
                auth(doc);
            });
        } else {
            auth(res[0]);
        }
    });
}