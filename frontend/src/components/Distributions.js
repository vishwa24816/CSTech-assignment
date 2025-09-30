import React, { useState, useEffect } from 'react';
import { uploadAPI } from '../services/api';
import './Distributions.css';

const Distributions = () => {
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDistributions();
  }, []);

  const fetchDistributions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await uploadAPI.getDistributions();
      setDistributions(response.data);
    } catch (err) {
      setError('Failed to load distributions');
      console.error('Error fetching distributions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="distributions-container">
        <div className="loading">Loading distributions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="distributions-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (distributions.length === 0) {
    return (
      <div className="distributions-container">
        <h2>Distributed Lists</h2>
        <div className="no-data">
          <p>No distributions available yet.</p>
          <p>Upload a CSV/Excel file to distribute lists among agents.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="distributions-container">
      <div className="distributions-header">
        <h2>Distributed Lists by Agent</h2>
        <button onClick={fetchDistributions} className="refresh-button">
          Refresh
        </button>
      </div>

      <div className="distributions-grid">
        {distributions.map((agent) => (
          <div key={agent.agentId} className="agent-distribution">
            <div className="agent-header">
              <h3>{agent.agentName}</h3>
              <p className="agent-email">{agent.agentEmail}</p>
              <span className="list-count">{agent.lists.length} items</span>
            </div>

            {agent.lists.length > 0 ? (
              <div className="lists-table-wrapper">
                <table className="lists-table">
                  <thead>
                    <tr>
                      <th>First Name</th>
                      <th>Phone</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agent.lists.map((item) => (
                      <tr key={item.id}>
                        <td>{item.firstName}</td>
                        <td>{item.phone}</td>
                        <td>{item.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-items">No items distributed to this agent yet.</p>
            )}
          </div>
        ))}
      </div>

      <div className="summary-section">
        <h3>Distribution Summary</h3>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-value">{distributions.length}</div>
            <div className="summary-label">Total Agents</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">
              {distributions.reduce((sum, agent) => sum + agent.lists.length, 0)}
            </div>
            <div className="summary-label">Total Items</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">
              {distributions.length > 0
                ? Math.round(
                    distributions.reduce((sum, agent) => sum + agent.lists.length, 0) /
                      distributions.length
                  )
                : 0}
            </div>
            <div className="summary-label">Avg per Agent</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Distributions;
