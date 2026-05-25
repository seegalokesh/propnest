const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');

// POST /api/favorites/:propertyId - toggle favorite
router.post('/:propertyId', authenticate, requireRole('buyer'), (req, res, next) => {
  try {
    const db = getDb();
    const existing = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND property_id = ?')
      .get(req.user.id, req.params.propertyId);

    if (existing) {
      db.prepare('DELETE FROM favorites WHERE user_id = ? AND property_id = ?').run(req.user.id, req.params.propertyId);
      return res.json({ success: true, favorited: false, message: 'Removed from favorites' });
    } else {
      db.prepare('INSERT INTO favorites (user_id, property_id) VALUES (?, ?)').run(req.user.id, req.params.propertyId);
      return res.json({ success: true, favorited: true, message: 'Added to favorites' });
    }
  } catch (err) { next(err); }
});

// GET /api/favorites - buyer
router.get('/', authenticate, requireRole('buyer'), (req, res, next) => {
  try {
    const db = getDb();
    const favorites = db.prepare(`
      SELECT p.*, l.city, l.area, f.created_at as favorited_at
      FROM favorites f
      JOIN properties p ON f.property_id = p.id
      LEFT JOIN locations l ON p.location_id = l.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `).all(req.user.id);
    res.json({ success: true, data: favorites });
  } catch (err) { next(err); }
});

module.exports = router;
