const express = require("express");
const bodyParser = require("body-parser");

import morgan from 'morgan';
import OAuthServer from 'express-oauth-server';

import config from "./backend/setup/config";
import {setupDB} from "./backend/setup/db"
import logger from "./backend/setup/logger";
import auth from "./backend/controllers/auth.controller";

import authedRoutes from "./backend/routes/authed.routes";
import openRoutes from "./backend/routes/open.routes";
import Users from "./backend/models/users.model";

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
