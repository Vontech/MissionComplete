import bcrypt from 'bcrypt';
import Users from '../models/users.model';
import Tokens from '../models/tokens.model';
import logger from '../setup/logger';
import s3 from '../setup/s3';
import config from '../setup/config';

var multer = require('multer')
var multerS3 = require('multer-s3')

import { getProfileImage } from '../setup/s3';

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: config.awsProfilePictureBucket,
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, new Date().toISOString() + '-' + file.originalname);
    }
  })
})

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

controller.getUserPreferences = async (req, res, next) => {
  Users.findById(req.session.userId, (err, user) => {
		if (err) {
			res.status(400);
			return res.json({ message: `Error getting preferences: ${err}` });
		}
    res.status(200);
		res.json(user.devPreferences ? JSON.parse(user.devPreferences) : {});
	});
}

controller.saveUserPreferences = async (req, res, next) => {
  Users.findByIdAndUpdate(req.session.userId, {devPreferences: JSON.stringify(req.body.prefs)}, (err, user) => {
		if (err) {
			res.status(400);
			return res.json({ message: `Error saving preferences: ${err}` });
		}
    next();
	});
}

controller.getUserInformation = async (req, res, next) => {
  Users.findById(req.session.userId, (err, user) => {
		if (err) {
			res.status(400);
			return res.json({ message: `Error getting user: ${err}` });
		}
    res.status(200);
		res.json({
      username: user.username,
      email: user.email
    });
	});
}

controller.prepareProfilePicture = upload.single("file")

controller.uploadProfilePicture = (req, res, next) => {
  let profileLocation = req.file.key;
  Users.findByIdAndUpdate(req.session.userId, {'$set': {'profilePicture': profileLocation}},  { new: true }, (err, user) => {
    if (err) {
			res.status(400);
			return res.json({ message: `Error setting profile picture: ${err}` });
		}
    res.status(200);
    res.json({
      status: 'success'
    })
	});
}

controller.getProfilePicture = (req, res, next) => {
  let username = req.params.username;
  if (username === 0 || username === '0') {
    username = req.session.user.username;
  }
  Users.findOne({username: username}, (err, user) => {
		if (err) {
			res.status(400);
			return res.json({ message: `Error getting user: ${err}` });
    }
    let s3Key = user.profilePicture;
    if (s3Key) {
      getProfileImage(s3Key).then((img) => {
        let buf = Buffer.from(img.Body);
        let base64 = buf.toString('base64');
        let extension = s3Key.split('.').pop();
        let htmlString = 'data:image/' + extension + ';base64,' + base64;
        res.status(200);
        res.json({
          imageData: htmlString,
        });
      })
      .catch(() => {
        res.status(200);
        res.json({
          imageData: null,
        });
      })
    } else {
      res.status(200);
        res.json({
          imageData: null,
        });
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