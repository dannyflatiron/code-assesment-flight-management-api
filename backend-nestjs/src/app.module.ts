import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { FlightsModule } from './flights/flights.module';
import { HealthController } from './health.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DbModule, FlightsModule],
  controllers: [HealthController],
})
export class AppModule {}
