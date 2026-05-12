import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { useUI } from '../../context/UIContext';
import '../AdminSidebar/AdminSidebar.css'; // Reuse Admin Sidebar styles completely

const CustomerSidebar = React.memo(() => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSidebarOpen, closeSidebar } = useUI();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      <div className={`sidebar-backdrop ${isSidebarOpen ? 'open' : ''}`} onClick={closeSidebar}></div>
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="portal-title">Customer Portal</h2>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/menu" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
             <span className="icon">📖</span> Menu
          </NavLink>
          <NavLink to="/cart" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
             <span className="icon">🛒</span> My Cart
          </NavLink>
          <NavLink to="/my-orders" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
             <span className="icon">📦</span> My Orders
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item logout-item" onClick={handleLogout}>
             <span className="icon">🚪</span> Logout
          </div>
        </div>
      </aside>
  </>
);
});

export default CustomerSidebar;
