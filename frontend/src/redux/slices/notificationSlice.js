import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/notifications', { params });
    return { data: data.data, meta: data.meta };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const markNotificationRead = createAsyncThunk('notifications/markRead', async (id, { rejectWithValue }) => {
  try {
    await api.put(`/notifications/${id}/read`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const markAllRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try {
    await api.put('/notifications/read-all');
    return true;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
    meta: null,
  },
  reducers: {
    setUnreadCount: (state, action) => { state.unreadCount = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.unreadCount = action.payload.meta?.unreadCount || 0;
        state.meta = action.payload.meta;
      })
      .addCase(fetchNotifications.rejected, (state) => { state.loading = false; })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const n = state.items.find((i) => i._id === action.payload);
        if (n && !n.isRead) { n.isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.items.forEach((i) => { i.isRead = true; });
        state.unreadCount = 0;
      });
  },
});

export const { setUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;
