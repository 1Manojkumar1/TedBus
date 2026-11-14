import mongoose from 'mongoose';
import 'dotenv/config';
import { Route } from './models/route.js';
import { Bus } from './models/bus.js';
import { Customer } from './models/customer.js';
import { CommunityPost, COMMUNITY_CATEGORIES } from './models/communityPost.js';
import { PostComment } from './models/postComment.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tedbus';

// -------------------------------------------------------------
// 1. EXTENSIVE BUS ROUTES (Bidirectional Major Indian Corridors)
// -------------------------------------------------------------
const ROUTE_DEFINITIONS = [
  // Bangalore / Bengaluru Hub
  {
    from: 'Bangalore', to: 'Hyderabad', duration: 8.5,
    depSubs: ['Majestic (Kempegowda BS)', 'Electronic City Toll', 'Silk Board', 'Hebbal Flyover', 'Yelahanka'],
    arrSubs: ['Miyapur Metro', 'Kukatpally', 'Ameerpet', 'Lakdikapul', 'LB Nagar Ring Road']
  },
  {
    from: 'Bangalore', to: 'Chennai', duration: 6,
    depSubs: ['Majestic', 'Shantinagar', 'Indiranagar', 'KR Puram Railway Station', 'Hosakote Toll'],
    arrSubs: ['Koyambedu CMBT', 'Guindy Metro', 'Tambaram', 'Ashok Nagar', 'Sriperumbudur']
  },
  {
    from: 'Bangalore', to: 'Goa', duration: 11,
    depSubs: ['Majestic', 'Yeshwantpur', 'Jalahalli Cross', 'Tumkur Bypass'],
    arrSubs: ['Panaji KTC Bus Stand', 'Mapusa Bus Stand', 'Margao KTC', 'Porvorim']
  },
  {
    from: 'Bangalore', to: 'Coimbatore', duration: 6.5,
    depSubs: ['Majestic', 'Madiwala', 'Electronic City', 'Bommasandra', 'Attibele Toll'],
    arrSubs: ['Gandhipuram Omni Bus Stand', 'Hopes College', 'KMCH', 'Singanallur', 'Ukkadam']
  },
  {
    from: 'Bangalore', to: 'Kochi', duration: 9.5,
    depSubs: ['Majestic', 'Madiwala St. Johns', 'Electronic City Phase 1', 'Hosur Toll'],
    arrSubs: ['Vyttila Mobility Hub', 'Edappally Toll', 'Aluva Flyover', 'Kaloor Stadium', 'Palarivattom']
  },
  {
    from: 'Bangalore', to: 'Mysore', duration: 3,
    depSubs: ['Majestic', 'Satellite Bus Station (Kengeri)', 'Bidadi Bypass', 'Rajarajeshwari Nagar'],
    arrSubs: ['Suburban Bus Stand', 'KSRTC Central Bus Stand', 'Columbia Asia Hospital Circle', 'Infosys Gate']
  },
  {
    from: 'Bangalore', to: 'Madurai', duration: 7.5,
    depSubs: ['Majestic', 'Madiwala', 'Electronic City', 'Chandapura'],
    arrSubs: ['Mattuthavani Integrated Bus Stand', 'Periyar Bus Stand', 'Arapalayam', 'Fathima College']
  },
  {
    from: 'Bangalore', to: 'Tirupati', duration: 4.5,
    depSubs: ['Majestic', 'KR Puram', 'Hoskote', 'Kolar Bypass'],
    arrSubs: ['Tirupati Central Bus Stand', 'Alipiri Gate', 'Leela Mahal Circle', 'RTC Complex']
  },
  {
    from: 'Bangalore', to: 'Mangalore', duration: 7,
    depSubs: ['Majestic', 'Yeshwantpur', 'Nelamangala Toll', 'Kunigal Bypass'],
    arrSubs: ['KSRTC Bus Stand Bejai', 'Pumpwell Circle', 'Surathkal NITK', 'Hampankatta']
  },
  {
    from: 'Bangalore', to: 'Pune', duration: 13,
    depSubs: ['Majestic', 'Yeshwantpur Govardhan', 'Nelamangala', 'Tumkur'],
    arrSubs: ['Swargate', 'Shivajinagar', 'Hinjewadi Bridge Phase 1', 'Wakad Flyover', 'Katraj Bypass']
  },
  {
    from: 'Bangalore', to: 'Mumbai', duration: 16,
    depSubs: ['Majestic', 'Yeshwantpur', 'Peenya', 'Nelamangala Toll'],
    arrSubs: ['Borivali Nancy Colony', 'Andheri West', 'Dadar Asiad Bus Stand', 'Sion Circle', 'Vashi Toll']
  },
  {
    from: 'Bangalore', to: 'Vijayawada', duration: 10.5,
    depSubs: ['Majestic', 'KR Puram', 'Tin Factory', 'Hosakote Toll'],
    arrSubs: ['Pandit Nehru Bus Station (PNBS)', 'Benz Circle', 'Ramavarappadu Ring', 'Varadhi Junction']
  },
  {
    from: 'Bangalore', to: 'Pondicherry', duration: 6.5,
    depSubs: ['Majestic', 'Madiwala', 'Electronic City', 'Hosur'],
    arrSubs: ['Pondicherry New Bus Stand', 'Marapalam', 'Indira Gandhi Square', 'Auroville Junction']
  },

  // Hyderabad Hub
  {
    from: 'Hyderabad', to: 'Vijayawada', duration: 5.5,
    depSubs: ['MGBS Central', 'LB Nagar Ring Road', 'Uppal Ring Road', 'Hayathnagar', 'Dilsukhnagar'],
    arrSubs: ['Pandit Nehru Bus Station', 'Benz Circle', 'Gollapudi Bypass', 'Ramavarappadu Ring']
  },
  {
    from: 'Hyderabad', to: 'Visakhapatnam', duration: 11,
    depSubs: ['Miyapur', 'Kukatpally', 'SR Nagar', 'MGBS', 'LB Nagar'],
    arrSubs: ['Dwaraka Bus Station (RTC Complex)', 'Gajuwaka Junction', 'Maddilapalem', 'NAD Kotha Road']
  },
  {
    from: 'Hyderabad', to: 'Tirupati', duration: 9.5,
    depSubs: ['MGBS', 'Kacheguda', 'LB Nagar', 'Shamshabad Airport Road'],
    arrSubs: ['Tirupati Central Bus Stand', 'RTC Complex', 'Alipiri Depot', 'Kapila Theertham']
  },
  {
    from: 'Hyderabad', to: 'Chennai', duration: 11,
    depSubs: ['Miyapur', 'Ameerpet', 'MGBS', 'LB Nagar Ring Road'],
    arrSubs: ['Koyambedu CMBT', 'Madhavaram Intercity', 'Guindy', 'Tambaram Railway Station']
  },
  {
    from: 'Hyderabad', to: 'Pune', duration: 9.5,
    depSubs: ['Miyapur Metro', 'Kukatpally', 'Gachibowli Outer Ring', 'Patancheru Toll'],
    arrSubs: ['Swargate', 'Hinjewadi Flyover', 'Wakad', 'Hadapsar Gadital', 'Viman Nagar']
  },
  {
    from: 'Hyderabad', to: 'Mumbai', duration: 13,
    depSubs: ['Miyapur', 'KPHB Colony', 'Gachibowli', 'Patancheru Bypass'],
    arrSubs: ['Vashi Plaza', 'Maitri Park Chembur', 'Sion Circle', 'Dadar TT Circle', 'Borivali West']
  },
  {
    from: 'Hyderabad', to: 'Goa', duration: 14,
    depSubs: ['Kukatpally', 'Ameerpet', 'Gachibowli', 'Aramghar Chowrasta'],
    arrSubs: ['Panaji KTC Bus Stand', 'Mapusa', 'Margao KTC Station', 'Ponda Bus Stand']
  },
  {
    from: 'Hyderabad', to: 'Nagpur', duration: 8.5,
    depSubs: ['Secunderabad Jubilee Bus Station', 'Paradise Circle', 'Medchal Checkpost'],
    arrSubs: ['Ganeshpeth Bus Stand', 'Chatrapati Square', 'Loharipura', 'Sitabuldi Square']
  },

  // Mumbai & Western Corridors
  {
    from: 'Mumbai', to: 'Pune', duration: 3.5,
    depSubs: ['Borivali West', 'Andheri East Bisleri', 'Dadar Asiad', 'Chembur Maitri Park', 'Vashi Highway'],
    arrSubs: ['Wakad Bridge', 'Hinjewadi Phase 1', 'Shivajinagar Sancheti', 'Swargate', 'Katraj Bypass']
  },
  {
    from: 'Mumbai', to: 'Goa', duration: 11,
    depSubs: ['Borivali Nancy Colony', 'Andheri East', 'Dadar', 'Sion', 'Vashi Plaza'],
    arrSubs: ['Mapusa Bus Stand', 'Panaji KTC', 'Margao Old Bus Stand', 'Canacona']
  },
  {
    from: 'Mumbai', to: 'Ahmedabad', duration: 9,
    depSubs: ['Borivali National Park', 'Kandivali', 'Malad', 'Goregaon East', 'Thane Majiwada'],
    arrSubs: ['Paldi Bus Stand', 'Geeta Mandir ST Stand', 'C.G. Road', 'Bapu Nagar', 'Iscon Cross Roads']
  },
  {
    from: 'Mumbai', to: 'Surat', duration: 5.5,
    depSubs: ['Borivali West', 'Dahisar Checkpost', 'Ghodbunder Road', 'Vasai Phata'],
    arrSubs: ['Surat Central Bus Station', 'Kamrej Char Rasta', 'Kadodara Char Rasta', 'Ring Road']
  },
  {
    from: 'Mumbai', to: 'Nagpur', duration: 14,
    depSubs: ['Dadar', 'Thane Teen Hath Naka', 'Kalyan Bypass'],
    arrSubs: ['Ganeshpeth Bus Stand', 'Dharampeth', 'Medical Square', 'Wardha Road']
  },
  {
    from: 'Pune', to: 'Goa', duration: 8.5,
    depSubs: ['Swargate', 'Katraj Wonder City', 'Chandani Chowk', 'Wakad Bridge'],
    arrSubs: ['Mapusa Bus Stand', 'Panaji KTC Stand', 'Margao Bus Station']
  },
  {
    from: 'Pune', to: 'Ahmedabad', duration: 11.5,
    depSubs: ['Swargate', 'Shivajinagar', 'Wakad Flyover', 'Nigdi Nishant Hall'],
    arrSubs: ['Paldi Cross Road', 'Geeta Mandir', 'Satellite', 'Iscon Temple']
  },
  {
    from: 'Pune', to: 'Surat', duration: 8,
    depSubs: ['Swargate', 'Wakad Bridge', 'Chinchwad Station'],
    arrSubs: ['Kamrej Char Rasta', 'Surat Textile Market', 'Central Bus Stand']
  },
  {
    from: 'Ahmedabad', to: 'Surat', duration: 4,
    depSubs: ['Paldi', 'Geeta Mandir', 'C.T.M. Cross Road', 'Naroda Patiya'],
    arrSubs: ['Kamrej Char Rasta', 'Surat Central Bus Stand', 'Hirabaug Varachha']
  },
  {
    from: 'Ahmedabad', to: 'Jaipur', duration: 11,
    depSubs: ['Paldi', 'RTO Circle', 'Shahi Baug', 'C.T.M.'],
    arrSubs: ['Sindhi Camp Bus Stand', 'Polo Victory', 'Transport Nagar', '200 Feet Bypass']
  },

  // Northern Hubs (Delhi, Jaipur, Agra, Lucknow, Chandigarh)
  {
    from: 'Delhi', to: 'Jaipur', duration: 5,
    depSubs: ['Kashmere Gate ISBT', 'Dhaula Kuan Metro', 'Mahipalpur', 'IFFCO Chowk Gurugram', 'Rajeev Chowk'],
    arrSubs: ['Sindhi Camp Bus Stand', 'Narayan Singh Circle', 'Durgapura', 'Ajmer Pulia', '200 Feet Bypass']
  },
  {
    from: 'Delhi', to: 'Agra', duration: 3.5,
    depSubs: ['Sarai Kale Khan ISBT', 'Akshardham Temple', 'Mahamaya Flyover Noida', 'Pari Chowk Greater Noida'],
    arrSubs: ['ISBT Agra', 'Water Works Bypass', 'Idgah Bus Stand', 'Bhagwan Talkies']
  },
  {
    from: 'Delhi', to: 'Lucknow', duration: 8,
    depSubs: ['Anand Vihar ISBT', 'Kashmere Gate', 'Akshardham Metro', 'Noida Sector 37'],
    arrSubs: ['Alambagh Bus Stand', 'Charbagh Railway Station', 'Nahariya Chauraha', 'Polytechnic Chauraha']
  },
  {
    from: 'Delhi', to: 'Chandigarh', duration: 4.5,
    depSubs: ['Kashmere Gate ISBT Gate 1', 'Majnu Ka Tilla', 'Mukarba Chowk', 'Karnal Bypass'],
    arrSubs: ['Sector 43 ISBT', 'Sector 17 Bus Stand', 'Tribune Chowk', 'Mohali Phase 7']
  },
  {
    from: 'Delhi', to: 'Dehradun', duration: 6,
    depSubs: ['Kashmere Gate ISBT', 'Anand Vihar', 'Akshardham', 'Mohan Nagar'],
    arrSubs: ['ISBT Dehradun', 'Clock Tower', 'Rispana Bridge', 'Transport Nagar']
  },
  {
    from: 'Jaipur', to: 'Agra', duration: 4.5,
    depSubs: ['Sindhi Camp', 'Narayan Singh Circle', 'Transport Nagar'],
    arrSubs: ['ISBT Agra', 'Idgah Bus Stand', 'Bhagwan Talkies']
  },
  {
    from: 'Lucknow', to: 'Agra', duration: 5,
    depSubs: ['Alambagh Bus Stand', 'Charbagh', 'Transport Nagar'],
    arrSubs: ['ISBT Agra', 'Water Works', 'Idgah Bus Stand']
  },
  {
    from: 'Delhi', to: 'Varanasi', duration: 12,
    depSubs: ['Anand Vihar ISBT', 'Kashmere Gate', 'Noida Mor'],
    arrSubs: ['Varanasi Cantt Bus Stand', 'Lanka BHU', 'Babatpur Airport Road']
  },
  {
    from: 'Delhi', to: 'Amritsar', duration: 8.5,
    depSubs: ['Kashmere Gate ISBT', 'Mukarba Chowk', 'Sonipat Bypass'],
    arrSubs: ['Amritsar ISBT', 'Golden Temple Gate', 'Hall Gate']
  },
  {
    from: 'Jaipur', to: 'Udaipur', duration: 7,
    depSubs: ['Sindhi Camp', '200 Ft Bypass', 'Durgapura'],
    arrSubs: ['Udaipur Central Bus Stand', 'Udiapole', 'Rana Pratap Nagar']
  },

  // Tamil Nadu & Kerala Corridors
  {
    from: 'Chennai', to: 'Coimbatore', duration: 8,
    depSubs: ['Koyambedu CMBT', 'Guindy', 'Ashok Pillar', 'Tambaram Sanatorium', 'Perungalathur'],
    arrSubs: ['Gandhipuram Omni Bus Stand', 'Hopes College', 'Singanallur', 'Ukkadam Bus Stand']
  },
  {
    from: 'Chennai', to: 'Madurai', duration: 7.5,
    depSubs: ['Koyambedu CMBT', 'Tambaram', 'Perungalathur', 'Chengalpattu Toll'],
    arrSubs: ['Mattuthavani Integrated Bus Stand', 'Periyar Bus Stand', 'Arapalayam']
  },
  {
    from: 'Chennai', to: 'Tirupati', duration: 3.5,
    depSubs: ['Madhavaram MMBT', 'Koyambedu', 'Ambattur OT', 'Tiruvallur Bypass'],
    arrSubs: ['Tirupati Central Bus Stand', 'Alipiri Depot', 'RTC Complex']
  },
  {
    from: 'Chennai', to: 'Vijayawada', duration: 7.5,
    depSubs: ['Koyambedu CMBT', 'Madhavaram MMBT', 'Red Hills Toll'],
    arrSubs: ['Pandit Nehru Bus Station', 'Benz Circle', 'Mangalagiri Bypass']
  },
  {
    from: 'Kochi', to: 'Coimbatore', duration: 4,
    depSubs: ['Vyttila Mobility Hub', 'Edappally Toll', 'Aluva Bypass', 'Angamaly'],
    arrSubs: ['Gandhipuram Omni Bus Stand', 'Ukkadam', 'Singanallur']
  },
  {
    from: 'Kochi', to: 'Trivandrum', duration: 5,
    depSubs: ['Vyttila Mobility Hub', 'Kundannoor Junction', 'Aroor Toll'],
    arrSubs: ['Thampanoor Central Bus Stand', 'Pattom', 'Kazhakkoottam Technopark']
  },
  {
    from: 'Coimbatore', to: 'Madurai', duration: 4.5,
    depSubs: ['Gandhipuram Omni Bus Stand', 'Singanallur', 'Pollachi Road'],
    arrSubs: ['Mattuthavani Bus Stand', 'Arapalayam Bus Stand', 'Periyar']
  },

  // Eastern Corridors
  {
    from: 'Kolkata', to: 'Bhubaneswar', duration: 8,
    depSubs: ['Esplanade Bus Terminus', 'Babughat', 'Santragachi Station', 'Kona Expressway'],
    arrSubs: ['Baramunda ISBT', 'Master Canteen Square', 'Jaydev Vihar', 'Khandagiri']
  },
  {
    from: 'Visakhapatnam', to: 'Bhubaneswar', duration: 7.5,
    depSubs: ['Dwaraka Bus Station', 'NAD Junction', 'Madhurawada'],
    arrSubs: ['Baramunda Bus Stand', 'Master Canteen', 'Vani Vihar']
  },
];

// -------------------------------------------------------------
// OPERATOR PROFILES
// -------------------------------------------------------------
const BUS_OPERATORS = [
  { name: 'TedBus Primo Sleeper', type: 'A/C Sleeper (2+1)', seats: 36, tracking: 1, reschedule: 1 },
  { name: 'TedBus Express Superfast', type: 'Multi-Axle Volvo Semi-Sleeper (2+2)', seats: 42, tracking: 1, reschedule: 1 },
  { name: 'Orange Tours & Travels', type: 'BharatBenz A/C Sleeper (2+1)', seats: 34, tracking: 1, reschedule: 1 },
  { name: 'IntrCity SmartBus', type: 'Lounge Sleeper A/C (2+1)', seats: 36, tracking: 1, reschedule: 1 },
  { name: 'Zingbus Electric Cruiser', type: 'Volvo Electric A/C Semi-Sleeper', seats: 40, tracking: 1, reschedule: 1 },
  { name: 'SRS Royal Cruiser', type: 'Scania Multi-Axle A/C (2+2)', seats: 44, tracking: 1, reschedule: 0 },
  { name: 'Kallada G4 Travels', type: 'A/C Sleeper (2+1)', seats: 36, tracking: 1, reschedule: 1 },
  { name: 'GreenLine Express', type: 'Non A/C High-Back Seater (2+2)', seats: 48, tracking: 0, reschedule: 0 },
];

const DEPARTURE_HOURS = ['06:30', '09:00', '13:30', '18:00', '20:45', '22:15', '23:30'];
const BUS_RATINGS = [4.8, 4.6, 4.4, 4.2, 4.7, 4.5, 4.3];
const HERO_IMAGES = [
  'https://s3.rdbuz.com/web/images/homeV2/heroBanner/heroBanner-2x.webp',
  'https://s3.rdbuz.com/web/images/homeV2/heroBanner/heroBanner2-2x.webp',
  'https://s3.rdbuz.com/web/images/homeV2/heroBanner/heroBanner3-2x.webp',
];

// -------------------------------------------------------------
// 2. VERIFIED COMMUNITY AUTHORS
// -------------------------------------------------------------
const SEED_USERS = [
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@tedbus.test',
    badge: 'Top Contributor',
    picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    gender: 'Female',
    age: 28,
  },
  {
    name: 'Rahul Verma',
    email: 'rahul.verma@tedbus.test',
    badge: 'Route Explorer',
    picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    gender: 'Male',
    age: 32,
  },
  {
    name: 'Ananya Iyer',
    email: 'ananya.iyer@tedbus.test',
    badge: 'Verified Traveler',
    picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    gender: 'Female',
    age: 26,
  },
  {
    name: 'Vikram Malhotra',
    email: 'vikram.m@tedbus.test',
    badge: 'Community Champion',
    picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    gender: 'Male',
    age: 35,
  },
  {
    name: 'Kavita Reddy',
    email: 'kavita.reddy@tedbus.test',
    badge: 'Verified Traveler',
    picture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    gender: 'Female',
    age: 30,
  },
  {
    name: 'Arjun Dasgupta',
    email: 'arjun.d@tedbus.test',
    badge: 'Route Explorer',
    picture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    gender: 'Male',
    age: 29,
  },
];

// -------------------------------------------------------------
// 3. COMMUNITY DISCUSSIONS ACROSS ALL 6 CATEGORIES
// -------------------------------------------------------------
const SEED_DISCUSSIONS = [
  // 1. Bus routes
  {
    title: 'Bangalore to Goa Overnight: Top Operators, Route Quality & NH48 Condition',
    content: `Taking the sleeper bus from Bangalore to Goa (Panaji / Mapusa) is one of the most scenic journeys in South India. 
    
    Here is an update on the current road conditions and operator experience:
    - **Route Taken:** Bangalore -> Tumkur -> Chitradurga -> Hubli Bypass -> Dharwad -> Alnavar -> Anmod Ghat -> Mollem -> Panaji (approx 560 km).
    - **Road Quality:** 4-lane expressway till Dharwad bypass is buttery smooth. The Anmod Ghat section has scenic forest views; gentle speeds recommended.
    - **Top Bus Operators:** IntrCity SmartBus and TedBus Primo Sleeper offer blankets, charging ports that actually work, and clean hygienic dinner stops near Davanagere.
    - **Tip for Sleepers:** Book lower single berths on the right side (seats 2, 5, 8) for the least sway through the Western Ghat hairpins!`,
    category: 'Bus routes',
    tags: ['Bangalore', 'Goa', 'SleeperBus', 'RoadTrip', 'NH48'],
    images: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800'],
    routeTag: { from: 'Bangalore', to: 'Goa' },
    authorIndex: 0,
    likesCount: 142,
    viewsCount: 1840,
    comments: [
      {
        authorIndex: 1,
        content: 'Totally agree on the Davanagere stop! Those Benne Dosas at midnight make the entire bus journey unforgettable.',
        replies: [
          { authorIndex: 0, content: 'Yes Rahul! Guru Kottureshwara Benne Dosa stop is legendary on this route.' }
        ]
      },
      {
        authorIndex: 2,
        content: 'Does TedBus Primo stop directly at Mapusa Bus Stand? Or outside the bypass?',
        replies: [
          { authorIndex: 0, content: 'They drop right at the main Mapusa KTC bus stand near the taxi union counter.' }
        ]
      }
    ]
  },
  {
    title: 'Hyderabad to Vijayawada: Express Highway vs Daytime Scania Buses',
    content: `The 275 km corridor on NH65 between Hyderabad (LB Nagar) and Vijayawada (PNBS) is one of the fastest bus routes in India. 
    
    Most multi-axle Volvo and Scania buses complete the journey in just 4.5 to 5.5 hours. 
    If you travel by day, try booking the front panoramic seats for great views of Suryapet and the Krishna river barrage upon arrival in Vijayawada!`,
    category: 'Bus routes',
    tags: ['Hyderabad', 'Vijayawada', 'NH65', 'Volvo'],
    images: ['https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800'],
    routeTag: { from: 'Hyderabad', to: 'Vijayawada' },
    authorIndex: 1,
    likesCount: 98,
    viewsCount: 1120,
    comments: [
      { authorIndex: 3, content: 'Suryapet Seven Food Court is a must-visit midway rest stop on this route.' }
    ]
  },

  // 2. Destinations
  {
    title: 'Weekend Escape to Coorg & Madikeri: How to Plan via Mysore Bus Transit',
    content: `Coorg (Kodagu) is known as the Scotland of India, famous for coffee plantations, Raja's Seat sunsets, and Abbey Falls.
    
    Best way to reach:
    1. Take the TedBus overnight or morning express from Bangalore to Mysore (3 hrs via Bengaluru-Mysore expressway).
    2. Switch to the direct KSRTC Airavat / sleeper from Mysore to Madikeri (just 2.5 hours through Hunsur and Kushalnagar).
    3. Visit the Golden Temple (Namdroling Monastery) at Bylakuppe along the way. Highly recommended for couples and solo backpackers!`,
    category: 'Destinations',
    tags: ['Coorg', 'Mysore', 'WeekendGetaway', 'Nature', 'CoffeePlantations'],
    images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'],
    routeTag: { from: 'Bangalore', to: 'Mysore' },
    authorIndex: 2,
    likesCount: 215,
    viewsCount: 2900,
    comments: [
      { authorIndex: 4, content: 'The coffee blossoms bloom between March and April—the fragrance across the hills is heavenly!' },
      { authorIndex: 5, content: 'Is two days enough for Madikeri or do you recommend staying three days?',
        replies: [{ authorIndex: 2, content: '3 days is ideal so you can cover Dubare Elephant Camp and Talacauvery without rushing.' }]
      }
    ]
  },
  {
    title: 'Discovering Hampi: The Ancient Ruins by Overnight Sleeper from Bangalore',
    content: `Hampi is a UNESCO World Heritage site that transports you centuries back into the Vijayanagara Empire. 
    
    Taking an AC Sleeper bus from Bangalore (Majestic) directly to Hospet (12 km from Hampi) is the most comfortable and budget-friendly way. Buses depart around 10:00 PM and arrive at Hospet at 6:30 AM fresh for sightseeing!`,
    category: 'Destinations',
    tags: ['Hampi', 'Heritage', 'History', 'UNESCO', 'Karnataka'],
    images: ['https://images.unsplash.com/photo-1600100397608-f010f443b7d1?w=800'],
    routeTag: { from: 'Bangalore', to: 'Goa' },
    authorIndex: 3,
    likesCount: 178,
    viewsCount: 2240,
    comments: [
      { authorIndex: 0, content: 'Rent a bicycle or moped near Virupaksha temple—it is the best way to explore the boulder landscape.' }
    ]
  },

  // 3. Travel experiences
  {
    title: 'My First Solo Bus Trip from Mumbai to Goa: Sunset on the Konkan Highway',
    content: `I was nervous about taking my first solo long-distance trip, but TedBus made the entire journey effortless. 
    
    Boarded from Borivali West at 7:30 PM. The bus captain verified my digital ticket QR code, guided me to my single upper berth, and provided sanitised linen and a bottled water. 
    
    Waking up around 6:00 AM as the bus cruised past lush palm groves in Sawantwadi with the morning sea breeze blowing in was pure magic. If you are debating a solo trip, just pack your bags and go!`,
    category: 'Travel experiences',
    tags: ['SoloTravel', 'Mumbai', 'Goa', 'Konkan', 'FirstTime'],
    images: ['https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800'],
    routeTag: { from: 'Mumbai', to: 'Goa' },
    authorIndex: 2,
    likesCount: 310,
    viewsCount: 4100,
    comments: [
      { authorIndex: 1, content: 'Inspiring story! Single upper berths on modern multi-axle buses are so cozy and private.' },
      { authorIndex: 4, content: 'Did the bus have live GPS tracking for family back home?',
        replies: [{ authorIndex: 2, content: 'Yes! My parents could see my exact location in real-time right on the TedBus app.' }]
      }
    ]
  },
  {
    title: 'Monsoon Magic: Driving through the Western Ghats between Pune and Goa',
    content: `Riding an AC sleeper through the Amboli Ghat during peak monsoon is an unforgettable visual spectacle. Countless seasonal waterfalls cascading down emerald green cliffs right beside the highway. Make sure to keep your camera ready!`,
    category: 'Travel experiences',
    tags: ['Monsoon', 'WesternGhats', 'Pune', 'Goa', 'Waterfalls'],
    images: ['https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800'],
    routeTag: { from: 'Pune', to: 'Goa' },
    authorIndex: 5,
    likesCount: 145,
    viewsCount: 1980,
    comments: [
      { authorIndex: 3, content: 'Amboli Ghat fog can get thick, so good operators with experienced drivers are essential.' }
    ]
  },

  // 4. Travel tips
  {
    title: '10 Essential Hacks for Overnight Sleeper Bus Journeys in India',
    content: `After logging over 25,000 km across interstate buses, here are my top 10 practical hacks for a restful journey:

1. **Berth Selection:** Lower berths offer the least vibration; upper berths offer maximum privacy and luggage space.
2. **Carry an Eye Mask & Earplugs:** Essential for block-out sleep even if fellow passengers watch videos.
3. **Power Bank Backup:** While most buses have USB sockets, some charge slowly. A 10,000mAh power bank guarantees a full phone upon arrival.
4. **Offline Maps:** Download your destination city on Google Maps or Apple Maps before departure.
5. **Light Layering:** AC temperatures can dip to 19°C by 3 AM; keep a lightweight fleece or hoodie in your cabin bag.
6. **Luggage Tags:** Label your bags in the luggage hold with your seat number and mobile phone.
7. **Snack Smart:** Carry dry fruits and electrolytic drinks instead of oily chips.
8. **Rest Stop Awareness:** Note down the bus registration number before stepping down at highway dhabas!
9. **Water Bottle in Reach:** Store your bottle in the door mesh before lying down.
10. **Book Verified Operators:** Look for the TedBus Primo badge for guaranteed on-time departure and sanitised cabins.`,
    category: 'Travel tips',
    tags: ['TravelHacks', 'SleeperBus', 'PackingList', 'ProTips'],
    images: ['https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'],
    authorIndex: 3,
    likesCount: 420,
    viewsCount: 5600,
    comments: [
      { authorIndex: 0, content: 'Tip #8 is crucial! At midnight highway halts, dozens of identical white Volvo buses park together. Always check the number plate.' },
      { authorIndex: 1, content: 'Bookmarked! Sharing this with my college group.' }
    ]
  },
  {
    title: 'How to Choose the Best Seat: Window vs Aisle, Upper vs Lower Berth Explained',
    content: `Confused about seat layouts?
    - **Single Upper (Left):** Best for solo travelers who want absolute uninterrupted privacy.
    - **Double Lower (Right):** Ideal for couples, friends, or elderly travelers who prefer minimal climbing.
    - **Middle of the Bus:** Minimal bumpiness compared to the extreme back seats over the rear axle.`,
    category: 'Travel tips',
    tags: ['SeatSelection', 'Guide', 'BookingTips'],
    images: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800'],
    authorIndex: 4,
    likesCount: 164,
    viewsCount: 2100,
    comments: [
      { authorIndex: 2, content: 'Always pick rows 3 to 6 for the smoothest ride!' }
    ]
  },

  // 5. Safety and recommendations
  {
    title: 'Solo Female Travelers Guide: Night Bus Safety, Boarding Points & Red Flags',
    content: `Safety is paramount, especially when boarding late-night interstate buses alone. 
    
    Here is a verified safety checklist:
    - **Choose Main Boarding Hubs:** Always board from well-lit central terminals (like Majestic, Koyambedu, or Kashmere Gate) rather than isolated highway flyovers.
    - **Women-Only Adjacent Seats:** Look for operators that restrict adjacent booking to female passengers when a woman has booked single berths.
    - **Share Live Trip Link:** Use the TedBus in-app live tracking link to share your live coordinates with family via WhatsApp.
    - **Driver & Staff Verification:** Primo buses display the driver badge, police verification status, and conductor phone number prominently at the cabin entrance.
    - **Emergency Contacts:** Save National Emergency Helpline 112 and highway police speed dials before travelling.`,
    category: 'Safety and recommendations',
    tags: ['SoloFemaleTravel', 'WomenSafety', 'SafeTravel', 'PrimoVerified'],
    images: ['https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'],
    authorIndex: 0,
    likesCount: 388,
    viewsCount: 4900,
    comments: [
      { authorIndex: 2, content: 'Thank you Priya for sharing this! The women-only adjacent seat feature on TedBus gives so much peace of mind.' },
      { authorIndex: 4, content: 'Great points. Keeping a small torch and power bank in your crossbody bag is also very handy.' }
    ]
  },
  {
    title: 'Luggage Safety & Insurance: Is the ₹15 Travel Protection Worth It?',
    content: `We recently tested the claim process when a passenger lost their laptop backpack from an interstate coach. 
    The ₹15 ICICI Lombard protection covered emergency baggage loss and medical delays with instant OTP verification. 
    For just fifteen rupees, never uncheck this box during checkout!`,
    category: 'Safety and recommendations',
    tags: ['LuggageSafety', 'Insurance', 'Protection', 'SafeBooking'],
    images: ['https://images.unsplash.com/photo-1553531384-cc64ac80f931?w=800'],
    authorIndex: 1,
    likesCount: 122,
    viewsCount: 1650,
    comments: [
      { authorIndex: 3, content: 'Completely agree. ₹15 is negligible for complete peace of mind on long trips.' }
    ]
  },

  // 6. General discussions
  {
    title: 'Future of Indian Intercity Travel: Electric Sleeper Buses & Expressways',
    content: `With the rapid expansion of access-controlled expressways like the Bengaluru-Mysuru Expressway, Mumbai-Nagpur Samruddhi Mahamarg, and Delhi-Mumbai Expressway, intercity bus travel in India is undergoing a massive revolution.
    
    Electric double-decker sleepers and high-speed multi-axle electric coaches are entering service on routes up to 400 km. Zero engine noise, zero cabin vibration, and ultra-smooth regenerative braking make sleeper travel feel like a luxury cruise!
    
    What has been your experience on modern EV or Multi-Axle buses? Share your thoughts below!`,
    category: 'General discussions',
    tags: ['EVBuses', 'FutureOfTravel', 'Expressways', 'Innovation', 'India'],
    images: ['https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800'],
    authorIndex: 1,
    likesCount: 260,
    viewsCount: 3450,
    comments: [
      { authorIndex: 0, content: 'Rode the Zingbus EV from Delhi to Jaipur last month. The silent cabin made sleeping so easy!' },
      { authorIndex: 3, content: 'The Samruddhi Mahamarg cut Mumbai-Nagpur road travel time from 16 hours down to under 10 hours. Incredible infrastructure.' }
    ]
  },
  {
    title: 'Favorite Highway Dhabas & Rest Stops Across Indian Corridors',
    content: `Every frequent bus commuter has their favorite highway food haven.
    From Murthal parathas on NH44 to Davanagere benne dosas on NH48, and spicy Andhra meals along NH65 near Suryapet. 
    
    Drop your absolute favorite highway food stop and the route it is located on!`,
    category: 'General discussions',
    tags: ['HighwayFood', 'Dhabas', 'Foodie', 'RoadTrips'],
    images: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'],
    authorIndex: 5,
    likesCount: 195,
    viewsCount: 2600,
    comments: [
      { authorIndex: 1, content: 'Amrik Sukhdev at Murthal for white butter parathas on the Delhi-Chandigarh run! Unbeatable.' },
      { authorIndex: 4, content: 'Aryas on the Chennai-Bangalore highway at Vellore bypass serves top-notch filter coffee and hot vadas.' }
    ]
  }
];

// -------------------------------------------------------------
// SEED RUNNER
// -------------------------------------------------------------
async function runSeed() {
  console.log(`Connecting to MongoDB at: ${MONGODB_URI}...`);
  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB connected successfully!');

  // 1. Seed / Upsert Users in Customer collection
  console.log('Seeding verified community users...');
  const createdCustomers = [];
  for (const user of SEED_USERS) {
    let customer = await Customer.findOne({ email: user.email }).exec();
    if (!customer) {
      customer = await Customer.create({
        name: user.name,
        email: user.email,
        googleId: `google-${user.email.replace(/[@.]/g, '-')}`,
        age: user.age,
        gender: user.gender,
        dateOfBirth: '1995-05-15',
        phoneNumber: '9876543210',
        profilePicture: user.picture,
      });
    }
    createdCustomers.push(customer);
  }
  console.log(`Ensured ${createdCustomers.length} verified users.`);

  // 2. Clear previous seed community posts & comments
  console.log('Purging existing community posts and comments for a clean seed...');
  await CommunityPost.deleteMany({}).exec();
  await PostComment.deleteMany({}).exec();

  // 3. Insert Community Posts & Comments
  console.log('Seeding rich community discussions across all 6 categories...');
  for (const item of SEED_DISCUSSIONS) {
    const authorCustomer = createdCustomers[item.authorIndex];
    const authorUser = SEED_USERS[item.authorIndex];

    const post = await CommunityPost.create({
      title: item.title,
      content: item.content,
      category: item.category,
      tags: item.tags,
      images: item.images,
      routeTag: item.routeTag,
      author: {
        customerId: String(authorCustomer._id),
        name: authorCustomer.name,
        email: authorCustomer.email,
        picture: authorCustomer.profilePicture,
        badge: authorUser.badge,
      },
      likes: createdCustomers.slice(0, Math.min(5, createdCustomers.length)).map(c => String(c._id)),
      likesCount: item.likesCount,
      commentsCount: 0,
      viewsCount: item.viewsCount,
      status: 'published',
      isPinned: item.category === 'Bus routes' || item.category === 'Safety and recommendations',
    });

    let totalComments = 0;
    for (const commentData of item.comments || []) {
      const commentAuthor = createdCustomers[commentData.authorIndex];
      const commentAuthorInfo = SEED_USERS[commentData.authorIndex];

      const parentComment = await PostComment.create({
        postId: post._id,
        parentCommentId: null,
        author: {
          customerId: String(commentAuthor._id),
          name: commentAuthor.name,
          email: commentAuthor.email,
          picture: commentAuthor.profilePicture,
          badge: commentAuthorInfo.badge,
        },
        content: commentData.content,
        likes: [String(authorCustomer._id)],
        likesCount: 3,
        status: 'published',
      });
      totalComments++;

      for (const replyData of commentData.replies || []) {
        const replyAuthor = createdCustomers[replyData.authorIndex];
        const replyAuthorInfo = SEED_USERS[replyData.authorIndex];

        await PostComment.create({
          postId: post._id,
          parentCommentId: parentComment._id,
          author: {
            customerId: String(replyAuthor._id),
            name: replyAuthor.name,
            email: replyAuthor.email,
            picture: replyAuthor.profilePicture,
            badge: replyAuthorInfo.badge,
          },
          content: replyData.content,
          likes: [],
          likesCount: 1,
          status: 'published',
        });
        totalComments++;
      }
    }

    post.commentsCount = totalComments;
    await post.save();
  }
  console.log(`Successfully seeded ${SEED_DISCUSSIONS.length} rich discussions covering all categories!`);

  // 4. Seed Comprehensive Bus Routes & Buses
  console.log('Seeding comprehensive nationwide bus routes and buses...');
  // Clear existing demo routes & buses
  await Route.deleteMany({}).exec();
  await Bus.deleteMany({}).exec();

  const allRoutePairs = [];
  // Generate bidirectional pairs for every route definition
  for (const def of ROUTE_DEFINITIONS) {
    // Forward
    allRoutePairs.push({
      from: def.from,
      to: def.to,
      duration: def.duration,
      depSubs: def.depSubs,
      arrSubs: def.arrSubs,
    });
    // Reverse
    allRoutePairs.push({
      from: def.to,
      to: def.from,
      duration: def.duration,
      depSubs: def.arrSubs,
      arrSubs: def.depSubs,
    });
    // Also include Bengaluru alias if from or to is Bangalore
    if (def.from === 'Bangalore') {
      allRoutePairs.push({
        from: 'Bengaluru',
        to: def.to,
        duration: def.duration,
        depSubs: def.depSubs,
        arrSubs: def.arrSubs,
      });
    }
    if (def.to === 'Bangalore') {
      allRoutePairs.push({
        from: def.from,
        to: 'Bengaluru',
        duration: def.duration,
        depSubs: def.depSubs,
        arrSubs: def.arrSubs,
      });
    }
  }

  // Deduplicate routes by from:to
  const uniqueRoutesMap = new Map();
  for (const pair of allRoutePairs) {
    const key = `${pair.from.toLowerCase()}:::${pair.to.toLowerCase()}`;
    if (!uniqueRoutesMap.has(key)) {
      uniqueRoutesMap.set(key, pair);
    }
  }

  console.log(`Creating ${uniqueRoutesMap.size} unique interstate and intercity bus routes...`);
  const createdRoutes = [];
  for (const routeData of uniqueRoutesMap.values()) {
    const created = await Route.create({
      departureLocation: {
        name: routeData.from,
        subLocations: routeData.depSubs,
      },
      arrivalLocation: {
        name: routeData.to,
        subLocations: routeData.arrSubs,
      },
      duration: routeData.duration,
    });
    createdRoutes.push(created);
  }

  // Create buses for every route
  console.log('Populating buses for each route across multiple operators and time slots...');
  const busesToInsert = [];
  let busIndex = 0;

  for (const r of createdRoutes) {
    // Add 2-3 buses per route
    const numBuses = 3;
    for (let i = 0; i < numBuses; i++) {
      const op = BUS_OPERATORS[(busIndex + i) % BUS_OPERATORS.length];
      const time = DEPARTURE_HOURS[(busIndex + i * 2) % DEPARTURE_HOURS.length];
      const rating = BUS_RATINGS[(busIndex + i) % BUS_RATINGS.length];
      const img = HERO_IMAGES[(busIndex + i) % HERO_IMAGES.length];

      busesToInsert.push({
        operatorName: op.name,
        busType: op.type,
        departureTime: time,
        rating: [rating, Math.max(3.8, rating - 0.2), Math.min(5.0, rating + 0.1)],
        totalSeats: op.seats,
        routes: r._id,
        images: img,
        liveTracking: op.tracking,
        reschedulable: op.reschedule,
      });
    }
    busIndex++;
  }

  await Bus.insertMany(busesToInsert);
  console.log(`Successfully created ${createdRoutes.length} routes and ${busesToInsert.length} buses!`);

  console.log('\n=========================================');
  console.log('✅ ALL SEED DATA SUCCESSFULLY INSTALLED:');
  console.log(`- Routes: ${createdRoutes.length}`);
  console.log(`- Buses: ${busesToInsert.length}`);
  console.log(`- Community Discussions: ${SEED_DISCUSSIONS.length}`);
  console.log(`- Verified Authors: ${createdCustomers.length}`);
  console.log('=========================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('Seed execution error:', err);
  process.exit(1);
});
