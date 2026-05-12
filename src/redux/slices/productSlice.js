import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

// Fetch all products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/products');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

// Create a new product (FormData)
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/admin/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create product');
    }
  }
);

// Update an existing product (FormData)
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/admin/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

// Delete a product
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/admin/products/${id}`);
      return id; // Return id to remove from state
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    actionStatus: 'idle', // For create/update/delete operations
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
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Create
      .addCase(createProduct.pending, (state) => {
        state.actionStatus = 'loading';
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.items.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.actionError = action.payload;
      })
      // Update
      .addCase(updateProduct.pending, (state) => {
        state.actionStatus = 'loading';
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.actionError = action.payload;
      })
      // Delete
      .addCase(deleteProduct.pending, (state) => {
        state.actionStatus = 'loading';
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.actionError = action.payload;
      });
  },
});

export const { resetActionStatus } = productSlice.actions;
export default productSlice.reducer;
