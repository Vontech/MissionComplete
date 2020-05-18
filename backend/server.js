const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');

import morgan from 'morgan';
import OAuthServer from 'express-oauth-server';

import config from "./setup/config";
import {setupDB} from "./setup/db"
import logger from "./setup/logger";
import auth from "./controllers/auth.controller";

import authedRoutes from "./routes/authed.routes";
import openRoutes from "./routes/open.routes";
import Users from "./models/users.model";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

logger.stream = {
  write(message) {
    logger.info(message);
  },
};

app.use(morgan('dev', { stream: logger.stream }));

app.oauth = new OAuthServer({
  model: auth,
  debug: true,
});

app.all('/oauth/token', app.oauth.token());

function attachUser(req, res, next) {
  Users.find({_id: res.locals.oauth.token.userId}, (err, users) => {
    // TODO: Handle errors
    let user = users[0];
    req.session = {};
    req.session.user = user
    req.session.userId = user._id;
    req.session.token = res.locals.oauth.token;
    next();
  })
}

app.use('/api/s', app.oauth.authenticate(), attachUser, authedRoutes);
app.use('/api', openRoutes);

app.use(function (err, req, res, next) {
  console.log(err)
  next()
})

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

app.alreadyStarted = false;

app.server = app.listen(config.serverPort, async () => {
  await setupDB();
  logger.info(`Listening on port ${config.serverPort}`);
  app.alreadyStarted = true;
  if (app.finished) { // Call any listeners
    app.finished();
  }
});

module.exports = app;
