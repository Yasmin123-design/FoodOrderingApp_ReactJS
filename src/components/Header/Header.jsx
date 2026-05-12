import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useUI } from '../../context/UIContext';
import './Header.css';

const Header = React.memo(() => {
  const { user } = useSelector(state => state.auth);
  const { items: cartItems } = useSelector(state => state.cart);
  const { toggleSidebar } = useUI();

  return (
    <header className="header">
      <div className="header-left">
        {user && (
          <button className="hamburger-menu" onClick={toggleSidebar}>
            ☰
          </button>
        )}
        <Link to="/" className="logo">Epicurean Express</Link>
      </div>
    
      <div className="header-right">
        <span className="icon">🌐</span>
        {user && user.email !== 'admin@foodapp.com' && (
          <span className="icon cart-icon-wrapper">
            🛒
            {cartItems.length > 0 && (
              <span className="cart-badge">
                {cartItems.length}
              </span>
            )}
          </span>
        )}
        <span className="icon">👤</span>
      </div>
    </header>
  );
});

export default Header;
