import bcrypt from 'bcrypt';
import Users from '../models/users.model';
import Tokens from '../models/tokens.model';
import logger from '../setup/logger';

const controller = {};

function emailValid(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

controller.createUser = async (req, res, next) => {

  let err = await validateCreateUser(req.body);
  if (err) {
    res.status(err.status);
    res.json({message: err.message});
    return;
  }
    // Hash the password
    bcrypt.hash(req.body.password, 8, (errH, hash) => {
      if (errH) {
        logger.error(errH);
        return next(errH);
      }
      const userData = {
        email: req.body.email,
        username: req.body.username,
        password: hash,
      };
      Users.create(userData, (err, user) => {
        if (err) {
          logger.error(err);
          return next(err);
        }
        return res.json({ message: `User with username '${user.username}' has been created` });
      });
    });

};

controller.logoutUser = async (req, res, next) => {
  Tokens.deleteMany({accessToken: req.session.token.accessToken}, (err) => {
    if (err) {
      res.status(500);
      return res.json({ message: err });
    } else {
      return res.sendStatus(200);
    }
  });
}

/**
 * Validate the user creation routine in the following ways:
 *  - Makes sure all fields are present
 *  - Makes sure the email is a valid email
 *  - Makes sure password meets a certain standard
 *  - Makes sure passwords match
 *  - Makes sure that this user does not already exist
 *  - Makes sure that the username is good enough
 * @param {*} body 
 * @returns null if no error, or an error string otherwise
 */
async function validateCreateUser(body) {
  let baseError = "User creation error - ";
  if (!body.email) {
    return {status: 400, message: baseError + "A valid email must be provided."}
  }
  if (!body.username) {
    return {status: 400, message: baseError + "A valid username must be provided."}
  }
  if (!body.password) {
    return {status: 400, message: baseError + "A valid password must be provided."}
  }
  if (!body.passwordConf) {
    return {status: 400, message: baseError + "A valid password must be provided."}
  }

  // Check that this is a valid email
  if (!emailValid(body.email)) {
    return {status: 400, message: baseError + "The provided email is not a valid email address."}
  }

  // Check that passwords match
  if (body.password != body.passwordConf) {
    return {status: 400, message: baseError + "Passwords do not match."}
  }

  // Now check that this user does not exist
  let existingUsers = await Users.find({username: body.username, email: body.email});
  if (existingUsers.length > 0) {
    return {status: 409, message: baseError + "A user with this username or email already exists."}
  }

}

export default controller;