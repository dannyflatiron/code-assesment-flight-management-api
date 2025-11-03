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
    BookingStatus,
    CreateBookingInput,
    CreateBookingResponse,
    CancelBookingResponse,
  } from './booking.types';

@Injectable()
export class BookingService {

}