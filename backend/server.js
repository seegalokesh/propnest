require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { runMigrations } = require('./db/migrations');

const app = express();
const PORT = process.env.PORT || 5000;

// Run migrations on startup
runMigrations();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://propnest-nu.vercel.app/',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/site-visits', require('./routes/siteVisits'));
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/api/agents', require('./routes/agents'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/favorites', require('./routes/favorites'));

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: 'PropNest API is running 🏠' }));

// Error handler
app.use(require('./middleware/errorHandler'));

app.listen(PORT, () => {
  console.log(`🏠 PropNest server running on http://localhost:${PORT}`);
});


module.exports = app;
