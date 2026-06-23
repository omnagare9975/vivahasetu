import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchSuggestedMatches = createAsyncThunk('match/fetchSuggested', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/matches/suggestions', { params });
    return { data: data.data, meta: data.meta };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch matches');
  }
});

export const searchProfiles = createAsyncThunk('match/search', async (filters, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/matches/search', { params: filters });
    return { data: data.data, meta: data.meta };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Search failed');
  }
});

const matchSlice = createSlice({
  name: 'match',
  initialState: {
    suggestions: [],
    searchResults: [],
    searchMeta: null,
    suggestionsMeta: null,
    loading: false,
    error: null,
    filters: {},
  },
  reducers: {
    setFilters: (state, action) => { state.filters = action.payload; },
    clearFilters: (state) => { state.filters = {}; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuggestedMatches.pending, (state) => { state.loading = true; })
      .addCase(fetchSuggestedMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.suggestions = action.payload.data;
        state.suggestionsMeta = action.payload.meta;
      })
      .addCase(fetchSuggestedMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(searchProfiles.pending, (state) => { state.loading = true; })
      .addCase(searchProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.data;
        state.searchMeta = action.payload.meta;
      })
      .addCase(searchProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters } = matchSlice.actions;
export default matchSlice.reducer;
