-- Air Freight Tracking Platform - Database Schema
-- Below is intended to be run within the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Shipments table
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  tracking_number VARCHAR(50) UNIQUE NOT NULL,
  origin VARCHAR(255) NOT NULL,
  origin_lat DECIMAL(10, 6),
  origin_lon DECIMAL(10, 6),
  destination VARCHAR(255) NOT NULL,
  dest_lat DECIMAL(10, 6),
  dest_lon DECIMAL(10, 6),
  status VARCHAR(50) DEFAULT 'pending',
  estimated_arrival TIMESTAMP WITH TIME ZONE,
  cargo_type VARCHAR(100),
  weight_kg DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracked flights (cached from OpenSky API)
CREATE TABLE IF NOT EXISTS tracked_flights (
  id SERIAL PRIMARY KEY,
  icao24 VARCHAR(20) UNIQUE NOT NULL,
  callsign VARCHAR(20),
  origin_country VARCHAR(100),
  longitude DECIMAL(10, 6),
  latitude DECIMAL(10, 6),
  altitude DECIMAL(10, 2),
  velocity DECIMAL(10, 2),
  heading DECIMAL(5, 2),
  vertical_rate DECIMAL(10, 2),
  on_ground BOOLEAN DEFAULT false,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weather data (cached from OpenWeatherMap API)
CREATE TABLE IF NOT EXISTS weather_data (
  id SERIAL PRIMARY KEY,
  location_name VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 6),
  longitude DECIMAL(10, 6),
  temperature DECIMAL(5, 2),
  feels_like DECIMAL(5, 2),
  conditions VARCHAR(100),
  description VARCHAR(255),
  wind_speed DECIMAL(5, 2),
  wind_direction DECIMAL(5, 2),
  visibility INTEGER,
  humidity INTEGER,
  pressure INTEGER,
  clouds INTEGER,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weather alerts
CREATE TABLE IF NOT EXISTS weather_alerts (
  id SERIAL PRIMARY KEY,
  location_name VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 6),
  longitude DECIMAL(10, 6),
  event VARCHAR(100),
  severity VARCHAR(20),
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weather impacts on shipments
CREATE TABLE IF NOT EXISTS weather_impacts (
  id SERIAL PRIMARY KEY,
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  impact_type VARCHAR(50),
  description TEXT,
  severity VARCHAR(20),
  weather_condition VARCHAR(100),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracking events (status history)
CREATE TABLE IF NOT EXISTS tracking_events (
  id SERIAL PRIMARY KEY,
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  location VARCHAR(255),
  latitude DECIMAL(10, 6),
  longitude DECIMAL(10, 6),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Shipment assignments (link shipments to real flights)
CREATE TABLE IF NOT EXISTS shipment_assignments (
  id SERIAL PRIMARY KEY,
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  flight_id INTEGER REFERENCES tracked_flights(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_shipments_user_id ON shipments(user_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_created_at ON shipments(created_at);
CREATE INDEX IF NOT EXISTS idx_tracking_events_shipment_id ON tracking_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_timestamp ON tracking_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_tracked_flights_last_updated ON tracked_flights(last_updated);
CREATE INDEX IF NOT EXISTS idx_tracked_flights_icao24 ON tracked_flights(icao24);
CREATE INDEX IF NOT EXISTS idx_weather_data_fetched_at ON weather_data(fetched_at);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_location ON weather_alerts(location_name);
CREATE INDEX IF NOT EXISTS idx_weather_impacts_shipment_id ON weather_impacts(shipment_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) Policies
-- =====================================================

-- Enable RLS on shipments
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

-- Users can only see their own shipments
CREATE POLICY "Users can view own shipments" ON shipments
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own shipments
CREATE POLICY "Users can create own shipments" ON shipments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own shipments
CREATE POLICY "Users can update own shipments" ON shipments
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own shipments
CREATE POLICY "Users can delete own shipments" ON shipments
  FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS on tracking_events
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;

-- Users can view tracking events for their shipments
CREATE POLICY "Users can view own tracking events" ON tracking_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shipments WHERE shipments.id = tracking_events.shipment_id AND shipments.user_id = auth.uid()
    )
  );

-- Users can insert tracking events for their shipments
CREATE POLICY "Users can create tracking events" ON tracking_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM shipments WHERE shipments.id = tracking_events.shipment_id AND shipments.user_id = auth.uid()
    )
  );

-- Enable RLS on weather_impacts
ALTER TABLE weather_impacts ENABLE ROW LEVEL SECURITY;

-- Users can view weather impacts for their shipments
CREATE POLICY "Users can view own weather impacts" ON weather_impacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shipments WHERE shipments.id = weather_impacts.shipment_id AND shipments.user_id = auth.uid()
    )
  );

-- Users can insert weather impacts for their shipments
CREATE POLICY "Users can create weather impacts" ON weather_impacts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM shipments WHERE shipments.id = weather_impacts.shipment_id AND shipments.user_id = auth.uid()
    )
  );

-- Enable RLS on shipment_assignments
ALTER TABLE shipment_assignments ENABLE ROW LEVEL SECURITY;

-- Users can view assignments for their shipments
CREATE POLICY "Users can view own assignments" ON shipment_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shipments WHERE shipments.id = shipment_assignments.shipment_id AND shipments.user_id = auth.uid()
    )
  );

-- Public read access for tracked_flights and weather_data (cached data)
ALTER TABLE tracked_flights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access to flights" ON tracked_flights FOR SELECT USING (true);

ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access to weather" ON weather_data FOR SELECT USING (true);

ALTER TABLE weather_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access to alerts" ON weather_alerts FOR SELECT USING (true);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on shipments
CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

