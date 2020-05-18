'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.setupDB = setupDB;
exports.createBaseClient = createBaseClient;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _clients = require('../models/clients.model');

var _clients2 = _interopRequireDefault(_clients);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.set('useNewUrlParser', true);
_mongoose2.default.set('useFindAndModify', false);
_mongoose2.default.set('useCreateIndex', true);

async function setupDB() {
    var dbHost = _config2.default.dbHost,
        dbPort = _config2.default.dbPort,
        dbName = _config2.default.dbName;

    try {
        if (process.env.MONGODB_URI) {
            await _mongoose2.default.connect(process.env.MONGODB_URI);
            _logger2.default.info('Connected to mongo server at ' + process.env.MONGODB_URI);
        } else {
            await _mongoose2.default.connect('mongodb://' + dbHost + ':' + dbPort + '/' + dbName);
            _logger2.default.info('Connected to mongo server at mongodb://' + dbHost + ':' + dbPort + '/' + dbName);
        }

        await createBaseClient();
    } catch (err) {
        _logger2.default.error('Could not connect to MongoDB.');
    }
};

async function createBaseClient() {
    // Create the base client if does not already exist
    await _clients2.default.findOneAndUpdate({
        clientId: _config2.default.clientId
    }, {
        clientId: _config2.default.clientId,
        clientSecret: _config2.default.clientSecret,
        grants: ['password']
    }, { upsert: true });

    _logger2.default.info('Successfully instantiated base client.');
}