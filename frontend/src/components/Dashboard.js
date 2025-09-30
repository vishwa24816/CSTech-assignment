import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AddAgent from './AddAgent';
import UploadFile from './UploadFile';
import Distributions from './Distributions';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('agents');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Agent Management Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.email}</span>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <nav className="dashboard-nav">
          <button
            className={activeTab === 'agents' ? 'active' : ''}
            onClick={() => setActiveTab('agents')}
          >
            Add Agents
          </button>
          <button
            className={activeTab === 'upload' ? 'active' : ''}
            onClick={() => setActiveTab('upload')}
          >
            Upload & Distribute
          </button>
          <button
            className={activeTab === 'distributions' ? 'active' : ''}
            onClick={() => setActiveTab('distributions')}
          >
            View Distributions
          </button>
        </nav>

        <div className="dashboard-main">
          {activeTab === 'agents' && <AddAgent />}
          {activeTab === 'upload' && <UploadFile />}
          {activeTab === 'distributions' && <Distributions />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
