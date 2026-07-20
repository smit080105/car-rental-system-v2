import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Fleet from './pages/Fleet';
import Bookings from './pages/Bookings';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <>
      {isLoggedIn && (
        <nav style={{
          background: '#1976d2',
          padding: '15px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#fff'
        }}>
          <h2 style={{ margin: 0 }}>🚗 Car Rental</h2>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <a href="/fleet" style={{ color: '#fff', textDecoration: 'none', fontSize: '16px' }}>Fleet</a>
            <a href="/bookings" style={{ color: '#fff', textDecoration: 'none', fontSize: '16px' }}>Bookings</a>
            <button
              onClick={handleLogout}
              style={{
                background: '#d32f2f',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Logout
            </button>
          </div>
        </nav>
      )}

      <Routes>
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/signup" element={<SignUp setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/fleet" element={isLoggedIn ? <Fleet /> : <Navigate to="/login" />} />
        <Route path="/bookings" element={isLoggedIn ? <Bookings /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={isLoggedIn ? "/fleet" : "/login"} />} />
        <Route path="*" element={<Navigate to={isLoggedIn ? "/fleet" : "/login"} />} />
      </Routes>
    </>
  );
}
