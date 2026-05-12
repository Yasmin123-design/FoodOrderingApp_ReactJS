import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

// Fetch standard menu (Categories with nested products)
export const fetchCustomerMenu = createAsyncThunk(
  'customerMenu/fetchCustomerMenu',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/categories'); // Base url without /admin
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch menu');
    }
  }
);

// Search for specific products
export const searchProducts = createAsyncThunk(
  'customerMenu/searchProducts',
  async (searchTerm, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/products?search=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search products');
    }
  }
);

const customerMenuSlice = createSlice({
  name: 'customerMenu',
  initialState: {
    categories: [],
    searchResults: [],
    isSearching: false,
    status: 'idle',
    error: null,
  },
  reducers: {
    clearSearch: (state) => {
      state.isSearching = false;
      state.searchResults = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Menu
      .addCase(fetchCustomerMenu.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCustomerMenu.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categories = action.payload;
      })
      .addCase(fetchCustomerMenu.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Search
      .addCase(searchProducts.pending, (state) => {
        state.status = 'loading';
        state.isSearching = true;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.searchResults = action.payload;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearSearch } = customerMenuSlice.actions;
export default customerMenuSlice.reducer;
