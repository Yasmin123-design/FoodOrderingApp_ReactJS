import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
    updateAccessToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = { 
          email: action.payload.email || action.meta.arg.email, 
          name: action.payload.name 
        };
        state.token = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        if (action.payload.access_token) {
           localStorage.setItem('token', action.payload.access_token);
        }
        if (action.payload.refresh_token) {
           localStorage.setItem('refreshToken', action.payload.refresh_token);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = { 
          email: action.payload.email || action.meta.arg.email, 
          name: action.payload.name || action.meta.arg.name 
        };
        state.token = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        if (action.payload.access_token) {
           localStorage.setItem('token', action.payload.access_token);
        }
        if (action.payload.refresh_token) {
           localStorage.setItem('refreshToken', action.payload.refresh_token);
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { logout, updateAccessToken } = authSlice.actions;
export default authSlice.reducer;
