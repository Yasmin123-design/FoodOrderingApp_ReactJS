import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import categoryReducer from './slices/categorySlice';
import orderReducer from './slices/orderSlice';
import statReducer from './slices/statSlice';
import productReducer from './slices/productSlice';
import customerMenuReducer from './slices/customerMenuSlice';
import customerOrderReducer from './slices/customerOrderSlice';
import cartReducer from './slices/cartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoryReducer,
    orders: orderReducer,
    stats: statReducer,
    products: productReducer,
    customerMenu: customerMenuReducer,
    customerOrders: customerOrderReducer,
    cart: cartReducer,
  },
});
