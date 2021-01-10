import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './NewApp';
import * as serviceWorker from './serviceWorker';
import { api, deleteAccessToken } from './utils/api';
import { userStateUpdated, UserStatus } from './features/users/usersSlice';

import store from './lib/store'
import { Provider } from 'react-redux'


store.dispatch(userStateUpdated(UserStatus.UNKNOWN));

// Update the state based on whether logged in
api.isLoggedIn()
  .then((isLoggedIn) => { 
    // If not logged in, lets make sure to delete leftover access Tokens
    if (!isLoggedIn) {
      deleteAccessToken()
    }
    store.dispatch(userStateUpdated(isLoggedIn ? UserStatus.LOGGED_IN : UserStatus.LOGGED_OUT));
  })
  .catch(() => {
    deleteAccessToken()
    store.dispatch(userStateUpdated(UserStatus.LOGGED_OUT));
  })


ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>, 
  document.getElementById('root'));

// If you want your app tos work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
