import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { FlightsModule } from './flights/flights.module';
import { HealthController } from './health.controller';
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DbModule, FlightsModule, BookingsModule],
  controllers: [HealthController],
})
export class AppModule {}
