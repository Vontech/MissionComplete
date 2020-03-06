# Mission Complete

## Setup Instructions
1. Install [Node.js](https://nodejs.org/en/download/), [Yarn](https://classic.yarnpkg.com/en/docs/install/), [MongoDB](https://www.mongodb.com/), and [Postman](https://www.postman.com/)
2. Run `yarn install` within the root folder.
3. Run `yarn install` within the frontend folder.
4. Run `yarn global add nodemon`
5. See the [Run Tests](#run-tests) section to make sure that the server and frontend are setup properly.

## Run Tests

Running tests is as simple as running the following command on Mac or Linux

```
yarn test-server
```

If on Windows, use the following command

```
yarn test-server-windows
```

If successful, you should see an output similar to this:

```
STARTING TEST SERVER...


(node:68008) DeprecationWarning: "--compilers" will be removed in a future version of Mocha; see https://git.io/vdcSr for more info
(node:68008) DeprecationWarning: current Server Discovery and Monitoring engine is deprecated, and will be removed in a future version. To use the new Server Discover and Monitoring engine, pass option { useUnifiedTopology: true } to the MongoClient constructor.
  Users
    user creation and auth flow
      √ POST /api/users (93ms)
      √ POST /api/users (duplicate error)
      √ POST /api/users (invalid email)
      √ POST /api/users (mismatched passwords)
      √ POST /api/users (missing fields)
      √ POST /oauth/token (205ms)
      √ POST /oauth/token (invalid password)
      √ POST /oauth/token (duplicate key)
    user logout
      √ POST /api/s/logout

TEARING DOWN TEST SERVER
```

### Adding New Functionality

Adding a new endpoint that relies on new models and logic is relatively straightfoward. Complete the following steps:

1. Create a new model in `backend/models` (`users.model.js` is a good example). This model will automatically be created within MongoDB.
2. Create a new controller file in `backend/controllers` (`users.controller.js` is a good example). You controller is essentially a set of functions to handle functionality for that model / your feature. If authenticated, the `req` object will have a few properties about the user that may be helpful (`req.session.user`, `req.session.userId`, and `req.session.token`).
3. Create a new endpoint within either `routes/authed.routes.js` or `open.routes.js` (likely will want the former). Make sure to keep this file organized. Whatever endpoint you put in the auth file will be prefixed by `/api/s/` (i.e. `/addThing` will be an endpoint of `/api/s/addThing`)
4. Make a call to this endpoint using Postman (make sure to import the Collection and Environment from the `postman/` folder). If authentication is needed, run the `Create User` request, and then then `Authenticate User` request. This will get an access token for the user, which is stored in Postman as an environment variable `accessToken`. When making a call to your endpoint, in order to authenticate, you need to add a header of the following form:

```
Authorization: Bearer {{accessToken}}
```

You can see an example of this within the Logout User request

5. Once your endpoint is pretty stable write an automated test within `backend/test`. Make sure to test edge cases in user input (i.e. forgot an input, bad input, etc...).