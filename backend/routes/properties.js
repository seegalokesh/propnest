const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');

// GET /api/properties - public
router.get('/', async (req, res, next) => {
  try {
    const db = getDb();
    const { location, type, minPrice, maxPrice, status, search, page = 1, limit = 12 } = req.query;

    let query = `
      SELECT p.*, 
        l.city, l.area, l.state, l.pincode,
        u.name as seller_name, u.phone as seller_phone,
        a.name as agent_name,
        (SELECT COUNT(*) FROM favorites f WHERE f.property_id = p.id) as favorite_count
      FROM properties p
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN users a ON p.agent_id = a.id
      WHERE 1=1
    `;
    let countQuery = `SELECT COUNT(*) as count FROM properties p
      LEFT JOIN locations l ON p.location_id = l.id
      WHERE 1=1`;
    const params = [];

    if (location) { 
      query += ` AND (l.city LIKE ? OR l.area LIKE ?)`;
      countQuery += ` AND (l.city LIKE ? OR l.area LIKE ?)`;
      params.push(`%${location}%`, `%${location}%`); 
    }
    if (type) { 
      query += ` AND p.type = ?`;
      countQuery += ` AND p.type = ?`;
      params.push(type); 
    }
    if (minPrice) { 
      query += ` AND p.price >= ?`;
      countQuery += ` AND p.price >= ?`;
      params.push(Number(minPrice)); 
    }
    if (maxPrice) { 
      query += ` AND p.price <= ?`;
      countQuery += ` AND p.price <= ?`;
      params.push(Number(maxPrice)); 
    }
    if (status) { 
      query += ` AND p.status = ?`;
      countQuery += ` AND p.status = ?`;
      params.push(status); 
    }
    if (search) { 
      query += ` AND (p.title LIKE ? OR p.description LIKE ? OR l.city LIKE ?)`;
      countQuery += ` AND (p.title LIKE ? OR p.description LIKE ? OR l.city LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`); 
    }

    // Count total
    const countResult = await db.prepare(countQuery).get(...params);
    const total = countResult ? countResult.count : 0;

    // Fetch properties with limit and offset
    query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const properties = await db.prepare(query).all(...params);
    res.json({ success: true, data: { properties, total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

// GET /api/properties/:id - public
router.get('/:id', async (req, res, next) => {
  try {
    const db = getDb();
    const property = await db.prepare(`
      SELECT p.*, 
        l.city, l.area, l.state, l.pincode,
        u.name as seller_name, u.phone as seller_phone, u.email as seller_email,
        a.name as agent_name, a.phone as agent_phone, a.email as agent_email,
        ag.license_number, ag.experience_years, ag.specialization, ag.rating
      FROM properties p
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN users a ON p.agent_id = a.id
      LEFT JOIN agents ag ON ag.user_id = p.agent_id
      WHERE p.id = ?
    `).get(req.params.id);

    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    const images = await db.prepare('SELECT * FROM property_images WHERE property_id = ?').all(req.params.id);
    res.json({ success: true, data: { ...property, images } });
  } catch (err) { next(err); }
});

// POST /api/properties - seller/admin
router.post('/', authenticate, requireRole('seller', 'admin'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('type').isIn(['apartment', 'villa', 'plot', 'house', 'commercial']).withMessage('Invalid property type'),
  body('price').isFloat({ min: 1, max: 999999999 }).withMessage('Price must be between 1 and 999,999,999'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('area').trim().notEmpty().withMessage('Area is required'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

    const db = getDb();
    const { title, description, type, price, bedrooms, bathrooms, area_sqft, address, city, area, state, pincode, primary_image } = req.body;
    const sellerId = req.user.id;

    const dup = await db.prepare('SELECT id FROM properties WHERE title = ? AND address = ? AND seller_id = ?').get(title, address, sellerId);
    if (dup) return res.status(409).json({ success: false, message: 'A property with the same title and address already exists in your listings' });

    const locRes = await db.prepare('INSERT INTO locations (city, area, state, pincode) VALUES (?, ?, ?, ?)').run(city, area, state || null, pincode || null);
    const propRes = await db.prepare(`
      INSERT INTO properties (title, description, type, price, bedrooms, bathrooms, area_sqft, address, location_id, seller_id, primary_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title, description || null, type, price, bedrooms || 0, bathrooms || 0, area_sqft || null, address, locRes.lastInsertRowid, sellerId, primary_image || null);

    if (primary_image) {
      await db.prepare('INSERT INTO property_images (property_id, image_url, is_primary) VALUES (?, ?, 1)').run(propRes.lastInsertRowid, primary_image);
    }

    res.status(201).json({ success: true, data: { id: propRes.lastInsertRowid } });
  } catch (err) { next(err); }
});

// PUT /api/properties/:id/status - agent/admin
router.put('/:id/status', authenticate, requireRole('agent', 'admin'), [
  body('status').isIn(['available', 'sold', 'pending']).withMessage('Invalid status'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

    const db = getDb();
    const property = await db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    if (req.user.role === 'agent' && property.agent_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only update status of properties assigned to you' });
    }

    await db.prepare('UPDATE properties SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.body.status, req.params.id);
    res.json({ success: true, message: 'Status updated successfully' });
  } catch (err) { next(err); }
});

// PUT /api/properties/:id - seller (own) or admin
router.put('/:id', authenticate, requireRole('seller', 'admin'), async (req, res, next) => {
  try {
    const db = getDb();
    const property = await db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    if (req.user.role === 'seller' && property.seller_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only edit your own properties' });
    }
    const { title, description, price, bedrooms, bathrooms, area_sqft, primary_image } = req.body;
    await db.prepare(`UPDATE properties SET title=COALESCE(?,title), description=COALESCE(?,description), price=COALESCE(?,price), 
      bedrooms=COALESCE(?,bedrooms), bathrooms=COALESCE(?,bathrooms), area_sqft=COALESCE(?,area_sqft), 
      primary_image=COALESCE(?,primary_image), updated_at=CURRENT_TIMESTAMP WHERE id=?`
    ).run(title, description, price, bedrooms, bathrooms, area_sqft, primary_image, req.params.id);
    res.json({ success: true, message: 'Property updated' });
  } catch (err) { next(err); }
});

// DELETE /api/properties/:id - seller (own) or admin
router.delete('/:id', authenticate, requireRole('seller', 'admin'), async (req, res, next) => {
  try {
    const db = getDb();
    const property = await db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    if (req.user.role === 'seller' && property.seller_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only delete your own properties' });
    }
    await db.prepare('DELETE FROM properties WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Property deleted successfully' });
  } catch (err) { next(err); }
});

module.exports = router;
