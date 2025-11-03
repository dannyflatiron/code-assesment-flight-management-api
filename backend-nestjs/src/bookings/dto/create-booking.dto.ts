import { Transform } from 'class-transformer';
import {
  IsIn,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const SEAT_CLASSES = ['ECONOMY', 'BUSINESS', 'FIRST'] as const;
type SeatClassEnum = typeof SEAT_CLASSES[number];

export class CreateBookingDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  passengerName!: string;

  // consume string payload, clean it, UPPERCASE IT
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value
  )

  // payload has to match a value from SEAT_CLASSES
  @IsIn(SEAT_CLASSES as unknown as string[], {
    message: `seatClass must be one of: ${SEAT_CLASSES.join(', ')}`,
  })
  seatClass!: SeatClassEnum;

  get seatClassDb(): SeatClassEnum {
    return this.seatClass;
  }
}
