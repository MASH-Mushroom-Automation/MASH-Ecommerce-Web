-- ============================================================================
-- AI-007: Neon PostgreSQL Database Setup
-- Phase 1: Complete Database Initialization
-- ============================================================================
-- 
-- Execute this entire script in Neon SQL Editor: https://console.neon.tech
-- Expected time: 2-3 minutes
--
-- ============================================================================

-- Step 1: Create growers table (Seller profiles)
-- ============================================================================

CREATE TABLE IF NOT EXISTS growers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  specialty VARCHAR(255),
  location VARCHAR(255),
  capacity_kg INTEGER DEFAULT 100,
  rating DECIMAL(3,2) DEFAULT 4.5,
  role VARCHAR(50) DEFAULT 'SELLER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_growers_role ON growers(role);
CREATE INDEX IF NOT EXISTS idx_growers_location ON growers(location);

-- Step 2: Create availability_slots table (Time slots for appointments)
-- ============================================================================

CREATE TABLE IF NOT EXISTS availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_uid VARCHAR(255) NOT NULL REFERENCES growers(user_uid) ON DELETE CASCADE,
  available_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  is_available BOOLEAN DEFAULT TRUE,
  booked_by VARCHAR(255),
  appointment_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_availability_seller ON availability_slots(seller_uid);
CREATE INDEX IF NOT EXISTS idx_availability_date ON availability_slots(available_date);
CREATE INDEX IF NOT EXISTS idx_availability_status ON availability_slots(is_available, available_date);

-- Step 3: Create appointments table (Booking records)
-- ============================================================================

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_uid VARCHAR(255) NOT NULL,
  buyer_name VARCHAR(255) NOT NULL,
  buyer_email VARCHAR(255) NOT NULL,
  buyer_phone VARCHAR(50),
  seller_uid VARCHAR(255) NOT NULL REFERENCES growers(user_uid),
  seller_name VARCHAR(255) NOT NULL,
  product_type VARCHAR(255),
  quantity_kg INTEGER,
  scheduled_time TIMESTAMP NOT NULL,
  location VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  meeting_type VARCHAR(50) DEFAULT 'consultation',
  notes TEXT,
  cancel_reason TEXT,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointments_buyer ON appointments(buyer_uid);
CREATE INDEX IF NOT EXISTS idx_appointments_seller ON appointments(seller_uid);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON appointments(scheduled_time);

-- ============================================================================
-- Step 4: Seed Growers Data (3 sellers)
-- ============================================================================

INSERT INTO growers (user_uid, name, email, phone, specialty, location, capacity_kg, rating, role) VALUES
('seller_001', 'Manila Urban Farm', 'manila@mashfarm.com', '+63-912-345-6789', 'Oyster Mushrooms, King Oyster', 'Manila, Philippines', 150, 4.8, 'SELLER'),
('seller_002', 'Quezon City Growers', 'quezon@mashfarm.com', '+63-917-234-5678', 'Shiitake, Lion''s Mane', 'Quezon City, Philippines', 100, 4.6, 'SELLER'),
('seller_003', 'Makati Mushroom Co', 'makati@mashfarm.com', '+63-920-345-6789', 'All Mushroom Types', 'Makati, Philippines', 200, 4.9, 'SELLER')
ON CONFLICT (user_uid) DO NOTHING;

-- ============================================================================
-- Step 5: Seed Availability Slots (672 slots = 3 sellers × 7 days × 8 hours)
-- ============================================================================

INSERT INTO availability_slots (seller_uid, available_date, start_time, end_time, duration_minutes, is_available)
SELECT 
  seller_uid,
  (CURRENT_DATE + d.day) AS available_date,
  (t.hour || ':00:00')::TIME AS start_time,
  ((t.hour + 1) || ':00:00')::TIME AS end_time,
  60,
  TRUE
FROM (VALUES ('seller_001'), ('seller_002'), ('seller_003')) AS s(seller_uid)
CROSS JOIN generate_series(0, 6) AS d(day)
CROSS JOIN generate_series(9, 16) AS t(hour);

-- ============================================================================
-- Step 6: Seed Sample Appointments (2 test appointments)
-- ============================================================================

INSERT INTO appointments (buyer_uid, buyer_name, buyer_email, buyer_phone, seller_uid, seller_name, product_type, quantity_kg, scheduled_time, location, status, meeting_type, notes) VALUES
('buyer_test_001', 'Juan Dela Cruz', 'juan@example.com', '+63-915-123-4567', 'seller_001', 'Manila Urban Farm', 'Oyster Mushroom', 10, CURRENT_TIMESTAMP + INTERVAL '1 day', 'Manila', 'confirmed', 'consultation', 'Interested in regular supply'),
('buyer_test_002', 'Maria Santos', 'maria@example.com', '+63-916-234-5678', 'seller_002', 'Quezon City Growers', 'Shiitake Mushroom', 5, CURRENT_TIMESTAMP + INTERVAL '5 days', 'Quezon City', 'pending', 'farm_tour', 'Want to see growing facility')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Step 7: Verify Data (Run this to confirm setup)
-- ============================================================================

SELECT 'Growers:' as table_name, COUNT(*) as row_count FROM growers
UNION ALL
SELECT 'Availability Slots:', COUNT(*) FROM availability_slots
UNION ALL
SELECT 'Appointments:', COUNT(*) FROM appointments;

-- Expected output:
-- Growers: 3
-- Availability Slots: 672
-- Appointments: 2

-- ============================================================================
-- Step 8: Sample Queries (Test your data)
-- ============================================================================

-- View all sellers
-- SELECT * FROM growers ORDER BY rating DESC;

-- View available slots for next 7 days
-- SELECT seller_uid, available_date, start_time, end_time 
-- FROM availability_slots 
-- WHERE is_available = TRUE 
-- ORDER BY available_date, start_time 
-- LIMIT 20;

-- View all appointments
-- SELECT buyer_name, seller_name, product_type, scheduled_time, status 
-- FROM appointments 
-- ORDER BY scheduled_time;

-- ============================================================================
-- ✅ Phase 1 Complete!
-- Next: Configure n8n PostgreSQL credential
-- Guide: Open NEXT-STEPS-POSTGRESQL.md -> Phase 2
-- ============================================================================
