

import React, { useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { Button, Drawer } from 'antd';
import { MenuOutlined, ImportOutlined, CodeOutlined } from '@ant-design/icons';

import TaskTree from './TaskTree';
import { userStateUpdated, UserStatus } from '../users/usersSlice';
import { deleteAccessToken } from '../../utils/api';


export const TaskDrawerPanel = () => {

  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [devPrefsOpen, setDevPrefsOpen] = useState(false);

  const logout = useCallback(
    () => {
      dispatch(userStateUpdated(UserStatus.LOGGED_OUT));
      deleteAccessToken();
    },
    [dispatch]
  )

  return (
		<div>
			<MenuOutlined style={styles.hamburger} onClick={() => setIsOpen(!isOpen)} />
			<Drawer
				title="Tasks"
				placement="right"
				closable={false}
				onClose={() => setIsOpen(false)}
				visible={isOpen}
			>
				<TaskTree shouldFocus={true} onTaskSelected={(t) => console.log(t)}/>
				{/* {this.renderDevModal()} */}
				<Button type="link" icon={<CodeOutlined />} style={styles.devprefs} onClick={() => setDevPrefsOpen(true)}>
					Show Dev Preferences
				</Button>
				<Button type="link" icon={<ImportOutlined />} style={styles.logout} onClick={logout}>
					Logout
				</Button>
			</Drawer>
		</div>
	);

}

const styles = {
  hamburger: {
    position: 'fixed',
    top: 32,
    right: 32
  },
  logout: {
    position: 'absolute',
    bottom: 16,
    left: 8
  },
  devprefs: {
    position: 'absolute',
    bottom: 32,
    left: 8
  }
}

export default TaskDrawerPanel;