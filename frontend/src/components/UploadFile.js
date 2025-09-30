import React, { useState } from 'react';
import { uploadAPI } from '../services/api';
import './UploadFile.css';

const UploadFile = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    // Validate file type
    if (selectedFile) {
      const allowedExtensions = ['.csv', '.xlsx', '.xls'];
      const fileName = selectedFile.name.toLowerCase();
      const isValid = allowedExtensions.some(ext => fileName.endsWith(ext));
      
      if (!isValid) {
        setMessage({ 
          type: 'error', 
          text: 'Invalid file type. Only CSV, XLSX, and XLS files are allowed.' 
        });
        setFile(null);
        e.target.value = '';
        return;
      }
      
      setFile(selectedFile);
      setMessage({ type: '', text: '' });
      setUploadResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file to upload' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await uploadAPI.uploadFile(formData);
      setMessage({ type: 'success', text: response.data.message });
      setUploadResult(response.data);
      setFile(null);
      // Reset file input
      document.getElementById('file-input').value = '';
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to upload file';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-file-container">
      <div className="upload-section">
        <h2>Upload CSV/Excel File</h2>
        <p className="upload-description">
          Upload a CSV or Excel file containing contact lists. The file will be automatically 
          distributed equally among all registered agents.
        </p>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="file-input-wrapper">
            <label htmlFor="file-input" className="file-label">
              {file ? file.name : 'Choose File'}
            </label>
            <input
              type="file"
              id="file-input"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="file-input"
            />
          </div>

          <button type="submit" disabled={loading || !file} className="upload-button">
            {loading ? 'Uploading...' : 'Upload & Distribute'}
          </button>
        </form>

        {uploadResult && (
          <div className="upload-result">
            <h3>Upload Summary</h3>
            <div className="result-details">
              <p><strong>Total Items:</strong> {uploadResult.totalItems}</p>
              <p><strong>Agents:</strong> {uploadResult.agentsCount}</p>
              <p><strong>Items Distributed:</strong> {uploadResult.inserted}</p>
            </div>
          </div>
        )}
      </div>

      <div className="format-guide">
        <h3>File Format Requirements</h3>
        <div className="format-content">
          <p>Your file must contain the following columns:</p>
          <ul>
            <li><strong>FirstName</strong> - Text (Required)</li>
            <li><strong>Phone</strong> - Number (Required)</li>
            <li><strong>Notes</strong> - Text (Optional)</li>
          </ul>

          <div className="example-section">
            <h4>Example CSV Format:</h4>
            <pre className="code-block">
FirstName,Phone,Notes
John,1234567890,VIP Customer
Sarah,9876543210,Follow up needed
Mike,5551234567,New lead
            </pre>
          </div>

          <div className="info-box">
            <p><strong>Distribution Logic:</strong></p>
            <p>Items are distributed equally among agents. If the total number cannot be 
            divided evenly, remaining items are distributed sequentially starting from the first agent.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadFile;
