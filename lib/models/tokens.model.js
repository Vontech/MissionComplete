'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TokenSchema = new _mongoose2.default.Schema({
  accessToken: { type: String },
  accessTokenExpiresAt: { type: Date },
  client: { type: Object }, // `client` and `user` are required in multiple places, for example `getAccessToken()`
  clientId: { type: String },
  refreshToken: { type: String },
  refreshTokenExpiresAt: { type: Date },
  user: { type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Users' },
  userId: { type: String }
});

var Tokens = _mongoose2.default.model('Tokens', TokenSchema);

exports.default = Tokens;