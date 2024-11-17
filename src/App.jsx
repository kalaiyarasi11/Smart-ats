import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [atsScore, setAtsScore] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== 'application/pdf') {
      setError('Only PDF files are supported');
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setError('');
  };

  const handleSubmit = async () => {
    if (!jobDescription.trim() || !selectedFile) {
      setError('Please provide both Job Description and Resume');
      return;
    }

    setError('');
    setIsLoading(true);

    const formData = new FormData();
    formData.append('jobDescription', jobDescription);
    formData.append('resume', selectedFile);

    try {
      const response = await axios.post('http://localhost:5000/api/ats/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAtsScore(response.data.atsScore);
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.error);
      } else {
        setError('Failed to calculate ATS score. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>ATS Score Calculator</h1>
      <textarea
        rows="5"
        placeholder="Enter Job Description here..."
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        style={{ width: '80%', marginBottom: '10px' }}
      />
      <br />
      <input type="file" onChange={handleFileChange} />
      <br />
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Calculating...' : 'Calculate ATS Score'}
      </button>
      {atsScore && (
        <div>
          <h2>ATS Score:</h2>
          <p>{atsScore}</p>
        </div>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}

export default App;
