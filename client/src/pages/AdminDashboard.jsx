import React, { useState, useEffect } from 'react';
import '../App.css';
import API_URL from '../config';

export default function AdminDashboard({ user }) {
  const [pendingCitizens, setPendingCitizens] = useState([]);
  const [allElections, setAllElections] = useState([]);
  const [newElection, setNewElection] = useState('');
  const [targetState, setTargetState] = useState('National');
  const [candidates, setCandidates] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPendingCitizens();
    fetchAllElections();
  }, []);

  const fetchPendingCitizens = async () => {
    try {
      // FIX: Added backticks for template literal
      const response = await fetch(`${API_URL}/api/admin/pending`);
      const data = await response.json();
      setPendingCitizens(data);
    } catch (error) {
      console.error("Failed to fetch pending citizens.");
    }
  };

  const fetchAllElections = async () => {
    try {
      // FIX: Replaced localhost with API_URL
      const response = await fetch(`${API_URL}/api/elections`);
      const data = await response.json();
      setAllElections(data);
    } catch (error) {
      console.error("Failed to fetch election results.");
    }
  };

  const approveCitizen = async (userId) => {
    try {
      // FIX: Replaced localhost with API_URL
      const response = await fetch(`${API_URL}/api/admin/approve/${userId}`, { method: 'PUT' });
      if (response.ok) {
        setMessage("✅ Citizen KYC approved successfully.");
        fetchPendingCitizens(); 
      }
    } catch (error) {
      setMessage("❌ Failed to approve citizen.");
    }
  };

  const handleCreateElection = async (e) => {
    e.preventDefault();
    const candidatesArray = candidates.split(',').map(c => c.trim());

    try {
      // FIX: Replaced localhost with API_URL
      const response = await fetch(`${API_URL}/api/elections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newElection, targetState, candidates: candidatesArray })
      });

      if (response.ok) {
        setMessage("✅ Official Ballot published securely.");
        setNewElection('');
        setCandidates('');
        fetchAllElections(); // Refresh the results view
      } else {
        setMessage("❌ Failed to publish ballot.");
      }
    } catch (error) {
      setMessage("❌ Server error publishing ballot.");
    }
  };

  return (
    <div className="app-container">
      <h2 style={{ fontSize: '2rem', color: 'var(--primary-navy)', marginBottom: '2rem' }}>Election Commission Panel</h2>
      
      {message && (
        <div className={`alert ${message.includes('❌') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      {/* --- KYC APPROVAL CARD --- */}
      <div className="card">
        <h3 className="card-header" style={{ textAlign: 'left', fontSize: '1.25rem' }}>Pending Voter Registrations</h3>
        {pendingCitizens.length === 0 ? <p className="help-text" style={{ textAlign: 'left' }}>No pending applications at this time.</p> : null}
        
        {pendingCitizens.map(citizen => (
          <div key={citizen._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--primary-navy)' }}>{citizen.name}</strong>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                DOB: {new Date(citizen.dateOfBirth).toLocaleDateString()} | State: {citizen.state}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--accent-blue)', display: 'block', marginTop: '6px', fontWeight: '600' }}>
                Aadhaar: {citizen.aadharNumber} {citizen.voterIdNumber ? ` | Voter ID: ${citizen.voterIdNumber}` : ''}
              </span>
            </div>
            <button onClick={() => approveCitizen(citizen._id)} className="btn btn-success" style={{ width: 'auto', padding: '0.5rem 1rem' }}>
              Approve KYC
            </button>
          </div>
        ))}
      </div>

      {/* --- CREATE ELECTION CARD --- */}
      <div className="card" style={{ backgroundColor: '#f8fafc' }}>
        <h3 className="card-header" style={{ textAlign: 'left', fontSize: '1.25rem' }}>Launch New Election</h3>
        <form onSubmit={handleCreateElection}>
          <div className="input-group">
            <input type="text" className="form-control" placeholder="Election Title (e.g., General Assembly)" value={newElection} onChange={(e) => setNewElection(e.target.value)} required />
          </div>
          <div className="input-group">
            <select className="form-control" value={targetState} onChange={(e) => setTargetState(e.target.value)} required>
              <option value="National">National Election (All States)</option>
              <option value="Punjab">Punjab Only</option>
              <option value="Haryana">Haryana Only</option>
              <option value="Maharashtra">Maharashtra Only</option>
              <option value="Delhi">Delhi Only</option>
              <option value="Karnataka">Karnataka Only</option>
            </select>
          </div>
          <div className="input-group">
            <input type="text" className="form-control" placeholder="Candidates (comma separated, e.g., Party A, Party B)" value={candidates} onChange={(e) => setCandidates(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary">Publish Official Ballot</button>
        </form>
      </div>

      {/* --- LIVE RESULTS CARD --- */}
      <div className="card">
        <h3 className="card-header" style={{ textAlign: 'left', fontSize: '1.25rem', color: 'var(--accent-blue)' }}>Live Election Tally</h3>
        {allElections.length === 0 ? <p className="help-text" style={{ textAlign: 'left' }}>No elections have been created yet.</p> : null}

        {allElections.map(election => (
          <div key={election._id} style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', backgroundColor: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{election.title}</h4>
              <span style={{ fontSize: '0.8rem', backgroundColor: 'var(--primary-navy)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '1rem' }}>
                Target: {election.targetState}
              </span>
            </div>
            
            {election.options.map(option => (
              <div key={option._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }}>
                <div>
                  <strong style={{ fontSize: '1.1rem' }}>{option.candidateName}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {Object.entries(option.votesByState).map(([state, votes]) => (
                      <span key={state} style={{ marginRight: '10px' }}>{state}: {votes}</span>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success-green)' }}>
                  {option.totalVotes} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>votes</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
