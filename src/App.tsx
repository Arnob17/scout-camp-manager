import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AdminAuth from './components/AdminAuth';
import AdminDashboard from './components/AdminDashboard';
import ScoutAuth from './components/ScoutAuth';
import ScoutProfile from './components/ScoutProfile';
import Footer from './components/Footer';
import MoneyReceipt from './components/money_reciept';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, you'd validate the token with the server
      // For now, we'll just check if it exists
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp > Date.now() / 1000) {
          setUser({
            id: payload.id,
            email: payload.email,
            role: payload.role,
            name: payload.name || 'User'
          });
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onLogout={handleLogout} />

        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route
            path="/admin"
            element={
              !user || user.role !== 'admin' ? (
                <AdminAuth onLogin={handleLogin} />
              ) : (
                <Navigate to="/admin/dashboard" replace />
              )
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              user && user.role === 'admin' ? (
                <AdminDashboard user={user} />
              ) : (
                <Navigate to="/admin" replace />
              )
            }
          />

          <Route
            path="/money"
            element={
              <MoneyReceipt />
            }
          />

          <Route
            path="/scout/login"
            element={
              !user || user.role !== 'scout' ? (
                <ScoutAuth onLogin={handleLogin} />
              ) : (
                <Navigate to="/scout/profile" replace />
              )
            }
          />

          <Route
            path="/scout/profile"
            element={
              user && user.role === 'scout' ? (
                <ScoutProfile user={user} />
              ) : (
                <Navigate to="/scout/login" replace />
              )
            }
          />

          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;