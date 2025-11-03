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
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

type MaybeDateInput = Omit<
  CreateFlightInput,
  'departure_time' | 'arrival_time'
> & {
  departure_time: string | Date;
  arrival_time: string | Date;
};

@ApiTags('Flights')
@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @ApiOperation({ summary: 'Search or list flights' })
  @ApiQuery({ name: 'origin', required: false, example: 'JFK' })
  @ApiQuery({ name: 'destination', required: false, example: 'LAX' })
  @ApiQuery({ name: 'date', required: false, example: '2025-11-10', description: 'YYYY-MM-DD (UTC)' })
  @ApiResponse({ status: 200, description: 'Array of flights' })
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

  @ApiOperation({ summary: 'Get a flight by id' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Flight found' })
  @ApiResponse({ status: 404, description: 'Flight not found' })
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number): Promise<Flight> {
    return this.flightsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a flight' })
  @ApiResponse({ status: 201, description: 'Flight created' })
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
