const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');

// POST /api/inquiries - buyer only
router.post('/', authenticate, requireRole('buyer'), [
  body('property_id').isInt().withMessage('Valid property ID required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

    const { property_id, message } = req.body;
    const db = getDb();

    const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(property_id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    const result = db.prepare(
      'INSERT INTO inquiries (property_id, buyer_id, agent_id, message) VALUES (?, ?, ?, ?)'
    ).run(property_id, req.user.id, property.agent_id, message);

    res.status(201).json({ success: true, data: { id: result.lastInsertRowid } });
  } catch (err) { next(err); }
});

// GET /api/inquiries
router.get('/', authenticate, (req, res, next) => {
  try {
    const db = getDb();
    let query = `
      SELECT i.*, p.title as property_title, p.primary_image, p.address,
        l.city, l.area,
        u.name as buyer_name, u.email as buyer_email, u.phone as buyer_phone,
        a.name as agent_name
      FROM inquiries i
      LEFT JOIN properties p ON i.property_id = p.id
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN users u ON i.buyer_id = u.id
      LEFT JOIN users a ON i.agent_id = a.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'buyer') { query += ' AND i.buyer_id = ?'; params.push(req.user.id); }
    else if (req.user.role === 'agent') { query += ' AND i.agent_id = ?'; params.push(req.user.id); }

    const { status } = req.query;
    if (status) { query += ' AND i.status = ?'; params.push(status); }

    query += ' ORDER BY i.created_at DESC';
    const inquiries = db.prepare(query).all(...params);
    res.json({ success: true, data: inquiries });
  } catch (err) { next(err); }
});

// PUT /api/inquiries/:id/status - agent/admin
router.put('/:id/status', authenticate, requireRole('agent', 'admin'), [
  body('status').isIn(['open', 'responded', 'closed']).withMessage('Invalid status'),
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

    const db = getDb();
    const { status, response } = req.body;
    db.prepare('UPDATE inquiries SET status = ?, response = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, response || null, req.params.id);
    res.json({ success: true, message: 'Inquiry status updated' });
  } catch (err) { next(err); }
});

module.exports = router;
