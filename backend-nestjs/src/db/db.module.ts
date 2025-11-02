import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

export const PG_POOL = Symbol('PG_POOL');

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('DATABASE_URL');
        if (url) return new Pool({ connectionString: url });
        return new Pool({
          host: config.get('DB_HOST', 'localhost'),
          port: parseInt(config.get('DB_PORT', '5432'), 10),
          user: config.get('DB_USERNAME', 'flight_user'),
          password: config.get('DB_PASSWORD', 'flight_pass'),
          database: config.get('DB_NAME', 'flight_management'),
        });
      },
    },
  ],
  exports: [PG_POOL],
})
export class DbModule {}
