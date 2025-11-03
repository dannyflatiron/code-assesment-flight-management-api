// backend-nestjs/src/bookings/bookings.controller.ts
import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingResponse, CancelBookingResponse } from './booking.types';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsAdminController {
  constructor(private readonly bookings: BookingsService) {}

  @ApiOperation({ summary: 'List all bookings (admin view)' })
  @ApiOkResponse({
    description: 'Returns all bookings across all flights',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          bookingId: { type: 'integer', example: 2 },
          flightId: { type: 'integer', example: 1 },
          passengerName: { type: 'string', example: 'John Doe' },
          seatClass: {
            type: 'string',
            example: 'Economy',
            enum: ['Economy', 'Business', 'First'],
          },
          status: {
            type: 'string',
            example: 'Confirmed',
            enum: ['Confirmed', 'Cancelled'],
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-03-01T12:00:00.000Z',
          },
        },
        required: [
          'bookingId',
          'flightId',
          'passengerName',
          'seatClass',
          'status',
          'createdAt',
        ],
      },
    },
  })
  @Get()
  listAll() {
    return this.bookings.listAll();
  }
}

@ApiTags('Bookings')
@Controller('flights/:id/bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  // PAYLOAD { passengerName: "John Doe", seatClass: "ECONOMY" }
  @ApiOperation({ summary: 'Create a booking for a specific flight' })
  @ApiParam({ name: 'id', example: 1, description: 'Flight ID' })
  @ApiBody({
    description: 'Booking payload',
    type: CreateBookingDto,
    examples: {
      sample: {
        summary: 'Example payload',
        value: { passengerName: 'John Doe', seatClass: 'ECONOMY' },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Booking successfully created',
    schema: {
      type: 'object',
      properties: {
        bookingId: { type: 'integer', example: 2 },
        status: { type: 'string', example: 'Confirmed' },
      },
      required: ['bookingId', 'status'],
    },
  })
  @Post()
  async book(
    @Param('id', ParseIntPipe) flightId: number,
    @Body() dto: CreateBookingDto,
  ): Promise<CreateBookingResponse> {
    return this.bookings.bookOne({
      flightId,
      passengerName: dto.passengerName,
      seatClass: dto.seatClassDb,
    });
  }

  // RESPONSE { message: "Booking canceled successfully." }
  @ApiOperation({ summary: 'Cancel an existing booking' })
  @ApiParam({ name: 'id', example: 1, description: 'Flight ID' })
  @ApiParam({ name: 'bookingId', example: 2, description: 'Booking ID' })
  @ApiOkResponse({
    description: 'Booking successfully canceled',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Booking canceled successfully.',
        },
      },
      required: ['message'],
    },
  })
  @Delete(':bookingId')
  async cancel(
    @Param('id', ParseIntPipe) flightId: number,
    @Param('bookingId', ParseIntPipe) bookingId: number,
  ): Promise<CancelBookingResponse> {
    return this.bookings.cancelBooking(flightId, bookingId);
  }
}
