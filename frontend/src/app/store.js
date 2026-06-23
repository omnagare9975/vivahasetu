import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/slices/authSlice';
import profileReducer from '../redux/slices/profileSlice';
import matchReducer from '../redux/slices/matchSlice';
import notificationReducer from '../redux/slices/notificationSlice';
import uiReducer from '../redux/slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    match: matchReducer,
    notifications: notificationReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
