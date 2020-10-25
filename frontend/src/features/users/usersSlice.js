import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  userState: 'unknown' // unknown, logged-out, registering, logged-in
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    userStateUpdated(state, action) {
      const { status } = action.payload;
      state.userState = status;
    }
  }
})

export const { userStateUpdated } = usersSlice.actions

export const UserStatus = {
  UNKNOWN: {status: 'unknown'},
  LOGGED_IN: {status: 'logged-in'},
  LOGGED_OUT: {status: 'logged-out'},
  REGISTERING: {status: 'registering'},
}

export default usersSlice.reducer