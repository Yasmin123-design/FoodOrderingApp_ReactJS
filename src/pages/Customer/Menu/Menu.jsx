import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomerMenu, searchProducts, clearSearch } from '../../../redux/slices/customerMenuSlice';
import { fetchMyOrders } from '../../../redux/slices/customerOrderSlice';
import { addToCart } from '../../../redux/slices/cartSlice';
import CustomerSidebar from '../../../components/CustomerSidebar/CustomerSidebar';
import './Menu.css';

const Menu = () => {
  const dispatch = useDispatch();
  const { categories, searchResults, isSearching, status } = useSelector((state) => state.customerMenu);
  const { items: orders } = useSelector((state) => state.customerOrders);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    dispatch(fetchCustomerMenu());
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() === '') {
      dispatch(clearSearch());
    } else {
      dispatch(searchProducts(searchTerm));
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    dispatch(clearSearch());
  };

  const [notification, setNotification] = useState(null);

  const handleAddToCart = (product) => {
    dispatch(addToCart(product))
      .unwrap()
      .then(() => {
        setNotification({ 
          type: 'success', 
          message: `✨ ${product.nameEn} added to your gourmet collection!` 
        });
        setTimeout(() => setNotification(null), 3000);
      })
      .catch((err) => {
        setNotification({ 
          type: 'error', 
          message: err || 'Failed to add item to cart' 
        });
        setTimeout(() => setNotification(null), 4000);
      });
  };

  // If we are searching, we display searchResults. 
  // Otherwise, we display products based on activeCategory
  const displayedProducts = useMemo(() => {
    if (isSearching) {
      return searchResults;
    }
    
    if (activeCategory === 'ALL') {
      // Flatten all products from all categories
      return categories.reduce((acc, cat) => {
        if (cat.products) {
          return [...acc, ...cat.products];
        }
        return acc;
      }, []);
    } else {
      const category = categories.find(c => c.id === activeCategory);
      return category?.products || [];
    }
  }, [categories, searchResults, isSearching, activeCategory]);

  return (
    <div className="customer-layout" dir="ltr">
      <CustomerSidebar />
      <div className="customer-content">
        {/* Professional Notification Toast */}
        {notification && (
          <div className={`toast-notification ${notification.type}`}>
            <div className="toast-content">
              {notification.message}
            </div>
          </div>
        )}

        <div className="menu-page-header">
          <div className="menu-title-section">
            <h2 className="exquisite-title">Exquisite Menu</h2>
            <p className="exquisite-subtitle">Discover authentic flavors from Epicurean Express</p>
          </div>
          
          <form className="search-box" onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="Search for pizza, burger..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-btn">🔍</button>
            {isSearching && <button type="button" className="clear-btn" onClick={handleClearSearch}>✖</button>}
          </form>
        </div>

        {!isSearching && (
          <div className="category-pills">
            <button 
              className={`pill ${activeCategory === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveCategory('ALL')}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id} 
                className={`pill ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.nameEn}
              </button>
            ))}
          </div>
        )}

        <div className="menu-grid">
          {status === 'loading' && <p>Loading delicious items...</p>}
          {status === 'succeeded' && displayedProducts.length === 0 && <p>No items found.</p>}
          
          {status === 'succeeded' && displayedProducts.map(product => (
            <div key={product.id} className="menu-card">
              <div className="menu-card-img" style={{ backgroundImage: `url(${product.image || 'https://via.placeholder.com/300x200'})` }}></div>
              <div className="menu-card-body">
                <div className="card-title-row">
                  <h3>{product.nameEn}</h3>
                  {/* Mock badge for styling purposes based on image */}
                  <span className="product-badge">{product.price > 100 ? 'Premium' : 'Best Seller'}</span>
                </div>
                <p className="ar-name" dir="rtl">{product.nameAr}</p>
                <p className="product-desc">{product.descriptionEn?.substring(0, 50) || 'Delicious authentic food cooked with fresh ingredients.'}...</p>
                <div className="price-row">
                  <span className="price">${product.price}</span>
                  <button className="add-cart-btn" onClick={() => handleAddToCart(product)}>
                    + Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* My Recent Orders Section */}
        <div className="recent-orders-section">
          <h3>My Recent Orders</h3>
          <table className="recent-orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 3).map(order => (
                <tr key={order.id}>
                  <td className="fw-500">#{order.id.substring(0,8).toUpperCase()}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'})}</td>
                  <td className="fw-bold-red">{order.totalAmount} SAR</td>
                  <td>
                    <span className={`status-pill ${order.status.toLowerCase()}`}>{order.status}</span>
                  </td>
                  <td>
                    <a href="/my-orders" className="view-details-link">View Details</a>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan="5" className="empty-table-cell">No recent orders.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Menu;
