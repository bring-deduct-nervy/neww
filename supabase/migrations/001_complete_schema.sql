-- Complete Database Schema for ResQ-Unified Disaster Response Platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'VOLUNTEER', 'CASE_MANAGER', 'COORDINATOR', 'ADMIN', 'SUPER_ADMIN')),
  district TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Beneficiaries Table
CREATE TABLE IF NOT EXISTS beneficiaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  alternate_phone TEXT,
  email TEXT,
  national_id TEXT,
  household_size INTEGER DEFAULT 1,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  gs_division TEXT,
  village TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  vulnerabilities TEXT[] DEFAULT '{}',
  opt_in_sms BOOLEAN DEFAULT true,
  opt_in_email BOOLEAN DEFAULT true,
  total_aid_received DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Volunteers Table
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(user_id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  district TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  equipment TEXT[] DEFAULT '{}',
  availability TEXT DEFAULT 'ON_CALL' CHECK (availability IN ('FULL_TIME', 'PART_TIME', 'ON_CALL', 'UNAVAILABLE')),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED')),
  role TEXT DEFAULT 'FIELD_WORKER' CHECK (role IN ('FIELD_WORKER', 'DRIVER', 'MEDICAL', 'COORDINATOR', 'TEAM_LEAD')),
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  completed_cases INTEGER DEFAULT 0,
  total_cases_handled INTEGER DEFAULT 0,
  cases_resolved_on_time INTEGER DEFAULT 0,
  average_response_time DECIMAL(10, 2) DEFAULT 0,
  average_resolution_time DECIMAL(10, 2) DEFAULT 0,
  sla_compliance_rate DECIMAL(5, 2) DEFAULT 0,
  customer_satisfaction_score DECIMAL(3, 2) DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cases Table
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number TEXT UNIQUE NOT NULL,
  beneficiary_id UUID REFERENCES beneficiaries(id),
  category TEXT NOT NULL CHECK (category IN ('FOOD', 'WATER', 'MEDICAL', 'SHELTER', 'EVACUATION', 'RESCUE', 'CLOTHING', 'SANITATION', 'ELECTRICITY', 'COMMUNICATION', 'TRANSPORT', 'OTHER')),
  priority TEXT NOT NULL CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED', 'CANCELLED')),
  description TEXT NOT NULL,
  address TEXT,
  district TEXT,
  gs_division TEXT,
  village TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  access_notes TEXT,
  people_affected INTEGER DEFAULT 1,
  assigned_volunteer_id UUID REFERENCES volunteers(id),
  sla_deadline TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shelters Table
CREATE TABLE IF NOT EXISTS shelters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'TEMPORARY' CHECK (type IN ('TEMPORARY', 'PERMANENT', 'SCHOOL', 'COMMUNITY_CENTER', 'RELIGIOUS', 'GOVERNMENT')),
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  total_capacity INTEGER DEFAULT 0,
  current_occupancy INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'FULL', 'CLOSED')),
  has_medical BOOLEAN DEFAULT false,
  has_food BOOLEAN DEFAULT false,
  has_water BOOLEAN DEFAULT false,
  has_sanitation BOOLEAN DEFAULT false,
  has_electricity BOOLEAN DEFAULT false,
  has_internet BOOLEAN DEFAULT false,
  is_accessible BOOLEAN DEFAULT false,
  contact_name TEXT,
  contact_phone TEXT,
  needs TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('FLOOD', 'WEATHER', 'EVACUATION', 'EMERGENCY', 'INFORMATION', 'WARNING')),
  severity TEXT NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  districts TEXT[] DEFAULT '{}',
  source TEXT,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  service TEXT NOT NULL,
  key_value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- River Levels Table
CREATE TABLE IF NOT EXISTS river_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  river_name TEXT NOT NULL,
  station_name TEXT NOT NULL,
  district TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  current_level DECIMAL(10, 2),
  warning_level DECIMAL(10, 2),
  danger_level DECIMAL(10, 2),
  status TEXT DEFAULT 'NORMAL' CHECK (status IN ('NORMAL', 'RISING', 'WARNING', 'DANGER', 'CRITICAL')),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weather Data Table
CREATE TABLE IF NOT EXISTS weather_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  temperature DECIMAL(5, 2),
  humidity DECIMAL(5, 2),
  rainfall DECIMAL(10, 2),
  wind_speed DECIMAL(10, 2),
  wind_direction INTEGER,
  pressure DECIMAL(10, 2),
  cloud_cover INTEGER,
  visibility DECIMAL(10, 2),
  feels_like DECIMAL(5, 2),
  weather_code INTEGER,
  flood_risk_level TEXT DEFAULT 'LOW' CHECK (flood_risk_level IN ('LOW', 'MODERATE', 'HIGH', 'VERY_HIGH', 'EXTREME')),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Uploaded Documents Table
CREATE TABLE IF NOT EXISTS uploaded_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  storage_path TEXT,
  extracted_data JSONB,
  processing_status TEXT DEFAULT 'PENDING' CHECK (processing_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  error_message TEXT,
  uploaded_by_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Donations Table
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_name TEXT,
  donor_email TEXT,
  donor_phone TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'LKR',
  payment_method TEXT,
  payment_reference TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED')),
  campaign_id UUID,
  notes TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aid Items Table
CREATE TABLE IF NOT EXISTS aid_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id),
  beneficiary_id UUID REFERENCES beneficiaries(id),
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit TEXT DEFAULT 'units',
  value DECIMAL(12, 2),
  distributed_by UUID REFERENCES volunteers(id),
  distributed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency Reports Table
CREATE TABLE IF NOT EXISTS emergency_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_name TEXT,
  reporter_phone TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT,
  district TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  severity TEXT DEFAULT 'MEDIUM',
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'ASSIGNED', 'RESOLVED', 'REJECTED')),
  case_id UUID REFERENCES cases(id),
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Missing Persons Table
CREATE TABLE IF NOT EXISTS missing_persons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  description TEXT,
  last_seen_location TEXT,
  last_seen_date TIMESTAMPTZ,
  district TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  photo_url TEXT,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  status TEXT DEFAULT 'MISSING' CHECK (status IN ('MISSING', 'FOUND', 'DECEASED')),
  found_at TIMESTAMPTZ,
  found_location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Broadcasts Table
CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'INFO' CHECK (type IN ('ALERT', 'WARNING', 'INFO', 'UPDATE')),
  channels TEXT[] DEFAULT '{}',
  target_districts TEXT[] DEFAULT '{}',
  target_roles TEXT[] DEFAULT '{}',
  sent_at TIMESTAMPTZ,
  sent_by UUID,
  recipients_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED')),
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resources Table
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'units',
  min_stock_level INTEGER DEFAULT 0,
  location TEXT,
  shelter_id UUID REFERENCES shelters(id),
  status TEXT DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'RESERVED')),
  last_restocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  user_id UUID,
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  user_email TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flood Predictions Table
CREATE TABLE IF NOT EXISTS flood_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district TEXT NOT NULL,
  river_name TEXT,
  prediction_date DATE NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH', 'VERY_HIGH', 'EXTREME')),
  probability DECIMAL(5, 2),
  expected_rainfall DECIMAL(10, 2),
  expected_river_level DECIMAL(10, 2),
  affected_areas TEXT[],
  recommendations TEXT[],
  model_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Notes Table
CREATE TABLE IF NOT EXISTS case_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  author_id UUID,
  author_name TEXT,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Attachments Table
CREATE TABLE IF NOT EXISTS case_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  storage_path TEXT NOT NULL,
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification Queue Table
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('SMS', 'EMAIL', 'PUSH')),
  recipient TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENDING', 'SENT', 'FAILED')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_priority ON cases(priority);
CREATE INDEX IF NOT EXISTS idx_cases_district ON cases(district);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_district ON beneficiaries(district);
CREATE INDEX IF NOT EXISTS idx_volunteers_status ON volunteers(status);
CREATE INDEX IF NOT EXISTS idx_volunteers_district ON volunteers(district);
CREATE INDEX IF NOT EXISTS idx_shelters_status ON shelters(status);
CREATE INDEX IF NOT EXISTS idx_shelters_district ON shelters(district);
CREATE INDEX IF NOT EXISTS idx_alerts_is_active ON alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_weather_data_district ON weather_data(district);
CREATE INDEX IF NOT EXISTS idx_river_levels_status ON river_levels(status);
CREATE INDEX IF NOT EXISTS idx_emergency_reports_status ON emergency_reports(status);
CREATE INDEX IF NOT EXISTS idx_missing_persons_status ON missing_persons(status);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE cases;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE shelters;
ALTER PUBLICATION supabase_realtime ADD TABLE volunteers;
ALTER PUBLICATION supabase_realtime ADD TABLE beneficiaries;
ALTER PUBLICATION supabase_realtime ADD TABLE river_levels;
ALTER PUBLICATION supabase_realtime ADD TABLE weather_data;
ALTER PUBLICATION supabase_realtime ADD TABLE emergency_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE missing_persons;
ALTER PUBLICATION supabase_realtime ADD TABLE donations;
ALTER PUBLICATION supabase_realtime ADD TABLE resources;
ALTER PUBLICATION supabase_realtime ADD TABLE broadcasts;

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false) ON CONFLICT DO NOTHING;

-- Insert default system settings
INSERT INTO system_settings (key, value, description) VALUES
  ('sla_critical_hours', '4', 'SLA deadline for critical priority cases (hours)'),
  ('sla_high_hours', '24', 'SLA deadline for high priority cases (hours)'),
  ('sla_medium_hours', '48', 'SLA deadline for medium priority cases (hours)'),
  ('sla_low_hours', '72', 'SLA deadline for low priority cases (hours)'),
  ('weather_sync_interval', '15', 'Weather data sync interval (minutes)'),
  ('river_sync_interval', '30', 'River level sync interval (minutes)'),
  ('sms_enabled', 'true', 'Enable SMS notifications'),
  ('email_enabled', 'true', 'Enable email notifications'),
  ('push_enabled', 'true', 'Enable push notifications'),
  ('use_free_apis', 'true', 'Use free API alternatives when available')
ON CONFLICT (key) DO NOTHING;

-- Insert default API services info
INSERT INTO system_settings (key, value, description) VALUES
  ('api_services', '{
    "weather": {
      "free": "OPEN_METEO",
      "paid": "OPENWEATHERMAP",
      "current": "OPEN_METEO"
    },
    "sms": {
      "free": null,
      "paid": "TWILIO",
      "current": "TWILIO"
    },
    "maps": {
      "free": "OPENSTREETMAP",
      "paid": "GOOGLE_MAPS",
      "current": "OPENSTREETMAP"
    },
    "ai": {
      "free": null,
      "paid": "OPENAI",
      "current": "OPENAI"
    }
  }', 'API service configuration')
ON CONFLICT (key) DO NOTHING;
