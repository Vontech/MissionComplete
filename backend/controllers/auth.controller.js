import bcrypt from 'bcrypt';
import Users from '../models/users.model';
import Tokens from '../models/tokens.model';
import Clients from '../models/clients.model';
import logger from '../setup/logger';
import moment from 'moment';

/**
 * Get access token.
 */

module.exports.getAccessToken = function(bearerToken) {
  // Adding `.lean()`, as we get a mongoose wrapper object back from `findOne(...)`, and oauth2-server complains.
  return Tokens.findOne({ accessToken: bearerToken }).lean();
};

/**
 * Get client.
 */

module.exports.getClient = function(clientId, clientSecret) {
  return Clients.findOne({ clientId: clientId, clientSecret: clientSecret }).lean();
};

/**
 * Get refresh token.
 */

module.exports.getRefreshToken = function(refreshToken) {
  return Tokens.findOne({ refreshToken: refreshToken }).lean();
};

/**
 * Get user.
 */

module.exports.getUser = async function(username, password) {

  // First find this user
  let user = (await Users.findOne({ username: username }));
  if (!user) {
    return false;
  }

  // Next, make sure the password is good
  let hashPass = user.password;
  let matches = bcrypt.compareSync(password, hashPass);
  if (matches) {
    return user;
  }
  return false;

};

/**
 * Save token.
 */

module.exports.saveToken = function(token, client, user) {
  var accessToken = new Tokens({
    accessToken: token.accessToken,
    accessTokenExpiresAt: moment(token.accessTokenExpiresAt).toDate(),
    client : client,
    clientId: client.clientId,
    refreshToken: token.refreshToken,
    refreshTokenExpiresAt: moment(token.refreshTokenExpiresAt).toDate(),
    user : user,
    userId: user._id,
  });
  // Can't just chain `lean()` to `save()` as we did with `findOne()` elsewhere. Instead we use `Promise` to resolve the data.
  return new Promise( function(resolve,reject){
    accessToken.save(function(err,data){
      if( err ) reject( err );
      else resolve( data );
    }) ;
  }).then(function(saveResult){
    // `saveResult` is mongoose wrapper object, not doc itself. Calling `toJSON()` returns the doc.
    saveResult = saveResult && typeof saveResult == 'object' ? saveResult.toJSON() : saveResult;
    
    // Unsure what else points to `saveResult` in oauth2-server, making copy to be safe
    var data = new Object();
    for( var prop in saveResult ) data[prop] = saveResult[prop];
    
    // /oauth-server/lib/models/token-model.js complains if missing `client` and `user`. Creating missing properties.
    data.client = data.clientId;
    data.user = data.userId;

    return data;
  });
};