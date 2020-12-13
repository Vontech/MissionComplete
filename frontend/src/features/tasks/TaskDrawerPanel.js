

import React, { useState, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Button, Drawer } from 'antd';
import { MenuOutlined, ImportOutlined, CodeOutlined } from '@ant-design/icons';

import TaskTree from './TaskTree';
import { userStateUpdated, UserStatus } from '../users/usersSlice';
import { updateIsProfileDialogOpen, getProfile } from '../profile/profileSlice';
import { deleteAccessToken } from '../../utils/api';

export const TaskDrawerPanel = () => {

  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [profileHovered, setProfileHovered] = useState(false);

  const logout = useCallback(
    (e) => {
      e.stopPropagation();
      dispatch(userStateUpdated(UserStatus.LOGGED_OUT));
      deleteAccessToken();
    },
    [dispatch]
  )

  const openProfileDialog = useCallback(
    () => {
      dispatch(updateIsProfileDialogOpen(true));
    },
    [dispatch]
  )

  // Show profile in drawer
  const profileInformation = useSelector(state => state.profile.profileInformation)

  let profileView = null;
  if (profileInformation) {
    profileView = (
      <div style={{...styles.profileContainer, ...(profileHovered ? styles.profileContainerHovered : {})}} 
           onClick={openProfileDialog} 
           onMouseEnter={() => setProfileHovered(true)}
           onMouseLeave={() => setProfileHovered(false)}>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <img 
            style={{width: 52, height: 52, borderRadius: 100, objectFit: 'cover'}}
            src={profileInformation.profilePicture} />
          <div style={{marginLeft: '16px'}}>
            <h3>{profileInformation.username}</h3>
            <Button type="primary" icon={<ImportOutlined />} style={styles.logout} onClick={logout} shape="round" size="small">
              Logout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
		<div>
			<MenuOutlined style={styles.hamburger} onClick={() => setIsOpen(!isOpen)} />
			<Drawer
				
				placement="right"
				closable={false}
				onClose={() => setIsOpen(false)}
				visible={isOpen}
			>
        {profileView}
				<TaskTree shouldFocus={true} onTaskSelected={(t) => console.log(t)}/>
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
    // position: 'absolute',
    // bottom: 16,
    // left: 8,
    // right: 8
  },
  profileContainer: {
    // position: 'absolute',
    // bottom: 64,
    // left: 8,
    // right: 8,
    cursor: 'pointer',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8
  },
  profileContainerHovered: {
    background: '#F1F1F1'
  }
}

export default TaskDrawerPanel;