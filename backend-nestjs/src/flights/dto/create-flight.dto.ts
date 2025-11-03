import {
  IsNotEmpty,
  IsString,
  Matches,
  Length,
  IsISO8601,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFlightDto {
  @ApiProperty({
    example: 'JB-202',
    description: 'Unique flight number (2–12 characters, letters/numbers/dash)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9-]{2,12}$/i, {
    message: 'flight_number must be letters, numbers, or dash (2–12)',
  })
  flight_number!: string;
  
  @ApiProperty({ example: 'JFK', description: '3 letter origin code' })
  // 3 letter code, uppercase
  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/, { message: 'origin must be a 3 letter code' })
  origin!: string;

  @ApiProperty({ example: 'LAX', description: '3 letter destination code' })
  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/, {
    message: 'destination must be a 3 letter code',
  })
  destination!: string;

  @ApiProperty({
    example: '2025-03-15T10:00:00',
    description: 'departure timestamp (UTC)',
  })
  @IsISO8601()
  departure_time!: string;

  @IsISO8601()
  arrival_time!: string;
}
