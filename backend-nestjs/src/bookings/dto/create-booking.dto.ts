import { Transform } from 'class-transformer';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export const SEAT_CLASSES = ['ECONOMY', 'BUSINESS', 'FIRST'] as const;
type SeatClassEnum = (typeof SEAT_CLASSES)[number];

export class CreateBookingDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Passenger full name',
    maxLength: 120,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  passengerName!: string;

  @ApiProperty({
    example: 'ECONOMY',
    enum: SEAT_CLASSES,
    description: 'Seat class (must be one of the listed values)',
  })
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsIn(SEAT_CLASSES as unknown as string[], {
    message: `seatClass must be one of: ${SEAT_CLASSES.join(', ')}`,
  })
  seatClass!: SeatClassEnum;

  // Convenience getter for service layer (already UPPERCASED by the Transform)
  get seatClassDb(): SeatClassEnum {
    return this.seatClass;
  }
}
