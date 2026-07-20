import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

export default function Fleet() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [bookingCarId, setBookingCarId] = useState(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/cars`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load cars');
        setLoading(false);
        return;
      }

      setCars(data);
    } catch (err) {
      setError('Connection error. Is backend running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const daysBetween = (start, end) => {
    const ms = new Date(end) - new Date(start);
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  };

  const openBookingForm = (carId) => {
    setBookingCarId(carId);
    setCheckInDate('');
    setCheckOutDate('');
    setMessage('');
  };

  const closeBookingForm = () => {
    setBookingCarId(null);
    setCheckInDate('');
    setCheckOutDate('');
  };

  const handleConfirmBooking = async (car) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!checkInDate || !checkOutDate) {
      setMessage('Please select both check-in and check-out dates');
      return;
    }

    const days = daysBetween(checkInDate, checkOutDate);
    if (days <= 0) {
      setMessage('Check-out date must be after check-in date');
      return;
    }

    const totalCost = days * Number(car.pricePerDay);

    setSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          carId: car.id,
          checkInDate,
          checkOutDate,
          totalCost
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Booking failed');
        setSubmitting(false);
        return;
      }

      navigate('/bookings');
    } catch (err) {
      setMessage('Error: ' + err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#333', fontSize: '18px' }}>Loading fleet...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '40px 20px' }}>
      <h1 style={{ color: '#1976d2', textAlign: 'center', marginBottom: '10px' }}>🚗 CAR RENTAL</h1>
      <h2 style={{ color: '#666', textAlign: 'center', marginBottom: '30px', fontSize: '28px' }}>Our Fleet</h2>

      {error && (
        <p style={{ color: '#d32f2f', textAlign: 'center', marginBottom: '20px', fontWeight: 'bold', fontSize: '16px' }}>
          {error}
        </p>
      )}

      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {cars.length === 0 && !error && (
          <p style={{ color: '#999', textAlign: 'center', gridColumn: '1 / -1' }}>
            No cars available right now.
          </p>
        )}

        {cars.map((car) => (
          <div key={car.id} style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <p style={{ color: '#1976d2', fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px' }}>
              {car.name}
            </p>
            <p style={{ color: '#666', fontSize: '14px', margin: '0 0 12px' }}>
              {car.brand} • {car.type}
            </p>
            <p style={{ color: '#388e3c', fontWeight: 'bold', fontSize: '18px', margin: '0 0 16px' }}>
              ₹{car.pricePerDay} <span style={{ color: '#999', fontWeight: 'normal', fontSize: '13px' }}>/ day</span>
            </p>

            {car.available === 0 || car.available === false ? (
              <p style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: '13px' }}>Currently unavailable</p>
            ) : bookingCarId === car.id ? (
              <div style={{ marginTop: 'auto' }}>
                <label style={{ display: 'block', color: '#333', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                  Check-in
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px', boxSizing: 'border-box' }}
                />
                <label style={{ display: 'block', color: '#333', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                  Check-out
                </label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px', boxSizing: 'border-box' }}
                />

                {checkInDate && checkOutDate && daysBetween(checkInDate, checkOutDate) > 0 && (
                  <p style={{ color: '#666', fontSize: '13px', marginBottom: '10px' }}>
                    {daysBetween(checkInDate, checkOutDate)} day(s) • Total: ₹{daysBetween(checkInDate, checkOutDate) * Number(car.pricePerDay)}
                  </p>
                )}

                {message && (
                  <p style={{ color: '#d32f2f', fontSize: '13px', marginBottom: '10px' }}>{message}</p>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleConfirmBooking(car)}
                    disabled={submitting}
                    style={{
                      flex: 1,
                      background: submitting ? '#ccc' : '#1976d2',
                      color: '#fff',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '4px',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      fontSize: '13px'
                    }}
                  >
                    {submitting ? 'Booking...' : 'Confirm Booking'}
                  </button>
                  <button
                    onClick={closeBookingForm}
                    disabled={submitting}
                    style={{
                      flex: 1,
                      background: '#eee',
                      color: '#333',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '13px'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => openBookingForm(car.id)}
                style={{
                  marginTop: 'auto',
                  background: '#1976d2',
                  color: '#fff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                Book Now
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
