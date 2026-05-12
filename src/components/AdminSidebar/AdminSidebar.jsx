import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { useUI } from '../../context/UIContext';
import './AdminSidebar.css';

const AdminSidebar = React.memo(() => {
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
        <h2>Admin Portal</h2>
        <p>Management Dashboard</p>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/admin/products" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
           <span className="icon">📦</span> Products
        </NavLink>
        <NavLink to="/admin/categories" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
           <span className="icon">📂</span> Categories
        </NavLink>
        <NavLink to="/admin/orders" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
           <span className="icon">📝</span> Orders
        </NavLink>
        <NavLink to="/admin/stats" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
           <span className="icon">📈</span> Stats
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

export default AdminSidebar;
