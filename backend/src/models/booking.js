import mongoose from 'mongoose';

const tripdetailsSchema = new mongoose.Schema(
  {
    city: { type: String, required: true },
    location: { type: String },
    time: { type: mongoose.Schema.Types.Mixed, required: true },
    date: { type: String, required: true },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true, index: true },
    passengerDetails: {
      type: [
        new mongoose.Schema(
          {
            name: { type: String, required: true },
            gender: { type: String, required: true },
            age: { type: Number, required: true },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    fare: { type: Number, required: true },
    status: { type: String, required: true, default: 'upcoming' },
    bookingDate: { type: String, required: true },
    busId: { type: String, required: true },
    seats: { type: [Number], required: true },
    departureDetails: { type: tripdetailsSchema, required: true },
    arrivalDetails: { type: tripdetailsSchema, required: true },
    boardingPoint: { type: String },
    droppingPoint: { type: String },
    duration: { type: String, required: true },
    isBusinessTravel: { type: Boolean, default: false },
    businessDetails: {
      gst: { type: String },
      name: { type: String },
      address: { type: String },
      email: { type: String },
    },
    isInsurance: { type: Boolean, default: false },
    isCovidDonated: { type: Boolean, default: false },
    cancelledAt: { type: Date },
    refundAmount: { type: Number, default: 0 },
    payment: {
      provider: { type: String },
      reference: { type: String },
      amount: { type: Number },
      paidAt: { type: Date },
    },
  },
  { timestamps: true }
);

bookingSchema.index({ customerId: 1, bookingDate: -1 });
bookingSchema.index({ busId: 1, 'departureDetails.date': 1 });

export const Booking = mongoose.model('Bookings', bookingSchema);
