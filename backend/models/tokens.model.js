import mongoose from 'mongoose';

const TokenSchema = new mongoose.Schema({
  accessToken: { type: String },
  accessTokenExpiresAt: { type: Date },
  client : { type: Object },  // `client` and `user` are required in multiple places, for example `getAccessToken()`
  clientId: { type: String },
  refreshToken: { type: String },
  refreshTokenExpiresAt: { type: Date },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  userId: { type: String },
});

const Tokens = mongoose.model('Tokens', TokenSchema);

export default Tokens;