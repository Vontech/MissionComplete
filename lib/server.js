"use strict";

var _morgan = require("morgan");

var _morgan2 = _interopRequireDefault(_morgan);

var _expressOauthServer = require("express-oauth-server");

var _expressOauthServer2 = _interopRequireDefault(_expressOauthServer);

var _config = require("./setup/config");

var _config2 = _interopRequireDefault(_config);

var _db = require("./setup/db");

var _logger = require("./setup/logger");

var _logger2 = _interopRequireDefault(_logger);

var _auth = require("./controllers/auth.controller");

var _auth2 = _interopRequireDefault(_auth);

var _authed = require("./routes/authed.routes");

var _authed2 = _interopRequireDefault(_authed);

var _open = require("./routes/open.routes");

var _open2 = _interopRequireDefault(_open);

var _users = require("./models/users.model");

var _users2 = _interopRequireDefault(_users);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require("express");
var bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

_logger2.default.stream = {
  write: function write(message) {
    _logger2.default.info(message);
  }
};

app.use((0, _morgan2.default)('dev', { stream: _logger2.default.stream }));

app.oauth = new _expressOauthServer2.default({
  model: _auth2.default,
  debug: true
});

app.all('/oauth/token', app.oauth.token());

function attachUser(req, res, next) {
  _users2.default.find({ _id: res.locals.oauth.token.userId }, function (err, users) {
    // TODO: Handle errors
    var user = users[0];
    req.session = {};
    req.session.user = user;
    req.session.userId = user._id;
    req.session.token = res.locals.oauth.token;
    next();
  });
}

app.use('/api/s', app.oauth.authenticate(), attachUser, _authed2.default);
app.use('/api', _open2.default);

app.use(function (err, req, res, next) {
  console.log(err);
  next();
});

app.alreadyStarted = false;

app.server = app.listen(_config2.default.serverPort, async function () {
  await (0, _db.setupDB)();
  _logger2.default.info("Listening on port " + _config2.default.serverPort);
  app.alreadyStarted = true;
  if (app.finished) {
    // Call any listeners
    app.finished();
  }
});

module.exports = app;