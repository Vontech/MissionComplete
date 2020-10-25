import React, { useState, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  selectAllTasks,
  fetchTasks,
  selectTaskIds,
  selectTaskById
} from '../tasks/tasksSlice'

import TaskPanel from '../tasks/TaskPanel';
import HotkeyHandler from './HotkeyHandler';

export const AppContainer = () => {

  const dispatch = useDispatch()
  const taskStatus = useSelector(state => state.tasks.status)

  useEffect(() => {
    if (taskStatus === 'idle') {
      dispatch(fetchTasks())
    }
  }, [taskStatus, dispatch])

  return (
    <div id="primary-panel">
      <HotkeyHandler />
      <TaskPanel />
    </div>
  )

}

export default AppContainer;