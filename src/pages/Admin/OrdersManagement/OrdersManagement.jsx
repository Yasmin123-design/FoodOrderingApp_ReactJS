import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../../redux/slices/orderSlice';
import AdminSidebar from '../../../components/AdminSidebar/AdminSidebar';
import Modal from '../../../components/Modal/Modal';
import './OrdersManagement.css';

const OrdersManagement = () => {
  const dispatch = useDispatch();
  const { items: orders, status } = useSelector((state) => state.orders);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchOrders());
    }
  }, [status, dispatch]);

  // Calculate Stats
  const stats = useMemo(() => {
    let totalVolume = 0;
    let pendingCount = 0;
    let activeDeliveriesCount = 0;

    orders.forEach(order => {
      totalVolume += order.totalAmount;
      if (order.status === 'PENDING') pendingCount++;
      if (order.status === 'ON_THE_WAY') activeDeliveriesCount++;
    });

    return { totalVolume, pendingCount, activeDeliveriesCount };
  }, [orders]);

  const handleViewOrder = useCallback((order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const shortenId = (id) => {
    return `#ORD-${id.substring(0, 4).toUpperCase()}`;
  };

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
        
        // Handle nested user object
        if (sortConfig.key === 'user') {
          aValue = a.user.name.toLowerCase();
          bValue = b.user.name.toLowerCase();
        } else if (typeof aValue === 'string') {
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

  return (
    <div className="admin-layout" dir="ltr">
      <AdminSidebar />
      <div className="admin-content">
        <div className="orders-header">
          <div>
            <h2>Orders Management</h2>
            <p>Review and manage customer food orders and logistics status.</p>
          </div>
    
        </div>

        {/* Stats Section */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-info">
              <p>Total Volume Today</p>
              <h3>{formatCurrency(stats.totalVolume)}</h3>
              <span className="trend positive">~ +14% from yesterday</span>
            </div>
            <div className="stat-icon total-icon">💵</div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <p>Pending Orders</p>
              <h3>{stats.pendingCount}</h3>
            </div>
            <div className="progress-bar pending-bar"></div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <p>Active Deliveries</p>
              <h3>{stats.activeDeliveriesCount}</h3>
            </div>
            <div className="progress-bar active-bar"></div>
          </div>
        </div>

        {/* Orders Table Section */}
        <div className="table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th onClick={() => requestSort('id')} style={{cursor: 'pointer'}}>Order ID {sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}</th>
                <th onClick={() => requestSort('user')} style={{cursor: 'pointer'}}>Username / Email {sortConfig.key === 'user' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}</th>
                <th onClick={() => requestSort('paymentMethod')} style={{cursor: 'pointer'}}>Payment {sortConfig.key === 'paymentMethod' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}</th>
                <th onClick={() => requestSort('totalAmount')} style={{cursor: 'pointer'}}>Total {sortConfig.key === 'totalAmount' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}</th>
                <th onClick={() => requestSort('status')} style={{cursor: 'pointer'}}>Status {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && status !== 'loading' && (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No orders found.</td></tr>
              )}
              {status === 'loading' && (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>Loading orders...</td></tr>
              )}
              {sortedOrders.map(order => (
                <tr key={order.id}>
                  <td>
                    <div className="order-id">
                      {shortenId(order.id)}
                      <span className="time-ago">Just now</span>
                    </div>
                  </td>
                  <td>
                    <div className="user-info">
                      <div className="avatar">{order.user.name.substring(0, 2).toUpperCase()}</div>
                      <div>
                        <div className="user-name">{order.user.name}</div>
                        <div className="user-email">{order.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="payment-info">
                      <span className="icon">💳</span> {order.paymentMethod}
                    </div>
                  </td>
                  <td className="total-amount">{formatCurrency(order.totalAmount)}</td>
                  <td>
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn view-btn" onClick={() => handleViewOrder(order)}>
                      👁️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-footer">
            <p>Showing {orders.length} orders</p>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Order Details: ${selectedOrder ? shortenId(selectedOrder.id) : ''}`}
      >
        {selectedOrder && (
          <div className="order-details-modal">
            <div className="details-grid">
              <div className="detail-section">
                <h4>Customer Info</h4>
                <p><strong>Name:</strong> {selectedOrder.user.name}</p>
                <p><strong>Email:</strong> {selectedOrder.user.email}</p>
                <p><strong>Address:</strong> {selectedOrder.address}</p>
              </div>
              <div className="detail-section">
                <h4>Order Summary</h4>
                <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                <p><strong>Status:</strong> <span className={`status-badge ${selectedOrder.status.toLowerCase()}`}>{selectedOrder.status}</span></p>
                <p><strong>Payment:</strong> {selectedOrder.paymentMethod}</p>
              </div>
              {selectedOrder.paymentMethod === 'ONLINE' && selectedOrder.paymentProof && (
                <div className="detail-section" style={{ gridColumn: 'span 2' }}>
                  <h4>Payment Proof</h4>
                  <div style={{ backgroundImage: `url(${selectedOrder.paymentProof})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '200px', borderRadius: '8px', border: '1px solid #ddd' }}></div>
                </div>
              )}
            </div>

            <h4 className="items-heading">Order Items</h4>
            <div className="order-items-list">
              {selectedOrder.orderItems.map(item => (
                <div key={item.id} className="order-item">
                  <div className="item-image" style={{ backgroundImage: `url(${item.product.image})` }}></div>
                  <div className="item-details">
                    <h5>{item.product.nameEn} <span className="item-ar" dir="rtl">({item.product.nameAr})</span></h5>
                    <p className="item-price">{formatCurrency(item.price)} x {item.quantity}</p>
                  </div>
                  <div className="item-subtotal">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="order-total-summary">
              <h3>Total Amount: <span>{formatCurrency(selectedOrder.totalAmount)}</span></h3>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrdersManagement;
