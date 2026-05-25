const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');

// POST /api/site-visits - buyer only
router.post('/', authenticate, requireRole('buyer'), [
  body('property_id').isInt().withMessage('Valid property ID required'),
  body('visit_date').isDate().withMessage('Valid visit date required'),
  body('visit_time').notEmpty().withMessage('Visit time is required'),
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

    const { property_id, visit_date, visit_time, notes } = req.body;
    const db = getDb();

    const today = new Date().toISOString().split('T')[0];
    if (visit_date < today) return res.status(400).json({ success: false, message: 'Visit date must be today or in the future' });

    const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(property_id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    if (property.status === 'sold') return res.status(400).json({ success: false, message: 'This property has already been sold' });

    const existing = db.prepare('SELECT id FROM site_visits WHERE property_id = ? AND buyer_id = ? AND visit_date = ?')
      .get(property_id, req.user.id, visit_date);
    if (existing) return res.status(409).json({ success: false, message: 'You already have a visit booked for this date' });

    const result = db.prepare(`
      INSERT INTO site_visits (property_id, buyer_id, agent_id, visit_date, visit_time, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(property_id, req.user.id, property.agent_id, visit_date, visit_time, notes || null);

    res.status(201).json({ success: true, data: { id: result.lastInsertRowid } });
  } catch (err) { next(err); }
});

// GET /api/site-visits
router.get('/', authenticate, (req, res, next) => {
  try {
    const db = getDb();
    let query = `
      SELECT sv.*, p.title as property_title, p.address, p.primary_image,
        l.city, l.area,
        u.name as buyer_name, u.phone as buyer_phone,
        a.name as agent_name
      FROM site_visits sv
      LEFT JOIN properties p ON sv.property_id = p.id
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN users u ON sv.buyer_id = u.id
      LEFT JOIN users a ON sv.agent_id = a.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'buyer') { query += ' AND sv.buyer_id = ?'; params.push(req.user.id); }
    else if (req.user.role === 'agent') { query += ' AND sv.agent_id = ?'; params.push(req.user.id); }

    query += ' ORDER BY sv.visit_date DESC';
    const visits = db.prepare(query).all(...params);
    res.json({ success: true, data: visits });
  } catch (err) { next(err); }
});

// PUT /api/site-visits/:id/status - agent/admin
router.put('/:id/status', authenticate, requireRole('agent', 'admin'), [
  body('status').isIn(['scheduled', 'completed', 'cancelled']).withMessage('Invalid status'),
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

    const db = getDb();
    const visit = db.prepare('SELECT * FROM site_visits WHERE id = ?').get(req.params.id);
    if (!visit) return res.status(404).json({ success: false, message: 'Visit not found' });

    db.prepare('UPDATE site_visits SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.body.status, req.params.id);
    res.json({ success: true, message: 'Visit status updated' });
  } catch (err) { next(err); }
});

module.exports = router;
