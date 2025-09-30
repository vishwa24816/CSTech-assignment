import React, { useState, useEffect } from 'react';
import { agentsAPI } from '../services/api';
import './AddAgent.css';

const AddAgent = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: ''
  });
  const [agents, setAgents] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await agentsAPI.getAll();
      setAgents(response.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await agentsAPI.create(formData);
      setMessage({ type: 'success', text: response.data.message });
      setFormData({ name: '', email: '', mobile: '', password: '' });
      fetchAgents(); // Refresh agent list
    } catch (error) {
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.errors?.[0]?.msg || 
                      'Failed to add agent';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-agent-container">
      <div className="agent-form-section">
        <h2>Add New Agent</h2>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter agent name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobile">Mobile Number *</label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
              placeholder="e.g., +1-555-123-4567"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              placeholder="Minimum 6 characters"
            />
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Adding Agent...' : 'Add Agent'}
          </button>
        </form>
      </div>

      <div className="agents-list-section">
        <h2>Registered Agents ({agents.length})</h2>
        {agents.length === 0 ? (
          <p className="no-agents">No agents registered yet. Add your first agent!</p>
        ) : (
          <div className="agents-grid">
            {agents.map((agent) => (
              <div key={agent.id} className="agent-card">
                <h3>{agent.name}</h3>
                <p><strong>Email:</strong> {agent.email}</p>
                <p><strong>Mobile:</strong> {agent.mobile}</p>
                <p className="created-date">
                  Added: {new Date(agent.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddAgent;
