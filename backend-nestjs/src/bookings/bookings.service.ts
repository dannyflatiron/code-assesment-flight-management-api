import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../db/db.module';
import {
  Booking,
  CreateBookingInput,
  CreateBookingResponse,
  CancelBookingResponse,
} from './booking.types';

type BookingView = {
  bookingId: number;
  flightId: number;
  passengerName: string;
  seatClass: 'Economy' | 'Business' | 'First';
  status: 'Confirmed' | 'Cancelled';
  createdAt: string;
};

const toTitle = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

@Injectable()
export class BookingsService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  //flight must exist and not have departed
  //confirmed bookings < flight capacity
  //seatClass normalized to uppercase
  // RESPONSE { "bookingId': 101, "status"; 'Booking confirmed.'}
  async bookOne(input: CreateBookingInput): Promise<CreateBookingResponse> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Lock flight row to safely check capacity
      const flightResult = await client.query<{
        id: number;
        departure_time: string;
        capacity: number;
      }>(
        `SELECT id, departure_time, capacity
           FROM flights
          WHERE id = $1
          FOR UPDATE`, //lock seat to prevent over booking
        [input.flightId],
      );

      if (flightResult.rowCount === 0) {
        throw new NotFoundException('Seat(s) unavailable');
      }

      const { departure_time, capacity } = flightResult.rows[0];

      // Prevent booking after departure
      if (new Date(departure_time).getTime() <= Date.now()) {
        throw new BadRequestException('Cannot book a flight that has already departed');
      }

      // Enforce simple capacity rule (if capacity > 0)
      if (capacity > 0) {
        const countResult = await client.query<{ count: string }>(
          `SELECT COUNT(*)::int AS count
             FROM bookings
            WHERE flight_id = $1 AND status = 'CONFIRMED'`,
          [input.flightId],
        );

        const confirmedCount = Number(countResult.rows[0].count);
        if (confirmedCount >= capacity) {
          throw new BadRequestException('Flight is sold out');
        }
      }

      // Normalize UPPERCASE seat class before inserting
      const seatClassDb = (input.seatClass || '').trim().toUpperCase();

      // booking record inserted into db
      const insertResult = await client.query<{ id: number }>(
        `INSERT INTO bookings (flight_id, passenger_name, seat_class, status)
         VALUES ($1, $2, $3, 'CONFIRMED')
         RETURNING id`,
        [input.flightId, input.passengerName.trim(), seatClassDb],
      );

      await client.query('COMMIT'); //inserted record saved onto db

      return {
        bookingId: insertResult.rows[0].id,
        status: 'Booking confirmed.',
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // cancel an existing booking
  // cannot cancel after flight departure
  // if already cancelled return success anyway
  async cancelBooking(
    flightId: number,
    bookingId: number,
  ): Promise<CancelBookingResponse> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // fetch & lock booking row
      const bookingResult = await client.query<Booking>(
        `SELECT id, flight_id, status
           FROM bookings
          WHERE id = $1 AND flight_id = $2
          FOR UPDATE`,
        [bookingId, flightId],
      );

      if (bookingResult.rowCount === 0) {
        throw new NotFoundException('Booking not found for this flight');
      }

      const existingBooking = bookingResult.rows[0];

      // Lock flight row for departure check
      const flightResult = await client.query<{ departure_time: string }>(
        `SELECT departure_time FROM flights WHERE id = $1 FOR UPDATE`,
        [existingBooking.flight_id],
      );

      const flight = flightResult.rows[0];

      // flight has already departed
      if (new Date(flight.departure_time).getTime() <= Date.now()) {
        throw new BadRequestException('Cannot cancel after departure');
      }

      // if already cancelled return success
      if (existingBooking.status === 'CANCELLED') {
        await client.query('COMMIT');
        return { message: 'Booking canceled successfully.' };
      }

      // update booking to CANCELLED
      await client.query(
        `UPDATE bookings SET status = 'CANCELLED' WHERE id = $1`,
        [existingBooking.id],
      );

      await client.query('COMMIT');
      return { message: 'Booking canceled successfully.' };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async listAll(): Promise<BookingView[]> {
    const { rows } = await this.pool.query<Booking>(`
      SELECT id, flight_id, passenger_name, seat_class, status, created_at
      FROM bookings
      ORDER BY id ASC
    `);

    return rows.map(b => ({
      bookingId: b.id,
      flightId: b.flight_id,
      passengerName: b.passenger_name,
      seatClass: toTitle(b.seat_class) as BookingView['seatClass'],
      status: toTitle(b.status) as BookingView['status'],
      createdAt: b.created_at,
    }));
  }
}
