import React, { useEffect, useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { Button, Popover } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';

import TaskDrawerPanel from './TaskDrawerPanel'
import TaskGraph from './TaskGraph'
import TaskForm from './TaskForm'
import TaskSearchModal from './TaskSearchModal'

import { addNewTask, updateCurrentSelectedTask } from './tasksSlice';

export const TaskPanel = () => {

  const dispatch = useDispatch()

  let [addNewOpen, setAddNewOpen] = useState(false);
  const addFormRef = useRef(null);
  const buttonRef = useRef(null);

  // Code to detect when outside the add panel is clicked
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {

      // This means that the button was clicked
      if (buttonRef.current && buttonRef.current.contains(event.target)) {
        return;
      }

      // This means that the addForm dialog did not contain the event
      // and that the ant picker for the date did not contain the event
      let datePicker = document.getElementsByClassName('ant-picker-dropdown');
      let clickedDatePicker = datePicker.length > 0 ? datePicker[0].contains(event.target) : false;
      if (addFormRef.current && !addFormRef.current.contains(event.target) && addNewOpen && !clickedDatePicker) {
        setAddNewOpen(false)
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [addFormRef, addNewOpen]);

  return (
    <div>
      <TaskSearchModal />
      <TaskGraph />
      <TaskDrawerPanel />

      {/* Show add task form */}
      <div
        ref={addFormRef}
        style={{
          pointerEvents: addNewOpen ? 'auto' : 'none',
          opacity: addNewOpen ? '100%' : '0%',
          position: 'fixed',
          bottom: addNewOpen ? '64px' : '0px',
          left: '16px',
          transition: 'all 0.4s',
          border: "2px solid rgb(244, 244, 244)",
          borderRadius: "12px",
          width: "300px"
        }}>
        <TaskForm onFormSubmitted={(newTask) => {
          setAddNewOpen(false);
          dispatch(updateCurrentSelectedTask(newTask._id))
        }} />
      </div>

      <div style={{
        position: 'fixed',
        bottom: '16px',
        left: '16px',
      }}>
        <Button
          ref={buttonRef}
          size="large"
          icon={<PlusOutlined />}
          type="primary"
          shape="circle"
          onClick={() => { 
            setAddNewOpen(!addNewOpen)
          }}
        />
      </div>

    </div>
  )
}

export default TaskPanel;