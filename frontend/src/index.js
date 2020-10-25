import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './NewApp';
import * as serviceWorker from './serviceWorker';
import { api } from './utils/api';
import { userStateUpdated } from './features/users/usersSlice';

import store from './lib/store'
import { Provider } from 'react-redux'

console.log(api.isLoggedIn())

store.dispatch(userStateUpdated({
    status: api.isLoggedIn() ? 'logged-in' : 'logged-out'
}));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>, 
  document.getElementById('root'));

// If you want your app tos work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
