import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 
import API_URL from '../config'; // Added central API configuration

export default function AuthPage({ setUser }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [needsWallet, setNeedsWallet] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  
  const [formData, setFormData] = useState({ 
    name: '', 
    dateOfBirth: '', 
    state: '', 
    aadharNumber: '', 
    voterIdNumber: '' 
  });
  
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const connectWallet = async () => {
    if (!window.ethereum) {
      setNeedsWallet(true);
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0]);
      setMessage("✅ Secure ID connected! Please proceed.");
      setNeedsWallet(false);
    } catch (error) {
      setMessage("❌ Failed to connect your digital ID. Please try again.");
    }
  };

  const handleLogin = async () => {
    if (!walletAddress) return setMessage("❌ Please connect your Secure Digital ID first.");
    try {
      // FIX: Replaced localhost with API_URL template literal
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress })
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(`❌ ${data.message}`);
        if (response.status === 404) setIsRegistering(true);
        return;
      }
      localStorage.setItem('voterData', JSON.stringify(data.user));
      setUser(data.user);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      setMessage("❌ Server error during login. Please try again later.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!walletAddress) return setMessage("❌ Please connect your Secure Digital ID first.");
    
    // Basic Aadhaar validation
    if (formData.aadharNumber.length < 12) {
      return setMessage("❌ Please enter a valid 12-digit Aadhaar Number.");
    }

    try {
      // FIX: Replaced localhost with API_URL template literal
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, ...formData })
      });
      const data = await response.json();
      if (!response.ok) return setMessage(`❌ ${data.message}`);

      setMessage("✅ Registration successful! Profile is pending Election Commission approval.");
      setIsRegistering(false); 
      // Clear form on success
      setFormData({ name: '', dateOfBirth: '', state: '', aadharNumber: '', voterIdNumber: '' });
    } catch (error) {
      setMessage("❌ Server error during registration.");
    }
  };

  return (
    <div className="app-container">
      <div className="card" style={{ maxWidth: '450px', margin: '2rem auto' }}>
        <h2 className="card-header">
          {isRegistering ? 'Citizen Registration' : 'Voter Authentication'}
        </h2>

        {needsWallet ? (
          <div className="alert alert-info">
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary-navy)' }}>Step 1: Get Your Secure Digital ID</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>
              To vote securely, you need a free digital ID card (MetaMask) installed on your browser.
            </p>
            <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginBottom: '10px' }}>
              Download MetaMask
            </a>
            <button onClick={() => window.location.reload()} className="btn btn-success">
              I have installed it! Refresh Page
            </button>
          </div>
        ) : (
          <div style={{ marginBottom: '1.5rem' }}>
            <button onClick={connectWallet} className="btn btn-wallet">
              {walletAddress ? `✅ ID Connected: ${walletAddress.substring(0, 6)}...${walletAddress.slice(-4)}` : 'Connect Secure Digital ID'}
            </button>
          </div>
        )}

        {message && (
          <div className={`alert ${message.includes('❌') ? 'alert-error' : 'alert-success'}`}>
            {message}
          </div>
        )}

        {!needsWallet && (
          !isRegistering ? (
            <div>
              <button onClick={handleLogin} className="btn btn-primary" style={{ marginBottom: '1rem' }}>
                Login to Voting Booth
              </button>
              <p className="help-text">
                Don't have a voter profile yet? <span onClick={() => setIsRegistering(true)} className="text-link">Register your ID here.</span>
              </p>
            </div>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="input-group">
                <label className="input-label">Full Legal Name</label>
                <input type="text" className="form-control" placeholder="Full Legal Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              
              <div className="input-group">
                <label className="input-label">Date of Birth (Must be 18+)</label>
                <input type="date" className="form-control" value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} required />
              </div>

              <div className="input-group">
                <label className="input-label">State of Residence</label>
                <select className="form-control" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} required>
                  <option value="" disabled>Select your State</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Karnataka">Karnataka</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Aadhaar Card Number <span style={{color: 'var(--danger-red)'}}>*</span></label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="12-digit Aadhaar Number" 
                  maxLength="12"
                  value={formData.aadharNumber} 
                  onChange={(e) => setFormData({...formData, aadharNumber: e.target.value.replace(/\D/g, '')})} 
                  required 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Voter ID Number (Optional)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. ABC1234567" 
                  value={formData.voterIdNumber} 
                  onChange={(e) => setFormData({...formData, voterIdNumber: e.target.value.toUpperCase()})} 
                />
              </div>

              <button type="submit" className="btn btn-success" style={{ marginBottom: '1rem' }}>
                Submit KYC Registration
              </button>
              <p className="help-text">
                Already registered? <span onClick={() => setIsRegistering(false)} className="text-link">Back to login.</span>
              </p>
            </form>
          )
        )}
      </div>
    </div>
  );
}
