import { Module } from '@nestjs/common';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';
import { DbModule } from '../db/db.module';
import { Pool } from 'pg';

@Module({
  imports: [DbModule],
  controllers: [FlightsController],
  providers: [
    FlightsService,
    {
      provide: 'PG_POOL',
      useFactory: () =>
        new Pool({ connectionString: process.env.DATABASE_URL }),
    },
  ],
})
export class FlightsModule {}
