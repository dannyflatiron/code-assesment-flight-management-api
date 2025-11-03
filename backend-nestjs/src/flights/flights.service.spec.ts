import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { FlightsService } from './flights.service';
import { PG_POOL } from '../db/db.module';

describe('FlightsService (unit)', () => {
  let svc: FlightsService;

  const mockPool = {
    query: jest.fn(),
    end: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [FlightsService, { provide: PG_POOL, useValue: mockPool }],
    }).compile();

    svc = moduleRef.get(FlightsService);
  });

  it('creates a valid flight', async () => {
    const dep = '2025-03-18T09:00:00.000Z';
    const arr = '2025-03-18T12:30:00.000Z';

    // duplicate check -> false
    mockPool.query.mockResolvedValueOnce({ rows: [{ exists: false }] });
    // INSERT ... RETURNING
    mockPool.query.mockResolvedValueOnce({
      rows: [
        {
          id: 123,
          flight_number: 'DL-10',
          origin: 'JFK',
          destination: 'LAX',
          departure_time: dep,
          arrival_time: arr,
        },
      ],
    });

    const created = await svc.create({
      flight_number: 'DL-10',
      origin: 'JFK',
      destination: 'LAX',
      departure_time: dep,
      arrival_time: arr,
    });

    expect(created.id).toBe(123);
    expect(mockPool.query).toHaveBeenCalledTimes(2); // exists + insert
  });

  it('rejects arrival <= departure (validation happens before DB)', async () => {
    const dep = '2025-03-18T09:00:00.000Z';
    const arr = '2025-03-18T09:00:00.000Z'; // equal -> invalid

    await expect(
      svc.create({
        flight_number: 'DL-10',
        origin: 'JFK',
        destination: 'LAX',
        departure_time: dep,
        arrival_time: arr,
      }),
    ).rejects.toThrow('arrival_time must be after departure_time');

    expect(mockPool.query).not.toHaveBeenCalled(); // 0 DB calls
  });

  it('rejects invalid IATA codes (origin)', async () => {
    await expect(
      svc.create({
        flight_number: 'LH-1',
        origin: 'SF', // invalid (must be exactly 3 letters)
        destination: 'JFK',
        departure_time: '2025-03-15T10:00:00.000Z',
        arrival_time: '2025-03-15T13:00:00.000Z',
      }),
    ).rejects.toThrow('must be a 3 letter code');

    expect(mockPool.query).not.toHaveBeenCalled(); // validation blocked DB
  });

  it('rejects duplicate flight_number', async () => {
    // first create: exists(false) -> insert
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ exists: false }] }) // exists
      .mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            flight_number: 'AA-77',
            origin: 'LHR',
            destination: 'JFK',
            departure_time: '2025-06-01T09:00:00.000Z',
            arrival_time: '2025-06-01T12:00:00.000Z',
          },
        ],
      })
      // second create: exists(true) -> throw duplicate
      .mockResolvedValueOnce({ rows: [{ exists: true }] });

    // first create succeeds
    await svc.create({
      flight_number: 'AA-77',
      origin: 'LHR',
      destination: 'JFK',
      departure_time: '2025-06-01T09:00:00.000Z',
      arrival_time: '2025-06-01T12:00:00.000Z',
    });

    // second create (duplicate)
    await expect(
      svc.create({
        flight_number: 'AA-77',
        origin: 'LAX',
        destination: 'SFO',
        departure_time: '2025-07-01T09:00:00.000Z',
        arrival_time: '2025-07-01T10:00:00.000Z',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(mockPool.query).toHaveBeenCalledTimes(3); // exists + insert + exists
  });
});
