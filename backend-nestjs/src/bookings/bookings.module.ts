import { Module } from '@nestjs/common';
import { DbModule } from '../db/db.module';         // provides the PG_POOL
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [DbModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
