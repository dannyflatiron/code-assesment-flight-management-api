import { Controller, Post, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingInput, CreateBookingResponse, CancelBookingResponse } from './booking.types';

@Controller('api/flights/:id/bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  // PAYLOAD { passengerName: "John Doe", seatClass: "Economy" }
  // RESPONSE { bookingId: 101, status: "Booking confirmed" }
  @Post()
  async book(
    @Param('id', ParseIntPipe) flightId: number,
    @Body() body: { passengerName: string; seatClass: string },
  ): Promise<CreateBookingResponse> {
    const input: CreateBookingInput = {
      flightId,
      passengerName: body?.passengerName,
      seatClass: body?.seatClass,
    };
    return this.bookings.bookOne(input);
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
