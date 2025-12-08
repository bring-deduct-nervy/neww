-- Seed Admin Users for ResQ-Unified
-- Note: These are for demonstration purposes. Change passwords in production!

-- Insert default admin user profiles
INSERT INTO user_profiles (user_id, email, full_name, phone, role, district, is_active) VALUES
  (gen_random_uuid(), 'admin@resq-unified.lk', 'System Administrator', '+94771234567', 'SUPER_ADMIN', 'Colombo', true),
  (gen_random_uuid(), 'coordinator@resq-unified.lk', 'Relief Coordinator', '+94772345678', 'COORDINATOR', 'Colombo', true),
  (gen_random_uuid(), 'casemanager@resq-unified.lk', 'Case Manager', '+94773456789', 'CASE_MANAGER', 'Gampaha', true),
  (gen_random_uuid(), 'volunteer@resq-unified.lk', 'Field Volunteer', '+94774567890', 'VOLUNTEER', 'Kalutara', true)
ON CONFLICT DO NOTHING;

-- Insert sample alerts
INSERT INTO alerts (type, severity, title, message, districts, source, is_active) VALUES
  ('FLOOD', 'HIGH', 'Flood Warning - Kelani River', 'Water levels rising rapidly. Residents in low-lying areas advised to evacuate immediately.', ARRAY['Colombo', 'Gampaha'], 'Disaster Management Center', true),
  ('WEATHER', 'MEDIUM', 'Heavy Rainfall Expected', 'Heavy rainfall expected in Western and Southern provinces over the next 24 hours. Take precautions.', ARRAY['Colombo', 'Kalutara', 'Galle', 'Matara'], 'Meteorological Department', true),
  ('EVACUATION', 'CRITICAL', 'Mandatory Evacuation - Kaduwela', 'Immediate evacuation required for residents in Kaduwela low-lying areas due to dam release.', ARRAY['Colombo'], 'Disaster Management Center', true),
  ('INFORMATION', 'LOW', 'Relief Distribution Schedule', 'Relief supplies will be distributed at designated centers from 8 AM to 5 PM daily.', ARRAY['Colombo', 'Gampaha', 'Kalutara'], 'District Secretariat', true)
ON CONFLICT DO NOTHING;

-- Insert sample shelters
INSERT INTO shelters (name, type, address, district, latitude, longitude, total_capacity, current_occupancy, status, has_medical, has_food, has_water, has_sanitation, has_electricity, has_internet, is_accessible, contact_name, contact_phone) VALUES
  ('Colombo Municipal School', 'SCHOOL', '123 Main Street, Colombo 07', 'Colombo', 6.9271, 79.8612, 500, 320, 'ACTIVE', true, true, true, true, true, false, true, 'Mr. Silva', '0112345678'),
  ('Kelaniya Temple Relief Camp', 'RELIGIOUS', 'Temple Road, Kelaniya', 'Gampaha', 6.9553, 79.9225, 300, 280, 'ACTIVE', false, true, true, true, true, false, false, 'Rev. Thero', '0112987654'),
  ('Gampaha Community Center', 'COMMUNITY_CENTER', 'Station Road, Gampaha', 'Gampaha', 7.0917, 79.9500, 400, 150, 'ACTIVE', true, true, true, true, true, true, true, 'Mrs. Fernando', '0332222333'),
  ('Kalutara District Hospital Annex', 'GOVERNMENT', 'Hospital Road, Kalutara', 'Kalutara', 6.5854, 79.9607, 200, 180, 'ACTIVE', true, true, true, true, true, false, true, 'Dr. Perera', '0342222111'),
  ('Ratnapura Buddhist Temple', 'RELIGIOUS', 'Temple Lane, Ratnapura', 'Ratnapura', 6.6828, 80.3992, 250, 100, 'ACTIVE', false, true, true, true, true, false, false, 'Rev. Nanda', '0452222444'),
  ('Galle Fort Community Hall', 'COMMUNITY_CENTER', 'Fort Road, Galle', 'Galle', 6.0535, 80.2210, 350, 200, 'ACTIVE', true, true, true, true, true, true, true, 'Mr. Jayawardena', '0912222555')
ON CONFLICT DO NOTHING;

-- Insert sample river levels
INSERT INTO river_levels (river_name, station_name, district, latitude, longitude, current_level, warning_level, danger_level, status) VALUES
  ('Kelani River', 'Nagalagam Street', 'Colombo', 6.9497, 79.8612, 4.2, 4.0, 5.5, 'WARNING'),
  ('Kelani River', 'Hanwella', 'Colombo', 6.9097, 80.0812, 3.8, 4.0, 5.5, 'RISING'),
  ('Kalu River', 'Putupaula', 'Kalutara', 6.5854, 79.9607, 3.5, 4.5, 6.0, 'NORMAL'),
  ('Gin River', 'Baddegama', 'Galle', 6.1535, 80.1910, 2.8, 3.5, 5.0, 'NORMAL'),
  ('Nilwala River', 'Pitabeddara', 'Matara', 6.0549, 80.4550, 3.2, 4.0, 5.5, 'NORMAL'),
  ('Mahaweli River', 'Peradeniya', 'Kandy', 7.2706, 80.5937, 4.8, 5.0, 6.5, 'RISING'),
  ('Walawe River', 'Thimbolketiya', 'Ratnapura', 6.4828, 80.5992, 3.0, 4.0, 5.5, 'NORMAL'),
  ('Attanagalu Oya', 'Dunamale', 'Gampaha', 7.0917, 79.9500, 2.5, 3.0, 4.5, 'NORMAL')
ON CONFLICT DO NOTHING;

-- Insert sample weather data
INSERT INTO weather_data (district, latitude, longitude, temperature, humidity, rainfall, wind_speed, wind_direction, pressure, cloud_cover, visibility, feels_like, weather_code, flood_risk_level) VALUES
  ('Colombo', 6.9271, 79.8612, 28.5, 78, 15.2, 12.5, 225, 1012, 75, 8.5, 31.2, 61, 'MODERATE'),
  ('Gampaha', 7.0917, 79.9500, 27.8, 82, 22.5, 10.2, 210, 1010, 85, 7.0, 30.5, 63, 'HIGH'),
  ('Kalutara', 6.5854, 79.9607, 29.2, 75, 8.5, 15.0, 240, 1013, 60, 10.0, 32.0, 51, 'LOW'),
  ('Kandy', 7.2906, 80.6337, 24.5, 85, 18.0, 8.5, 180, 1008, 90, 6.0, 26.8, 65, 'MODERATE'),
  ('Galle', 6.0535, 80.2210, 28.8, 80, 12.0, 18.5, 250, 1011, 70, 9.0, 31.5, 61, 'MODERATE'),
  ('Matara', 5.9549, 80.5550, 29.0, 78, 5.5, 20.0, 260, 1012, 55, 12.0, 31.8, 45, 'LOW'),
  ('Ratnapura', 6.6828, 80.3992, 26.5, 88, 35.0, 6.5, 190, 1006, 95, 4.0, 29.2, 80, 'VERY_HIGH'),
  ('Kurunegala', 7.4867, 80.3647, 30.2, 70, 3.5, 14.0, 220, 1014, 45, 15.0, 33.0, 3, 'LOW'),
  ('Anuradhapura', 8.3114, 80.4037, 32.5, 65, 0.0, 16.5, 200, 1015, 30, 20.0, 35.2, 1, 'LOW'),
  ('Jaffna', 9.6615, 80.0255, 31.8, 68, 0.0, 22.0, 180, 1014, 25, 25.0, 34.5, 0, 'LOW'),
  ('Batticaloa', 7.7310, 81.6747, 30.5, 72, 2.0, 18.0, 170, 1013, 40, 18.0, 33.2, 2, 'LOW'),
  ('Trincomalee', 8.5874, 81.2152, 31.2, 70, 1.5, 20.5, 165, 1013, 35, 22.0, 34.0, 1, 'LOW'),
  ('Badulla', 6.9934, 81.0550, 22.5, 90, 25.0, 5.0, 195, 1005, 98, 3.0, 24.8, 95, 'HIGH'),
  ('Nuwara Eliya', 6.9497, 80.7891, 16.5, 92, 20.0, 8.0, 200, 1002, 100, 2.0, 17.2, 80, 'MODERATE')
ON CONFLICT DO NOTHING;

-- Insert sample beneficiaries
INSERT INTO beneficiaries (name, phone, alternate_phone, email, national_id, household_size, address, district, gs_division, village, vulnerabilities, opt_in_sms, opt_in_email) VALUES
  ('Kamal Perera', '0771234567', '0112345678', 'kamal@email.com', '199012345678', 5, '45 Galle Road, Colombo 03', 'Colombo', 'Kollupitiya', 'Colombo 03', ARRAY['ELDERLY', 'CHRONIC_ILLNESS'], true, true),
  ('Nimal Silva', '0772345678', NULL, 'nimal@email.com', '198523456789', 4, '123 Station Road, Gampaha', 'Gampaha', 'Gampaha', 'Gampaha Town', ARRAY['CHILDREN_UNDER_5'], true, false),
  ('Kumari Fernando', '0773456789', '0332222333', NULL, '199234567890', 3, '78 Temple Road, Kalutara', 'Kalutara', 'Kalutara South', 'Kalutara', ARRAY['PREGNANT', 'DISABLED'], true, true),
  ('Sunil Jayawardena', '0774567890', NULL, 'sunil@email.com', '197845678901', 6, '234 Main Street, Ratnapura', 'Ratnapura', 'Ratnapura', 'Ratnapura Town', ARRAY['ELDERLY', 'CHILDREN_UNDER_5'], true, true),
  ('Malini Wickramasinghe', '0775678901', '0912222444', 'malini@email.com', '198556789012', 2, '56 Fort Road, Galle', 'Galle', 'Galle Fort', 'Galle', ARRAY['SINGLE_PARENT'], true, false)
ON CONFLICT DO NOTHING;

-- Insert sample volunteers
INSERT INTO volunteers (name, phone, email, district, skills, equipment, availability, status, role, is_verified, completed_cases, rating) VALUES
  ('Ashan Bandara', '0776789012', 'ashan@email.com', 'Colombo', ARRAY['FIRST_AID', 'DRIVING', 'SWIMMING'], ARRAY['VEHICLE', 'FIRST_AID_KIT'], 'FULL_TIME', 'ACTIVE', 'TEAM_LEAD', true, 45, 4.8),
  ('Dilshan Rajapaksa', '0777890123', 'dilshan@email.com', 'Gampaha', ARRAY['FIRST_AID', 'COOKING'], ARRAY['COOKING_EQUIPMENT'], 'PART_TIME', 'ACTIVE', 'FIELD_WORKER', true, 28, 4.5),
  ('Chamari Seneviratne', '0778901234', 'chamari@email.com', 'Kalutara', ARRAY['MEDICAL', 'COUNSELING'], ARRAY['MEDICAL_KIT'], 'ON_CALL', 'ACTIVE', 'MEDICAL', true, 52, 4.9),
  ('Ruwan Dissanayake', '0779012345', 'ruwan@email.com', 'Ratnapura', ARRAY['DRIVING', 'HEAVY_LIFTING'], ARRAY['VEHICLE', 'BOAT'], 'FULL_TIME', 'ACTIVE', 'DRIVER', true, 38, 4.6),
  ('Sanduni Perera', '0770123456', 'sanduni@email.com', 'Galle', ARRAY['FIRST_AID', 'COMMUNICATION'], ARRAY['RADIO', 'FIRST_AID_KIT'], 'PART_TIME', 'ACTIVE', 'COORDINATOR', true, 62, 4.7)
ON CONFLICT DO NOTHING;

-- Insert sample cases
INSERT INTO cases (case_number, category, priority, status, description, address, district, gs_division, village, people_affected) VALUES
  ('CASE-2024-001', 'FOOD', 'HIGH', 'IN_PROGRESS', 'Family of 5 needs food supplies. Running low on rice and essentials.', '45 Galle Road, Colombo 03', 'Colombo', 'Kollupitiya', 'Colombo 03', 5),
  ('CASE-2024-002', 'MEDICAL', 'CRITICAL', 'ASSIGNED', 'Elderly diabetic patient needs insulin urgently. Cannot access pharmacy.', '123 Station Road, Gampaha', 'Gampaha', 'Gampaha', 'Gampaha Town', 1),
  ('CASE-2024-003', 'SHELTER', 'HIGH', 'PENDING', 'House flooded. Family of 4 needs temporary shelter.', '78 Temple Road, Kalutara', 'Kalutara', 'Kalutara South', 'Kalutara', 4),
  ('CASE-2024-004', 'WATER', 'MEDIUM', 'RESOLVED', 'Community needs clean drinking water. Well contaminated.', '234 Main Street, Ratnapura', 'Ratnapura', 'Ratnapura', 'Ratnapura Town', 25),
  ('CASE-2024-005', 'EVACUATION', 'CRITICAL', 'IN_PROGRESS', 'Family trapped on rooftop due to rising water levels.', '56 Fort Road, Galle', 'Galle', 'Galle Fort', 'Galle', 3),
  ('CASE-2024-006', 'RESCUE', 'CRITICAL', 'ASSIGNED', 'Elderly couple stranded in flooded area. Need boat rescue.', '89 River Road, Colombo', 'Colombo', 'Wellawatte', 'Wellawatte', 2),
  ('CASE-2024-007', 'SANITATION', 'LOW', 'PENDING', 'Community toilet facilities damaged. Need repair supplies.', '12 Village Road, Gampaha', 'Gampaha', 'Minuwangoda', 'Minuwangoda', 50),
  ('CASE-2024-008', 'CLOTHING', 'MEDIUM', 'RESOLVED', 'Family lost all belongings. Need clothes for children.', '67 School Lane, Kalutara', 'Kalutara', 'Panadura', 'Panadura', 4)
ON CONFLICT DO NOTHING;

-- Insert sample donations
INSERT INTO donations (donor_name, donor_email, donor_phone, amount, currency, payment_method, status, is_anonymous) VALUES
  ('Anonymous Donor', NULL, NULL, 50000.00, 'LKR', 'BANK_TRANSFER', 'COMPLETED', true),
  ('Samantha Perera', 'samantha@email.com', '0771111111', 25000.00, 'LKR', 'CARD', 'COMPLETED', false),
  ('Corporate Donor Ltd', 'corporate@company.com', '0112222222', 500000.00, 'LKR', 'BANK_TRANSFER', 'COMPLETED', false),
  ('John Smith', 'john@email.com', NULL, 10000.00, 'LKR', 'CARD', 'COMPLETED', false),
  ('Anonymous', NULL, NULL, 15000.00, 'LKR', 'CARD', 'COMPLETED', true)
ON CONFLICT DO NOTHING;

-- Insert sample resources
INSERT INTO resources (name, category, quantity, unit, min_stock_level, location, status) VALUES
  ('Rice (5kg bags)', 'FOOD', 500, 'bags', 100, 'Colombo Central Warehouse', 'AVAILABLE'),
  ('Drinking Water (1L bottles)', 'WATER', 2000, 'bottles', 500, 'Colombo Central Warehouse', 'AVAILABLE'),
  ('First Aid Kits', 'MEDICAL', 150, 'kits', 50, 'Colombo Central Warehouse', 'AVAILABLE'),
  ('Blankets', 'SHELTER', 300, 'pieces', 100, 'Gampaha Distribution Center', 'AVAILABLE'),
  ('Tarpaulins', 'SHELTER', 200, 'pieces', 50, 'Gampaha Distribution Center', 'AVAILABLE'),
  ('Sanitary Pads', 'SANITATION', 1000, 'packs', 200, 'Colombo Central Warehouse', 'AVAILABLE'),
  ('Baby Formula', 'FOOD', 100, 'cans', 30, 'Kalutara Relief Center', 'LOW_STOCK'),
  ('Diapers', 'SANITATION', 500, 'packs', 100, 'Kalutara Relief Center', 'AVAILABLE'),
  ('Torches/Flashlights', 'EQUIPMENT', 200, 'pieces', 50, 'Ratnapura Warehouse', 'AVAILABLE'),
  ('Batteries', 'EQUIPMENT', 1000, 'packs', 200, 'Ratnapura Warehouse', 'AVAILABLE')
ON CONFLICT DO NOTHING;

-- Insert sample missing persons
INSERT INTO missing_persons (name, age, gender, description, last_seen_location, last_seen_date, district, contact_name, contact_phone, status) VALUES
  ('Saman Kumara', 45, 'Male', 'Last seen wearing blue shirt and black trousers. Has a scar on left arm.', 'Kaduwela Bridge Area', NOW() - INTERVAL '2 days', 'Colombo', 'Kumari Kumara', '0771234567', 'MISSING'),
  ('Nimali Fernando', 28, 'Female', 'Last seen wearing red dress. Pregnant, 7 months.', 'Gampaha Town Center', NOW() - INTERVAL '1 day', 'Gampaha', 'Sunil Fernando', '0772345678', 'MISSING'),
  ('Ranjith Perera', 65, 'Male', 'Elderly man with white hair. Uses walking stick. Has dementia.', 'Kalutara Beach Road', NOW() - INTERVAL '3 days', 'Kalutara', 'Malini Perera', '0773456789', 'MISSING'),
  ('Kasun Silva', 12, 'Male', 'School boy wearing white uniform. Last seen near school.', 'Ratnapura Central School', NOW() - INTERVAL '12 hours', 'Ratnapura', 'Nimal Silva', '0774567890', 'FOUND')
ON CONFLICT DO NOTHING;

-- Insert sample emergency reports
INSERT INTO emergency_reports (reporter_name, reporter_phone, category, description, address, district, severity, status) VALUES
  ('Anonymous', '0771111111', 'FLOOD', 'Water entering houses in low-lying area. About 10 families affected.', 'River View Lane, Colombo', 'Colombo', 'HIGH', 'VERIFIED'),
  ('Kamal Perera', '0772222222', 'LANDSLIDE', 'Small landslide blocking road. No injuries reported.', 'Hill Road, Ratnapura', 'Ratnapura', 'MEDIUM', 'ASSIGNED'),
  ('Anonymous', '0773333333', 'RESCUE', 'Family stranded on rooftop. Water level rising.', 'Flood Zone, Gampaha', 'Gampaha', 'CRITICAL', 'ASSIGNED'),
  ('Nimal Silva', '0774444444', 'MEDICAL', 'Elderly person needs dialysis. Cannot reach hospital.', 'Village Road, Kalutara', 'Kalutara', 'CRITICAL', 'RESOLVED'),
  ('Kumari Fernando', '0775555555', 'FIRE', 'Small fire in kitchen. Controlled but need assistance.', 'Main Street, Galle', 'Galle', 'LOW', 'RESOLVED')
ON CONFLICT DO NOTHING;

-- Insert flood predictions
INSERT INTO flood_predictions (district, river_name, prediction_date, risk_level, probability, expected_rainfall, expected_river_level, affected_areas, recommendations, model_version) VALUES
  ('Colombo', 'Kelani River', CURRENT_DATE + INTERVAL '1 day', 'HIGH', 75.5, 45.0, 5.2, ARRAY['Kaduwela', 'Wellawatte', 'Kolonnawa'], ARRAY['Prepare for evacuation', 'Move valuables to higher ground', 'Stock emergency supplies'], 'v2.1'),
  ('Gampaha', 'Attanagalu Oya', CURRENT_DATE + INTERVAL '1 day', 'MODERATE', 55.0, 30.0, 3.5, ARRAY['Minuwangoda', 'Ja-Ela'], ARRAY['Monitor water levels', 'Keep emergency kit ready'], 'v2.1'),
  ('Kalutara', 'Kalu River', CURRENT_DATE + INTERVAL '1 day', 'LOW', 25.0, 15.0, 2.8, ARRAY['Kalutara Town'], ARRAY['Normal precautions'], 'v2.1'),
  ('Ratnapura', 'Kalu River', CURRENT_DATE + INTERVAL '1 day', 'VERY_HIGH', 85.0, 60.0, 6.0, ARRAY['Ratnapura Town', 'Eheliyagoda', 'Kuruwita'], ARRAY['Immediate evacuation recommended', 'Avoid low-lying areas', 'Contact emergency services'], 'v2.1'),
  ('Galle', 'Gin River', CURRENT_DATE + INTERVAL '1 day', 'MODERATE', 45.0, 25.0, 3.2, ARRAY['Baddegama', 'Hikkaduwa'], ARRAY['Stay alert', 'Avoid river banks'], 'v2.1')
ON CONFLICT DO NOTHING;
