const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
const PORT = 5000;

// ✅ Your OpenWeatherMap API key
const API_KEY = '8af3db5e2b242f856bf52a0aa45a70b9';

// ✅ MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'noor',
  database: 'weatherdb'
});

// ✅ Weather API route
app.get('/api/weather', async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({ error: 'City name is required' });
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;

  try {
    const response = await axios.get(url);
    const { name, main, weather } = response.data;

    // ✅ Insert into MySQL
    db.query(
      `INSERT INTO searches (city, temperature, humidity, weather) VALUES (?, ?, ?, ?)`,
      [name, main.temp, main.humidity, weather[0].main],
      (err) => {
        if (err) console.error("Insert error:", err);
      }
    );

    res.json({
      city: name,
      temperature: main.temp,
      humidity: main.humidity,
      weather: weather[0].main,
    });
  } catch (error) {
    console.error("Weather fetch error:", error.response?.data || error.message);
    res.status(404).json({ error: 'City not found or server error' });
  }
});

// ✅ Fetch history from MySQL
app.get('/api/history', (req, res) => {
  db.query(
    `SELECT id, city, searched_at FROM searches ORDER BY searched_at DESC LIMIT 10`,
    (err, results) => {
      if (err) {
        console.error('MySQL history error:', err);
        return res.status(500).json({ error: 'Failed to fetch history' });
      }
      res.json(results);
    }
  );
});

// ✅ Delete item by ID from MySQL
app.delete('/api/history/:id', (req, res) => {
  const { id } = req.params;
  db.query(
    `DELETE FROM searches WHERE id = ?`,
    [id],
    (err, result) => {
      if (err) {
        console.error('Delete error:', err);
        return res.status(500).json({ error: 'Failed to delete item' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.status(200).json({ message: 'Deleted successfully' });
    }
  );
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
