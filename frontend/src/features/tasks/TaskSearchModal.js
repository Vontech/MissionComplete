import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { Modal } from 'antd';

import TaskTree from './TaskTree'
import { updateCurrentSelectedTask, updateIsSearchOpen } from './tasksSlice';

export const TaskSearchModal = () => {

  const dispatch = useDispatch()

  const isOpen = useSelector(state => state.tasks.isSearchOpen)
  console.log("Search model open: ", isOpen)

  const taskSelected = (task) => {
    dispatch(updateCurrentSelectedTask(task))
    dispatch(updateIsSearchOpen(false))
  }
  
  return (
    <Modal
      className="searchModal"
      centered
      footer={null}
      title={null}
      closable={false}
      onCancel={() => console.log("CLOSING")}
      visible={isOpen}>
      <TaskTree onTaskSelected={taskSelected} shouldFocus={true} />
    </Modal>
  )
}
  
  export default TaskSearchModal;