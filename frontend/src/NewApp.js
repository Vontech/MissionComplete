
import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import '../node_modules/antd/dist/antd.css';

import LoginContainer from './features/users/LoginContainer';
import RegisterContainer from './features/users/RegisterContainer';
import AppContainer from './features/appPeripherals/AppContainer';

export const App = () => {

  const userState = useSelector(state => state.users.userState);

  return (
    <div>
      {userState === 'logged-in' && <AppContainer />}
      {userState === 'logged-out' && <LoginContainer />}
      {userState === 'unknown' && <LoginContainer />}
      {userState === 'registering' && <RegisterContainer />}
      <div id="modal-root"></div>
    </div>
  )
}

export default App