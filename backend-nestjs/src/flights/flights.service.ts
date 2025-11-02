import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import { PG_POOL } from '../db/db.module';
import { Flight } from './flight.types';

@Injectable()
export class FlightsService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

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
