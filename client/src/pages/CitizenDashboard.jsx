import React, { useState, useEffect } from 'react';
import '../App.css';
import API_URL from '../config'; // Added central API configuration

export default function CitizenDashboard({ user }) {
  const [elections, setElections] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchElections();
  }, [user.walletAddress]);

  const fetchElections = async () => {
    try {
      // FIX: Replaced localhost with API_URL template literal
      const response = await fetch(`${API_URL}/api/elections/${user.walletAddress}`);
      const data = await response.json();
      setElections(data);
    } catch (error) {
      console.error("Failed to fetch elections.");
    }
  };

  const handleVote = async (electionId, candidateId) => {
    try {
      // FIX: Replaced localhost with API_URL template literal
      const response = await fetch(`${API_URL}/api/elections/${electionId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, walletAddress: user.walletAddress })
      });

      if (response.ok) {
        setMessage("✅ Your secure, anonymous vote has been recorded successfully.");
        // Instant disappearance from the UI after voting
        setElections(currentElections => currentElections.filter(e => e._id !== electionId));
      } else {
        const data = await response.json();
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage("❌ Failed to cast vote.");
    }
  };

  return (
    <div className="app-container">
      <h2 style={{ fontSize: '2rem', color: 'var(--primary-navy)', marginBottom: '2rem' }}>Active Electronic Ballots</h2>
      
      {message && (
        <div className={`alert ${message.includes('❌') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      {elections.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', margin: 0 }}>You have no pending elections.</h3>
          <p className="help-text">You have either cast all available ballots or there are no active elections in your registered state.</p>
        </div>
      ) : null}

      {elections.map((election) => (
        <div key={election._id} className="card" style={{ borderTop: '4px solid var(--primary-navy)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary-navy)' }}>{election.title}</h3>
            <span style={{ fontSize: '0.85rem', backgroundColor: '#e2e8f0', color: '#475569', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontWeight: 'bold' }}>
              Target: {election.targetState}
            </span>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Please select your preferred candidate carefully. Once cast, your vote is final, securely encrypted, and cannot be changed.
          </p>

          {election.options.map((option) => (
             <div key={option._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem', transition: 'all 0.2s ease' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>{option.candidateName}</span>
              <button
                onClick={() => handleVote(election._id, option._id)}
                className="btn btn-success"
                style={{ width: 'auto', padding: '0.5rem 1.5rem' }}
              >
                Cast Vote
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
