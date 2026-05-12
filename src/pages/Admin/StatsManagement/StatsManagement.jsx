import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStats } from '../../../redux/slices/statSlice';
import { fetchOrders } from '../../../redux/slices/orderSlice';
import AdminSidebar from '../../../components/AdminSidebar/AdminSidebar';
import './StatsManagement.css';

const StatsManagement = () => {
  const dispatch = useDispatch();
  const { data: apiData, status: statStatus } = useSelector((state) => state.stats);
  const { items: orders, status: orderStatus } = useSelector((state) => state.orders);

  useEffect(() => {
    if (statStatus === 'idle') dispatch(fetchStats());
    if (orderStatus === 'idle') dispatch(fetchOrders());
  }, [statStatus, orderStatus, dispatch]);

  const handleRefresh = () => {
    dispatch(fetchStats());
    dispatch(fetchOrders());
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // Calculate Real Data from Orders
  const dashboardStats = useMemo(() => {
    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Group by day for the last 6 days
    const last6Days = [...Array(6)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (5 - i));
      return d.toISOString().split('T')[0];
    });

    const revenueByDay = last6Days.map(day => {
      const dayTotal = deliveredOrders
        .filter(o => o.createdAt.split('T')[0] === day)
        .reduce((sum, o) => sum + o.totalAmount, 0);
      return {
        label: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
        value: dayTotal
      };
    });

    // Find max for scaling bars
    const maxVal = Math.max(...revenueByDay.map(d => d.value), 100);

    return { totalRevenue, revenueByDay, maxVal };
  }, [orders]);

  return (
    <div className="admin-layout" dir="ltr">
      <AdminSidebar />
      <div className="admin-content">
        <div className="stats-header-top">
          <div>
            <h2>Platform Statistics</h2>
            <p>Real-time performance overview and administrative metrics.</p>
          </div>
          <div className="stats-header-actions">
            <button className="btn-secondary">Download Report</button>
            <button className="btn-primary" onClick={handleRefresh} disabled={statStatus === 'loading'}>
              {statStatus === 'loading' ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {/* Top 4 Cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon-wrapper orange">
              <span className="icon">🧾</span>
            </div>
            <div className="kpi-content">
              <p>Total Orders</p>
              <h3>{apiData.totalOrders}</h3>
              <span className="kpi-trend positive">📈 +50% vs last month</span>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon-wrapper purple">
              <span className="icon">📦</span>
            </div>
            <div className="kpi-content">
              <p>Total Products</p>
              <h3>{apiData.totalProducts}</h3>
              <span className="kpi-trend neutral">Active Inventory</span>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon-wrapper green">
              <span className="icon">📂</span>
            </div>
            <div className="kpi-content">
              <p>Total Categories</p>
              <h3>{apiData.totalCategories}</h3>
              <span className="kpi-trend neutral">Structured Hierarchy</span>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon-wrapper red">
              <span className="icon">👥</span>
            </div>
            <div className="kpi-content">
              <p>Total Users</p>
              <h3>{apiData.totalUsers}</h3>
              <span className="kpi-trend positive">👤+ Growing community</span>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <p>Total Revenue (Delivered)</p>
                <h2 className="revenue-amount">{formatCurrency(dashboardStats.totalRevenue)}</h2>
              </div>
              <div className="kpi-icon-wrapper orange-light">
                <span className="icon">💵</span>
              </div>
            </div>

            <div className="chart-simulation">
              <div className="chart-y-lines">
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
              </div>
              <div className="chart-bars">
                {dashboardStats.revenueByDay.map((day, idx) => {
                  const heightPercentage = Math.max((day.value / dashboardStats.maxVal) * 100, 5);
                  return (
                    <div 
                      key={idx} 
                      className={`bar ${idx === 5 ? 'active' : ''}`} 
                      style={{ height: `${heightPercentage}%` }}
                      title={`${day.label}: ${formatCurrency(day.value)}`}
                    ></div>
                  );
                })}
              </div>
              <div className="chart-x-labels">
                {dashboardStats.revenueByDay.map((day, idx) => (
                  <span key={idx}>{day.label}</span>
                ))}
              </div>
            </div>

            {dashboardStats.totalRevenue === 0 && (
              <div className="revenue-warning">
                <span className="icon alert-icon">⚠️</span>
                <p>Revenue is currently at $0. Check your payment gateway configurations.</p>
              </div>
            )}
          </div>

          {/* Order Source */}
          <div className="source-card">
            <h4>Order Source</h4>
            
            <div className="source-item">
              <div className="source-labels">
                <span>Mobile App</span>
                <span>0%</span>
              </div>
              <div className="source-progress"><div className="fill fill-0"></div></div>
            </div>
            <div className="source-item">
              <div className="source-labels">
                <span>Web Portal</span>
                <span>0%</span>
              </div>
              <div className="source-progress"><div className="fill fill-0"></div></div>
            </div>
            <div className="source-item">
              <div className="source-labels">
                <span>External API</span>
                <span>0%</span>
              </div>
              <div className="source-progress"><div className="fill fill-0"></div></div>
            </div>

            <div className="pro-tip">
              <h5>Pro Tip</h5>
              <p>Run a flash sale on your single Product to boost the revenue metric today.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StatsManagement;
