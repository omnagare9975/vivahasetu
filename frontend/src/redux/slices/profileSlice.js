import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchMyProfile = createAsyncThunk('profile/fetchMy', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/profiles/me');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
  }
});

export const updateProfile = createAsyncThunk('profile/update', async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/profiles/me', profileData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

export const fetchProfileById = createAsyncThunk('profile/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/profiles/${id}`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
  }
});

export const uploadPhoto = createAsyncThunk('profile/uploadPhoto', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/profiles/photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Upload failed');
  }
});

export const deletePhoto = createAsyncThunk('profile/deletePhoto', async (photoId, { rejectWithValue }) => {
  try {
    await api.delete(`/profiles/photos/${photoId}`);
    return photoId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Delete failed');
  }
});

export const setProfilePhoto = createAsyncThunk('profile/setProfilePhoto', async (photoId, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/profiles/photos/${photoId}/set-profile`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    myProfile: null,
    viewedProfile: null,
    photos: [],
    loading: false,
    updating: false,
    error: null,
  },
  reducers: {
    clearViewedProfile: (state) => { state.viewedProfile = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProfile.pending, (state) => { state.loading = true; })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.myProfile = action.payload;
        state.photos = action.payload?.photos || [];
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => { state.updating = true; })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.myProfile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      .addCase(fetchProfileById.pending, (state) => { state.loading = true; })
      .addCase(fetchProfileById.fulfilled, (state, action) => {
        state.loading = false;
        state.viewedProfile = action.payload;
      })
      .addCase(fetchProfileById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadPhoto.fulfilled, (state, action) => {
        state.photos.push(action.payload);
        if (state.myProfile) state.myProfile.photos = state.photos;
      })
      .addCase(deletePhoto.fulfilled, (state, action) => {
        state.photos = state.photos.filter((p) => p._id !== action.payload);
        if (state.myProfile) state.myProfile.photos = state.photos;
      })
      .addCase(setProfilePhoto.fulfilled, (state, action) => {
        state.photos = state.photos.map((p) => ({
          ...p,
          isProfilePhoto: p._id === action.payload._id,
        }));
        if (state.myProfile) state.myProfile.profilePhoto = action.payload.url;
      });
  },
});

export const { clearViewedProfile, clearError } = profileSlice.actions;
export default profileSlice.reducer;
