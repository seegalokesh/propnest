require('dotenv').config();
const bcrypt = require('bcryptjs');
const { getDb } = require('./database');
const { runMigrations } = require('./migrations');

async function seed() {
  try {
    console.log('🌱 Starting seed...');
    runMigrations();
    
    const db = getDb();
    
    // Wait for DB connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('🧹 Clearing existing data...');
    
    // Clear existing data
    await db.prepare('DELETE FROM property_compare').run();
    await db.prepare('DELETE FROM favorites').run();
    await db.prepare('DELETE FROM sales').run();
    await db.prepare('DELETE FROM inquiries').run();
    await db.prepare('DELETE FROM site_visits').run();
    await db.prepare('DELETE FROM agents').run();
    await db.prepare('DELETE FROM property_images').run();
    await db.prepare('DELETE FROM properties').run();
    await db.prepare('DELETE FROM locations').run();
    await db.prepare('DELETE FROM users').run();

    // Hash passwords
    const adminHash = await bcrypt.hash('Admin@123', 10);
    const sellerHash = await bcrypt.hash('Seller@123', 10);
    const buyerHash = await bcrypt.hash('Buyer@123', 10);
    const agentHash = await bcrypt.hash('Agent@123', 10);

    console.log('👥 Creating users...');

    // Insert users
    const adminRes = await db.prepare(`
      INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)
    `).run('Admin User', 'admin@demo.com', adminHash, 'admin', '9876543210');
    const adminId = adminRes.lastInsertRowid;
    
    const sellerRes = await db.prepare(`
      INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)
    `).run('Rajesh Sharma', 'seller@demo.com', sellerHash, 'seller', '9876543211');
    const sellerId = sellerRes.lastInsertRowid;
    
    const buyerRes = await db.prepare(`
      INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)
    `).run('Priya Patel', 'buyer@demo.com', buyerHash, 'buyer', '9876543212');
    const buyerId = buyerRes.lastInsertRowid;
    
    const agentRes = await db.prepare(`
      INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)
    `).run('Amit Verma', 'agent@demo.com', agentHash, 'agent', '9876543213');
    const agentId = agentRes.lastInsertRowid;

    console.log('📍 Creating locations...');

    // Insert locations
    const loc1Res = await db.prepare(`
      INSERT INTO locations (city, area, state, pincode) VALUES (?, ?, ?, ?)
    `).run('Mumbai', 'Bandra West', 'Maharashtra', '400050');
    const loc1 = loc1Res.lastInsertRowid;
    
    const loc2Res = await db.prepare(`
      INSERT INTO locations (city, area, state, pincode) VALUES (?, ?, ?, ?)
    `).run('Bangalore', 'Koramangala', 'Karnataka', '560034');
    const loc2 = loc2Res.lastInsertRowid;
    
    const loc3Res = await db.prepare(`
      INSERT INTO locations (city, area, state, pincode) VALUES (?, ?, ?, ?)
    `).run('Delhi', 'Vasant Kunj', 'Delhi', '110070');
    const loc3 = loc3Res.lastInsertRowid;
    
    const loc4Res = await db.prepare(`
      INSERT INTO locations (city, area, state, pincode) VALUES (?, ?, ?, ?)
    `).run('Hyderabad', 'Gachibowli', 'Telangana', '500032');
    const loc4 = loc4Res.lastInsertRowid;
    
    const loc5Res = await db.prepare(`
      INSERT INTO locations (city, area, state, pincode) VALUES (?, ?, ?, ?)
    `).run('Pune', 'Baner', 'Maharashtra', '411045');
    const loc5 = loc5Res.lastInsertRowid;
    
    const loc6Res = await db.prepare(`
      INSERT INTO locations (city, area, state, pincode) VALUES (?, ?, ?, ?)
    `).run('Chennai', 'Anna Nagar', 'Tamil Nadu', '600040');
    const loc6 = loc6Res.lastInsertRowid;

    console.log('🏠 Creating properties...');

    // Insert properties
    const p1Res = await db.prepare(`
      INSERT INTO properties (title, description, type, status, price, bedrooms, bathrooms, area_sqft, address, location_id, seller_id, agent_id, primary_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Luxury Sea-View Apartment', 
      'A stunning 3BHK apartment with breathtaking sea views in the heart of Bandra. Modern amenities, spacious rooms, and premium finishes throughout.',
      'apartment', 'available', 18500000, 3, 2, 1450, 'Plot 12, Sea View Residency, Bandra West', loc1, sellerId, agentId,
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'
    );
    const p1 = p1Res.lastInsertRowid;

    const p2Res = await db.prepare(`
      INSERT INTO properties (title, description, type, status, price, bedrooms, bathrooms, area_sqft, address, location_id, seller_id, agent_id, primary_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Premium Tech Park Villa',
      'Elegant 4BHK villa in the prestigious Koramangala area. Perfect for IT professionals, minutes from major tech parks. Private garden and parking.',
      'villa', 'available', 35000000, 4, 3, 2800, '14th Cross, Koramangala 6th Block', loc2, sellerId, agentId,
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800'
    );
    const p2 = p2Res.lastInsertRowid;

    const p3Res = await db.prepare(`
      INSERT INTO properties (title, description, type, status, price, bedrooms, bathrooms, area_sqft, address, location_id, seller_id, agent_id, primary_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Prime Commercial Space',
      'Well-located commercial property in Vasant Kunj commercial complex. Ideal for retail, office or showroom. High footfall area with ample parking.',
      'commercial', 'available', 22000000, 0, 2, 1200, 'Shop 4, Vasant Kunj Commercial Complex', loc3, sellerId, agentId,
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
    );
    const p3 = p3Res.lastInsertRowid;

    const p4Res = await db.prepare(`
      INSERT INTO properties (title, description, type, status, price, bedrooms, bathrooms, area_sqft, address, location_id, seller_id, agent_id, primary_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Gachibowli Residential Plot',
      'Prime residential plot in the IT corridor of Gachibowli. HMDA approved. Perfect investment opportunity with all utilities nearby.',
      'plot', 'pending', 9500000, 0, 0, 2400, 'Survey No. 45, Gachibowli Village', loc4, sellerId, agentId,
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'
    );
    const p4 = p4Res.lastInsertRowid;

    const p5Res = await db.prepare(`
      INSERT INTO properties (title, description, type, status, price, bedrooms, bathrooms, area_sqft, address, location_id, seller_id, agent_id, primary_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Modern Family Home in Baner',
      'Beautiful 3BHK independent house in a quiet residential area. Newly constructed with Italian marble flooring, modular kitchen and private terrace.',
      'house', 'available', 14500000, 3, 3, 2100, '7, Rose Valley Society, Baner Road', loc5, sellerId, agentId,
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'
    );
    const p5 = p5Res.lastInsertRowid;

    const p6Res = await db.prepare(`
      INSERT INTO properties (title, description, type, status, price, bedrooms, bathrooms, area_sqft, address, location_id, seller_id, agent_id, primary_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Anna Nagar 2BHK Apartment',
      'Comfortable 2BHK apartment in prime Anna Nagar location. Walking distance from metro station and major markets. Ready to move in.',
      'apartment', 'sold', 8200000, 2, 2, 980, 'Block C, Sri Apartments, 15th Street', loc6, sellerId, agentId,
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
    );
    const p6 = p6Res.lastInsertRowid;

    console.log('🖼️  Adding property images...');

    // Insert property images
    await db.prepare(`INSERT INTO property_images (property_id, image_url, is_primary) VALUES (?, ?, ?)`).run(p1, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 1);
    await db.prepare(`INSERT INTO property_images (property_id, image_url, is_primary) VALUES (?, ?, ?)`).run(p1, 'https://images.unsplash.com/photo-1560447204-e02f11c3d0e2?w=800', 0);
    await db.prepare(`INSERT INTO property_images (property_id, image_url, is_primary) VALUES (?, ?, ?)`).run(p1, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800', 0);
    await db.prepare(`INSERT INTO property_images (property_id, image_url, is_primary) VALUES (?, ?, ?)`).run(p2, 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800', 1);
    await db.prepare(`INSERT INTO property_images (property_id, image_url, is_primary) VALUES (?, ?, ?)`).run(p2, 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800', 0);
    await db.prepare(`INSERT INTO property_images (property_id, image_url, is_primary) VALUES (?, ?, ?)`).run(p3, 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', 1);
    await db.prepare(`INSERT INTO property_images (property_id, image_url, is_primary) VALUES (?, ?, ?)`).run(p4, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', 1);
    await db.prepare(`INSERT INTO property_images (property_id, image_url, is_primary) VALUES (?, ?, ?)`).run(p5, 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800', 1);
    await db.prepare(`INSERT INTO property_images (property_id, image_url, is_primary) VALUES (?, ?, ?)`).run(p5, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 0);
    await db.prepare(`INSERT INTO property_images (property_id, image_url, is_primary) VALUES (?, ?, ?)`).run(p6, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 1);

    console.log('🤝 Creating agent profile...');

    // Insert agent profile
    await db.prepare(`
      INSERT INTO agents (user_id, license_number, experience_years, specialization, bio, total_sales, rating)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(agentId, 'MH-REA-2019-4521', 5, 'Residential & Commercial', 
      'Experienced real estate agent specializing in premium properties across Mumbai and Pune. 5+ years of market expertise with 50+ successful closings.',
      12, 4.7);

    console.log('📅 Creating site visits...');

    // Insert site visits
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const visitDate1 = tomorrow.toISOString().split('T')[0];

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const visitDate2 = nextWeek.toISOString().split('T')[0];

    await db.prepare(`
      INSERT INTO site_visits (property_id, buyer_id, agent_id, visit_date, visit_time, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(p1, buyerId, agentId, visitDate1, '10:00 AM', 'scheduled', 'Please bring ID proof');
    await db.prepare(`
      INSERT INTO site_visits (property_id, buyer_id, agent_id, visit_date, visit_time, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(p2, buyerId, agentId, visitDate2, '3:00 PM', 'scheduled', 'Gate access required');

    console.log('❓ Creating inquiries...');

    // Insert inquiries
    await db.prepare(`
      INSERT INTO inquiries (property_id, buyer_id, agent_id, message, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(p1, buyerId, agentId, 'Is this property available for immediate possession? What are the maintenance charges?', 'open');
    await db.prepare(`
      INSERT INTO inquiries (property_id, buyer_id, agent_id, message, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(p2, buyerId, agentId, 'Can the price be negotiated? Also, is the property RERA registered?', 'responded');
    await db.prepare(`
      INSERT INTO inquiries (property_id, buyer_id, agent_id, message, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(p5, buyerId, agentId, 'What is the exact carpet area? Are there any pending dues on this property?', 'open');

    console.log('💰 Creating sales...');

    // Insert a sale
    const salePrice = 8200000;
    await db.prepare(`
      INSERT INTO sales (property_id, buyer_id, seller_id, agent_id, sale_price, commission, sale_date, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(p6, buyerId, sellerId, agentId, salePrice, salePrice * 0.02, new Date().toISOString().split('T')[0], 
      'Smooth transaction, buyer and seller both satisfied');

    console.log('✅ Seed data inserted successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('  Admin:  admin@demo.com  / Admin@123');
    console.log('  Agent:  agent@demo.com  / Agent@123');
    console.log('  Seller: seller@demo.com / Seller@123');
    console.log('  Buyer:  buyer@demo.com  / Buyer@123');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
