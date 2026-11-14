import mongoose from 'mongoose';
import 'dotenv/config';
import { Route } from './models/route.js';
import { Bus } from './models/bus.js';
import { Customer } from './models/customer.js';
import { CommunityPost, COMMUNITY_CATEGORIES } from './models/communityPost.js';
import { PostComment } from './models/postComment.js';
import { ContentReport } from './models/contentReport.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tedbus';

const SEED_USERS = [
  {
    "name": "Priya Sharma",
    "email": "priya.sharma@tedbus.community",
    "age": 28,
    "gender": "Female",
    "picture": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    "badge": "Top Contributor"
  },
  {
    "name": "Rahul Verma",
    "email": "rahul.verma@tedbus.community",
    "age": 32,
    "gender": "Male",
    "picture": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    "badge": "Route Explorer"
  },
  {
    "name": "Ananya Iyer",
    "email": "ananya.iyer@tedbus.community",
    "age": 26,
    "gender": "Female",
    "picture": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    "badge": "Verified Traveler"
  },
  {
    "name": "Vikram Aditya",
    "email": "vikram.aditya@tedbus.community",
    "age": 35,
    "gender": "Male",
    "picture": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    "badge": "Community Champion"
  },
  {
    "name": "Neha Patel",
    "email": "neha.patel@tedbus.community",
    "age": 29,
    "gender": "Female",
    "picture": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    "badge": "Top Contributor"
  },
  {
    "name": "Karthik Rajan",
    "email": "karthik.rajan@tedbus.community",
    "age": 31,
    "gender": "Male",
    "picture": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
    "badge": "Verified Traveler"
  },
  {
    "name": "Sneha Reddy",
    "email": "sneha.reddy@tedbus.community",
    "age": 27,
    "gender": "Female",
    "picture": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150",
    "badge": "Route Explorer"
  },
  {
    "name": "Arjun Menon",
    "email": "arjun.menon@tedbus.community",
    "age": 34,
    "gender": "Male",
    "picture": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150",
    "badge": "Top Contributor"
  },
  {
    "name": "Pooja Deshmukh",
    "email": "pooja.deshmukh@tedbus.community",
    "age": 30,
    "gender": "Female",
    "picture": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    "badge": "Verified Traveler"
  },
  {
    "name": "Rohit Singh",
    "email": "rohit.singh@tedbus.community",
    "age": 33,
    "gender": "Male",
    "picture": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
    "badge": "Community Champion"
  },
  {
    "name": "Divya Nair",
    "email": "divya.nair@tedbus.community",
    "age": 25,
    "gender": "Female",
    "picture": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    "badge": "Verified Traveler"
  },
  {
    "name": "Manish Gupta",
    "email": "manish.gupta@tedbus.community",
    "age": 38,
    "gender": "Male",
    "picture": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    "badge": "Top Contributor"
  },
  {
    "name": "Swati Kulkarni",
    "email": "swati.kulkarni@tedbus.community",
    "age": 29,
    "gender": "Female",
    "picture": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    "badge": "Route Explorer"
  },
  {
    "name": "Deepak Choudhary",
    "email": "deepak.choudhary@tedbus.community",
    "age": 36,
    "gender": "Male",
    "picture": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    "badge": "Verified Traveler"
  },
  {
    "name": "Tanvi Joshi",
    "email": "tanvi.joshi@tedbus.community",
    "age": 27,
    "gender": "Female",
    "picture": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    "badge": "Route Explorer"
  }
];

const SEED_DISCUSSIONS = [
  {
    "title": "Bangalore to Goa Overnight: Top Operators, Route Quality & NH48 Condition",
    "content": "For anyone planning a weekend trip to Goa from Bangalore, taking an overnight sleeper bus is by far the most convenient and cost-effective option. The journey takes around 11 to 12 hours.\n\n### Recommended Route:\nBangalore -> Tumkur -> Chitradurga -> Hubli -> Dharwad -> Alnavar -> Anmod Ghat -> Mollem -> Panaji/Madgaon.\n\n### Top Operators:\n1. **TedBus Primo Volvo Multi-Axle:** Clean linens, punctual departures from Majestic and Yeshwantpur, and smooth highway driving.\n2. **Orange Tours & Travels:** Spacious berths, charging ports, and mineral water bottles provided.\n\n### Pro Tip:\nAvoid buses routing via Chorla Ghat at night during heavy rains as landslides can add 3-4 hours. Stick to the Anmod Ghat route!",
    "category": "Bus routes",
    "tags": [
      "BangaloreToGoa",
      "NH48",
      "SleeperBus",
      "RoadTrip"
    ],
    "routeFrom": "Bangalore",
    "routeTo": "Goa",
    "images": [
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800"
    ],
    "authorIndex": 0,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 1,
        "content": "Took the TedBus Primo 9:30 PM bus last Friday. Reached Panaji by 8:45 AM without any delays. Very comfortable suspension!"
      },
      {
        "authorIndex": 2,
        "content": "Do they halt at a decent place for dinner? Usually Tumkur dhabas are crowded."
      },
      {
        "authorIndex": 0,
        "content": "@Ananya Iyer They stop near Sira at a clean food plaza with spotless restrooms."
      }
    ]
  },
  {
    "title": "Hyderabad to Vijayawada: Express Highway vs Daytime Scania Buses",
    "content": "The 6-lane NH65 stretch between Hyderabad and Vijayawada is arguably one of the fastest and smoothest highway stretches in South India. Most AC buses cover this 275 km distance in just 4.5 to 5 hours.\n\nBuses depart round the clock from MGBS, LB Nagar, and Miyapur. For day travel, the luxury Multi-Axle Scania coaches by APSRTC Garuda Plus and Orange Travels are fantastic with scenic views of the Krishna river valley.",
    "category": "Bus routes",
    "tags": [
      "HyderabadToVijayawada",
      "NH65",
      "GarudaPlus",
      "DaytimeTravel"
    ],
    "routeFrom": "Hyderabad",
    "routeTo": "Vijayawada",
    "images": [
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800"
    ],
    "authorIndex": 3,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 6,
        "content": "The Suryapet food court halt has the best Andhra mirchi bajji and filter coffee!"
      }
    ]
  },
  {
    "title": "Delhi to Manali Overnight Volvos: Complete Highway Review & Atal Tunnel Guide",
    "content": "Taking the semi-sleeper Volvo or Scania from Kashmere Gate ISBT or Majnu Ka Tilla to Manali is an iconic North Indian backpacker rite of passage.\n\n### Highway Breakdown:\n- **Delhi to Chandigarh/Kiratpur:** Fast 4-lane expressway with smooth cruising.\n- **Kiratpur to Bilaspur & Mandi:** New 4-lane highway with bypass tunnels has eliminated hours of truck traffic!\n- **Aut Tunnel to Kullu:** Scenic riverbed drive along the Beas River.\n\n### Timing Advice:\nBoard between 6:00 PM and 8:00 PM to arrive in Manali around 7:30 AM to 9:00 AM, in time for hotel check-ins.",
    "category": "Bus routes",
    "tags": [
      "DelhiToManali",
      "Himachal",
      "Volvo",
      "MountainHighway"
    ],
    "routeFrom": "Delhi",
    "routeTo": "Manali",
    "images": [
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800"
    ],
    "authorIndex": 1,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 9,
        "content": "The new Kiratpur-Nerchowk section saves at least 3.5 hours compared to two years ago!"
      },
      {
        "authorIndex": 3,
        "content": "Always carry warm layers inside the cabin; AC runs cold even in mountain weather."
      }
    ]
  },
  {
    "title": "Mumbai to Pune via Yashwantrao Chavan Expressway: Best Timing & Boarding",
    "content": "The Mumbai-Pune Expressway is the lifeline of Maharashtra road travel. AC Shivneri and private multi-axle buses operate every 15 minutes.\n\n### Key Tips:\n- **Best Departure:** 6:30 AM on weekends beats the Navi Mumbai and Khandala ghat traffic.\n- **Pickup Points:** Borivali, Dadar TT, and Vashi Highway Plaza are best.\n- Travel time is consistently 3 to 3.5 hours up to Wakad or Swargate.",
    "category": "Bus routes",
    "tags": [
      "MumbaiToPune",
      "Expressway",
      "Shivneri",
      "WeekendCommute"
    ],
    "routeFrom": "Mumbai",
    "routeTo": "Pune",
    "images": [
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800"
    ],
    "authorIndex": 4,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 8,
        "content": "Wakad drop is super convenient for Hinjawadi tech park workers."
      }
    ]
  },
  {
    "title": "Chennai to Bangalore: E-City vs Majestic Drop Points Analyzed",
    "content": "When booking tickets from Chennai to Bangalore, picking the correct arrival boarding point can save you 1.5 hours of inner city commute.\n\nIf you work or live in South Bangalore (Koramangala, HSR Layout, BTM, Sarjapur), choose Electronic City or Silk Board drop.\nIf heading to Central or North Bangalore, stay on the bus until Shantinagar or Majestic Kempegowda Bus Station.",
    "category": "Bus routes",
    "tags": [
      "ChennaiToBangalore",
      "CommuteHacks",
      "BoardingPoints"
    ],
    "routeFrom": "Chennai",
    "routeTo": "Bangalore",
    "images": [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800"
    ],
    "authorIndex": 5,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 0,
        "content": "Silk Board drop is a lifesaver on Monday mornings to catch the yellow line metro."
      }
    ]
  },
  {
    "title": "Delhi to Jaipur Superfast Expressways: 4.5 Hour Bus Commute Experience",
    "content": "With the modern Delhi-Mumbai Expressway and Gurgaon-Jaipur bypass corridors, bus travel between Delhi and the Pink City has never been faster. Multiple electric and Volvo buses complete this run in under 5 hours with zero fatigue.",
    "category": "Bus routes",
    "tags": [
      "DelhiToJaipur",
      "ElectricBus",
      "PinkCity",
      "Expressway"
    ],
    "routeFrom": "Delhi",
    "routeTo": "Jaipur",
    "images": [
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800"
    ],
    "authorIndex": 9,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 1,
        "content": "Zingbus and IntrCity both provide smooth rides on this route with guaranteed on-time arrival."
      }
    ]
  },
  {
    "title": "Kochi to Bangalore Night Sleeper: Palakkad Gap & Coimbatore Bypass Guide",
    "content": "Connecting Kerala's commercial capital to Bangalore is a bustling corridor. Buses take NH544 through the Palakkad Gap, bypassing Coimbatore, Erode, and Salem.\n\nBooking Upper Berth sleepers ensures uninterrupted sleep as the bus glides smoothly across the 4-lane national highway.",
    "category": "Bus routes",
    "tags": [
      "KochiToBangalore",
      "KeralaBuses",
      "NightSleeper",
      "NH544"
    ],
    "routeFrom": "Kochi",
    "routeTo": "Bangalore",
    "images": [
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800"
    ],
    "authorIndex": 7,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 10,
        "content": "Boarding at Edappally Toll is much quicker than Vyttila during evening rush hour!"
      }
    ]
  },
  {
    "title": "Weekend Escape to Coorg & Madikeri: How to Plan via Mysore Bus Transit",
    "content": "Coorg (Kodagu) is known as the Scotland of India for its mist-clad coffee plantations, spice gardens, and cascading waterfalls. Here is how to plan a seamless 2-day itinerary entirely using bus connectivity from Bangalore.\n\n### Travel Logistics:\n- Take a Friday night sleeper from Bangalore Satellite Bus Station or Majestic directly to Madikeri (6.5 hours).\n- Alternatively, take a fast 2-hour bus to Mysore via the expressway, explore Mysore Palace, then hop onto a KSRTC Rajahamsa up to Madikeri.\n\n### Must-Visit Spots in Madikeri:\n1. **Raja's Seat:** Sunset vantage point overlooking lush valleys.\n2. **Abbey Falls:** Located 8 km from town inside fragrant coffee estates.\n3. **Dubare Elephant Camp:** 30 km towards Kushalnagar on the banks of River Cauvery.",
    "category": "Destinations",
    "tags": [
      "Coorg",
      "WeekendGetaway",
      "CoffeePlantations",
      "KarnatakaTourism"
    ],
    "routeFrom": "Bangalore",
    "routeTo": "Mysore",
    "images": [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"
    ],
    "authorIndex": 2,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 0,
        "content": "Did this exact itinerary last month! The early morning fog at Raja Seat was magical."
      },
      {
        "authorIndex": 4,
        "content": "Make sure to sample authentic Coorg Pandi Curry or Akki Roti near the private bus stand."
      }
    ]
  },
  {
    "title": "Discovering Hampi: The Ancient Ruins by Overnight Sleeper from Bangalore",
    "content": "Hampi is a UNESCO World Heritage site that transports you straight back into the 14th century Vijayanagara Empire. Boulders balanced precariously over turquoise riverbanks, intricate stone temples, and chilled-out cafe culture make it an unforgettable weekend destination.\n\n### How to Reach by Bus:\n- Direct sleeper buses run daily from Bangalore to Hosapete (Hospet).\n- From Hospet central bus stand, local buses and autos run every 15 minutes to Hampi Bazaar (12 km).\n\nRent a bicycle or moped to explore the Virupaksha Temple, Lotus Mahal, and sunset from Matanga Hill!",
    "category": "Destinations",
    "tags": [
      "Hampi",
      "UNESCOHeritage",
      "HistoryBuff",
      "SoloBackpacker"
    ],
    "routeFrom": "Bangalore",
    "routeTo": "Hubli",
    "images": [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800"
    ],
    "authorIndex": 0,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 3,
        "content": "Watching the sunrise from Matanga Hill is easily in my top 3 travel experiences across India."
      }
    ]
  },
  {
    "title": "Pondicherry French Quarter Walk & Beach Cafes: The ECR Coastal Journey",
    "content": "Puducherry is just a 3-hour scenic coastal ride along the East Coast Road (ECR) from Chennai. Pastel yellow colonial mansions, bougainvillea hanging over wooden doorways, chic bakeries, and the serene Promenade Beach make it a paradise for relaxed weekends.",
    "category": "Destinations",
    "tags": [
      "Pondicherry",
      "FrenchQuarter",
      "ECR",
      "WeekendEscape"
    ],
    "routeFrom": "Chennai",
    "routeTo": "Pondicherry",
    "images": [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"
    ],
    "authorIndex": 5,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 2,
        "content": "Croissants at Cafe des Arts and cycling around White Town is the best way to spend a Sunday morning."
      }
    ]
  },
  {
    "title": "Ooty & Nilgiri Hills: Scenic Hill Climb from Coimbatore",
    "content": "Taking a morning bus from Gandhipuram Coimbatore up the hairpin bends of Mettupalayam and Coonoor is one of the most picturesque hill journeys in South India. Temperatures drop pleasantly as tea gardens stretch endlessly across the misty slopes.",
    "category": "Destinations",
    "tags": [
      "Ooty",
      "Nilgiris",
      "HillStation",
      "TeaGardens"
    ],
    "routeFrom": "Coimbatore",
    "routeTo": "Ooty",
    "images": [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800"
    ],
    "authorIndex": 7,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 6,
        "content": "Sit on the left side of the bus when climbing up for panoramic valley views!"
      }
    ]
  },
  {
    "title": "Udaipur The City of Lakes: Rajasthan Heritage Route from Ahmedabad",
    "content": "Just a 5-hour comfortable bus journey from Ahmedabad, Udaipur greets travelers with shimmering Lake Pichola, the majestic City Palace, and vibrant bazaars. AC buses provide seamless pickup from Paldi and drop off right near Udiapole in the city center.",
    "category": "Destinations",
    "tags": [
      "Udaipur",
      "CityOfLakes",
      "Rajasthan",
      "HeritageTravel"
    ],
    "routeFrom": "Ahmedabad",
    "routeTo": "Udaipur",
    "images": [
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800"
    ],
    "authorIndex": 4,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 1,
        "content": "Buses leave every hour. Great for a quick spontaneous weekend getaway."
      }
    ]
  },
  {
    "title": "Rishikesh & Haridwar: Spiritual Riverbank Bus Route from Delhi",
    "content": "Looking to reset from the corporate hustle? Delhi to Rishikesh takes just 5.5 to 6 hours by AC Volvo. Wake up to the soothing sound of the holy Ganga, attend the Triveni Ghat evening aarti, and explore Beatles Ashram.",
    "category": "Destinations",
    "tags": [
      "Rishikesh",
      "YogaCapital",
      "SpiritualTravel",
      "Uttarakhand"
    ],
    "routeFrom": "Delhi",
    "routeTo": "Rishikesh",
    "images": [
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800"
    ],
    "authorIndex": 9,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 0,
        "content": "Buses drop off right near Nepali Farm or the private bus stand. Very convenient for hostel transfers."
      }
    ]
  },
  {
    "title": "Munnar Tea Trails & Mattupetty Dam: Kerala Hill Route from Kochi",
    "content": "Munnar is heaven on earth. The 4-hour scenic bus ride from Kochi through Kothamangalam passes cascading Cheeyappara and Valara waterfalls. Perfect for tea tasting, trekking Anamudi peak, and serene boathouse rides.",
    "category": "Destinations",
    "tags": [
      "Munnar",
      "KeralaTourism",
      "TeaEstates",
      "GodsOwnCountry"
    ],
    "routeFrom": "Kochi",
    "routeTo": "Munnar",
    "images": [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"
    ],
    "authorIndex": 10,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 7,
        "content": "KSRTC Fast Passenger or Super Fast buses are dirt cheap and super frequent on this route!"
      }
    ]
  },
  {
    "title": "My First Solo Bus Trip from Mumbai to Goa: Sunset on the Konkan Highway",
    "content": "I was hesitant about booking a 12-hour overnight bus alone as a woman, but my experience on the TedBus Primo AC Sleeper completely changed my perspective.\n\nFrom the moment I boarded at Borivali, the bus staff was courteous, verified every passenger ticket with an OTP, and the berth was spotless with clean bedsheets and a sealed water bottle.\n\nWaking up to the lush palms of North Goa at sunrise with coastal breeze blowing was pure serenity. If you are on the fence about solo road travel, take the leap!",
    "category": "Travel experiences",
    "tags": [
      "SoloTravel",
      "MumbaiToGoa",
      "WomenTraveler",
      "FirstTrip"
    ],
    "routeFrom": "Mumbai",
    "routeTo": "Goa",
    "images": [
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800"
    ],
    "authorIndex": 0,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 2,
        "content": "This is so inspiring Priya! I was worried about luggage safety on sleepers, but your post gives me confidence."
      },
      {
        "authorIndex": 8,
        "content": "Primo buses have CCTV and emergency buttons which makes a huge difference."
      }
    ]
  },
  {
    "title": "Monsoon Magic: Driving through the Western Ghats between Pune and Goa",
    "content": "If you have never travelled through the Western Ghats during July or August, you are missing out on one of nature's greatest spectacles. Waterfalls cascade right off the cliffside next to the highway, emerald green rice paddies stretch endlessly, and rolling clouds envelope the bus.\n\nTook the daytime Scania bus from Swargate. Pure cinematic bliss!",
    "category": "Travel experiences",
    "tags": [
      "MonsoonTravel",
      "WesternGhats",
      "PuneToGoa",
      "NatureLover"
    ],
    "routeFrom": "Pune",
    "routeTo": "Goa",
    "images": [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800"
    ],
    "authorIndex": 1,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 3,
        "content": "Amboli Ghat during peak monsoon is unreal. Glad you experienced it!"
      }
    ]
  },
  {
    "title": "My First 14-Hour Electric Bus Journey on Zingbus EV: Quiet, Smooth & Zero Fumes",
    "content": "I was skeptical about long-distance electric buses, but my recent 300 km trip on an intercity EV sleeper was astonishing. Zero diesel rumble, no exhaust odor inside the cabin, and ultra-smooth acceleration made sleeping effortless.\n\nThe 35-minute charging stop coincided perfectly with dinner at a modern highway plaza equipped with high-speed DC fast chargers.",
    "category": "Travel experiences",
    "tags": [
      "ElectricVehicles",
      "ZingbusEV",
      "GreenTravel",
      "EcoFriendly"
    ],
    "routeFrom": "Delhi",
    "routeTo": "Jaipur",
    "images": [
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800"
    ],
    "authorIndex": 1,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 9,
        "content": "The lack of engine vibration is the biggest win for sleeper cabins. You actually wake up refreshed!"
      }
    ]
  },
  {
    "title": "Crossing the Pamban Corridor: Coastal Bus Ride from Madurai to Rameswaram",
    "content": "Riding across the Pamban sea bridge by road as turquoise waters glisten on both sides is an unforgettable feeling. The salty sea breeze, fishing boats bobbing in the distance, and the spiritual energy of Rameswaram makes this an epic day journey.",
    "category": "Travel experiences",
    "tags": [
      "Rameswaram",
      "PambanBridge",
      "CoastalRoad",
      "TamilNadu"
    ],
    "routeFrom": "Madurai",
    "routeTo": "Chennai",
    "images": [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"
    ],
    "authorIndex": 5,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 7,
        "content": "Truly iconic! Make sure to take an early morning bus when sunrise hits the ocean."
      }
    ]
  },
  {
    "title": "Backpacking Across Rajasthan on RSRTC Goldline & Private AC Sleepers",
    "content": "Covered Jaipur, Jodhpur, and Udaipur in 5 days exclusively by bus. Booking through TedBus made managing multiple legs simple. The drivers were punctual, and overnight journeys saved me two full nights of hotel costs!",
    "category": "Travel experiences",
    "tags": [
      "RajasthanBackpacking",
      "BudgetTravel",
      "SoloTraveler",
      "DesertVibes"
    ],
    "routeFrom": "Jaipur",
    "routeTo": "Udaipur",
    "images": [
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800"
    ],
    "authorIndex": 3,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 4,
        "content": "Overnight bus travel as a substitute for hotel rooms is the golden rule of budget backpacking."
      }
    ]
  },
  {
    "title": "The Mist-Covered Hairpin Bends: Night Journey from Bangalore to Ooty",
    "content": "Waking up at 5:00 AM as the bus climbed the 36 hairpin bends through Bandipur and Mudumalai forests was thrilling. We even spotted wild spotted deers and an elephant grazing by the roadside before the morning sun broke through the eucalyptus trees.",
    "category": "Travel experiences",
    "tags": [
      "WildlifeSpotted",
      "NilgiriClimb",
      "Bandipur",
      "ForestHighway"
    ],
    "routeFrom": "Bangalore",
    "routeTo": "Ooty",
    "images": [
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800"
    ],
    "authorIndex": 6,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 0,
        "content": "Bandipur night traffic rules mean buses wait till 6 AM gate opening. It is so quiet and peaceful there."
      }
    ]
  },
  {
    "title": "Connecting East Coast to Silicon Plateau: 16 Hours from Visakhapatnam to Bangalore",
    "content": "Long haul bus journeys have their own meditative charm. Watching the landscape transition from the lush Andhra coast through rayalaseema hills down to Karnataka's tech capital gave me uninterrupted time to read two full books.",
    "category": "Travel experiences",
    "tags": [
      "LongHaul",
      "CoastToPlains",
      "SlowTravel",
      "ReadingOnTheGo"
    ],
    "routeFrom": "Visakhapatnam",
    "routeTo": "Bangalore",
    "images": [
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800"
    ],
    "authorIndex": 11,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 1,
        "content": "A high-capacity power bank and noise-cancelling headphones are lifesavers on 14+ hour rides."
      }
    ]
  },
  {
    "title": "10 Essential Hacks for Overnight Sleeper Bus Journeys in India",
    "content": "After clocking over 20,000 km across interstate buses, here are my top 10 verified hacks for a smooth journey:\n\n1. **Pick the Right Berth:** Upper berths offer 100% privacy with sliding windows and zero foot traffic. Lower berths are easier to access for seniors.\n2. **Avoid the Last Row:** Seats directly over the rear axle experience maximum road bounce.\n3. **Carry an Eye Mask & Earplugs:** Highway dhabas and honking trucks can disrupt light sleepers.\n4. **Dress in Layers:** Bus AC can be unpredictable; hoodies or light stoles are essentials.\n5. **Keep Essentials in a Sling Bag:** Never put wallet, phone, power bank, or medicines in overhead luggage racks.\n6. **Check Live Tracking Before Leaving:** Track your bus 45 minutes prior so you avoid standing in the rain or heat at the boarding point.\n7. **Snack Smart:** Avoid overly greasy food right before boarding.\n8. **Note the Bus Registration Number:** Take a photo of the bus number plate during midnight rest stop halts!\n9. **Water Bottle in Reach:** Store your bottle in the door mesh before lying down.\n10. **Book Verified Operators:** Look for the TedBus Primo badge for guaranteed on-time departure and sanitised cabins.",
    "category": "Travel tips",
    "tags": [
      "TravelHacks",
      "SleeperBus",
      "PackingList",
      "ProTips"
    ],
    "images": [
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800"
    ],
    "authorIndex": 3,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 0,
        "content": "Tip #8 is crucial! At midnight highway halts, dozens of identical white Volvo buses park together. Always check the number plate."
      },
      {
        "authorIndex": 1,
        "content": "Bookmarked! Sharing this with my college group."
      }
    ]
  },
  {
    "title": "How to Choose the Best Seat: Window vs Aisle, Upper vs Lower Berth Explained",
    "content": "Confused about seat layouts when booking on TedBus?\n\n- **Single Upper (Left):** Best for solo travelers who want absolute uninterrupted privacy.\n- **Double Lower (Right):** Ideal for couples, friends, or elderly travelers who prefer minimal climbing.\n- **Middle of the Bus (Rows 3-6):** Minimal bumpiness compared to the extreme back seats over the rear axle.\n- **Front Row (Row 1):** Great legroom on seater buses, but can have extra headlights glare on sleepers.",
    "category": "Travel tips",
    "tags": [
      "SeatSelection",
      "Guide",
      "BookingTips",
      "Comfort"
    ],
    "images": [
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800"
    ],
    "authorIndex": 4,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 2,
        "content": "Always pick rows 3 to 5 on the right side if you get motion sickness. Much smoother ride!"
      }
    ]
  },
  {
    "title": "Packing Checklist for Long Distance Bus Journeys: The Ultimate Carry-On Guide",
    "content": "Keep your main suitcase in the luggage belly and keep these carry-on items in your personal backpack:\n- 20,000mAh Power Bank & 2m long charging cable\n- Disinfectant wet wipes & hand sanitizer\n- Lip balm & light moisturizer (AC air dries skin)\n- Inflatable neck pillow & fleece blanket\n- Electrolyte sachets and dry fruits",
    "category": "Travel tips",
    "tags": [
      "PackingChecklist",
      "CarryOn",
      "TravelSmart"
    ],
    "images": [
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800"
    ],
    "authorIndex": 2,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 6,
        "content": "The long charging cable tip is gold! Some bus USB plugs are near the foot of the berth."
      }
    ]
  },
  {
    "title": "How to Survive Mountain Ghat Hairpin Bends Without Motion Sickness",
    "content": "Heading to Ooty, Munnar, Manali, or Mahabaleshwar? Ghat roads can trigger nausea if unprepared.\n- Take an Avomine or ginger tablet 45 minutes before ghat section begins.\n- Keep your eyes focused on the distant horizon rather than looking at your phone screen.\n- Carry citrus candies, mints, and a personal trash bag.\n- Sit in rows 2 to 4 near the middle axis of the vehicle.",
    "category": "Travel tips",
    "tags": [
      "MotionSickness",
      "GhatRoads",
      "HealthTips",
      "HillStation"
    ],
    "images": [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800"
    ],
    "authorIndex": 8,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 0,
        "content": "Sipping peppermint tea before boarding works wonders as well!"
      }
    ]
  },
  {
    "title": "Booking in Advance vs Last-Minute Tatkal: Best Practices for Holiday Weekends",
    "content": "During Diwali, Dussehra, Pongal, and long holiday weekends, bus ticket prices can fluctuate heavily based on dynamic pricing.\n- Book at least 10 to 14 days in advance for holiday dates.\n- Use TedBus free cancellation and reschedule options if plans are tentative.\n- For emergency travel, check RTC special extra buses which open 24 hours prior at fixed government fares.",
    "category": "Travel tips",
    "tags": [
      "Tatkal",
      "HolidayBooking",
      "PriceHacks",
      "TedBusDeals"
    ],
    "images": [
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800"
    ],
    "authorIndex": 11,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 3,
        "content": "RTC extra buses are a lifesaver when private operators double their fares during festivals."
      }
    ]
  },
  {
    "title": "Managing Food & Hydration on Long Overnight Routes",
    "content": "Midnight highway meals can be heavy and upset your stomach while lying flat in a sleeper berth. Have a wholesome dinner before boarding, drink small sips of water rather than chugging a litre, and carry light biscuits or trail mix for sudden hunger pangs.",
    "category": "Travel tips",
    "tags": [
      "FoodAndHydration",
      "HealthyTravel",
      "OvernightJourney"
    ],
    "images": [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"
    ],
    "authorIndex": 12,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 5,
        "content": "Spot on. Heavy oily dhabas at 1:00 AM are a recipe for insomnia."
      }
    ]
  },
  {
    "title": "Mobile Signal & Internet Connectivity Along Major Indian National Highways",
    "content": "Wondering if you can work or stream Netflix on the bus? Jio and Airtel offer reliable 5G/4G coverage along NH44, NH48, and NH65. Download your movies, podcasts, and work documents offline before entering ghat sections like Khandala, Anmod, or Kullu valley where signal drops.",
    "category": "Travel tips",
    "tags": [
      "HighwayInternet",
      "RemoteWork",
      "5GCoverage",
      "Entertainment"
    ],
    "images": [
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800"
    ],
    "authorIndex": 1,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 9,
        "content": "Always download your Google Maps offline areas for the route so you can track progress without network."
      }
    ]
  },
  {
    "title": "Solo Female Travelers Guide: Night Bus Safety, Boarding Points & Red Flags",
    "content": "Safety is paramount, especially when boarding late-night interstate buses alone.\n\nHere is a verified safety checklist:\n- **Choose Main Boarding Hubs:** Always board from well-lit central terminals (like Majestic, Koyambedu, or Kashmere Gate) rather than isolated highway flyovers.\n- **Women-Only Adjacent Seats:** Look for operators that restrict adjacent booking to female passengers when a woman has booked single berths.\n- **Share Live Trip Link:** Use the TedBus in-app live tracking link to share your live coordinates with family via WhatsApp.\n- **Driver & Staff Verification:** Primo buses display the driver badge, police verification status, and conductor phone number prominently at the cabin entrance.\n- **Emergency Contacts:** Save National Emergency Helpline 112 and highway police speed dials before travelling.",
    "category": "Safety and recommendations",
    "tags": [
      "SoloFemaleTravel",
      "WomenSafety",
      "SafeTravel",
      "PrimoVerified"
    ],
    "images": [
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800"
    ],
    "authorIndex": 0,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 2,
        "content": "Thank you Priya for sharing this! The women-only adjacent seat feature on TedBus gives so much peace of mind."
      },
      {
        "authorIndex": 4,
        "content": "Great points. Keeping a small torch and power bank in your crossbody bag is also very handy."
      }
    ]
  },
  {
    "title": "Luggage Safety & Insurance: Is the \u20b915 Travel Protection Worth It?",
    "content": "We recently tested the claim process when a passenger lost their laptop backpack from an interstate coach.\nThe \u20b915 protection covered emergency baggage loss and medical delays with instant OTP verification.\nFor just fifteen rupees, never uncheck this box during checkout!",
    "category": "Safety and recommendations",
    "tags": [
      "LuggageSafety",
      "Insurance",
      "Protection",
      "SafeBooking"
    ],
    "images": [
      "https://images.unsplash.com/photo-1553531384-cc64ac80f931?w=800"
    ],
    "authorIndex": 1,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 3,
        "content": "Completely agree. \u20b915 is negligible for complete peace of mind on long trips."
      }
    ]
  },
  {
    "title": "Primo Buses vs Regular Private Operators: Is the Extra \u20b9150 Worth It?",
    "content": "Ever wonder what the TedBus Primo badge actually guarantees?\n- Guaranteed on-time departure with refund guarantee if delayed over 30 mins.\n- Sanitized cabins with fresh sealed blankets.\n- Trained and background-verified drivers.\n- Functioning AC and working power outlets on every seat.\nHaving taken both on the Bangalore-Hyderabad route, the extra \u20b9150 is easily worth every penny.",
    "category": "Safety and recommendations",
    "tags": [
      "PrimoVerified",
      "OperatorReview",
      "QualityAssurance"
    ],
    "images": [
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800"
    ],
    "authorIndex": 3,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 6,
        "content": "The refund guarantee when a bus is late gives real accountability to operators."
      }
    ]
  },
  {
    "title": "Emergency Protocols on Highway Buses: What to Do in Case of Breakdown",
    "content": "Breakdowns can happen even to the best fleet vehicles. Here is what you should do:\n1. Remain calm and stay inside the vehicle until the driver clears the hazard zone.\n2. Note your GPS coordinates and milestone marker on the highway.\n3. Call TedBus 24/7 dedicated support immediately via the in-app help button.\n4. Licensed operators are required to arrange a replacement coach within 90 minutes or process a full refund.",
    "category": "Safety and recommendations",
    "tags": [
      "BreakdownHelp",
      "EmergencyProtocols",
      "CustomerSafety"
    ],
    "images": [
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800"
    ],
    "authorIndex": 7,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 1,
        "content": "The SOS button in the app directly calls customer support with your booking details preloaded."
      }
    ]
  },
  {
    "title": "Night Boarding Safety Checklist: Avoiding Isolated Highway Tolls",
    "content": "Many private buses list highway toll gates or flyover underpasses as boarding points. If travelling late at night or with family, always choose the primary city terminal or certified travel agency lounge instead. The extra 15 minutes of auto ride is worth staying safe in well-lit surroundings.",
    "category": "Safety and recommendations",
    "tags": [
      "NightBoarding",
      "SafeStops",
      "FamilyTravel"
    ],
    "images": [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"
    ],
    "authorIndex": 8,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 0,
        "content": "Agreed! Avoid dark bypass pickups at 1:00 AM under any circumstances."
      }
    ]
  },
  {
    "title": "Senior Citizens & Travelers with Mobility Needs: Essential Booking Advice",
    "content": "If booking tickets for elderly parents or family members:\n- Strictly select Lower Deck berths in row 1 or row 2.\n- Ensure the bus is a Multi-Axle model with air suspension for minimal vertical bounce.\n- Verify that boarding points do not involve overhead pedestrian footbridges.",
    "category": "Safety and recommendations",
    "tags": [
      "SeniorTravelers",
      "Accessibility",
      "ComfortFirst"
    ],
    "images": [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800"
    ],
    "authorIndex": 11,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 4,
        "content": "Lower berth 1 or 2 is closest to the entry stairs. Best for my parents."
      }
    ]
  },
  {
    "title": "Fire Safety & Emergency Exits: Know Before You Sleep",
    "content": "Every modern sleeper coach is equipped with emergency escape roof hatches, rear emergency windows, and glass-breaking safety hammers located near rows 3 and 7. Take 30 seconds upon boarding to spot the nearest hammer and fire extinguisher.",
    "category": "Safety and recommendations",
    "tags": [
      "FireSafety",
      "EmergencyExits",
      "SafetyFirst"
    ],
    "images": [
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800"
    ],
    "authorIndex": 9,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 3,
        "content": "Crucial awareness. Safety takes 10 seconds of observation."
      }
    ]
  },
  {
    "title": "Future of Indian Intercity Travel: Electric Sleeper Buses & Expressways",
    "content": "With the rapid expansion of access-controlled expressways like the Bengaluru-Mysuru Expressway, Mumbai-Nagpur Samruddhi Mahamarg, and Delhi-Mumbai Expressway, intercity bus travel in India is undergoing a massive revolution.\n\nElectric double-decker sleepers and high-speed multi-axle electric coaches are entering service on routes up to 400 km. Zero engine noise, zero cabin vibration, and ultra-smooth regenerative braking make sleeper travel feel like a luxury cruise!\n\nWhat has been your experience on modern EV or Multi-Axle buses? Share your thoughts below!",
    "category": "General discussions",
    "tags": [
      "EVBuses",
      "FutureOfTravel",
      "Expressways",
      "Innovation",
      "India"
    ],
    "images": [
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800"
    ],
    "authorIndex": 1,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 0,
        "content": "Rode the Zingbus EV from Delhi to Jaipur last month. The silent cabin made sleeping so easy!"
      },
      {
        "authorIndex": 3,
        "content": "The Samruddhi Mahamarg cut Mumbai-Nagpur road travel time from 16 hours down to under 10 hours. Incredible infrastructure."
      }
    ]
  },
  {
    "title": "Favorite Highway Dhabas & Rest Stops Across Indian Corridors",
    "content": "Every frequent bus commuter has their favorite highway food haven.\nFrom Murthal parathas on NH44 to Davanagere benne dosas on NH48, and spicy Andhra meals along NH65 near Suryapet.\n\nDrop your absolute favorite highway food stop and the route it is located on!",
    "category": "General discussions",
    "tags": [
      "HighwayFood",
      "Dhabas",
      "Foodie",
      "RoadTrips"
    ],
    "images": [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"
    ],
    "authorIndex": 5,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 1,
        "content": "Amrik Sukhdev at Murthal for white butter parathas on the Delhi-Chandigarh run! Unbeatable."
      },
      {
        "authorIndex": 4,
        "content": "Aryas on the Chennai-Bangalore highway at Vellore bypass serves top-notch filter coffee and hot vadas."
      }
    ]
  },
  {
    "title": "Luggage Policies Across Bus Operators: How Strict Are They in Practice?",
    "content": "Technically, most bus operators advertise a 15-20 kg luggage limit per passenger. In practice, as long as you have one standard trolley bag and one backpack, conductors rarely weigh luggage. However, charges apply for commercial cardboard cartons or oversized musical gear.\n\nWhat has been your luggage experience?",
    "category": "General discussions",
    "tags": [
      "LuggageRules",
      "BaggagePolicy",
      "TravelAdvice"
    ],
    "images": [
      "https://images.unsplash.com/photo-1553531384-cc64ac80f931?w=800"
    ],
    "authorIndex": 8,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 7,
        "content": "Carried a full camping tent and trekking rucksack without any extra fee on Bangalore-Manali route."
      }
    ]
  },
  {
    "title": "Volvo vs Scania vs BharatBenz vs Tata Prima: Which Coach Do You Prefer?",
    "content": "The battle of commercial bus chassis! Volvo B11R Multi-Axle has legendary highway cruising and air suspension. Scania Metrolink feels modern with punchy transmission. BharatBenz sleeper coaches are winning hearts on affordability and cabin soundproofing.\n\nWhich coach manufacturer gives you the most restful sleep?",
    "category": "General discussions",
    "tags": [
      "BusEnthusiast",
      "VolvoB11R",
      "Scania",
      "BharatBenz"
    ],
    "images": [
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800"
    ],
    "authorIndex": 9,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 1,
        "content": "Volvo 9600s with the ultra-low floor and I-Shift transmission are supreme."
      }
    ]
  },
  {
    "title": "Night Owls vs Morning Birds: Do You Prefer Overnight Sleepers or Day Buses?",
    "content": "There are two kinds of travelers: those who love sleeping through the night to save daylight hours, and those who love watching the countryside through huge tinted panoramic windows with tea halts along the way.\n\nWhich camp are you in?",
    "category": "General discussions",
    "tags": [
      "DayVsNight",
      "TravelStyle",
      "CommunityDebate"
    ],
    "images": [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800"
    ],
    "authorIndex": 2,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 0,
        "content": "Overnight sleepers for long distances, daytime buses for ghat routes and hill stations!"
      }
    ]
  },
  {
    "title": "The Evolution of Bus Bookings: From Dusty Counters to In-App Live Tracking",
    "content": "Remember queuing up at physical travel agencies in the 2000s, hoping your handwritten paper ticket was valid? Today with TedBus, you pick your exact berth, track the coach on Google Maps, pay via UPI in seconds, and board with an electronic QR code. What tech feature would you like to see next?",
    "category": "General discussions",
    "tags": [
      "TravelTech",
      "Nostalgia",
      "Evolution",
      "TedBusApp"
    ],
    "images": [
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800"
    ],
    "authorIndex": 12,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 3,
        "content": "In-cabin meal pre-ordering before highway stops would be a game-changer!"
      }
    ]
  },
  {
    "title": "Solo Travel vs Group Road Trips: What Has Taught You More About India?",
    "content": "Traveling in a group is full of jokes, shared dhabas, and memorable chaos. But traveling solo in an interstate bus makes you strike up conversations with strangers from completely different states, backgrounds, and languages.\n\nTell us about an unforgettable interaction you had with a fellow bus passenger!",
    "category": "General discussions",
    "tags": [
      "SoloTravel",
      "HeartwarmingStories",
      "IncredibleIndia"
    ],
    "images": [
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800"
    ],
    "authorIndex": 14,
    "likesCount": 0,
    "viewsCount": 0,
    "comments": [
      {
        "authorIndex": 2,
        "content": "Shared tea with a grandma on the Madurai bus who gave me homemade Murukku and travel blessings. Unforgettable."
      }
    ]
  }
];

const RAW_CORRIDORS = [
  { from: "Bangalore", to: "Hyderabad", duration: 8.5, depSubs: ["Majestic", "Electronic City", "Silk Board", "Hebbal", "Yelahanka"], arrSubs: ["Miyapur", "Kukatpally", "Ameerpet", "Lakdikapul", "LB Nagar"] },
  { from: "Bangalore", to: "Chennai", duration: 6.0, depSubs: ["Majestic", "Shantinagar", "Indiranagar", "KR Puram", "Hosakote Toll"], arrSubs: ["Koyambedu", "Guindy Metro", "Tambaram", "Ashok Nagar", "Sriperumbudur"] },
  { from: "Bangalore", to: "Goa", duration: 11.0, depSubs: ["Majestic", "Yeshwantpur", "Jalahalli Cross", "Tumkur Bypass"], arrSubs: ["Panaji KTC", "Mapusa", "Margao KTC", "Porvorim"] },
  { from: "Bangalore", to: "Coimbatore", duration: 6.5, depSubs: ["Majestic", "Madiwala", "Electronic City", "Attibele Toll"], arrSubs: ["Gandhipuram", "Hopes College", "KMCH", "Singanallur"] },
  { from: "Bangalore", to: "Kochi", duration: 9.5, depSubs: ["Majestic", "Madiwala", "Electronic City", "Hosur"], arrSubs: ["Vyttila Hub", "Edappally Toll", "Aluva Flyover", "Palarivattom"] },
  { from: "Bangalore", to: "Mysore", duration: 3.0, depSubs: ["Majestic", "Satellite BS (Kengeri)", "Bidadi Bypass"], arrSubs: ["Suburban Bus Stand", "KSRTC Central BS", "Columbia Asia Circle"] },
  { from: "Bangalore", to: "Madurai", duration: 7.5, depSubs: ["Majestic", "Madiwala", "Electronic City"], arrSubs: ["Mattuthavani BS", "Periyar BS", "Arapalayam"] },
  { from: "Bangalore", to: "Tirupati", duration: 4.5, depSubs: ["Majestic", "KR Puram", "Hosakote", "Kolar Bypass"], arrSubs: ["Tirupati RTC Central", "Alipiri Gate", "Leela Mahal Circle"] },
  { from: "Bangalore", to: "Vijayawada", duration: 11.0, depSubs: ["Majestic", "Hebbal", "Devanahalli Toll"], arrSubs: ["Pandit Nehru BS", "Benz Circle", "Bhavanipuram"] },
  { from: "Bangalore", to: "Visakhapatnam", duration: 17.0, depSubs: ["Majestic", "Hebbal", "Chikkaballapur"], arrSubs: ["Dwaraka Bus Station", "Gajuwaka", "Maddilapalem"] },
  { from: "Bangalore", to: "Mangalore", duration: 7.5, depSubs: ["Majestic", "Yeshwantpur", "Nelamangala"], arrSubs: ["KSRTC State BS", "Pumpwell Circle", "Jyothi Circle"] },
  { from: "Bangalore", to: "Udupi", duration: 8.5, depSubs: ["Majestic", "Yeshwantpur", "Kunigal"], arrSubs: ["Service Bus Stand", "Manipal Tiger Circle", "Santhekatte"] },
  { from: "Bangalore", to: "Ooty", duration: 7.0, depSubs: ["Majestic", "Satellite BS", "Mysore Bypass", "Bandipur"], arrSubs: ["Ooty Bus Stand", "Charring Cross", "Botanical Garden Gate"] },
  { from: "Bangalore", to: "Pondicherry", duration: 7.0, depSubs: ["Majestic", "Madiwala", "Electronic City", "Hosur"], arrSubs: ["New Bus Stand", "JIPMER Circle", "ECR Toll"] },
  { from: "Bangalore", to: "Hubli", duration: 6.5, depSubs: ["Majestic", "Yeshwantpur", "Tumkur Toll"], arrSubs: ["Old Bus Stand", "CBT Bus Terminal", "Gokul Road"] },
  { from: "Bangalore", to: "Belgaum", duration: 8.5, depSubs: ["Majestic", "Yeshwantpur", "Tumkur"], arrSubs: ["Central Bus Stand", "Chennamma Circle", "Udyambag"] },
  { from: "Bangalore", to: "Kozhikode", duration: 7.5, depSubs: ["Majestic", "Satellite BS", "Mysore", "Gundlupet"], arrSubs: ["KSRTC Terminal", "Palayam", "Thondayad Bypass"] },
  { from: "Hyderabad", to: "Chennai", duration: 11.0, depSubs: ["MGBS", "LB Nagar", "Dilsukhnagar", "Hayathnagar"], arrSubs: ["Koyambedu CMBT", "Madhavaram", "Red Hills"] },
  { from: "Hyderabad", to: "Vijayawada", duration: 5.0, depSubs: ["MGBS", "LB Nagar", "Vanasthalipuram", "Choutuppal"], arrSubs: ["Pandit Nehru BS", "Ramavarappadu Ring", "Benz Circle"] },
  { from: "Hyderabad", to: "Visakhapatnam", duration: 11.5, depSubs: ["MGBS", "Uppal", "LB Nagar"], arrSubs: ["RTC Complex", "Gajuwaka", "NAD Junction"] },
  { from: "Hyderabad", to: "Tirupati", duration: 9.5, depSubs: ["MGBS", "Shamshabad", "Jadcherla"], arrSubs: ["Central Bus Stand", "Alipiri", "RTC Cross Roads"] },
  { from: "Hyderabad", to: "Pune", duration: 9.5, depSubs: ["Ameerpet", "Miyapur", "Balanagar", "Patancheru"], arrSubs: ["Swargate", "Wakad Flyover", "Hadapsar", "Viman Nagar"] },
  { from: "Hyderabad", to: "Mumbai", duration: 13.0, depSubs: ["Miyapur", "Kukatpally", "SR Nagar", "Lakdikapul"], arrSubs: ["Vashi Plaza", "Dadar TT", "Borivali East", "Sion"] },
  { from: "Hyderabad", to: "Goa", duration: 14.0, depSubs: ["Miyapur", "Gachibowli", "ORR Exit 1"], arrSubs: ["Panaji KTC", "Mapusa", "Margao"] },
  { from: "Hyderabad", to: "Nagpur", duration: 8.5, depSubs: ["Medchal", "Secunderabad", "Bowenpally"], arrSubs: ["Ganeshpeth Bus Stand", "Dharampeth", "Chatrapati Square"] },
  { from: "Hyderabad", to: "Shirdi", duration: 11.5, depSubs: ["Kukatpally", "Miyapur", "Patancheru"], arrSubs: ["Shirdi Bus Stand", "Pimpalwadi Road", "Sainagar"] },
  { from: "Hyderabad", to: "Guntur", duration: 4.5, depSubs: ["LB Nagar", "Hayathnagar"], arrSubs: ["NTR Bus Station", "Autonagar", "Brindavan Gardens"] },
  { from: "Hyderabad", to: "Rajahmundry", duration: 8.0, depSubs: ["LB Nagar", "Uppal"], arrSubs: ["Kotipalli Bus Stand", "Lalacheruvu Ring", "Morampudi"] },
  { from: "Chennai", to: "Coimbatore", duration: 8.0, depSubs: ["Koyambedu", "Guindy", "Tambaram", "Perungalathur"], arrSubs: ["Gandhipuram", "Omni Bus Stand", "KMCH"] },
  { from: "Chennai", to: "Madurai", duration: 7.5, depSubs: ["Koyambedu", "Tambaram", "Chengalpattu Toll"], arrSubs: ["Mattuthavani", "Periyar Bus Stand", "Arapalayam"] },
  { from: "Chennai", to: "Kochi", duration: 12.0, depSubs: ["Koyambedu", "Guindy", "Tambaram"], arrSubs: ["Vyttila Mobility Hub", "Edappally", "Aluva"] },
  { from: "Chennai", to: "Tirupati", duration: 3.5, depSubs: ["Koyambedu", "Madhavaram", "Tiruvallur"], arrSubs: ["Central Bus Stand", "Alipiri", "Bypass"] },
  { from: "Chennai", to: "Vijayawada", duration: 7.5, depSubs: ["Koyambedu", "Madhavaram Bypass", "Gummidipoondi"], arrSubs: ["Pandit Nehru BS", "Benz Circle", "Gollapudi"] },
  { from: "Chennai", to: "Pondicherry", duration: 3.0, depSubs: ["Koyambedu", "Guindy", "Tidel Park (OMR)", "Thiruvanmiyur"], arrSubs: ["New Bus Stand", "JIPMER", "White Town Gate"] },
  { from: "Chennai", to: "Trichy", duration: 5.5, depSubs: ["Koyambedu", "Tambaram", "Perungalathur"], arrSubs: ["Central Bus Stand", "Chatram Bus Stand", "Tollgate"] },
  { from: "Chennai", to: "Salem", duration: 5.5, depSubs: ["Koyambedu", "Poonamallee", "Sriperumbudur"], arrSubs: ["New Bus Stand", "AVR Circle", "Kondalampatti"] },
  { from: "Mumbai", to: "Pune", duration: 3.5, depSubs: ["Borivali", "Andheri", "Sion", "Chembur", "Vashi"], arrSubs: ["Wakad", "Hinjawadi", "Shivajinagar", "Swargate"] },
  { from: "Mumbai", to: "Goa", duration: 11.5, depSubs: ["Borivali", "Bandra", "Sion", "Vashi", "Panvel"], arrSubs: ["Mapusa", "Panaji KTC", "Margao", "Porvorim"] },
  { from: "Mumbai", to: "Ahmedabad", duration: 9.5, depSubs: ["Borivali East", "Kandivali", "Goregaon", "Ghirbunder"], arrSubs: ["Paldi", "Geeta Mandir", "Satellite", "CTM"] },
  { from: "Mumbai", to: "Surat", duration: 5.5, depSubs: ["Borivali", "Mira Road", "Vasai Phata"], arrSubs: ["Kamrej Char Rasta", "Varachha", "Kadodara Circle"] },
  { from: "Mumbai", to: "Udaipur", duration: 14.0, depSubs: ["Borivali", "Kandivali", "Ghirbunder"], arrSubs: ["Udaipur Bus Stand", "Udiapole", "Sukher Bypass"] },
  { from: "Mumbai", to: "Indore", duration: 12.5, depSubs: ["Borivali", "Thane", "Kalyan Bypass"], arrSubs: ["Sarwate Bus Stand", "Navlakha", "Vijay Nagar"] },
  { from: "Mumbai", to: "Nagpur", duration: 13.0, depSubs: ["Thane", "Vashi", "Navi Mumbai"], arrSubs: ["Ganeshpeth", "Loha Pul", "Dharampeth"] },
  { from: "Mumbai", to: "Shirdi", duration: 5.5, depSubs: ["Dadar", "Thane Teen Hath Naka", "Kalyan"], arrSubs: ["Shirdi Temple Gate", "Hotel Sai Leela", "Nagar Manmad Rd"] },
  { from: "Mumbai", to: "Nashik", duration: 4.0, depSubs: ["Dadar", "Thane", "Bhiwandi Bypass"], arrSubs: ["CBS Bus Stand", "Dwarka Circle", "Mumbai Naka"] },
  { from: "Pune", to: "Goa", duration: 9.5, depSubs: ["Swargate", "Katraj", "Wakad", "Chandani Chowk"], arrSubs: ["Mapusa", "Panaji KTC", "Margao"] },
  { from: "Pune", to: "Ahmedabad", duration: 12.0, depSubs: ["Wakad", "Nigdi", "Talegaon"], arrSubs: ["Paldi", "Satellite", "Geeta Mandir", "CTM Cross Road"] },
  { from: "Pune", to: "Surat", duration: 8.0, depSubs: ["Wakad", "Chinchwad", "Nigdi"], arrSubs: ["Kamrej", "Kadodara", "Parvat Patiya"] },
  { from: "Pune", to: "Indore", duration: 12.0, depSubs: ["Shivajinagar", "Viman Nagar", "Wagholi"], arrSubs: ["Navlakha Bus Stand", "Sarwate", "Bhawarkua"] },
  { from: "Pune", to: "Nagpur", duration: 12.0, depSubs: ["Viman Nagar", "Kharadi Bypass", "Wagholi"], arrSubs: ["Ganeshpeth", "Chatrapati Square", "Rahate Colony"] },
  { from: "Pune", to: "Shirdi", duration: 4.5, depSubs: ["Shivajinagar", "Bhosari", "Chakan"], arrSubs: ["Shirdi Nagar Manmad Road", "Sai Ashram", "Pimpalwadi"] },
  { from: "Pune", to: "Kolhapur", duration: 4.5, depSubs: ["Swargate", "Katraj Snake Park"], arrSubs: ["Central Bus Stand (CBS)", "Kawala Naka", "Tawde Hotel"] },
  { from: "Delhi", to: "Jaipur", duration: 5.0, depSubs: ["Kashmere Gate ISBT", "Dhaula Kuan", "IFFCO Chowk Gurgaon"], arrSubs: ["Sindhi Camp", "Narayan Singh Circle", "200ft Bypass"] },
  { from: "Delhi", to: "Agra", duration: 3.5, depSubs: ["Akshardham Metro", "Sarai Kale Khan ISBT", "Pari Chowk Greater Noida"], arrSubs: ["Idgah Bus Stand", "Water Works Crossing", "ISBT Agra"] },
  { from: "Delhi", to: "Chandigarh", duration: 4.5, depSubs: ["Kashmere Gate ISBT", "Majnu Ka Tilla", "Karnal Bypass"], arrSubs: ["Sector 17 ISBT", "Sector 43 ISBT", "Tribune Chowk"] },
  { from: "Delhi", to: "Manali", duration: 13.0, depSubs: ["Kashmere Gate ISBT", "Majnu Ka Tilla", "Mukarba Chowk"], arrSubs: ["Private Bus Stand Manali", "Mall Road", "Patlikuhal"] },
  { from: "Delhi", to: "Shimla", duration: 8.0, depSubs: ["Kashmere Gate ISBT", "Majnu Ka Tilla"], arrSubs: ["New ISBT Tutikandi", "Victory Tunnel", "Sanjauli"] },
  { from: "Delhi", to: "Dehradun", duration: 5.5, depSubs: ["Kashmere Gate ISBT", "Anand Vihar ISBT", "Mohan Nagar"], arrSubs: ["ISBT Dehradun", "Clock Tower", "Prince Chowk"] },
  { from: "Delhi", to: "Rishikesh", duration: 6.0, depSubs: ["Kashmere Gate ISBT", "Anand Vihar ISBT"], arrSubs: ["Nepali Farm", "Natraj Chowk", "ISBT Rishikesh"] },
  { from: "Delhi", to: "Haridwar", duration: 5.0, depSubs: ["Kashmere Gate ISBT", "Anand Vihar ISBT"], arrSubs: ["Haridwar Bus Stand", "Singh Dwar", "Jwalapur"] },
  { from: "Delhi", to: "Amritsar", duration: 8.5, depSubs: ["Kashmere Gate ISBT", "Majnu Ka Tilla"], arrSubs: ["ISBT Amritsar", "Hall Gate", "Railway Station Road"] },
  { from: "Delhi", to: "Lucknow", duration: 7.5, depSubs: ["Anand Vihar ISBT", "Akshardham", "Noida City Centre"], arrSubs: ["Alambagh Bus Stand", "Charbagh", "Nehrunagar"] },
  { from: "Delhi", to: "Varanasi", duration: 13.5, depSubs: ["Anand Vihar ISBT", "Akshardham", "Greater Noida Expressway"], arrSubs: ["Cantt Bus Stand", "Lanka Gate", "Lahartara"] },
  { from: "Delhi", to: "Udaipur", duration: 12.0, depSubs: ["Dhaula Kuan", "IFFCO Chowk", "Mahipalpur"], arrSubs: ["Udiapole", "Paras Cinema Circle", "Reti Stand"] },
  { from: "Ahmedabad", to: "Surat", duration: 4.5, depSubs: ["Paldi", "Geeta Mandir", "CTM"], arrSubs: ["Kamrej", "Varachha", "Kadodara"] },
  { from: "Ahmedabad", to: "Udaipur", duration: 5.0, depSubs: ["Paldi", "C.G. Road", "Naroda Patiya"], arrSubs: ["Udiapole", "Sukher Bypass", "Chetak Circle"] },
  { from: "Ahmedabad", to: "Jaipur", duration: 11.5, depSubs: ["Paldi", "Geeta Mandir", "RTO Circle"], arrSubs: ["Sindhi Camp", "Narayan Singh Circle", "Transport Nagar"] },
  { from: "Ahmedabad", to: "Indore", duration: 7.5, depSubs: ["Paldi", "C.G. Road", "CTM"], arrSubs: ["Sarwate Bus Stand", "Navlakha", "Vijay Nagar"] },
  { from: "Ahmedabad", to: "Jodhpur", duration: 8.5, depSubs: ["Paldi", "Sabarmati", "Chandkheda"], arrSubs: ["Paota Circle", "Kalpataru Cinema", "Railway Station"] },
  { from: "Jaipur", to: "Agra", duration: 4.5, depSubs: ["Sindhi Camp", "Narayan Singh Circle", "Transport Nagar"], arrSubs: ["Idgah Bus Stand", "Bijli Ghar", "Water Works"] },
  { from: "Jaipur", to: "Udaipur", duration: 6.5, depSubs: ["Sindhi Camp", "200ft Bypass", "Ajmer Road"], arrSubs: ["Udiapole", "Paras Stand", "Sukher"] },
  { from: "Jaipur", to: "Jodhpur", duration: 6.0, depSubs: ["Sindhi Camp", "200ft Bypass"], arrSubs: ["Paota", "Ratanada", "Railway Station Road"] },
  { from: "Kochi", to: "Munnar", duration: 4.0, depSubs: ["Vyttila Hub", "Aluva", "Kothamangalam"], arrSubs: ["Munnar Town Bus Stand", "Old Munnar", "Pallivasal"] },
  { from: "Kochi", to: "Trivandrum", duration: 5.0, depSubs: ["Vyttila Hub", "Kundannoor", "Aroor"], arrSubs: ["Thampanoor KSRTC Central", "Kazhakkoottam", "Pattom"] },
  { from: "Kochi", to: "Alleppey", duration: 1.5, depSubs: ["Vyttila Hub", "Kundannoor"], arrSubs: ["KSRTC Bus Stand Alleppey", "Boat Jetty", "Collectorate"] },
  { from: "Coimbatore", to: "Ooty", duration: 3.0, depSubs: ["Gandhipuram", "Mettupalayam Road"], arrSubs: ["Ooty Bus Stand", "Charring Cross"] },
  { from: "Madurai", to: "Kodaikanal", duration: 3.5, depSubs: ["Arapalayam", "Periyar Bus Stand"], arrSubs: ["Kodaikanal Bus Stand", "Seven Roads Circle"] },
  { from: "Trivandrum", to: "Kanyakumari", duration: 2.5, depSubs: ["Thampanoor", "Neyyattinkara"], arrSubs: ["Kanyakumari Bus Stand", "Vivekananda Rock Road"] },
  { from: "Kolkata", to: "Bhubaneswar", duration: 8.5, depSubs: ["Babughat", "Esplanade Bus Terminus", "Santragachi"], arrSubs: ["Baramunda Bus Stand", "Master Canteen", "Vani Vihar"] },
  { from: "Kolkata", to: "Siliguri", duration: 11.5, depSubs: ["Esplanade", "Ultadanga", "Airport Gate 1"], arrSubs: ["Tenzing Norgay Central Bus Terminus", "Junction", "Pradhan Nagar"] },
  { from: "Bhopal", to: "Indore", duration: 3.5, depSubs: ["Nadra Bus Stand", "ISBT Bhopal", "Halalpura"], arrSubs: ["Sarwate Bus Stand", "Navlakha", "Vijay Nagar"] },
  { from: "Varanasi", to: "Lucknow", duration: 5.5, depSubs: ["Cantt Bus Stand", "Lahartara"], arrSubs: ["Alambagh Bus Terminal", "Charbagh", "Polytechnic Crossing"] },
];

const OPERATORS = [
  {
    "name": "TedBus Primo AC Sleeper (2+1)",
    "type": "A/C Sleeper (2+1)",
    "img": "assets/volvo.png",
    "live": 1,
    "resched": 1,
    "baseFare": 950
  },
  {
    "name": "TedBus Primo Multi-Axle Volvo",
    "type": "Volvo Multi-Axle A/C Semi-Sleeper",
    "img": "assets/volvo2.png",
    "live": 1,
    "resched": 1,
    "baseFare": 850
  },
  {
    "name": "Orange Tours and Travels",
    "type": "BharatBenz A/C Sleeper (2+1)",
    "img": "assets/orange.png",
    "live": 1,
    "resched": 1,
    "baseFare": 900
  },
  {
    "name": "IntrCity SmartBus",
    "type": "A/C Sleeper (2+1)",
    "img": "assets/scania.png",
    "live": 1,
    "resched": 1,
    "baseFare": 1050
  },
  {
    "name": "Zingbus Electric Coach",
    "type": "Electric A/C Semi-Sleeper",
    "img": "assets/electric.png",
    "live": 1,
    "resched": 1,
    "baseFare": 750
  },
  {
    "name": "VRL Travels Multi-Axle",
    "type": "Volvo A/C Sleeper (2+1)",
    "img": "assets/volvo.png",
    "live": 1,
    "resched": 0,
    "baseFare": 980
  },
  {
    "name": "KSRTC Airawat Club Class",
    "type": "Scania Multi-Axle A/C",
    "img": "assets/ksrtc.png",
    "live": 1,
    "resched": 1,
    "baseFare": 880
  },
  {
    "name": "SRS Travels Royal Cruiser",
    "type": "Non-A/C Sleeper (2+1)",
    "img": "assets/volvo2.png",
    "live": 0,
    "resched": 1,
    "baseFare": 650
  }
];
const TIME_SLOTS = [
  {
    "dep": "20:30",
    "offset": 0.5
  },
  {
    "dep": "21:45",
    "offset": 1.25
  },
  {
    "dep": "22:30",
    "offset": 1.75
  },
  {
    "dep": "06:30",
    "offset": 0.0
  },
  {
    "dep": "14:15",
    "offset": 0.5
  }
];


export async function autoSeedDatabase(mongooseInstance = mongoose) {
  try {
    const routeCount = await Route.countDocuments().exec();
    const postCount = await CommunityPost.countDocuments().exec();
    
    if (routeCount >= 50 && postCount >= 25) {
      console.log(`Database already has ${routeCount} routes and ${postCount} posts. Skipping auto-seed.`);
      return;
    }
    console.log(`Seeding database (current routes: ${routeCount}, posts: ${postCount})...`);
    await runSeed(mongooseInstance);
  } catch (err) {
    console.error('Error during auto-seed check:', err.message);
  }
}

export async function runSeed(mongooseInstance = mongoose) {
  // 1. Seed Verified Users
  console.log('Seeding 15 verified community users...');
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
  console.log(`Ensured ${createdCustomers.length} verified users in MongoDB.`);

  // 2. Clear old posts & comments for a pristine seed
  console.log('Purging existing community posts and comments for a complete refresh...');
  await CommunityPost.deleteMany({}).exec();
  await PostComment.deleteMany({}).exec();

  // 3. Insert Community Posts and Nested Comments
  console.log(`Seeding ${SEED_DISCUSSIONS.length} rich discussions across all 6 categories...`);
  for (const item of SEED_DISCUSSIONS) {
    const authorUser = SEED_USERS[item.authorIndex];
    const authorCustomer = createdCustomers[item.authorIndex];

    const post = await CommunityPost.create({
      title: item.title,
      content: item.content,
      category: item.category,
      tags: item.tags,
      images: item.images || [],
      routeTag: item.routeFrom ? { from: item.routeFrom, to: item.routeTo } : undefined,
      author: {
        customerId: String(authorCustomer._id),
        name: authorUser.name,
        email: authorUser.email,
        picture: authorUser.picture,
        badge: authorUser.badge,
      },
      likes: [],
      likesCount: 0,
      commentsCount: item.comments ? item.comments.length : 0,
      viewsCount: 0,
      status: 'published',
      isPinned: false,
    });

    if (item.comments && item.comments.length > 0) {
      for (const c of item.comments) {
        const commentAuthor = SEED_USERS[c.authorIndex];
        const commentCustomer = createdCustomers[c.authorIndex];
        await PostComment.create({
          postId: String(post._id),
          parentCommentId: null,
          author: {
            customerId: String(commentCustomer._id),
            name: commentAuthor.name,
            email: commentAuthor.email,
            picture: commentAuthor.picture,
            badge: commentAuthor.badge,
          },
          content: c.content,
          likes: [],
          likesCount: 0,
        });
      }
    }
  }
  console.log(`Successfully seeded ${SEED_DISCUSSIONS.length} rich discussions!`);

  // 4. Seed Bidirectional Routes and Buses
  console.log('Seeding nationwide bidirectional bus routes and schedules...');
  const allCorridors = [];
  for (const c of RAW_CORRIDORS) {
    // Forward
    allCorridors.push({
      from: c.from,
      to: c.to,
      duration: c.duration,
      depSubs: c.depSubs,
      arrSubs: c.arrSubs,
    });
    // Return
    allCorridors.push({
      from: c.to,
      to: c.from,
      duration: c.duration,
      depSubs: c.arrSubs,
      arrSubs: c.depSubs,
    });
  }

  // Deduplicate
  const uniqueMap = new Map();
  for (const c of allCorridors) {
    const key = `${c.from.toLowerCase()}->${c.to.toLowerCase()}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, c);
    }
  }
  const uniqueCorridors = Array.from(uniqueMap.values());
  console.log(`Found ${uniqueCorridors.length} unique bidirectional corridors across India.`);

  let totalBuses = 0;
  let totalRoutes = 0;

  for (let i = 0; i < uniqueCorridors.length; i++) {
    const corr = uniqueCorridors[i];
    let route = await Route.findOne({
      'departureLocation.name': corr.from,
      'arrivalLocation.name': corr.to,
    }).exec();

    if (!route) {
      route = await Route.create({
        departureLocation: {
          name: corr.from,
          subLocations: corr.depSubs,
        },
        arrivalLocation: {
          name: corr.to,
          subLocations: corr.arrSubs,
        },
        duration: corr.duration,
      });
    }
    totalRoutes++;

    // Ensure 3 distinct buses for each route
    const existingBuses = await Bus.countDocuments({ routes: String(route._id) }).exec();
    if (existingBuses < 3) {
      const opIndexA = (i * 2) % OPERATORS.length;
      const opIndexB = (i * 2 + 1) % OPERATORS.length;
      const opIndexC = (i * 2 + 3) % OPERATORS.length;

      const selectedOps = [
        { op: OPERATORS[opIndexA], time: TIME_SLOTS[0] },
        { op: OPERATORS[opIndexB], time: TIME_SLOTS[1] },
        { op: OPERATORS[opIndexC], time: TIME_SLOTS[2] },
      ];

      for (const item of selectedOps) {
        await Bus.create({
          operatorName: item.op.name,
          busType: item.op.type,
          departureTime: item.time.dep,
          rating: [4.4, 4.6, 4.8, 4.5, 4.7],
          totalSeats: 36,
          routes: String(route._id),
          images: item.op.img,
          liveTracking: item.op.live,
          reschedulable: item.op.resched,
        });
        totalBuses++;
      }
    }
  }

  // 5. Seed Content Moderation Reports
  console.log('Seeding sample content reports for Admin moderation queue...');
  await ContentReport.deleteMany({}).exec();
  const samplePosts = await CommunityPost.find().limit(5).exec();
  const sampleComments = await PostComment.find().limit(2).exec();

  if (samplePosts.length > 0 && createdCustomers.length >= 5) {
    // 1. Pending Spam Report
    await ContentReport.create({
      contentType: 'post',
      contentId: samplePosts[0]._id.toString(),
      reportedBy: {
        customerId: createdCustomers[1]._id.toString(),
        email: createdCustomers[1].email,
        name: createdCustomers[1].name,
      },
      reason: 'spam',
      details: 'Contains repetitive promotional external booking affiliate links in comments.',
      status: 'pending',
    });

    // 2. Pending Misinformation Report
    await ContentReport.create({
      contentType: 'post',
      contentId: samplePosts[1]._id.toString(),
      reportedBy: {
        customerId: createdCustomers[2]._id.toString(),
        email: createdCustomers[2].email,
        name: createdCustomers[2].name,
      },
      reason: 'misinformation',
      details: 'The highway bypass mentioned is currently closed for monsoon maintenance until next week.',
      status: 'pending',
    });

    // 3. Pending Harassment on Comment
    if (sampleComments.length > 0) {
      await ContentReport.create({
        contentType: 'comment',
        contentId: sampleComments[0]._id.toString(),
        reportedBy: {
          customerId: createdCustomers[3]._id.toString(),
          email: createdCustomers[3].email,
          name: createdCustomers[3].name,
        },
        reason: 'harassment',
        details: 'Disrespectful language directed toward fellow traveler regarding bus fare inquiries.',
        status: 'pending',
      });
    }

    // 4. Actioned / Hidden Report (Demonstrating moderation history & restore feature)
    if (samplePosts.length > 2) {
      await CommunityPost.findByIdAndUpdate(samplePosts[2]._id, { status: 'hidden' });
      await ContentReport.create({
        contentType: 'post',
        contentId: samplePosts[2]._id.toString(),
        reportedBy: {
          customerId: createdCustomers[0]._id.toString(),
          email: createdCustomers[0].email,
          name: createdCustomers[0].name,
        },
        reason: 'inappropriate',
        details: 'Off-topic advertising not related to travel or bus journeys.',
        status: 'actioned',
        actionTaken: 'Content hidden from community',
        reviewedBy: 'admin@tedbus.internal',
        reviewedAt: new Date(Date.now() - 3600000 * 4),
      });
    }

    // 5. Dismissed Report (Demonstrating false alarm handling)
    if (samplePosts.length > 3) {
      await ContentReport.create({
        contentType: 'post',
        contentId: samplePosts[3]._id.toString(),
        reportedBy: {
          customerId: createdCustomers[4]._id.toString(),
          email: createdCustomers[4].email,
          name: createdCustomers[4].name,
        },
        reason: 'other',
        details: 'User reported price disagreement; verified as legitimate passenger tip.',
        status: 'dismissed',
        actionTaken: 'Dismissed by moderator - legitimate review',
        reviewedBy: 'admin@tedbus.internal',
        reviewedAt: new Date(Date.now() - 3600000 * 12),
      });
    }
  }

  console.log(`\n=========================================`);
  console.log(`✅ NATIONWIDE SEED COMPLETED SUCCESSFULLY:`);
  console.log(`- Routes: ${totalRoutes}`);
  console.log(`- Buses created: ${totalBuses}`);
  console.log(`- Discussions: ${SEED_DISCUSSIONS.length}`);
  console.log(`- Verified Users: ${createdCustomers.length}`);
  console.log(`=========================================\n`);
}

// Standalone execution
if (process.argv[1]?.endsWith('seedData.js')) {
  console.log(`Connecting to MongoDB at: ${MONGODB_URI}...`);
  mongoose.connect(MONGODB_URI).then(async () => {
    console.log('MongoDB connected successfully!');
    await runSeed(mongoose);
    process.exit(0);
  }).catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
  });
}
