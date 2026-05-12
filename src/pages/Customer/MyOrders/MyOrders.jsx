import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../../../redux/slices/customerOrderSlice';
import CustomerSidebar from '../../../components/CustomerSidebar/CustomerSidebar';
import Modal from '../../../components/Modal/Modal';
import './MyOrders.css';

console.log("CustomerSidebar is: ", CustomerSidebar);
console.log("Modal is: ", Modal);

const MyOrders = () => {
  const dispatch = useDispatch();
  const { items: orders, status } = useSelector((state) => state.customerOrders);

  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // Calculate Stats
  const stats = useMemo(() => {
    let totalSpent = 0;
    let pendingDelivery = 0;
    
    orders.forEach(order => {
      totalSpent += order.totalAmount;
      if (order.status === 'PENDING' || order.status === 'ON_THE_WAY') {
        pendingDelivery++;
      }
    });

    return { totalOrders: orders.length, totalSpent, pendingDelivery };
  }, [orders]);

  // Sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedOrders = useMemo(() => {
    let sortableItems = [...orders];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [orders, sortConfig]);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="customer-layout" dir="ltr">
      <CustomerSidebar />
      <div className="customer-content">
        <div className="orders-header">
          <h2>My Orders</h2>
          <p>View and track all your Epicurean Express orders.</p>
        </div>

        {/* Stats Section */}
        <div className="myorders-stats-row">
          <div className="myorders-stat-card">
            <div className="icon-wrapper light-red">🛍️</div>
            <div className="stat-text">
              <p>Total Orders</p>
              <h3>{stats.totalOrders}</h3>
            </div>
          </div>
          <div className="myorders-stat-card">
            <div className="icon-wrapper light-teal">💳</div>
            <div className="stat-text">
              <p>Total Spent</p>
              <h3>{formatCurrency(stats.totalSpent)}</h3>
            </div>
          </div>
          <div className="myorders-stat-card">
            <div className="icon-wrapper light-purple">🚚</div>
            <div className="stat-text">
              <p>Pending Delivery</p>
              <h3>{stats.pendingDelivery}</h3>
            </div>
          </div>
        </div>

        <div className="myorders-table-container">
          <div className="table-header-row">
            <h3>Recent Orders</h3>
          </div>
          
          <table className="myorders-table">
            <thead>
              <tr>
                <th onClick={() => requestSort('id')}>ORDER ID {sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}</th>
                <th onClick={() => requestSort('createdAt')}>DATE {sortConfig.key === 'createdAt' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}</th>
                <th onClick={() => requestSort('totalAmount')}>TOTAL {sortConfig.key === 'totalAmount' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}</th>
                <th onClick={() => requestSort('status')}>STATUS {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {status === 'loading' && <tr><td colSpan="5" className="empty-table-cell">Loading orders...</td></tr>}
              {status === 'succeeded' && sortedOrders.length === 0 && (
                 <tr><td colSpan="5" className="empty-table-cell">No orders found.</td></tr>
              )}
              {status === 'succeeded' && sortedOrders.map(order => (
                <tr key={order.id}>
                  <td className="fw-bold-red">#{order.id.substring(0,8).toUpperCase()}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'})}</td>
                  <td className="fw-500">{order.totalAmount} SAR</td>
                  <td>
                    <span className={`status-pill ${order.status.toLowerCase()}`}>{order.status}</span>
                  </td>
                  <td>
                    <button className="icon-btn" onClick={() => handleViewOrder(order)}>👁️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Order Details: #${selectedOrder ? selectedOrder.id.substring(0,8).toUpperCase() : ''}`}
      >
        {selectedOrder && (
          <div className="order-details-modal">
            <div className="details-grid">
              <div className="detail-section">
                <h4>Order Info</h4>
                <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                <p><strong>Status:</strong> <span className={`status-pill ${selectedOrder.status.toLowerCase()}`}>{selectedOrder.status}</span></p>
                <p><strong>Payment:</strong> {selectedOrder.paymentMethod}</p>
              </div>
              <div className="detail-section">
                <h4>Delivery Address</h4>
                <p>{selectedOrder.address}</p>
              </div>
              {selectedOrder.paymentMethod === 'ONLINE' && selectedOrder.paymentProof && (
                <div className="payment-proof-section">
                  <h4>Payment Proof</h4>
                  <div className="payment-proof-img" style={{ backgroundImage: `url(${selectedOrder.paymentProof})` }}></div>
                </div>
              )}
            </div>

            <h4 className="items-heading">Order Items</h4>
            <div className="order-items-list">
              {selectedOrder.orderItems?.length > 0 ? selectedOrder.orderItems.map(item => (
                <div key={item.id} style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f9f9f9'}}>
                  <div>
                    <span className="item-name">{item.product?.nameEn || 'Unknown Item'}</span>
                    <span className="item-qty">x {item.quantity}</span>
                  </div>
                  <div>{formatCurrency(item.price * item.quantity)}</div>
                </div>
              )) : <p>No items found in this order.</p>}
            </div>
            
            <div className="order-total-summary">
              Total Amount: <span className="total-val">{formatCurrency(selectedOrder.totalAmount)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyOrders;
