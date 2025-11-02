import { Module } from '@nestjs/common';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [FlightsController],
  providers: [FlightsService],
})
export class FlightsModule {}
