import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  fetchCart, 
  incrementItem, 
  decrementItem, 
  removeItem, 
  clearCart, 
  checkout,
  resetCheckoutStatus 
} from '../../../redux/slices/cartSlice';
import CustomerSidebar from '../../../components/CustomerSidebar/CustomerSidebar';
import Modal from '../../../components/Modal/Modal';
import './MyCart.css';

const MyCart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, status, checkoutStatus, checkoutError } = useSelector((state) => state.cart);
  
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    address: '',
    paymentMethod: 'CASH',
    file: null
  });

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    if (checkoutStatus === 'succeeded') {
      setIsCheckoutModalOpen(false);
      dispatch(resetCheckoutStatus());
      navigate('/my-orders');
    }
  }, [checkoutStatus, navigate, dispatch]);

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [items]);

  const deliveryFee = 0;
  const tax = subtotal * 0.05; // 5% VAT
  const total = subtotal + deliveryFee + tax;

  const handleIncrement = (productId) => {
    dispatch(incrementItem(productId));
  };

  const handleDecrement = (productId, currentQty) => {
    if (currentQty > 1) {
      dispatch(decrementItem(productId));
    } else {
      dispatch(removeItem(productId));
    }
  };

  const handleRemove = (productId) => {
    dispatch(removeItem(productId));
  };

  const handleClear = () => {
    setIsClearModalOpen(true);
  };

  const confirmClear = () => {
    dispatch(clearCart());
    setIsClearModalOpen(false);
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!checkoutData.address) {
      alert('Please provide a delivery address');
      return;
    }
    if (checkoutData.paymentMethod === 'ONLINE' && !checkoutData.file) {
      alert('Please upload payment proof for online payment');
      return;
    }
    dispatch(checkout(checkoutData));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (status === 'loading' && items.length === 0) {
    return (
      <div className="customer-layout">
        <CustomerSidebar />
        <div className="customer-content">
          <div className="cart-container">
            <p>Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-layout" dir="ltr">
      <CustomerSidebar />
      <div className="customer-content">
        <div className="cart-container">
          <div className="cart-header">
            <div>
              <h2>Your Shopping Cart</h2>
              <p>Review your selection and proceed to checkout.</p>
            </div>
            {items.length > 0 && (
              <button className="clear-cart-btn" onClick={handleClear}>
                <span>🗑️</span> Clear Cart
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="empty-cart">
              <span className="icon">🛒</span>
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added anything to your cart yet.</p>
              <Link to="/menu" className="browse-menu-btn">Browse Menu</Link>
            </div>
          ) : (
            <div className="cart-content-grid">
              <div className="cart-items-list">
                {items.map((item) => (
                  <div key={item.id} className="cart-item-card">
                    <div 
                      className="cart-item-image" 
                      style={{ backgroundImage: `url(${item.product.image || 'https://via.placeholder.com/150'})` }}
                    ></div>
                    <div className="cart-item-info">
                      <h4>{item.product.nameEn} / {item.product.nameAr}</h4>
                      <p className="description">{item.product.descriptionEn || 'No description available.'}</p>
                    </div>
                    <div className="cart-item-actions">
                      <div className="quantity-control">
                        <button className="qty-btn" onClick={() => handleDecrement(item.productId, item.quantity)}>−</button>
                        <span className="qty-value">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => handleIncrement(item.productId)}>+</button>
                      </div>
                      <div className="item-price">
                        {formatCurrency(item.product.price * item.quantity)}
                      </div>
                      <button className="remove-btn" onClick={() => handleRemove(item.productId)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-summary-card">
                <h3>Order Summary</h3>
                <div className="summary-details">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax (VAT 5%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

              

                <button 
                  className="checkout-btn" 
                  onClick={() => setIsCheckoutModalOpen(true)}
                >
                  Proceed to Checkout
                </button>

                <div className="delivery-info">
                  <div className="info-item">
                    <span className="icon">🕒</span>
                    <span>Estimated Delivery: 25-35 mins</span>
                  </div>
                  <div className="info-item">
                    <span className="icon">🛡️</span>
                    <span>Secure Payment Guaranteed</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isCheckoutModalOpen} 
        onClose={() => setIsCheckoutModalOpen(false)}
        title="Complete Your Order"
      >
        <form onSubmit={handleCheckoutSubmit} className="checkout-modal-content">
          <div className="form-group">
            <label>Delivery Address</label>
            <textarea 
              placeholder="e.g. 123 Street, Cairo" 
              value={checkoutData.address}
              onChange={(e) => setCheckoutData({...checkoutData, address: e.target.value})}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <div className="payment-methods">
              <div 
                className={`payment-option ${checkoutData.paymentMethod === 'CASH' ? 'active' : ''}`}
                onClick={() => setCheckoutData({...checkoutData, paymentMethod: 'CASH'})}
              >
                💵 Cash on Delivery
              </div>
              <div 
                className={`payment-option ${checkoutData.paymentMethod === 'ONLINE' ? 'active' : ''}`}
                onClick={() => setCheckoutData({...checkoutData, paymentMethod: 'ONLINE'})}
              >
                💳 Online Payment
              </div>
            </div>
          </div>

          {checkoutData.paymentMethod === 'ONLINE' && (
            <div className="form-group">
              <label>Upload Payment Proof (Screenshot)</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setCheckoutData({...checkoutData, file: e.target.files[0]})}
                required
              />
            </div>
          )}

          {checkoutError && <p style={{color: 'red', marginBottom: '1rem'}}>{checkoutError}</p>}

          <button 
            type="submit" 
            className="checkout-btn"
            disabled={checkoutStatus === 'loading'}
          >
            {checkoutStatus === 'loading' ? 'Processing...' : `Place Order (${formatCurrency(total)})`}
          </button>
        </form>
      </Modal>

      <Modal 
        isOpen={isClearModalOpen} 
        onClose={() => setIsClearModalOpen(false)}
        title="Confirmation Required"
      >
        <ClearCartConfirmation 
          onConfirm={confirmClear} 
          onCancel={() => setIsClearModalOpen(false)} 
        />
      </Modal>
    </div>
  );
};

const ClearCartConfirmation = ({ onConfirm, onCancel }) => (
  <div className="confirmation-modal-content">
    <div className="warning-icon">⚠️</div>
    <h3>Clear Shopping Cart?</h3>
    <p>This will remove all items from your cart. This action cannot be undone.</p>
    <div className="confirmation-actions">
      <button className="cancel-btn" onClick={onCancel}>Cancel</button>
      <button className="confirm-btn" onClick={onConfirm}>Yes, Clear Everything</button>
    </div>
  </div>
);

export default MyCart;
