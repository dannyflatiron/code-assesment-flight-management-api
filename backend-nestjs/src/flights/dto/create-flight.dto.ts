import {
  IsNotEmpty,
  IsString,
  Matches,
  Length,
  IsISO8601,
} from 'class-validator';

export class CreateFlightDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9-]{2,12}$/i, {
    message: 'flight_number must be letters, numbers, or dash (2–12)',
  })
  flight_number!: string;

  // 3-letter IATA, uppercase
  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/, { message: 'origin must be a 3-letter IATA code' })
  origin!: string;

  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/, {
    message: 'destination must be a 3-letter IATA code',
  })
  destination!: string;

  // ISO 8601 strings (e.g., 2025-03-15T14:00:00.000Z)
  @IsISO8601()
  departure_time!: string;

  @IsISO8601()
  arrival_time!: string;
}
