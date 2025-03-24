// src/redux/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null, // User state is initially null
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload; // Set the user data
    },
    removeUser: (state) => {
      state.user = null; // Remove the user data (logout)
    },
  },
});

export const { setUser, removeUser } = userSlice.actions;

export default userSlice.reducer;
