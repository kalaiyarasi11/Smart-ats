const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const atsRoutes = require('./routes/atsRoutes');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/ats', atsRoutes);

// MongoDB Connection
mongoose
  .connect('mongodb://127.0.0.1:27017/atsDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
