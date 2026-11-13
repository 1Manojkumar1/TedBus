// Seed the local `tedbus` database with demo routes, buses, a customer and bookings.
// Run with: mongosh "mongodb://127.0.0.1:27017/tedbus" tedbus-seed.js
//
// Re-running is safe: only demo records are removed and inserted again.

const tedbus = db.getSiblingDB('tedbus');

const CUSTOMER_ID = new ObjectId('66f1a2b3c4d5e6f7a8b9c0d1');

const ROUTES = [
  { departure: 'Hyderabad', arrival: 'Bengaluru', duration: 8.5, dep: ['Miyapur', 'Kukatpally', 'Ameerpet'], arr: ['Majestic', 'Electronic City', 'Whitefield'] },
  { departure: 'Bengaluru', arrival: 'Hyderabad', duration: 8.5, dep: ['Majestic', 'Electronic City', 'Whitefield'], arr: ['Miyapur', 'Kukatpally', 'Ameerpet'] },
  { departure: 'Mumbai', arrival: 'Pune', duration: 3.5, dep: ['Borivali', 'Andheri', 'Dadar'], arr: ['Shivajinagar', 'Swargate', 'Hinjewadi'] },
  { departure: 'Pune', arrival: 'Mumbai', duration: 3.5, dep: ['Shivajinagar', 'Swargate', 'Hinjewadi'], arr: ['Borivali', 'Andheri', 'Dadar'] },
  { departure: 'Delhi', arrival: 'Jaipur', duration: 5, dep: ['Kashmere Gate', 'Dhaula Kuan', 'Gurugram'], arr: ['Sindhi Camp', 'Durgapura', 'Ajmer Road'] },
  { departure: 'Jaipur', arrival: 'Delhi', duration: 5, dep: ['Sindhi Camp', 'Durgapura', 'Ajmer Road'], arr: ['Kashmere Gate', 'Dhaula Kuan', 'Gurugram'] },
  { departure: 'Chennai', arrival: 'Bengaluru', duration: 6, dep: ['Koyambedu', 'Guindy', 'Tambaram'], arr: ['Majestic', 'Electronic City', 'KR Puram'] },
  { departure: 'Bengaluru', arrival: 'Chennai', duration: 6, dep: ['Majestic', 'Electronic City', 'KR Puram'], arr: ['Koyambedu', 'Guindy', 'Tambaram'] },
  { departure: 'Hyderabad', arrival: 'Vijayawada', duration: 5.5, dep: ['LB Nagar', 'Uppal', 'Hayathnagar'], arr: ['Pandit Nehru Bus Station', 'Benz Circle', 'Gollapudi'] },
  { departure: 'Vijayawada', arrival: 'Hyderabad', duration: 5.5, dep: ['Pandit Nehru Bus Station', 'Benz Circle', 'Gollapudi'], arr: ['LB Nagar', 'Uppal', 'Hayathnagar'] },
  { departure: 'Mumbai', arrival: 'Goa', duration: 11, dep: ['Borivali', 'Andheri', 'Dadar'], arr: ['Panaji', 'Mapusa', 'Margao'] },
  { departure: 'Goa', arrival: 'Mumbai', duration: 11, dep: ['Panaji', 'Mapusa', 'Margao'], arr: ['Borivali', 'Andheri', 'Dadar'] },
];

const OPERATORS = [
  { name: 'Tedbus Travels', type: 'A/C Sleeper (2+1)', seats: 36, tracking: 1, reschedule: 1 },
  { name: 'Tedbus Express', type: 'A/C Seater (2+2)', seats: 40, tracking: 1, reschedule: 0 },
  { name: 'Orange Tours', type: 'A/C Sleeper (2+1)', seats: 34, tracking: 1, reschedule: 1 },
  { name: 'GreenLine Travels', type: 'Non A/C Seater (2+2)', seats: 44, tracking: 0, reschedule: 0 },
];

const TIMES = ['06:00', '09:30', '14:00', '21:30', '23:15'];
const RATINGS = [4.6, 4.3, 4.1, 3.9, 4.5, 4.0];
const IMAGES = [
  'https://s3.rdbuz.com/web/images/homeV2/heroBanner/heroBanner-2x.webp',
  'https://s3.rdbuz.com/web/images/homeV2/heroBanner/heroBanner2-2x.webp',
  'https://s3.rdbuz.com/web/images/homeV2/heroBanner/heroBanner3-2x.webp',
];

// --- clean previous demo records -------------------------------------------
tedbus.customers.deleteMany({ email: 'demo@tedbus.test' });
tedbus.bookings.deleteMany({ email: 'demo@tedbus.test' });
tedbus.routes.deleteMany({ $or: [{ demo: true }, { _id: /^demo-/ }] });
tedbus.buses.deleteMany({ $or: [{ demo: true }, { _id: /^demo-/ }] });

// --- routes ----------------------------------------------------------------
const routes = ROUTES.map((route) => ({
  _id: new ObjectId(),
  departureLocation: { name: route.departure, subLocations: route.dep },
  arrivalLocation: { name: route.arrival, subLocations: route.arr },
  duration: route.duration,
  demo: true,
}));
tedbus.routes.insertMany(routes);

// --- buses -----------------------------------------------------------------
const buses = [];
routes.forEach((route, routeindex) => {
  const buscount = routeindex === 0 ? 4 : 2;

  for (let i = 0; i < buscount; i++) {
    const operator = OPERATORS[(routeindex + i) % OPERATORS.length];
    buses.push({
      _id: new ObjectId(),
      operatorName: operator.name,
      busType: operator.type,
      departureTime: TIMES[(routeindex + i) % TIMES.length],
      rating: RATINGS.slice(i, i + 3),
      totalSeats: operator.seats,
      routes: route._id,
      images: IMAGES[(routeindex + i) % IMAGES.length],
      liveTracking: operator.tracking,
      reschedulable: operator.reschedule,
      demo: true,
    });
  }
});
tedbus.buses.insertMany(buses);

// --- customer --------------------------------------------------------------
tedbus.customers.insertOne({
  _id: CUSTOMER_ID,
  name: 'Demo Traveller',
  googleId: 'demo-google-id',
  age: 33,
  gender: 'Male',
  email: 'demo@tedbus.test',
  dateOfBirth: '1993-03-04',
  profilePicture: '',
});

// --- bookings (Hyderabad -> Bengaluru buses belong to the first route) ------
const hyderabadbus = buses[0];
const mumbaibus = buses.find((bus) => bus.routes.equals(routes[2]._id));

tedbus.bookings.insertMany([
  {
    customerId: CUSTOMER_ID.toString(),
    passengerDetails: [
      { name: 'Demo Traveller', gender: 'Male', age: 33 },
      { name: 'Riya Sharma', gender: 'Female', age: 28 },
    ],
    email: 'demo@tedbus.test',
    phoneNumber: '9876543210',
    fare: 1450,
    status: 'upcoming',
    bookingDate: '2026-11-05T10:15:00.000Z',
    busId: hyderabadbus._id.toString(),
    seats: [12, 13],
    departureDetails: { city: 'Hyderabad', time: 22, date: '2026-11-20' },
    arrivalDetails: { city: 'Bengaluru', time: '06:30', date: '2026-11-21' },
    duration: '8.5',
    isBusinessTravel: false,
    isInsurance: true,
    isCovidDonated: false,
  },
  {
    customerId: CUSTOMER_ID.toString(),
    passengerDetails: [{ name: 'Demo Traveller', gender: 'Male', age: 33 }],
    email: 'demo@tedbus.test',
    phoneNumber: '9876543210',
    fare: 650,
    status: 'completed',
    bookingDate: '2026-10-12T07:40:00.000Z',
    busId: mumbaibus._id.toString(),
    seats: [7],
    departureDetails: { city: 'Mumbai', time: 8, date: '2026-10-18' },
    arrivalDetails: { city: 'Pune', time: '11:30', date: '2026-10-18' },
    duration: '3.5',
    isBusinessTravel: false,
    isInsurance: false,
    isCovidDonated: true,
  },
]);

print('tedbus seeded');
print('  customers: ' + tedbus.customers.countDocuments({}));
print('  bookings:  ' + tedbus.bookings.countDocuments({}));
print('  routes:    ' + tedbus.routes.countDocuments({}));
print('  buses:     ' + tedbus.buses.countDocuments({}));
print('  demo customer id: ' + CUSTOMER_ID.toString());
