import React from 'react';
import './Dashboard.css';

const Dashboard = ({ username }) => {
  return (
    <div className="dashboard-root">
      <div className="dashboard-greeting">Welcome, {username}</div>
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-title">Total Projects</div>
          <div className="stat-value">4</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Tasks</div>
          <div className="stat-value">32</div>
        </div>
      </div>
      <div className="dashboard-charts">
        <div className="chart-card">
          <div className="chart-title">Tasks: Completed vs Pending</div>
          <div className="chart-placeholder donut">[Donut Chart]</div>
        </div>
        <div className="chart-card">
          <div className="chart-title">Monthly Progress</div>
          <div className="chart-placeholder line">[Line Chart]</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 