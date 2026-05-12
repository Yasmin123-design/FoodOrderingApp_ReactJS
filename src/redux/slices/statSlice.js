import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchStats = createAsyncThunk(
  'stats/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

const statSlice = createSlice({
  name: 'stats',
  initialState: {
    data: {
      totalOrders: 0,
      totalProducts: 0,
      totalCategories: 0,
      totalUsers: 0,
      totalRevenue: 0
    },
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default statSlice.reducer;
