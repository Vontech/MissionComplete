import React, { useEffect, useCallback, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { Modal, Spin } from 'antd';
import { EditFilled, LoadingOutlined } from '@ant-design/icons';

import { updateIsProfileDialogOpen, getProfile, uploadProfilePicture } from './profileSlice';
import { api } from '../../utils/api';

const loadingIcon = <LoadingOutlined style={{ color: 'white', fontSize: 28, marginTop: 72/2 - 28/2, marginLeft: 72/2 - 28/2 }} spin />;

export const ProfileView = () => {

  const dispatch = useDispatch()

  const [profilePicHovered, setProfilePicHovered] = useState(false);

  const profileDialogOpen = useSelector(state => state.profile.isProfileDialogOpen)
  const profileInformation = useSelector(state => state.profile.profileInformation)
  const profileFetchingStatus = useSelector(state => state.profile.profileFetchingStatus)
  const profileUploadingStatus = useSelector(state => state.profile.profilePictureUploadingStatus)

  const profileHoverShouldShow = profilePicHovered || profileUploadingStatus == 'loading'

  const closeProfileDialog = useCallback(
    () => {
      dispatch(updateIsProfileDialogOpen(false));
    },
    [dispatch]
  )

  const uploadPicture = useCallback(
    (image) => {
      dispatch(uploadProfilePicture(image));
    },
    [dispatch]
  )

  
  return (
    <Modal
      className="profileModal"
      centered
      footer={null}
      title={null}
      closable={true}
      onCancel={closeProfileDialog}
      visible={profileDialogOpen}>
      {profileInformation && 
        <div>
          <input type="file" id="file" style={{display: 'none'}} accept="image/x-png,image/gif,image/jpeg"
            disabled={profileUploadingStatus == 'loading'}
            onChange={e => {
              const f = e.target.files[0];
              uploadPicture(f)
          }}/>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <img 
              onMouseEnter={() => setProfilePicHovered(true)}
              onMouseLeave={() => setProfilePicHovered(false)}
              style={{width: 72, height: 72, borderRadius: 100, cursor: 'pointer', objectFit: 'cover'}}
              src={profileInformation.profilePicture} />
            <label for="file" style={(profileHoverShouldShow ? styles.profilePicHovered : styles.profilePicNotHovered)}
                   onMouseEnter={() => setProfilePicHovered(true)}
                   onMouseLeave={() => setProfilePicHovered(false)} >
              {profileUploadingStatus == 'loading' &&
                <Spin indicator={loadingIcon}/>
              }
              {profileUploadingStatus != 'loading' &&
                <EditFilled style={{color: 'white', fontSize: 28, marginTop: 72/2 - 28/2, marginLeft: 72/2 - 28/2}}/>
              }
            </label>
            <h1 style={{marginLeft: '16px'}}>{profileInformation.username}</h1>
          </div>
          <div style={{marginTop: '16px'}}>
            <span>Email: </span><span>{profileInformation.email}</span>
          </div>
        </div>
      }
    </Modal>
  )
}

const styles = {
  profilePicHovered: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 100,
    background: 'rgba(1,1,1,0.2)',
    cursor: 'pointer'
  },
  profilePicNotHovered: {
    position: 'absolute',
    display: 'none'
  }
}
  
export default ProfileView;