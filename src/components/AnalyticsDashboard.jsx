import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

const AnalyticsDashboard = ({ campaignId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [realTimeData, setRealTimeData] = useState([]);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [campaignId]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/analytics`);
      const data = await response.json();
      setAnalytics(data);
      
      // Add to real-time data for charts
      setRealTimeData(prev => [
        ...prev.slice(-23), // Keep last 24 data points
        {
          time: new Date().toLocaleTimeString(),
          spend: data.totalSpend,
          clicks: data.totalClicks,
          conversions: data.totalConversions,
        },
      ]);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const optimizeBudget = async () => {
    setIsOptimizing(true);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/optimize`, {
        method: 'POST',
      });
      const result = await response.json();
      
      // Refresh analytics after optimization
      await fetchAnalytics();
      
      // Show success notification
      alert('Budget optimized successfully!');
    } catch (error) {
      console.error('Error optimizing budget:', error);
      alert('Optimization failed. Please try again.');
    }
    setIsOptimizing(false);
  };

  if (!analytics) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  const platformData = Object.entries(analytics.platformBreakdown).map(([platform, data]) => ({
    name: platform,
    spend: data.spend,
    conversions: data.conversions,
  }));

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h1>Campaign Analytics</h1>
        <button 
          onClick={optimizeBudget}
          disabled={isOptimizing}
          className="btn primary optimize-btn"
        >
          {isOptimizing ? '🔄 Optimizing...' : '🚀 AI Optimize'}
        </button>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <motion.div 
          className="metric-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3>Total Spend</h3>
          <p className="metric-value">${analytics.totalSpend.toLocaleString()}</p>
          <span className="metric-change positive">↗ 12% vs yesterday</span>
        </motion.div>

        <motion.div 
          className="metric-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3>Impressions</h3>
          <p className="metric-value">{analytics.totalImpressions.toLocaleString()}</p>
          <span className="metric-change positive">↗ 8% vs yesterday</span>
        </motion.div>

        <motion.div 
          className="metric-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3>Clicks</h3>
          <p className="metric-value">{analytics.totalClicks.toLocaleString()}</p>
          <span className="metric-change positive">↗ 15% vs yesterday</span>
        </motion.div>

        <motion.div 
          className="metric-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3>Conversions</h3>
          <p className="metric-value">{analytics.totalConversions.toLocaleString()}</p>
          <span className="metric-change positive">↗ 22% vs yesterday</span>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Real-time Performance */}
        <motion.div 
          className="chart-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3>Real-time Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={realTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="spend" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="conversions" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Platform Breakdown */}
        <motion.div 
          className="chart-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h3>Spend by Platform</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={platformData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="spend"
              >
                {platformData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Platform Performance */}
        <motion.div 
          className="chart-container full-width"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h3>Platform Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platformData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="spend" fill="#8884d8" />
              <Bar dataKey="conversions" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Budget Controls */}
      <motion.div 
        className="budget-controls"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <h3>Budget Allocation</h3>
        <div className="platform-budgets">
          {Object.entries(analytics.platformBreakdown).map(([platform, data]) => (
            <div key={platform} className="budget-control">
              <label>{platform}</label>
              <div className="budget-slider">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={(data.spend / analytics.totalSpend) * 100}
                  onChange={(e) => {
                    // Handle budget reallocation
                    console.log(`Reallocating ${platform} to ${e.target.value}%`);
                  }}
                />
                <span>${data.spend.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;