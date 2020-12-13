import { createSlice, createAsyncThunk, createEntityAdapter, createSelector, select } from '@reduxjs/toolkit'

import { api } from '../../utils/api';
import { message } from 'antd';

const initialState = {
  isProfileDialogOpen: false,
  profileInformation: null,
  profilePicture: null,
  profileFetchingStatus: 'idle',
  profilePictureUploadingStatus: 'idle',
  error: null
}

const getBase64 = (file) => new Promise(function (resolve, reject) {
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result)
  reader.onerror = (error) => reject('Error: ', error);
})


export const getProfile = createAsyncThunk('profile/getProfile', async () => {
  const response = await api.getUserInfo();
  const image = await api.getProfilePicture();
  response.data.profilePicture = image.data.imageData;
  return response.data;
});

export const uploadProfilePicture = createAsyncThunk('profile/uploadPicture', async (image) => {
  await api.uploadProfilePicture(image);
  const base64 = await getBase64(image);
  let extension = image.name.split('.').pop();
  return base64;
});

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateIsProfileDialogOpen(state, action) {
      const isOpen = action.payload;
      state.isProfileDialogOpen = isOpen;
    }
  },
  extraReducers: {
    [getProfile.pending]: (state, action) => {
      state.profileFetchingStatus = 'loading'
    },
    [getProfile.fulfilled]: (state, action) => {
      state.profileFetchingStatus = 'succeeded'
      state.profileInformation = action.payload
    },
    [getProfile.rejected]: (state, action) => {
      state.profileFetchingStatus = 'failed'
      state.error = action.error.message
    },
    [uploadProfilePicture.pending]: (state, action) => {
      state.profilePictureUploadingStatus = 'loading'
    },
    [uploadProfilePicture.fulfilled]: (state, action) => {
      state.profilePictureUploadingStatus = 'idle'
      state.profileInformation.profilePicture = action.payload
    },
    [uploadProfilePicture.rejected]: (state, action) => {
      state.profilePictureUploadingStatus = 'idle'
      state.error = action.error.message
    }
  }
})

// export const selectTaskTree = tasksAdapter.getSelectors((state) => getIdTree(state.tasks))

export const { updateIsProfileDialogOpen } = profileSlice.actions

export default profileSlice.reducer