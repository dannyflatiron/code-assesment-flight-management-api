import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import { PG_POOL } from '../db/db.module';
import { Flight } from './flight.types';

@Injectable()
export class FlightsService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  // Search by origin, destination, and departure calendar date (UTC)
  async search(
    originQuery: string | undefined,
    destinationQuery: string | undefined,
    departureDateQuery: string | undefined,
  ): Promise<Flight[]> {
    const where: string[] = [];
    const params: any[] = [];
    let i = 1;

    if (originQuery) {
      where.push(`UPPER(origin) = $${i++}`);
      params.push(originQuery.toUpperCase());
    }
    if (destinationQuery) {
      where.push(`UPPER(destination) = $${i++}`);
      params.push(destinationQuery.toUpperCase());
    }
    if (departureDateQuery) {
      // match flights departing on that YYYY-MM-DD (UTC)
      where.push(`DATE(departure_time) = $${i++}::date`); //omg
      params.push(departureDateQuery);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const sql = `
        SELECT id, flight_number, origin, destination, departure_time, arrival_time
        FROM flights
        ${whereSql}
        ORDER BY departure_time ASC
      `;

    const { rows } = await this.pool.query<Flight>(sql, params);

    if (rows.length === 0) {
      throw new NotFoundException(
        'No flight found matching provided queries'
      )
    }
    return rows;
  }

  async create(input: Omit<Flight, 'id'>): Promise<Flight> {
    this.assertCreateInput(input);

    // enforce unique flight_number (case-insensitive)
    const dup = await this.pool.query<{ exists: boolean }>(
      `SELECT EXISTS(SELECT 1 FROM flights WHERE UPPER(flight_number) = UPPER($1)) AS exists`,
      [input.flight_number],
    );
    if (dup.rows[0]?.exists) {
      throw new BadRequestException('flight_number already exists');
    }

    // sanitize to uppercase for codes/number
    const flightNumber = input.flight_number.toUpperCase();
    const origin = input.origin.toUpperCase();
    const destination = input.destination.toUpperCase();

    const result = await this.pool.query<Flight>(
      `INSERT INTO flights (flight_number, origin, destination, departure_time, arrival_time)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, flight_number, origin, destination, departure_time, arrival_time`,
      [
        flightNumber,
        origin,
        destination,
        input.departure_time,
        input.arrival_time,
      ],
    );

    return result.rows[0];
  }
  private assertCreateInput(i: Omit<Flight, 'id'>) {
    for (const key of [
      'flight_number',
      'origin',
      'destination',
      'departure_time',
      'arrival_time',
    ] as const) {
      const v = i[key] as unknown;
      if (v == null || (typeof v === 'string' && v.trim() === '')) {
        throw new BadRequestException(`"${key}" is required`);
      }
    }

    if (!/^[A-Z0-9-]{2,12}$/i.test(i.flight_number)) {
      throw new BadRequestException(
        'flight_number must be 2–12 chars (letters, numbers, dash)',
      );
    }
    if (!/^[A-Za-z]{3}$/.test(i.origin)) {
      throw new BadRequestException('must be a 3 letter code');
    }
    if (!/^[A-Za-z]{3}$/.test(i.destination)) {
      throw new BadRequestException('destination must be a 3-letter IATA code');
    }

    // dates + ordering
    const dep = Date.parse(i.departure_time);
    const arr = Date.parse(i.arrival_time);
    if (!Number.isFinite(dep) || !Number.isFinite(arr)) {
      throw new BadRequestException(
        'departure_time and arrival_time must be valid ISO 8601 timestamps',
      );
    }
    if (arr <= dep) {
      throw new BadRequestException(
        'arrival_time must be after departure_time',
      );
    }
  }

  // Fetch all flights
  async findAll(): Promise<Flight[]> {
    const result: QueryResult<Flight> = await this.pool.query<Flight>(
      `SELECT id, flight_number, origin, destination, departure_time, arrival_time
         FROM flights
         ORDER BY id`,
    ); // ORM methods here for relations
    return result.rows;
  }

  // Fetch one flight by ID
  async findOne(id: number): Promise<Flight> {
    const result = await this.pool.query<Flight>(
      `SELECT id, flight_number, origin, destination, departure_time, arrival_time
       FROM flights
       WHERE id = $1`,
      [id], // ORM methods here for relations
    );

    const flight = result.rows[0];
    if (!flight) throw new NotFoundException('Flight not found');
    return flight;
  }
}
