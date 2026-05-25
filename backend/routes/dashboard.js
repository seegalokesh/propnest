const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');

// GET /api/dashboard/admin
router.get('/admin', authenticate, requireRole('admin'), (req, res, next) => {
  try {
    const db = getDb();
    const totalProperties = db.prepare('SELECT COUNT(*) as count FROM properties').get().count;
    const available = db.prepare("SELECT COUNT(*) as count FROM properties WHERE status='available'").get().count;
    const sold = db.prepare("SELECT COUNT(*) as count FROM properties WHERE status='sold'").get().count;
    const pending = db.prepare("SELECT COUNT(*) as count FROM properties WHERE status='pending'").get().count;
    const totalRevenue = db.prepare('SELECT COALESCE(SUM(sale_price),0) as total FROM sales').get().total;
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role != 'admin'").get().count;

    const monthlySales = db.prepare(`
      SELECT strftime('%Y-%m', sale_date) as month, 
        COUNT(*) as count, 
        COALESCE(SUM(sale_price),0) as revenue
      FROM sales
      WHERE sale_date >= date('now', '-6 months')
      GROUP BY month ORDER BY month
    `).all();

    const topAgents = db.prepare(`
      SELECT u.id, u.name, ag.total_sales, ag.rating,
        COALESCE(SUM(s.sale_price),0) as revenue,
        COALESCE(SUM(s.commission),0) as commission
      FROM agents ag
      JOIN users u ON ag.user_id = u.id
      LEFT JOIN sales s ON s.agent_id = u.id
      GROUP BY u.id ORDER BY ag.total_sales DESC LIMIT 5
    `).all();

    const recentInquiries = db.prepare(`
      SELECT i.*, p.title as property_title, u.name as buyer_name
      FROM inquiries i
      JOIN properties p ON i.property_id = p.id
      JOIN users u ON i.buyer_id = u.id
      ORDER BY i.created_at DESC LIMIT 5
    `).all();

    const allProperties = db.prepare(`
      SELECT p.*, l.city, l.area, u.name as seller_name, a.name as agent_name
      FROM properties p
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN users a ON p.agent_id = a.id
      ORDER BY p.created_at DESC
    `).all();

    res.json({ success: true, data: {
      stats: { totalProperties, available, sold, pending, totalRevenue, totalUsers },
      monthlySales, topAgents, recentInquiries, allProperties
    }});
  } catch (err) { next(err); }
});

// GET /api/dashboard/agent
router.get('/agent', authenticate, requireRole('agent'), (req, res, next) => {
  try {
    const db = getDb();
    const agentId = req.user.id;

    const assignedProperties = db.prepare(`
      SELECT p.*, l.city, l.area FROM properties p
      LEFT JOIN locations l ON p.location_id = l.id
      WHERE p.agent_id = ? ORDER BY p.created_at DESC
    `).all(agentId);

    const openLeads = db.prepare(`
      SELECT i.*, p.title as property_title, u.name as buyer_name
      FROM inquiries i JOIN properties p ON i.property_id = p.id JOIN users u ON i.buyer_id = u.id
      WHERE i.agent_id = ? AND i.status = 'open' ORDER BY i.created_at DESC
    `).all(agentId);

    const upcomingVisits = db.prepare(`
      SELECT sv.*, p.title as property_title, u.name as buyer_name
      FROM site_visits sv JOIN properties p ON sv.property_id = p.id JOIN users u ON sv.buyer_id = u.id
      WHERE sv.agent_id = ? AND sv.status = 'scheduled' AND sv.visit_date >= date('now')
      ORDER BY sv.visit_date ASC
    `).all(agentId);

    const closedSales = db.prepare(`
      SELECT s.*, p.title as property_title FROM sales s JOIN properties p ON s.property_id = p.id
      WHERE s.agent_id = ? ORDER BY s.created_at DESC
    `).all(agentId);

    const stats = {
      totalAssigned: assignedProperties.length,
      openLeads: openLeads.length,
      upcomingVisits: upcomingVisits.length,
      closedSales: closedSales.length,
      totalCommission: closedSales.reduce((sum, s) => sum + (s.commission || 0), 0)
    };

    res.json({ success: true, data: { stats, assignedProperties, openLeads, upcomingVisits, closedSales } });
  } catch (err) { next(err); }
});

module.exports = router;
