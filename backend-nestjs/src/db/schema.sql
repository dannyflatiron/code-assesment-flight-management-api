-- === flights ===============================================================
CREATE TABLE IF NOT EXISTS flights (
  id              SERIAL PRIMARY KEY,
  flight_number   TEXT        NOT NULL,
  origin          TEXT        NOT NULL,
  destination     TEXT        NOT NULL,
  departure_time  TIMESTAMPTZ NOT NULL,
  arrival_time    TIMESTAMPTZ NOT NULL,
  capacity        INT         NOT NULL DEFAULT 0,
  CHECK (capacity >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_flights_flight_number_ci
  ON flights (UPPER(flight_number));

CREATE INDEX IF NOT EXISTS idx_flights_departure_time
  ON flights (departure_time);

-- === bookings ==============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id              SERIAL PRIMARY KEY,
  flight_id       INT  NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  passenger_name  TEXT NOT NULL,
  seat_class      TEXT NOT NULL CHECK (seat_class IN ('ECONOMY','BUSINESS','FIRST')),
  status          TEXT NOT NULL CHECK (status IN ('CONFIRMED','CANCELLED')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_flight_id ON bookings (flight_id);

-- === Seed Data =============================================================
-- Two example flights to test API with
INSERT INTO flights (flight_number, origin, destination, departure_time, arrival_time, capacity)
VALUES
  ('AI-202', 'JFK', 'LAX', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days 6 hours', 180),
  ('BA-305', 'LHR', 'JFK', NOW() + INTERVAL '8 days', NOW() + INTERVAL '8 days 7 hours', 200)
ON CONFLICT (flight_number) DO NOTHING;
