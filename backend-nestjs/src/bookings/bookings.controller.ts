import { Controller, Post, Delete, Param, Body, ParseIntPipe, Get } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingResponse, CancelBookingResponse } from './booking.types';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingsAdminController {
  constructor(private readonly bookings: BookingsService) {}
  @Get()
  listAll() {
    return this.bookings.listAll();
  }
}
@Controller('flights/:id/bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  // PAYLOAD { passengerName: "John Doe", seatClass: "Economy" }
  // RESPONSE { bookingId: 101, status: "Booking confirmed" }
  @Post()
  async book(
    @Param('id', ParseIntPipe) flightId: number,
    @Body() dto: CreateBookingDto,
  ): Promise<CreateBookingResponse> {
    return this.bookings.bookOne({
      flightId,
      passengerName: dto.passengerName,
      seatClass: dto.seatClassDb
    });
  }

  // cancel existing booking
  // RESPONSE { message: "Booking canceled successfully." }
  @Delete(':bookingId')
  async cancel(
    @Param('id', ParseIntPipe) flightId: number,
    @Param('bookingId', ParseIntPipe) bookingId: number,
  ): Promise<CancelBookingResponse> {
    return this.bookings.cancelBooking(flightId, bookingId);
  }
}
