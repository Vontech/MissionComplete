import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHotkeys } from 'react-hotkeys-hook';

import { updateIsSearchOpen } from '../tasks/tasksSlice';

export const HotkeyHandler = () => {

  const dispatch = useDispatch()
  const isOpen = useSelector(state => state.tasks.isSearchOpen)
  console.log(isOpen)

  useHotkeys('⌘+k', () => {
    console.log("Is search model open: ", isOpen)
    dispatch(updateIsSearchOpen(!isOpen))
  });
  
  return (
    <div />
  )
}
  
export default HotkeyHandler;