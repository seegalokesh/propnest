const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticate } = require('../middleware/auth');

// GET /api/agents - public
router.get('/', (req, res, next) => {
  try {
    const db = getDb();
    const agents = db.prepare(`
      SELECT u.id, u.name, u.email, u.phone,
        ag.license_number, ag.experience_years, ag.specialization, ag.bio, ag.total_sales, ag.rating,
        (SELECT COUNT(*) FROM properties p WHERE p.agent_id = u.id) as assigned_properties
      FROM agents ag
      JOIN users u ON ag.user_id = u.id
      ORDER BY ag.rating DESC
    `).all();
    res.json({ success: true, data: agents });
  } catch (err) { next(err); }
});

// GET /api/agents/:id/leads - agent only
router.get('/:id/leads', authenticate, (req, res, next) => {
  try {
    const db = getDb();
    const inquiries = db.prepare(`
      SELECT i.*, p.title as property_title, u.name as buyer_name, u.phone as buyer_phone
      FROM inquiries i
      JOIN properties p ON i.property_id = p.id
      JOIN users u ON i.buyer_id = u.id
      WHERE i.agent_id = ? ORDER BY i.created_at DESC
    `).all(req.params.id);

    const visits = db.prepare(`
      SELECT sv.*, p.title as property_title, u.name as buyer_name
      FROM site_visits sv
      JOIN properties p ON sv.property_id = p.id
      JOIN users u ON sv.buyer_id = u.id
      WHERE sv.agent_id = ? ORDER BY sv.visit_date DESC
    `).all(req.params.id);

    res.json({ success: true, data: { inquiries, visits } });
  } catch (err) { next(err); }
});

module.exports = router;
