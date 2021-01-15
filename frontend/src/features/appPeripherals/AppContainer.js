import React, { useState, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  selectAllTasks,
  fetchTasks,
  selectTaskIds,
  selectTaskById
} from '../tasks/tasksSlice'
import { getProfile } from '../profile/profileSlice';

import ProfileView from '../profile/ProfileView';
import FeedbackForm from '../users/FeedbackForm'
import TaskPanel from '../tasks/TaskPanel';
import HotkeyHandler from './HotkeyHandler';

export const AppContainer = () => {

  const dispatch = useDispatch()
  const taskStatus = useSelector(state => state.tasks.status)
  const profileFetchingStatus = useSelector(state => state.profile.profileFetchingStatus)

  useEffect(() => {
    if (taskStatus === 'idle') {
      dispatch(fetchTasks())
    }
  }, [taskStatus, dispatch])

  useEffect(() => {
    if (profileFetchingStatus === 'idle') {
      dispatch(getProfile())
    }
  }, [profileFetchingStatus, dispatch])

  return (
    <div id="primary-panel">
      <HotkeyHandler />
      <TaskPanel />
      <ProfileView />
      <FeedbackForm />
    </div>
  )

}

export default AppContainer;