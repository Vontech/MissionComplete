'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _users = require('../models/users.model');

var _users2 = _interopRequireDefault(_users);

var _tokens = require('../models/tokens.model');

var _tokens2 = _interopRequireDefault(_tokens);

var _clients = require('../models/clients.model');

var _clients2 = _interopRequireDefault(_clients);

var _logger = require('../setup/logger');

var _logger2 = _interopRequireDefault(_logger);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Get access token.
 */

module.exports.getAccessToken = function (bearerToken) {
  // Adding `.lean()`, as we get a mongoose wrapper object back from `findOne(...)`, and oauth2-server complains.
  return _tokens2.default.findOne({ accessToken: bearerToken }).lean();
};

/**
 * Get client.
 */

module.exports.getClient = function (clientId, clientSecret) {
  return _clients2.default.findOne({ clientId: clientId, clientSecret: clientSecret }).lean();
};

/**
 * Get refresh token.
 */

module.exports.getRefreshToken = function (refreshToken) {
  return _tokens2.default.findOne({ refreshToken: refreshToken }).lean();
};

/**
 * Get user.
 */

module.exports.getUser = async function (username, password) {

  // First find this user
  var user = await _users2.default.findOne({ username: username });
  if (!user) {
    return false;
  }

  // Next, make sure the password is good
  var hashPass = user.password;
  var matches = _bcrypt2.default.compareSync(password, hashPass);
  if (matches) {
    return user;
  }
  return false;
};

/**
 * Save token.
 */

module.exports.saveToken = function (token, client, user) {
  var accessToken = new _tokens2.default({
    accessToken: token.accessToken,
    accessTokenExpiresAt: (0, _moment2.default)(token.accessTokenExpiresAt).toDate(),
    client: client,
    clientId: client.clientId,
    refreshToken: token.refreshToken,
    refreshTokenExpiresAt: (0, _moment2.default)(token.refreshTokenExpiresAt).toDate(),
    user: user,
    userId: user._id
  });
  // Can't just chain `lean()` to `save()` as we did with `findOne()` elsewhere. Instead we use `Promise` to resolve the data.
  return new Promise(function (resolve, reject) {
    accessToken.save(function (err, data) {
      if (err) reject(err);else resolve(data);
    });
  }).then(function (saveResult) {
    // `saveResult` is mongoose wrapper object, not doc itself. Calling `toJSON()` returns the doc.
    saveResult = saveResult && (typeof saveResult === 'undefined' ? 'undefined' : _typeof(saveResult)) == 'object' ? saveResult.toJSON() : saveResult;

    // Unsure what else points to `saveResult` in oauth2-server, making copy to be safe
    var data = new Object();
    for (var prop in saveResult) {
      data[prop] = saveResult[prop];
    } // /oauth-server/lib/models/token-model.js complains if missing `client` and `user`. Creating missing properties.
    data.client = data.clientId;
    data.user = data.userId;

    return data;
  });
};