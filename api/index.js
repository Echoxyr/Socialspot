const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SocialSpot API is running' });
});

// Mock events endpoint
app.get('/api/events', (req, res) => {
  const mockEvents = [
    {
      id: 1,
      title: "Aperitivo sui Navigli 🍹",
      description: "Aperitivo rilassante al tramonto",
      category: "aperitivo",
      location: "Mag Cafè, Naviglio Grande",
      date: "2025-06-27",
      time: "19:00",
      maxParticipants: 8,
      currentParticipants: 3
    }
  ];
  
  res.json({ events: mockEvents });
});

module.exports = app;
