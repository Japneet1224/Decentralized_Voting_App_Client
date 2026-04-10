import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

// We will build these actual page files in the next step, 
// but we are importing them now so the router knows they exist.
import AuthPage from './pages/AuthPage.jsx';
import CitizenDashboard from './pages/CitizenDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check if a user is already logged in when the app loads
  useEffect(() => {
    const loggedInUser = localStorage.getItem('voterData');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
  }, []);

  // A secure logout function to completely wipe the session
  const handleLogout = () => {
    localStorage.removeItem('voterData');
    setUser(null);
    navigate('/');
  };

  return (
    <div>
      {/* GLOBAL NAVBAR */}
      <nav style={{ background: '#003366', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
        <h2 style={{ margin: 0, fontSize: '20px' }}>National Election Commission</h2>
        {user && (
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', background: 'rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: '4px' }}>
              {user.role === 'admin' ? 'Admin Mode' : `Voter: ${user.name}`}
            </span>
            <button onClick={handleLogout} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
              Secure Logout
            </button>
          </div>
        )}
      </nav>

      {/* THE ROUTER TRAFFIC CONTROLLER */}
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <Routes>
          {/* Default Route: The Login/Registration Screen */}
          <Route 
            path="/" 
            element={!user ? <AuthPage setUser={setUser} /> : <Navigate to={user.role === 'admin' ? "/admin" : "/dashboard"} />} 
          />

          {/* Citizen Route: Protected Dashboard */}
          <Route 
            path="/dashboard" 
            element={user && user.role === 'citizen' ? <CitizenDashboard user={user} /> : <Navigate to="/" />} 
          />

          {/* Admin Route: Protected Commission Panel */}
          <Route 
            path="/admin" 
            element={user && user.role === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/" />} 
          />
        </Routes>
      </div>
    </div>
  );
}