-- === TABLES =================================================================

CREATE TABLE IF NOT EXISTS flights (
  id              SERIAL PRIMARY KEY,
  flight_number   TEXT        NOT NULL,
  origin          TEXT        NOT NULL,
  destination     TEXT        NOT NULL,
  departure_time  TIMESTAMPTZ NOT NULL,
  arrival_time    TIMESTAMPTZ NOT NULL,
  capacity        INT         NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (capacity >= 0)
);

CREATE TABLE IF NOT EXISTS bookings (
  id              SERIAL PRIMARY KEY,
  flight_id       INT  NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  passenger_name  TEXT NOT NULL,
  seat_class      TEXT NOT NULL CHECK (seat_class IN ('ECONOMY','BUSINESS','FIRST')),
  status          TEXT NOT NULL CHECK (status IN ('CONFIRMED','CANCELLED')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- === INDEXES ================================================================

-- case-insensitive uniqueness for flight_number
CREATE UNIQUE INDEX IF NOT EXISTS idx_flights_flight_number_ci
  ON flights (UPPER(flight_number));

-- search helpers
CREATE INDEX IF NOT EXISTS idx_flights_origin_upper
  ON flights (UPPER(origin));

CREATE INDEX IF NOT EXISTS idx_flights_destination_upper
  ON flights (UPPER(destination));

-- timezone-safe date index (IMMUTABLE expression)
CREATE INDEX IF NOT EXISTS idx_flights_departure_date_utc
  ON flights ( ((departure_time AT TIME ZONE 'UTC')::date) );

CREATE INDEX IF NOT EXIST
