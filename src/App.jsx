import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('rydo_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('rydo_user');
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-surface-base flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
      </div>
    );
  }

  return (
    <div className="bg-surface-base min-h-screen text-white font-sans antialiased">
      <BrowserRouter>
        <Routes>
          {/* If no user, show login. If user exists, go to dashboard */}
          <Route
            path="/login"
            element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" replace />}
          />
          
          {/* Dashboard route needs the asterisk (*) to allow nested routes inside Dashboard.jsx */}
          <Route
            path="/dashboard/*"
            element={user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/login" replace />}
          />
          
          {/* Root redirect */}
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;