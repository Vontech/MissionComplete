
import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import '../node_modules/antd/dist/antd.css';

import LoginContainer from './features/users/LoginContainer';
import RegisterContainer from './features/users/RegisterContainer';
import AppContainer from './features/appPeripherals/AppContainer';

// const task = useSelector(state => selectTaskById(state, taskId))

export const App = () => {

  const userState = useSelector(state => state.users.userState);
  console.log('[App] Current user state: ' + userState);

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