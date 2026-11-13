export interface Booking {
  _id: string;
  customerId: string;
  passengerDetails: { name: string; age: number; gender: string }[];
  email: string;
  phoneNumber: string;
  fare: number;
  status: string;
  refundAmount?: number;
  busId: string;
  bookingDate: string;
  seats: number[];
  departureDetails?: { city: string; time: number | string; date: string };
  arrivalDetails?: { city: string; time: number | string; date: string };
  duration: number | string;
  isBusinessTravel: boolean;
  isInsurance: boolean;
  isCovidDonated: boolean;
}
