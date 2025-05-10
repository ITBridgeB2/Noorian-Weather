import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    if (!city.trim()) {
      alert('Please enter a city name');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/weather', {
        params: { city },
      });
      setWeatherData(response.data);
      await fetchHistory(); // Refresh history after successful search
    } catch (error) {
      console.error('Weather fetch error:', error);
      setWeatherData({ error: 'City not found or server error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/history');
      setHistory(response.data);
    } catch (error) {
      console.error('History fetch error:', error);
      alert('Failed to load history');
    }
  };

  const deleteHistoryItem = async (id) => {
    try {
      if (!id) return alert('Invalid ID');

      await axios.delete(`http://localhost:5000/api/history/${id}`);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Delete error:', error.response?.data || error.message);
      alert('Failed to delete item');
    }
  };

  const handleRefresh = () => {
    window.location.reload(); 
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="app-container">
      <div className="left-panel">
        <div className="weather-card">
          <h2>
            Weather Dashboard &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <button onClick={handleRefresh} className="refresh-button">🔄</button>
          </h2>
          <input
            type="text"
            placeholder="Enter City Name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button onClick={fetchWeather}>Search</button>
          <button className="history-toggle" onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? 'Hide History' : 'Recent Search History'}
          </button>

          {loading && <p>Loading...</p>}

          {weatherData && !weatherData.error && (
            <div className="result">
              <div><strong>City:</strong> {weatherData.city}</div>
              <div><strong>Temperature:</strong> {weatherData.temperature}°C</div>
              <div><strong>Humidity:</strong> {weatherData.humidity}%</div>
              <div><strong>Weather:</strong> {weatherData.weather}</div>
            </div>
          )}

          {weatherData?.error && <div className="error">{weatherData.error}</div>}
        </div>
      </div>

      {showHistory && (
        <div className="right-panel">
          <h3>Recent Searches</h3>
          <ul>
            {history.map((item) => (
              <li key={item.id} className="history-item">
                <span>{item.city} - {new Date(item.searched_at).toLocaleString()}</span>
                <button onClick={() => deleteHistoryItem(item.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
