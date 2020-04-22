import { rejects } from 'assert';
import Users from '../models/users.model';
import Tokens from '../models/tokens.model';
import Clients from '../models/clients.model';
import config from '../setup/config';
import moment from 'moment';
import {createBaseClient} from '../setup/db';

var mongoose = require('mongoose');

// This is the app reference that all tests will use
import app from '../../server';
console.log("STARTING TEST SERVER...");
app.finished = async () => {
    await dropDB();
}
if (app.alreadyStarted) {
    app.finished();
}
export {app};

export const testUser = {
    username: 'mocha',
    email: 'mocha@tester.com',
    password: 'mediummochaicedlattewithwholemilk',
    passwordConf: 'mediummochaicedlattewithwholemilk',
};

export const testUserAuth = {
    username: 'mocha',
    password: 'mediummochaicedlattewithwholemilk',
    grant_type: 'password'
}

const testUserHashed = {
    email: 'mocha@tester.com',
    username: 'mocha',
    password: '$2b$08$VQ3HMRKQVkH.qvPKL7vzwui.BXrgNVXf04H7.yw0sUYwA76SOst7a'
};

export const basicToken = 'dGFzc2stY2xpZW50Ojk3SDdGNEZENzJKRjdCUFFMMEdBQ1ox';

export function prepareServer(done) {
    app.finished = async () => {
        await dropDB();
        await createBaseClient();
        done();
    }
    if (app.alreadyStarted) {
        app.finished();
    }
}

const testsToFinish = {
    'users': false,
    'tasks': false
}

export function teardownServer(test, done) {

    testsToFinish[test] = true;

    if (Object.values(testsToFinish).reduce((prev, current) => prev && current)) {
        console.log("\nTEARING DOWN TEST SERVER");
        app.server.close();
        mongoose.connection.close(done);
        done();
    } else {
        done();
    }
    
}

export function getTestUserClone() {
    return Object.assign({}, testUser);
}

export function getTestAuthClone() {
    return Object.assign({}, testUserAuth);
}

export async function dropDB() {
    if (config.dbName == 'mission-complete') {
        console.error('STOPPING TESTS - PROD DB IN USE');
        process.exit(1);
    }
    await mongoose.connection.db.dropDatabase();
}

export function withLogin(request, done) {

    let token = {
        accessToken: 'aaaaa',
        accessTokenExpiresAt: moment().add(7, 'days').toDate(),
        client: null,
        clientId: config.clientId,
        refreshToken: 'bbbbb',
        refreshTokenExpiresAt: moment().add(7, 'days').toDate(),
        user: null,
        userId: null
    }

    let auth = (user) => {
        Clients.findOne({clientId: config.clientId, clientSecret: config.clientSecret}, (err, client) => {
            token['client'] = client;
            token['user'] = user;
            token['userId'] = user._id;
            Tokens.create(token).then((res) => {
                request.set('content-type', 'application/x-www-form-urlencoded')
                request.set('Authorization', `Bearer ${res.accessToken}`)
                request.accessToken = res.accessToken;
                request.user = user;
                done(request);
            })
        });
    }

    Users.find({email: testUserHashed.email, username: testUserHashed.username}, (err, res) => {
        if (res.length == 0) {
            Users.create(testUserHashed, (err, doc) => {
                auth(doc);
            });
        } else {
            auth(res[0]);
        }
    });
}
