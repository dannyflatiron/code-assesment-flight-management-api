import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { FlightsService } from './flights.service';
import { CreateFlightInput, Flight } from './flight.types';

type MaybeDateInput = Omit<
  CreateFlightInput,
  'departure_time' | 'arrival_time'
> & {
  departure_time: string | Date;
  arrival_time: string | Date;
};

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get()
  getAll(
    @Query('origin') origin?: string,
    @Query('desitination') destination?: string,
    @Query('date') date?: string,
  ): Promise<Flight[]> {
    const hasFilters = Boolean(origin || destination || date);
    if (!hasFilters) {
      return this.flightsService.findAll();
    }

    // normalize codes & date string
    const o = origin?.trim().toUpperCase();
    const d = destination?.trim().toUpperCase();
    const dt = date?.trim(); // expect YYYY-MM-DD
    return this.flightsService.search(o, d, dt);
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number): Promise<Flight> {
    return this.flightsService.findOne(id);
  }

  @Post()
  create(@Body() body: MaybeDateInput): Promise<Flight> {
    const toISO = (v: string | Date) =>
      (v instanceof Date ? v : new Date(v)).toISOString();

    const payload: CreateFlightInput = {
      flight_number: body.flight_number,
      origin: body.origin,
      destination: body.destination,
      departure_time: toISO(body.departure_time),
      arrival_time: toISO(body.arrival_time),
    };

    return this.flightsService.create(payload);
  }
}
