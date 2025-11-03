import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PG_POOL } from '../db/db.module';
import { CreateBookingInput } from './booking.types';

/*
mock PG
test POST and Delete actions - ideally both success and failure paths
seatClass UPPERCASED before insert
verify transaction flow
*/

type MockClient = { query: jest.Mock; release: jest.Mock };
const makeClient = (): MockClient => ({ query: jest.fn(), release: jest.fn() });

describe('BookingsService (unit)', () => {
  let svc: BookingsService;

  const mockPool = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };

  const NOW = new Date('2025-03-01T12:00:00.000Z').getTime();

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(NOW);

    const moduleRef = await Test.createTestingModule({
      providers: [BookingsService, { provide: PG_POOL, useValue: mockPool }],
    }).compile();

    svc = moduleRef.get(BookingsService);
  });

  // POST success path and UPPERCASE
  it('books a seat (happy path) and uppercases seatClass before INSERT', async () => {
    const client = makeClient();
    mockPool.connect.mockResolvedValueOnce(client);

    // BEGIN
    client.query.mockResolvedValueOnce({});
    // SELECT flight FOR UPDATE (future, capacity 2)
    client.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ id: 1, departure_time: '2025-03-02T00:00:00.000Z', capacity: 2 }],
    });
    // COUNT confirmed
    client.query.mockResolvedValueOnce({ rows: [{ count: 1 }] });
    // INSERT RETURNING id
    client.query.mockResolvedValueOnce({ rows: [{ id: 101 }] });
    // COMMIT
    client.query.mockResolvedValueOnce({});

    const input: CreateBookingInput = {
      flightId: 1,
      passengerName: 'John Doe',
      seatClass: 'economy', // user string payload, service uppercases to ECONOMY
    };

    const result = await svc.bookOne(input);

    expect(result).toEqual({ bookingId: 101, status: 'Booking confirmed.' });

    // Verify INSERT used UPPERCASE seat_class
    const insertCall = client.query.mock.calls.find(([sql]) =>
      String(sql).toUpperCase().includes('INSERT INTO BOOKINGS'),
    );
    expect(insertCall).toBeTruthy();
    const [, params] = insertCall!;
    expect(params[2]).toBe('ECONOMY'); // seat_class

    const sqls = client.query.mock.calls.map(([sql]) => String(sql).toUpperCase());
    expect(sqls[0]).toContain('BEGIN');
    expect(sqls.at(-1)).toContain('COMMIT');
    expect(client.release).toHaveBeenCalledTimes(1);
  });

  // DELETE success path
  it('cancels a booking (success path) → Booking canceled successfully', async () => {
    const client = makeClient();
    mockPool.connect.mockResolvedValueOnce(client);

    client.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ id: 10, flight_id: 1, status: 'CONFIRMED' }],
      }) // booking FOR UPDATE
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ departure_time: '2025-03-02T12:00:00.000Z' }],
      }) // flight FOR UPDATE
      .mockResolvedValueOnce({ rowCount: 1 }) // UPDATE to CANCELLED
      .mockResolvedValueOnce({}); // COMMIT

    const res = await svc.cancelBooking(1, 10);
    expect(res).toEqual({ message: 'Booking canceled successfully.' });
  });
});
