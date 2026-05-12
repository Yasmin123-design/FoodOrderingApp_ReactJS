import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStats } from '../../../redux/slices/statSlice';
import AdminSidebar from '../../../components/AdminSidebar/AdminSidebar';
import './StatsManagement.css';

const StatsManagement = () => {
  const dispatch = useDispatch();
  const { data, status } = useSelector((state) => state.stats);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchStats());
    }
  }, [status, dispatch]);

  const handleRefresh = () => {
    dispatch(fetchStats());
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

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
            <button className="btn-primary" onClick={handleRefresh} disabled={status === 'loading'}>
              {status === 'loading' ? 'Refreshing...' : 'Refresh Data'}
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
              <h3>{data.totalOrders}</h3>
              <span className="kpi-trend positive">📈 +50% vs last month</span>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon-wrapper purple">
              <span className="icon">📦</span>
            </div>
            <div className="kpi-content">
              <p>Total Products</p>
              <h3>{data.totalProducts}</h3>
              <span className="kpi-trend neutral">Active Inventory</span>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon-wrapper green">
              <span className="icon">📂</span>
            </div>
            <div className="kpi-content">
              <p>Total Categories</p>
              <h3>{data.totalCategories}</h3>
              <span className="kpi-trend neutral">Structured Hierarchy</span>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon-wrapper red">
              <span className="icon">👥</span>
            </div>
            <div className="kpi-content">
              <p>Total Users</p>
              <h3>{data.totalUsers}</h3>
              <span className="kpi-trend positive">👤+ Growing community</span>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="charts-grid">
          {/* Revenue Chart Simulation */}
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <p>Total Revenue</p>
                <h2 className="revenue-amount">{formatCurrency(data.totalRevenue)}</h2>
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
                <div className="bar bar-15"></div>
                <div className="bar bar-25"></div>
                <div className="bar bar-10"></div>
                <div className="bar active bar-5"></div>
                <div className="bar bar-12"></div>
                <div className="bar bar-18"></div>
              </div>
              <div className="chart-x-labels">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>
            </div>

            {data.totalRevenue === 0 && (
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
