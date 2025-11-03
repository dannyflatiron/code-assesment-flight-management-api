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

-- === Seed Flights ==========================================================
INSERT INTO flights (flight_number, origin, destination, departure_time, arrival_time, capacity)
VALUES
  ('AI-202', 'JFK', 'LAX', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days 6 hours', 180),
  ('BA-305', 'LHR', 'JFK', NOW() + INTERVAL '8 days', NOW() + INTERVAL '8 days 7 hours', 200)
ON CONFLICT (flight_number) DO NOTHING;

-- === Seed Bookings =========================================================
-- Bookings linked to the flights above (using subqueries for dynamic flight_id lookup)

INSERT INTO bookings (flight_id, passenger_name, seat_class, status)
SELECT id, 'John Doe', 'ECONOMY', 'CONFIRMED'
FROM flights
WHERE flight_number = 'AI-202'
AND NOT EXISTS (
  SELECT 1 FROM bookings b
  WHERE b.passenger_name = 'John Doe'
    AND b.flight_id = flights.id
);

INSERT INTO bookings (flight_id, passenger_name, seat_class, status)
SELECT id, 'Jane Smith', 'BUSINESS', 'CONFIRMED'
FROM flights
WHERE flight_number = 'AI-202'
AND NOT EXISTS (
  SELECT 1 FROM bookings b
  WHERE b.passenger_name = 'Jane Smith'
    AND b.flight_id = flights.id
);

INSERT INTO bookings (flight_id, passenger_name, seat_class, status)
SELECT id, 'Michael Johnson', 'FIRST', 'CONFIRMED'
FROM flights
WHERE flight_number = 'BA-305'
AND NOT EXISTS (
  SELECT 1 FROM bookings b
  WHERE b.passenger_name = 'Michael Johnson'
    AND b.flight_id = flights.id
);

INSERT INTO bookings (flight_id, passenger_name, seat_class, status)
SELECT id, 'Emily Davis', 'ECONOMY', 'CANCELLED'
FROM flights
WHERE flight_number = 'BA-305'
AND NOT EXISTS (
  SELECT 1 FROM bookings b
  WHERE b.passenger_name = 'Emily Davis'
    AND b.flight_id = flights.id
);

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE flights
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
