INSERT INTO flights (flight_number, origin, destination, departure_time, arrival_time, capacity)
VALUES
  ('AI-202', 'JFK', 'LAX', NOW() + INTERVAL '7 days',  NOW() + INTERVAL '7 days 6 hours', 180),
  ('BA-305', 'LHR', 'JFK', NOW() + INTERVAL '8 days',  NOW() + INTERVAL '8 days 7 hours', 200),
  ('LH-789', 'FRA', 'SFO', NOW() + INTERVAL '9 days',  NOW() + INTERVAL '9 days 6 hours', 220),
  ('EK-501', 'DXB', 'ORD', NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days 7 hours', 250)
ON CONFLICT (flight_number) DO NOTHING;

INSERT INTO bookings (flight_id, passenger_name, seat_class, status)
SELECT id, 'John Doe', 'ECONOMY', 'CONFIRMED'
FROM flights
WHERE flight_number = 'AI-202'
  AND NOT EXISTS (
    SELECT 1 FROM bookings b WHERE b.passenger_name = 'John Doe' AND b.flight_id = flights.id
  );

INSERT INTO bookings (flight_id, passenger_name, seat_class, status)
SELECT id, 'Jane Smith', 'BUSINESS', 'CONFIRMED'
FROM flights
WHERE flight_number = 'BA-305'
  AND NOT EXISTS (
    SELECT 1 FROM bookings b WHERE b.passenger_name = 'Jane Smith' AND b.flight_id = flights.id
  );

INSERT INTO bookings (flight_id, passenger_name, seat_class, status)
SELECT id, 'Michael Johnson', 'FIRST', 'CONFIRMED'
FROM flights
WHERE flight_number = 'LH-789'
  AND NOT EXISTS (
    SELECT 1 FROM bookings b WHERE b.passenger_name = 'Michael Johnson' AND b.flight_id = flights.id
  );

INSERT INTO bookings (flight_id, passenger_name, seat_class, status)
SELECT id, 'Emily Davis', 'ECONOMY', 'CANCELLED'
FROM flights
WHERE flight_number = 'EK-501'
  AND NOT EXISTS (
    SELECT 1 FROM bookings b WHERE b.passenger_name = 'Emily Davis' AND b.flight_id = flights.id
  );
