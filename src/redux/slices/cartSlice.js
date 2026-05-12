import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';
import { fetchMyOrders } from './customerOrderSlice';

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/cart');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (product, { rejectWithValue, dispatch }) => {
    try {
      // Assuming POST /cart adds an item or increments if exists
      const response = await axiosInstance.post('/cart/add', { productId: product.id, quantity: 1 });
      dispatch(fetchCart());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const incrementItem = createAsyncThunk(
  'cart/incrementItem',
  async (productId, { rejectWithValue, dispatch }) => {
    try {
      await axiosInstance.patch(`/cart/item/${productId}/increment`);
      dispatch(fetchCart());
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to increment');
    }
  }
);

export const decrementItem = createAsyncThunk(
  'cart/decrementItem',
  async (productId, { rejectWithValue, dispatch }) => {
    try {
      await axiosInstance.patch(`/cart/item/${productId}/decrement`);
      dispatch(fetchCart());
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to decrement');
    }
  }
);

export const removeItem = createAsyncThunk(
  'cart/removeItem',
  async (productId, { rejectWithValue, dispatch }) => {
    try {
      // If there's no specific remove, we might need one. 
      // Assuming DELETE /cart/item/${productId} or just decrement until 0.
      // Let's assume DELETE /cart/item/${productId} exists or use decrement if quantity is 1.
      await axiosInstance.delete(`/cart/item/${productId}`);
      dispatch(fetchCart());
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await axiosInstance.delete('/cart/clear');
      dispatch(fetchCart());
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

export const checkout = createAsyncThunk(
  'cart/checkout',
  async (orderData, { rejectWithValue, dispatch }) => {
    try {
      let response;
      if (orderData.paymentMethod === 'ONLINE') {
        const formData = new FormData();
        formData.append('address', orderData.address);
        formData.append('paymentMethod', orderData.paymentMethod);
        formData.append('file', orderData.file);
        response = await axiosInstance.post('/orders/checkout', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        const { address, paymentMethod } = orderData;
        response = await axiosInstance.post('/orders/checkout', { address, paymentMethod });
      }
      await dispatch(fetchCart());
      await dispatch(fetchMyOrders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Checkout failed');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    cartId: null,
    status: 'idle',
    error: null,
    checkoutStatus: 'idle',
    checkoutError: null,
  },
  reducers: {
    resetCheckoutStatus: (state) => {
      state.checkoutStatus = 'idle';
      state.checkoutError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items || [];
        state.cartId = action.payload.id;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(checkout.pending, (state) => {
        state.checkoutStatus = 'loading';
      })
      .addCase(checkout.fulfilled, (state) => {
        state.checkoutStatus = 'succeeded';
        state.items = [];
      })
      .addCase(checkout.rejected, (state, action) => {
        state.checkoutStatus = 'failed';
        state.checkoutError = action.payload;
      });
  }
});

export const { resetCheckoutStatus } = cartSlice.actions;
export default cartSlice.reducer;
