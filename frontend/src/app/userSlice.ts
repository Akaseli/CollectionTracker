import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    id: undefined,
    username: undefined
  },
  reducers: {
    userLogin: (state, action) => {
      state.id = action.payload["id"]
      state.username = action.payload["username"]
    }
  }
})

export const { userLogin } = userSlice.actions

export default userSlice.reducer