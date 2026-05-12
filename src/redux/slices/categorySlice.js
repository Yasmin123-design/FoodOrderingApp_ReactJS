import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/categories');
      return response.data; // Assuming it returns an array of categories directly
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/admin/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/admin/categories/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/admin/categories/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    actionStatus: 'idle',
    actionError: null
  },
  reducers: {
    resetActionStatus: (state) => {
      state.actionStatus = 'idle';
      state.actionError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Create
      .addCase(createCategory.pending, (state) => {
        state.actionStatus = 'loading';
        state.actionError = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.items.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.actionError = action.payload;
      })
      // Update
      .addCase(updateCategory.pending, (state) => {
        state.actionStatus = 'loading';
        state.actionError = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
           state.items[index] = { ...state.items[index], ...action.payload.data };
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.actionError = action.payload;
      })
      // Delete
      .addCase(deleteCategory.pending, (state) => {
        state.actionStatus = 'loading';
        state.actionError = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.actionError = action.payload;
      });
  },
});

export const { resetActionStatus } = categorySlice.actions;
export default categorySlice.reducer;
