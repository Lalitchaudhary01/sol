// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice"; // Import the user reducer

const store = configureStore({
  reducer: {
    user: userReducer, // Add the user slice to the store
  },
});

export default store;
