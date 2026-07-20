import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const navigate = useNavigate();

 useEffect(() => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  fetchBookings();
}, []);

  const fetchBookings = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load bookings');
        setLoading(false);
        return;
      }

      setBookings(data);
    } catch (err) {
      setError('Connection error. Is backend running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    const token = localStorage.getItem('token');
    setCancellingId(bookingId);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Cancellation failed');
        setCancellingId(null);
        return;
      }

      setMessage('✅ Booking cancelled successfully!');
      fetchBookings();
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#333', fontSize: '18px' }}>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '40px 20px' }}>
      <h1 style={{ color: '#333', textAlign: 'center', marginBottom: '10px' }}>🚗 CAR RENTAL</h1>
      <h2 style={{ color: '#666', textAlign: 'center', marginBottom: '30px', fontSize: '28px' }}>My Bookings</h2>

      {error && (
        <p style={{ color: '#d32f2f', textAlign: 'center', marginBottom: '20px', fontWeight: 'bold', fontSize: '16px' }}>
          {error}
        </p>
      )}
      {message && (
        <p style={{
          color: message.includes('✅') ? '#388e3c' : '#d32f2f',
          textAlign: 'center',
          marginBottom: '20px',
          fontWeight: 'bold',
          fontSize: '16px'
        }}>
          {message}
        </p>
      )}

      <div style={{
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {bookings.length === 0 && !error && (
          <p style={{ color: '#999', textAlign: 'center', padding: '40px', fontSize: '16px' }}>
            No bookings yet.{' '}
            <a href="/fleet" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 'bold' }}>
              Browse cars and make a booking!
            </a>
          </p>
        )}

        {bookings.map((booking) => (
          <div key={booking.id} style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '25px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <p style={{ color: '#999', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>CAR</p>
                <p style={{ color: '#1976d2', fontSize: '20px', fontWeight: 'bold' }}>
                  {booking.carName}
                </p>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  {booking.brand} • {booking.type}
                </p>
              </div>

              <div>
                <p style={{ color: '#999', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>BOOKING ID</p>
                <p style={{ color: '#ff9800', fontSize: '16px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  #{booking.id}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px', background: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
              <div>
                <p style={{ color: '#999', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>CHECK-IN</p>
                <p style={{ color: '#333', fontSize: '14px' }}>
                  {new Date(booking.checkInDate).toLocaleDateString('en-IN')}
                </p>
              </div>

              <div>
                <p style={{ color: '#999', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>CHECK-OUT</p>
                <p style={{ color: '#333', fontSize: '14px' }}>
                  {new Date(booking.checkOutDate).toLocaleDateString('en-IN')}
                </p>
              </div>

              <div>
                <p style={{ color: '#999', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>TOTAL COST</p>
                <p style={{ color: '#388e3c', fontWeight: 'bold', fontSize: '18px' }}>
                  ₹{booking.totalCost}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{
                color: booking.status === 'active' ? '#388e3c' : '#d32f2f',
                fontWeight: 'bold',
                fontSize: '14px',
                background: booking.status === 'active' ? '#e8f5e9' : '#ffebee',
                padding: '6px 12px',
                borderRadius: '20px',
                margin: 0
              }}>
                {booking.status?.toUpperCase() || 'PENDING'}
              </p>

              {booking.status === 'active' && (
                <button
                  onClick={() => handleCancel(booking.id)}
                  disabled={cancellingId === booking.id}
                  style={{
                    background: cancellingId === booking.id ? '#ccc' : '#d32f2f',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    cursor: cancellingId === booking.id ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {cancellingId === booking.id ? 'Cancelling...' : '✕ Cancel Booking'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
