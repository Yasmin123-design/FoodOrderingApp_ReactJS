import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store } from './redux/store';
import MainLayout from './components/Layout/MainLayout';
import { UIProvider } from './context/UIContext';

// Lazy load pages for performance
const Login = lazy(() => import('./pages/Login/Login'));
const Register = lazy(() => import('./pages/Register/Register'));
const CategoryManagement = lazy(() => import('./pages/Admin/CategoryManagement/CategoryManagement'));
const OrdersManagement = lazy(() => import('./pages/Admin/OrdersManagement/OrdersManagement'));
const StatsManagement = lazy(() => import('./pages/Admin/StatsManagement/StatsManagement'));
const ProductsManagement = lazy(() => import('./pages/Admin/ProductsManagement/ProductsManagement'));
const Menu = lazy(() => import('./pages/Customer/Menu/Menu'));
const MyOrders = lazy(() => import('./pages/Customer/MyOrders/MyOrders'));
const MyCart = lazy(() => import('./pages/Customer/MyCart/MyCart'));

// A simple loading fallback
const Loader = () => <div style={{textAlign: 'center', padding: '50px'}}>جاري التحميل...</div>;

// Admin Protected Route
const AdminRoute = ({ children }) => {
  const { user, token } = useSelector(state => state.auth);
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user is admin
  if (user?.email !== 'admin@foodapp.com') {
    return <Navigate to="/" replace />; // Or unauthorized page
  }

  return children;
};

// Customer Protected Route
const CustomerRoute = ({ children }) => {
  const { token } = useSelector(state => state.auth);
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Router Setup Component to allow using useSelector
const AppRoutes = () => {
  return (
    <Router>
      <UIProvider>
        <Suspense fallback={<Loader />}>
        <Routes>
          {/* Main Layout containing Header & Footer */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/login" replace />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            
            {/* Admin Routes */}
            <Route path="admin" element={<AdminRoute><Outlet /></AdminRoute>}>
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="products" element={<ProductsManagement />} />
              <Route path="orders" element={<OrdersManagement />} />
              <Route path="stats" element={<StatsManagement />} />
              {/* Other admin routes can be added here */}
            </Route>

            {/* Customer Routes */}
            <Route path="menu" element={<CustomerRoute><Menu /></CustomerRoute>} />
            <Route path="cart" element={<CustomerRoute><MyCart /></CustomerRoute>} />
            <Route path="my-orders" element={<CustomerRoute><MyOrders /></CustomerRoute>} />

            <Route path="*" element={<div style={{padding: '50px', textAlign: 'center'}}>الصفحة غير موجودة</div>} />
          </Route>
        </Routes>
      </Suspense>
      </UIProvider>
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
}

export default App;
