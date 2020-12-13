  
import { configureStore } from '@reduxjs/toolkit'

import tasksReducer from '../features/tasks/tasksSlice';
import usersReducer from '../features/users/usersSlice';
import profileReducer from '../features/profile/profileSlice';
import {attachTaskListeners} from '../features/tasks/tasksSlice';

export const appReducer = {
  tasks: tasksReducer,
  users: usersReducer,
  profile: profileReducer
};

let store = configureStore({
  reducer: appReducer
})
attachTaskListeners(store);
export default store;

export function getStoreWithPreloaded(preloadedState) {
  let store = configureStore({
    reducer: appReducer,
    preloadedState
  })
  attachTaskListeners(store);
  return store;
}

