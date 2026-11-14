# scripts/generate_seed.py
import json

cities_data = [
    # South India Hubs & Corridors
    ("Bangalore", "Hyderabad", 8.5, ["Majestic", "Electronic City", "Silk Board", "Hebbal", "Yelahanka"], ["Miyapur", "Kukatpally", "Ameerpet", "Lakdikapul", "LB Nagar"]),
    ("Bangalore", "Chennai", 6.0, ["Majestic", "Shantinagar", "Indiranagar", "KR Puram", "Hosakote Toll"], ["Koyambedu", "Guindy Metro", "Tambaram", "Ashok Nagar", "Sriperumbudur"]),
    ("Bangalore", "Goa", 11.0, ["Majestic", "Yeshwantpur", "Jalahalli Cross", "Tumkur Bypass"], ["Panaji KTC", "Mapusa", "Margao KTC", "Porvorim"]),
    ("Bangalore", "Coimbatore", 6.5, ["Majestic", "Madiwala", "Electronic City", "Attibele Toll"], ["Gandhipuram", "Hopes College", "KMCH", "Singanallur"]),
    ("Bangalore", "Kochi", 9.5, ["Majestic", "Madiwala", "Electronic City", "Hosur"], ["Vyttila Hub", "Edappally Toll", "Aluva Flyover", "Palarivattom"]),
    ("Bangalore", "Mysore", 3.0, ["Majestic", "Satellite BS (Kengeri)", "Bidadi Bypass"], ["Suburban Bus Stand", "KSRTC Central BS", "Columbia Asia Circle"]),
    ("Bangalore", "Madurai", 7.5, ["Majestic", "Madiwala", "Electronic City"], ["Mattuthavani BS", "Periyar BS", "Arapalayam"]),
    ("Bangalore", "Tirupati", 4.5, ["Majestic", "KR Puram", "Hosakote", "Kolar Bypass"], ["Tirupati RTC Central", "Alipiri Gate", "Leela Mahal Circle"]),
    ("Bangalore", "Vijayawada", 11.0, ["Majestic", "Hebbal", "Devanahalli Toll"], ["Pandit Nehru BS", "Benz Circle", "Bhavanipuram"]),
    ("Bangalore", "Visakhapatnam", 17.0, ["Majestic", "Hebbal", "Chikkaballapur"], ["Dwaraka Bus Station", "Gajuwaka", "Maddilapalem"]),
    ("Bangalore", "Mangalore", 7.5, ["Majestic", "Yeshwantpur", "Nelamangala"], ["KSRTC State BS", "Pumpwell Circle", "Jyothi Circle"]),
    ("Bangalore", "Udupi", 8.5, ["Majestic", "Yeshwantpur", "Kunigal"], ["Service Bus Stand", "Manipal Tiger Circle", "Santhekatte"]),
    ("Bangalore", "Ooty", 7.0, ["Majestic", "Satellite BS", "Mysore Bypass", "Bandipur"], ["Ooty Bus Stand", "Charring Cross", "Botanical Garden Gate"]),
    ("Bangalore", "Pondicherry", 7.0, ["Majestic", "Madiwala", "Electronic City", "Hosur"], ["New Bus Stand", "JIPMER Circle", "ECR Toll"]),
    ("Bangalore", "Hubli", 6.5, ["Majestic", "Yeshwantpur", "Tumkur Toll"], ["Old Bus Stand", "CBT Bus Terminal", "Gokul Road"]),
    ("Bangalore", "Belgaum", 8.5, ["Majestic", "Yeshwantpur", "Tumkur"], ["Central Bus Stand", "Chennamma Circle", "Udyambag"]),
    ("Bangalore", "Kozhikode", 7.5, ["Majestic", "Satellite BS", "Mysore", "Gundlupet"], ["KSRTC Terminal", "Palayam", "Thondayad Bypass"]),

    # Hyderabad Hub
    ("Hyderabad", "Chennai", 11.0, ["MGBS", "LB Nagar", "Dilsukhnagar", "Hayathnagar"], ["Koyambedu CMBT", "Madhavaram", "Red Hills"]),
    ("Hyderabad", "Vijayawada", 5.0, ["MGBS", "LB Nagar", "Vanasthalipuram", "Choutuppal"], ["Pandit Nehru BS", "Ramavarappadu Ring", "Benz Circle"]),
    ("Hyderabad", "Visakhapatnam", 11.5, ["MGBS", "Uppal", "LB Nagar"], ["RTC Complex", "Gajuwaka", "NAD Junction"]),
    ("Hyderabad", "Tirupati", 9.5, ["MGBS", "Shamshabad", "Jadcherla"], ["Central Bus Stand", "Alipiri", "RTC Cross Roads"]),
    ("Hyderabad", "Pune", 9.5, ["Ameerpet", "Miyapur", "Balanagar", "Patancheru"], ["Swargate", "Wakad Flyover", "Hadapsar", "Viman Nagar"]),
    ("Hyderabad", "Mumbai", 13.0, ["Miyapur", "Kukatpally", "SR Nagar", "Lakdikapul"], ["Vashi Plaza", "Dadar TT", "Borivali East", "Sion"]),
    ("Hyderabad", "Goa", 14.0, ["Miyapur", "Gachibowli", "ORR Exit 1"], ["Panaji KTC", "Mapusa", "Margao"]),
    ("Hyderabad", "Nagpur", 8.5, ["Medchal", "Secunderabad", "Bowenpally"], ["Ganeshpeth Bus Stand", "Dharampeth", "Chatrapati Square"]),
    ("Hyderabad", "Shirdi", 11.5, ["Kukatpally", "Miyapur", "Patancheru"], ["Shirdi Bus Stand", "Pimpalwadi Road", "Sainagar"]),
    ("Hyderabad", "Guntur", 4.5, ["LB Nagar", "Hayathnagar"], ["NTR Bus Station", "Autonagar", "Brindavan Gardens"]),
    ("Hyderabad", "Rajahmundry", 8.0, ["LB Nagar", "Uppal"], ["Kotipalli Bus Stand", "Lalacheruvu Ring", "Morampudi"]),

    # Chennai Hub
    ("Chennai", "Coimbatore", 8.0, ["Koyambedu", "Guindy", "Tambaram", "Perungalathur"], ["Gandhipuram", "Omni Bus Stand", "KMCH"]),
    ("Chennai", "Madurai", 7.5, ["Koyambedu", "Tambaram", "Chengalpattu Toll"], ["Mattuthavani", "Periyar Bus Stand", "Arapalayam"]),
    ("Chennai", "Kochi", 12.0, ["Koyambedu", "Guindy", "Tambaram"], ["Vyttila Mobility Hub", "Edappally", "Aluva"]),
    ("Chennai", "Tirupati", 3.5, ["Koyambedu", "Madhavaram", "Tiruvallur"], ["Central Bus Stand", "Alipiri", "Bypass"]),
    ("Chennai", "Vijayawada", 7.5, ["Koyambedu", "Madhavaram Bypass", "Gummidipoondi"], ["Pandit Nehru BS", "Benz Circle", "Gollapudi"]),
    ("Chennai", "Pondicherry", 3.0, ["Koyambedu", "Guindy", "Tidel Park (OMR)", "Thiruvanmiyur"], ["New Bus Stand", "JIPMER", "White Town Gate"]),
    ("Chennai", "Trichy", 5.5, ["Koyambedu", "Tambaram", "Perungalathur"], ["Central Bus Stand", "Chatram Bus Stand", "Tollgate"]),
    ("Chennai", "Salem", 5.5, ["Koyambedu", "Poonamallee", "Sriperumbudur"], ["New Bus Stand", "AVR Circle", "Kondalampatti"]),

    # Mumbai & Maharashtra Hub
    ("Mumbai", "Pune", 3.5, ["Borivali", "Andheri", "Sion", "Chembur", "Vashi"], ["Wakad", "Hinjawadi", "Shivajinagar", "Swargate"]),
    ("Mumbai", "Goa", 11.5, ["Borivali", "Bandra", "Sion", "Vashi", "Panvel"], ["Mapusa", "Panaji KTC", "Margao", "Porvorim"]),
    ("Mumbai", "Ahmedabad", 9.5, ["Borivali East", "Kandivali", "Goregaon", "Ghirbunder"], ["Paldi", "Geeta Mandir", "Satellite", "CTM"]),
    ("Mumbai", "Surat", 5.5, ["Borivali", "Mira Road", "Vasai Phata"], ["Kamrej Char Rasta", "Varachha", "Kadodara Circle"]),
    ("Mumbai", "Udaipur", 14.0, ["Borivali", "Kandivali", "Ghirbunder"], ["Udaipur Bus Stand", "Udiapole", "Sukher Bypass"]),
    ("Mumbai", "Indore", 12.5, ["Borivali", "Thane", "Kalyan Bypass"], ["Sarwate Bus Stand", "Navlakha", "Vijay Nagar"]),
    ("Mumbai", "Nagpur", 13.0, ["Thane", "Vashi", "Navi Mumbai"], ["Ganeshpeth", "Loha Pul", "Dharampeth"]),
    ("Mumbai", "Shirdi", 5.5, ["Dadar", "Thane Teen Hath Naka", "Kalyan"], ["Shirdi Temple Gate", "Hotel Sai Leela", "Nagar Manmad Rd"]),
    ("Mumbai", "Nashik", 4.0, ["Dadar", "Thane", "Bhiwandi Bypass"], ["CBS Bus Stand", "Dwarka Circle", "Mumbai Naka"]),

    # Pune Hub
    ("Pune", "Goa", 9.5, ["Swargate", "Katraj", "Wakad", "Chandani Chowk"], ["Mapusa", "Panaji KTC", "Margao"]),
    ("Pune", "Ahmedabad", 12.0, ["Wakad", "Nigdi", "Talegaon"], ["Paldi", "Satellite", "Geeta Mandir", "CTM Cross Road"]),
    ("Pune", "Surat", 8.0, ["Wakad", "Chinchwad", "Nigdi"], ["Kamrej", "Kadodara", "Parvat Patiya"]),
    ("Pune", "Indore", 12.0, ["Shivajinagar", "Viman Nagar", "Wagholi"], ["Navlakha Bus Stand", "Sarwate", "Bhawarkua"]),
    ("Pune", "Nagpur", 12.0, ["Viman Nagar", "Kharadi Bypass", "Wagholi"], ["Ganeshpeth", "Chatrapati Square", "Rahate Colony"]),
    ("Pune", "Shirdi", 4.5, ["Shivajinagar", "Bhosari", "Chakan"], ["Shirdi Nagar Manmad Road", "Sai Ashram", "Pimpalwadi"]),
    ("Pune", "Kolhapur", 4.5, ["Swargate", "Katraj Snake Park"], ["Central Bus Stand (CBS)", "Kawala Naka", "Tawde Hotel"]),

    # Delhi NCR & North India Hub
    ("Delhi", "Jaipur", 5.0, ["Kashmere Gate ISBT", "Dhaula Kuan", "IFFCO Chowk Gurgaon"], ["Sindhi Camp", "Narayan Singh Circle", "200ft Bypass"]),
    ("Delhi", "Agra", 3.5, ["Akshardham Metro", "Sarai Kale Khan ISBT", "Pari Chowk Greater Noida"], ["Idgah Bus Stand", "Water Works Crossing", "ISBT Agra"]),
    ("Delhi", "Chandigarh", 4.5, ["Kashmere Gate ISBT", "Majnu Ka Tilla", "Karnal Bypass"], ["Sector 17 ISBT", "Sector 43 ISBT", "Tribune Chowk"]),
    ("Delhi", "Manali", 13.0, ["Kashmere Gate ISBT", "Majnu Ka Tilla", "Mukarba Chowk"], ["Private Bus Stand Manali", "Mall Road", "Patlikuhal"]),
    ("Delhi", "Shimla", 8.0, ["Kashmere Gate ISBT", "Majnu Ka Tilla"], ["New ISBT Tutikandi", "Victory Tunnel", "Sanjauli"]),
    ("Delhi", "Dehradun", 5.5, ["Kashmere Gate ISBT", "Anand Vihar ISBT", "Mohan Nagar"], ["ISBT Dehradun", "Clock Tower", "Prince Chowk"]),
    ("Delhi", "Rishikesh", 6.0, ["Kashmere Gate ISBT", "Anand Vihar ISBT"], ["Nepali Farm", "Natraj Chowk", "ISBT Rishikesh"]),
    ("Delhi", "Haridwar", 5.0, ["Kashmere Gate ISBT", "Anand Vihar ISBT"], ["Haridwar Bus Stand", "Singh Dwar", "Jwalapur"]),
    ("Delhi", "Amritsar", 8.5, ["Kashmere Gate ISBT", "Majnu Ka Tilla"], ["ISBT Amritsar", "Hall Gate", "Railway Station Road"]),
    ("Delhi", "Lucknow", 7.5, ["Anand Vihar ISBT", "Akshardham", "Noida City Centre"], ["Alambagh Bus Stand", "Charbagh", "Nehrunagar"]),
    ("Delhi", "Varanasi", 13.5, ["Anand Vihar ISBT", "Akshardham", "Greater Noida Expressway"], ["Cantt Bus Stand", "Lanka Gate", "Lahartara"]),
    ("Delhi", "Udaipur", 12.0, ["Dhaula Kuan", "IFFCO Chowk", "Mahipalpur"], ["Udiapole", "Paras Cinema Circle", "Reti Stand"]),

    # Gujarat & Rajasthan Corridors
    ("Ahmedabad", "Surat", 4.5, ["Paldi", "Geeta Mandir", "CTM"], ["Kamrej", "Varachha", "Kadodara"]),
    ("Ahmedabad", "Udaipur", 5.0, ["Paldi", "C.G. Road", "Naroda Patiya"], ["Udiapole", "Sukher Bypass", "Chetak Circle"]),
    ("Ahmedabad", "Jaipur", 11.5, ["Paldi", "Geeta Mandir", "RTO Circle"], ["Sindhi Camp", "Narayan Singh Circle", "Transport Nagar"]),
    ("Ahmedabad", "Indore", 7.5, ["Paldi", "C.G. Road", "CTM"], ["Sarwate Bus Stand", "Navlakha", "Vijay Nagar"]),
    ("Ahmedabad", "Jodhpur", 8.5, ["Paldi", "Sabarmati", "Chandkheda"], ["Paota Circle", "Kalpataru Cinema", "Railway Station"]),
    ("Jaipur", "Agra", 4.5, ["Sindhi Camp", "Narayan Singh Circle", "Transport Nagar"], ["Idgah Bus Stand", "Bijli Ghar", "Water Works"]),
    ("Jaipur", "Udaipur", 6.5, ["Sindhi Camp", "200ft Bypass", "Ajmer Road"], ["Udiapole", "Paras Stand", "Sukher"]),
    ("Jaipur", "Jodhpur", 6.0, ["Sindhi Camp", "200ft Bypass"], ["Paota", "Ratanada", "Railway Station Road"]),

    # Kerala & Tamil Nadu Tourism Corridors
    ("Kochi", "Munnar", 4.0, ["Vyttila Hub", "Aluva", "Kothamangalam"], ["Munnar Town Bus Stand", "Old Munnar", "Pallivasal"]),
    ("Kochi", "Trivandrum", 5.0, ["Vyttila Hub", "Kundannoor", "Aroor"], ["Thampanoor KSRTC Central", "Kazhakkoottam", "Pattom"]),
    ("Kochi", "Alleppey", 1.5, ["Vyttila Hub", "Kundannoor"], ["KSRTC Bus Stand Alleppey", "Boat Jetty", "Collectorate"]),
    ("Coimbatore", "Ooty", 3.0, ["Gandhipuram", "Mettupalayam Road"], ["Ooty Bus Stand", "Charring Cross"]),
    ("Madurai", "Kodaikanal", 3.5, ["Arapalayam", "Periyar Bus Stand"], ["Kodaikanal Bus Stand", "Seven Roads Circle"]),
    ("Trivandrum", "Kanyakumari", 2.5, ["Thampanoor", "Neyyattinkara"], ["Kanyakumari Bus Stand", "Vivekananda Rock Road"]),

    # East & Central India Corridors
    ("Kolkata", "Bhubaneswar", 8.5, ["Babughat", "Esplanade Bus Terminus", "Santragachi"], ["Baramunda Bus Stand", "Master Canteen", "Vani Vihar"]),
    ("Kolkata", "Siliguri", 11.5, ["Esplanade", "Ultadanga", "Airport Gate 1"], ["Tenzing Norgay Central Bus Terminus", "Junction", "Pradhan Nagar"]),
    ("Bhopal", "Indore", 3.5, ["Nadra Bus Stand", "ISBT Bhopal", "Halalpura"], ["Sarwate Bus Stand", "Navlakha", "Vijay Nagar"]),
    ("Varanasi", "Lucknow", 5.5, ["Cantt Bus Stand", "Lahartara"], ["Alambagh Bus Terminal", "Charbagh", "Polytechnic Crossing"]),
]

print(f"Total city pairs: {len(cities_data)}")
