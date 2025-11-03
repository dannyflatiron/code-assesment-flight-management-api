// always store values in UPPERCASE in db
// later on normalize user input to UPPERCASE through validations
export type SeatClass = 'ECONOMY' | 'BUSINESS' | 'FIRST';

export type BookingStatus = 'CONFIRMED' | 'CANCELLED';

export interface Booking {
  id: number;
  flight_id: number;
  passenger_name: string;
  seat_class: SeatClass;
  status: BookingStatus;
  created_at: string; // ISO timestamp
}

// input payload sent to service after validation
export interface CreateBookingInput {
  flightId: number;
  passengerName: string;
  seatClass: string; // raw user input, normalized in service layer
}

// successful booking response
export interface CreateBookingResponse {
  bookingId: number;
  status: 'Booking Confirmed'; // human-readable not db format
}

export interface CancelBookingResponse {
  message: 'Booking Cancelled Successfully';
}

export interface ErrorResponse {
  statusCode: number; // 400, 404, 500
  message: string;    // descriptive error text
  error: string;      // short error label (ex: "Bad Request")
}
