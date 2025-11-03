export type Flight = {
  id: number;
  flight_number: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
};

export type CreateFlightInput = Pick<
  Flight,
  'flight_number' | 'origin' | 'destination' | 'departure_time' | 'arrival_time'
>;
