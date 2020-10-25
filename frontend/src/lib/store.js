  
import { configureStore } from '@reduxjs/toolkit'

import tasksReducer from '../features/tasks/tasksSlice';
import usersReducer from '../features/users/usersSlice';
import {attachTaskListeners} from '../features/tasks/tasksSlice';

export const appReducer = {
  tasks: tasksReducer,
  users: usersReducer
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

