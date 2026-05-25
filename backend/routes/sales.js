const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');

// POST /api/sales - admin/agent
router.post('/', authenticate, requireRole('admin', 'agent'), [
  body('property_id').isInt().withMessage('Valid property ID required'),
  body('buyer_id').isInt().withMessage('Valid buyer ID required'),
  body('sale_price').isFloat({ min: 1 }).withMessage('Sale price must be greater than 0'),
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

    const db = getDb();
    const { property_id, buyer_id, sale_price, notes } = req.body;

    const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(property_id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    if (property.status === 'sold') return res.status(400).json({ success: false, message: 'Property is already sold' });

    const commission = sale_price * 0.02;
    const result = db.prepare(`
      INSERT INTO sales (property_id, buyer_id, seller_id, agent_id, sale_price, commission, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(property_id, buyer_id, property.seller_id, property.agent_id, sale_price, commission, notes || null);

    db.prepare("UPDATE properties SET status = 'sold', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(property_id);
    if (property.agent_id) {
      db.prepare('UPDATE agents SET total_sales = total_sales + 1 WHERE user_id = ?').run(property.agent_id);
    }

    res.status(201).json({ success: true, data: { id: result.lastInsertRowid, commission } });
  } catch (err) { next(err); }
});

// GET /api/sales - admin sees all, agent sees own
router.get('/', authenticate, requireRole('admin', 'agent'), (req, res, next) => {
  try {
    const db = getDb();
    let query = `
      SELECT s.*, p.title as property_title, p.type as property_type,
        l.city, l.area,
        b.name as buyer_name, sell.name as seller_name, a.name as agent_name
      FROM sales s
      LEFT JOIN properties p ON s.property_id = p.id
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN users b ON s.buyer_id = b.id
      LEFT JOIN users sell ON s.seller_id = sell.id
      LEFT JOIN users a ON s.agent_id = a.id
      WHERE 1=1
    `;
    const params = [];
    if (req.user.role === 'agent') { query += ' AND s.agent_id = ?'; params.push(req.user.id); }
    query += ' ORDER BY s.created_at DESC';
    const sales = db.prepare(query).all(...params);
    res.json({ success: true, data: sales });
  } catch (err) { next(err); }
});

module.exports = router;
