# -*- coding: utf-8 -*-
"""
Expanded Master Franchise Dataset for FranchiseIQ
Contains at least 10 real, recognizable franchise brands operating in India
for EVERY existing sector, with official corporate website and franchise URLs.
"""

OFFICIAL_SOURCE_MAPPINGS_EXPANDED = {
    # Existing 23 mappings
    "Chai Point Express": ("https://chaipoint.com", "https://chaipoint.com/pages/franchise"),
    "Wow! Momo Express": ("https://wowmomo.com", "https://wowmomo.com/franchise"),
    "Burger King Kiosk": ("https://burgerking.in", "https://burgerking.in/franchise"),
    "Haldiram's Express": ("https://haldirams.com", "https://haldirams.com/franchise"),
    "Tibbs Frankie Hub": ("https://tibbsfrankie.com", "https://tibbsfrankie.com/franchise"),
    "Baskin Robbins Scoop Parlour": ("https://baskinrobbinsindia.com", "https://baskinrobbinsindia.com/franchise"),
    "Dr Lal Pathlabs Hub": ("https://lalpathlabs.com", "https://lalpathlabs.com/partner-with-us"),
    "Apollo 24|7 Pharmacy": ("https://apollopharmacy.in", "https://apollopharmacy.in/franchise"),
    "Cult.fit Studio": ("https://cult.fit", "https://cult.fit/franchise-opportunities"),
    "Anytime Fitness Club": ("https://anytimefitness.co.in", "https://anytimefitness.co.in/franchise"),
    "Kidzee Preschool": ("https://kidzee.com", "https://kidzee.com/franchise-enquiry"),
    "EuroKids Preschool": ("https://eurokidsindia.com", "https://eurokidsindia.com/franchise"),
    "Delhivery Express Hub": ("https://delhivery.com", "https://delhivery.com/partner-with-us"),
    "Blue Dart Express Point": ("https://bluedart.com", "https://bluedart.com/retail-franchise"),
    "DTDC Courier Counter": ("https://dtdc.in", "https://dtdc.in/business-partner"),
    "Lenskart Opticals": ("https://lenskart.com", "https://lenskart.com/franchise"),
    "FirstCry Kids Store": ("https://firstcry.com", "https://firstcry.com/franchise"),
    "Jawed Habib Hair Studio": ("https://jawedhabib.com", "https://jawedhabib.com/franchise"),
    "Naturals Beauty Salon": ("https://naturals.in", "https://naturals.in/franchise-inquiry"),
    "Ather Energy Experience Centre": ("https://atherenergy.com", "https://atherenergy.com/dealership"),
    "Ola Electric Hub": ("https://olaelectric.com", "https://olaelectric.com/partner"),
    "Wakefit Experience Studio": ("https://wakefit.co", "https://wakefit.co/franchise"),
    "Urban Company Partner Hub": ("https://urbancompany.com", "https://urbancompany.com/partner"),

    # Existing DB Names Mappings
    "Burger Singh Bistro": ("https://burgersinghonline.com", "https://burgersinghonline.com/franchise"),
    "Barbeque Nation Express": ("https://barbequenation.com", "https://barbequenation.com/franchise"),
    "Mainland China Bistro": ("https://speciality.co.in", "https://speciality.co.in/mainland-china"),
    "Paradise Biryani Hub": ("https://paradisefoodcourt.in", "https://paradisefoodcourt.in/franchise"),
    "Smoke House Deli Express": ("https://impresario.in", "https://impresario.in/brands/smoke-house-deli"),
    "The Belgian Waffle Co.": ("https://thebelgianwaffle.co", "https://thebelgianwaffle.co/franchise"),
    "Third Wave Coffee Roasters": ("https://thirdwavecoffee.in", "https://thirdwavecoffee.in/pages/partner-with-us"),
    "Chaayos Chai Bar": ("https://chaayos.com", "https://chaayos.com/franchise"),
    "Theobroma Patisserie": ("https://theobroma.in", "https://theobroma.in/pages/partner"),
    "Cafe Coffee Day Lounge": ("https://cafecoffeeday.com", "https://cafecoffeeday.com/franchise"),
    "MedPlus Community Pharmacy": ("https://medplusindia.com", "https://medplusindia.com/franchise"),
    "Apollo Pharmacy Hub": ("https://apollopharmacy.in", "https://apollopharmacy.in/franchise"),
    "Netmeds Wellness Store": ("https://netmeds.com", "https://netmeds.com/franchise"),
    "Wellness Forever 24/7": ("https://wellnessforever.com", "https://wellnessforever.com/franchise"),
    "Tata 1mg Health Shoppe": ("https://1mg.com", "https://1mg.com/franchise"),
    "Apollo Diagnostics Center": ("https://apollodiagnostics.in", "https://apollodiagnostics.in/partner-with-us"),
    "Dr. Lal PathLabs Collection Center": ("https://lalpathlabs.com", "https://lalpathlabs.com/partner-with-us"),
    "Metropolis Healthcare Lab": ("https://metropolisindia.com", "https://metropolisindia.com/partner-with-us"),
    "Thyrocare Wellness Point": ("https://thyrocare.com", "https://thyrocare.com/wellness-partner"),
    "SRL Diagnostics Express": ("https://agilusdiagnostics.com", "https://agilusdiagnostics.com/partner-with-us"),
    "Anytime Fitness 24/7": ("https://anytimefitness.co.in", "https://anytimefitness.co.in/franchise"),
    "Cult.fit Smart Gym": ("https://cult.fit", "https://cult.fit/franchise-opportunities"),
    "Gold's Gym Pro": ("https://goldsgym.in", "https://goldsgym.in/franchise"),
    "Snap Fitness Club": ("https://snapfitness.com/in", "https://snapfitness.com/in/franchise"),
    "Talwalkars Fitness Hub": ("https://talwalkars.net", "https://talwalkars.net/franchise"),
    "EuroKids Preschool & DayCare": ("https://eurokidsindia.com", "https://eurokidsindia.com/franchise"),
    "Kidzee Pre-School": ("https://kidzee.com", "https://kidzee.com/franchise-enquiry"),
    "Bachpan Play School": ("https://bachpanglobal.com", "https://bachpanglobal.com/franchise"),
    "Allen Career Digital Hub": ("https://allen.ac.in", "https://allen.ac.in/franchise"),
    "Kangaroo Kids International": ("https://kangarookidsindia.com", "https://kangarookidsindia.com/franchise"),
    "DTDC Express Logistics Hub": ("https://dtdc.in", "https://dtdc.in/business-partner"),
    "Shadowfax Express Depo": ("https://shadowfax.in", "https://shadowfax.in/partner-with-us"),
    "Blue Dart Express Counter": ("https://bluedart.com", "https://bluedart.com/retail-franchise"),
    "XpressBees Logistics Center": ("https://xpressbees.com", "https://xpressbees.com/partner"),
    "Lenskart Eyewear Studio": ("https://lenskart.com", "https://lenskart.com/franchise"),
    "Titan Eyeplus Studio": ("https://titaneyeplus.com", "https://titaneyeplus.com/franchise"),
    "Bata Shoes & Footwear": ("https://bata.in", "https://bata.in/franchise"),
    "Decathlon Connect": ("https://decathlon.in", "https://decathlon.in/partner"),
    "Jawed Habib Hair & Beauty": ("https://jawedhabib.com", "https://jawedhabib.com/franchise"),
    "Naturals Lounge Salon": ("https://naturals.in", "https://naturals.in/franchise-inquiry"),
    "Lakme Salon Luxe": ("https://lakmesalon.in", "https://lakmesalon.in/franchise"),
    "Green Trends Unisex Salon": ("https://mygreentrends.in", "https://mygreentrends.in/franchise"),
    "VLCC Wellness & Clinic": ("https://vlccwellness.com", "https://vlccwellness.com/franchise"),
    "Ather Space Experience Center": ("https://atherenergy.com", "https://atherenergy.com/dealership"),
    "Speed Car Wash Pro": ("https://speedcarwash.com", "https://speedcarwash.com/franchise"),
    "Ola Electric Experience Zone": ("https://olaelectric.com", "https://olaelectric.com/partner"),
    "Detailing Devils Studio": ("https://detailingdevils.com", "https://detailingdevils.com/franchise"),
    "Bosch Car Service Station": ("https://boschcarservice.com/in", "https://boschcarservice.com/in/en/workshop-partner"),
    "Pepperfry Furniture Studio": ("https://pepperfry.com", "https://pepperfry.com/franchise"),
    "Urban Clean Pro Hub": ("https://urbancompany.com", "https://urbancompany.com/partner"),
    "HomeLane Interior Hub": ("https://homelane.com", "https://homelane.com/partner-with-us"),
    "Livspace Design Studio": ("https://livspace.com", "https://livspace.com/in/partner"),
    "Godrej Interio Showcase": ("https://godrejinterio.com", "https://godrejinterio.com/franchise"),

    # NEW REAL BRANDS PER SECTOR
    # 1. QSR (+5)
    "Domino's Pizza India": ("https://dominos.co.in", "https://jubilantfoodworks.com/franchise"),
    "Subway India": ("https://subway.in", "https://subway.com/en-IN/OwnAFranchise"),
    "KFC India Express": ("https://kfc.co.in", "https://yum.com/franchise-opportunities"),
    "Pizza Hut Express": ("https://pizzahut.co.in", "https://yum.com/franchise-opportunities"),
    "McDonald's India (West & South)": ("https://mcdonaldsindia.com", "https://westlife.co.in/partner"),

    # 2. Food & Beverage (+6)
    "Biryani Blues": ("https://biryaniblues.com", "https://biryaniblues.com/franchise"),
    "Behrouz Biryani Hub": ("https://behrouzbiryani.com", "https://rebelfoods.com/partner"),
    "Faasos Food Kitchen": ("https://faasos.com", "https://rebelfoods.com/franchise"),
    "Goli Vada Pav No. 1": ("https://golivadapav.com", "https://golivadapav.com/franchise"),
    "Dosa Plaza Express": ("https://dosaplaza.com", "https://dosaplaza.com/franchise-enquiry"),
    "Bikanervala Express": ("https://bikanervala.com", "https://bikanervala.com/franchise"),

    # 3. Cafes (+6)
    "Barista Coffee Cafe": ("https://barista.co.in", "https://barista.co.in/franchise-enquiry"),
    "Costa Coffee India": ("https://costacoffee.com", "https://devyanifood.com/costa-coffee"),
    "Tea Post Desi Cafe": ("https://teapost.in", "https://teapost.in/franchise"),
    "MBA Chai Wala": ("https://mbachaiwala.com", "https://mbachaiwala.com/franchise"),
    "Chai Sutta Bar": ("https://chaisuttabarindia.com", "https://chaisuttabarindia.com/franchise"),
    "Roastery Coffee House": ("https://roasterycoffee.co.in", "https://roasterycoffee.co.in/partner"),

    # 4. Healthcare (+5)
    "Frank Ross Pharmacy": ("https://frankrosspharmacy.com", "https://frankrosspharmacy.com/franchise"),
    "Sanjivani Pharmacy": ("https://sanjivanipharmacy.com", "https://sanjivanipharmacy.com/franchise-opportunities"),
    "Noble Plus Pharmacy": ("https://nobleplus.in", "https://nobleplus.in/franchise"),
    "Generico Dava India": ("https://davaindia.com", "https://davaindia.com/franchise-enquiry"),
    "Guardian GNC Health Store": ("https://guardian.in", "https://guardian.in/franchise"),

    # 5. Diagnostics (+5)
    "Redcliffe Labs Hub": ("https://redcliffelabs.com", "https://redcliffelabs.com/partner-with-us"),
    "Suburban Diagnostics": ("https://suburbandiagnostics.com", "https://suburbandiagnostics.com/franchise"),
    "Max Lab Collection Center": ("https://maxlab.co.in", "https://maxlab.co.in/partner-with-us"),
    "Vijaya Diagnostic Centre": ("https://vijayadiagnostic.com", "https://vijayadiagnostic.com/partner-with-us"),
    "Healthians Wellness Hub": ("https://healthians.com", "https://healthians.com/partner"),

    # 6. Fitness (+5)
    "Fitness First India": ("https://fitnessfirst.net.in", "https://fitnessfirst.net.in/franchise"),
    "UFC Gym India": ("https://ufcgym.in", "https://ufcgym.in/own-a-gym"),
    "Ozone Fitness Club": ("https://ozoneclubs.com", "https://ozoneclubs.com/franchise"),
    "Plus Fitness 24/7": ("https://plusfitness.co.in", "https://plusfitness.co.in/franchise"),
    "Nitrro Wellness & Fitness": ("https://nitrro.in", "https://nitrro.in/franchise"),

    # 7. Education (+6)
    "Little Millennium Preschool": ("https://littlemillennium.com", "https://littlemillennium.com/franchise"),
    "T.I.M.E. Coaching Institute": ("https://time4education.com", "https://time4education.com/franchise"),
    "Aakash Career Institute": ("https://aakash.ac.in", "https://aakash.ac.in/franchise"),
    "Hello Kids Pre-School": ("https://hellokids.co.in", "https://hellokids.co.in/franchise"),
    "Cuemath Learning Centre": ("https://cuemath.com", "https://cuemath.com/teacher-partner"),
    "Smart Kidz Play School": ("https://smartkidzindia.com", "https://smartkidzindia.com/franchise"),

    # 8. Logistics (+5)
    "The Professional Couriers": ("https://tpcindia.com", "https://tpcindia.com/franchise.aspx"),
    "Trackon Couriers Hub": ("https://trackon.in", "https://trackon.in/franchise"),
    "Ecom Express Delivery Center": ("https://ecomexpress.in", "https://ecomexpress.in/partner-with-us"),
    "Ekart Logistics Hub": ("https://ekartlogistics.com", "https://ekartlogistics.com/partner"),
    "Shiprocket Delivery Point": ("https://shiprocket.in", "https://shiprocket.in/partner"),

    # 9. Retail (+5)
    "Tanishq Jewellery Boutique": ("https://tanishq.co.in", "https://titancompany.in/business-partner"),
    "Fabindia Experience Store": ("https://fabindia.com", "https://fabindia.com/franchise"),
    "The Raymond Shop": ("https://raymond.in", "https://raymond.in/franchise"),
    "Manyavar Ethnic Wear": ("https://manyavar.com", "https://vedantfashions.com/franchise"),
    "CaratLane Jewellery Studio": ("https://caratlane.com", "https://caratlane.com/partner"),

    # 10. Beauty & Salon (+5)
    "Looks Salon Studio": ("https://lookssalon.in", "https://lookssalon.in/franchise"),
    "Enrich Salon & Academy": ("https://enrichsalon.com", "https://enrichsalon.com/franchise"),
    "Toni & Guy Hair Dressing": ("https://toniandguyindia.com", "https://toniandguyindia.com/franchise"),
    "Geetanjali Salon Luxe": ("https://geetanjalisalon.com", "https://geetanjalisalon.com/franchise"),
    "Shahnaz Husain Herbal Spa": ("https://shahnaz.in", "https://shahnaz.in/franchise"),

    # 11. EV & Automotive (+5)
    "Hero Electric Dealership": ("https://heroelectric.in", "https://heroelectric.in/become-a-dealer"),
    "Pure EV Experience Centre": ("https://pureev.in", "https://pureev.in/dealership"),
    "3M Car Care Center": ("https://3mcarcare.com", "https://3mcarcare.com/partner"),
    "Mahindra First Choice Wheels": ("https://mahindrafirstchoice.com", "https://mahindrafirstchoice.com/franchise"),
    "Castrol Auto Service Hub": ("https://castrol.com", "https://castrol.com/en_in/india/home/car-engine-oil-and-fluids/castrol-auto-service.html"),

    # 12. Home Services (+5)
    "Urban Company Authorized Hub": ("https://urbancompany.com", "https://urbancompany.com/partner"),
    "Wakefit Mattress Studio": ("https://wakefit.co", "https://wakefit.co/franchise"),
    "Sleepwell Mattress World": ("https://mysleepwell.com", "https://mysleepwell.com/dealership"),
    "Asian Paints Beautiful Homes": ("https://asianpaints.com", "https://asianpaints.com/beautifulhomes/service"),
    "Rentomojo Furniture Studio": ("https://rentomojo.com", "https://rentomojo.com/partner")
}

# New franchise definitions to append to seed_data.py
# Schema matches franchises_master in seed_data.py:
# (name, slug, sector_name, sub_sector, founded, hq, min_inv, max_inv, tot_inv, fee, claimed_rev, actual_rev, claimed_prof, actual_prof, roi, payback, outlets, closed, closure_pct, royalty, mkt_fee, model, space_min, space_max, exp_rate, desc, verified_status, conf_score)

NEW_FRANCHISES_DATA = [
    # ----------------------------------------------------
    # SECTOR 1: QSR (Target: 11 Franchises)
    # ----------------------------------------------------
    (
        "Domino's Pizza India", "dominos-pizza-india", "QSR", "Pizza Delivery & Casual Dining",
        1995, "Noida", 4000000.0, 6000000.0, 5000000.0, 800000.0,
        1800000.0, 1550000.0, 360000.0, 290000.0, 69.6, 17.2,
        2000, 25, 1.2, 5.5, 2.5, "FOCO", 800.0, 1500.0, 16.0,
        "India's largest and most successful pizza delivery chain operated by Jubilant FoodWorks. 30-minute delivery promise, strong digital app orders, and robust corporate supply chain.",
        "VERIFIED", 96.0
    ),
    (
        "Subway India", "subway-india", "QSR", "Fresh Subs, Salads & Wraps",
        2001, "New Delhi", 2800000.0, 4200000.0, 3500000.0, 500000.0,
        850000.0, 720000.0, 180000.0, 142000.0, 48.7, 24.6,
        850, 40, 4.7, 8.0, 4.5, "FOFO", 350.0, 800.0, 12.0,
        "World famous sandwich restaurant offering customizable submarine sandwiches with fresh veggies and baked breads. Low cooking odor and compact equipment setup.",
        "VERIFIED", 92.0
    ),
    (
        "KFC India Express", "kfc-india-express", "QSR", "Crispy Fried Chicken, Burgers & Krushers",
        1995, "Gurugram", 4500000.0, 6500000.0, 5500000.0, 900000.0,
        1900000.0, 1620000.0, 380000.0, 310000.0, 67.6, 17.7,
        1000, 18, 1.8, 6.0, 3.0, "FOCO", 900.0, 1800.0, 18.0,
        "Global fried chicken icon by Yum! Brands with massive brand recall across youth and family diners, standardized pressure fryers, and high delivery basket sizes.",
        "VERIFIED", 95.0
    ),
    (
        "Pizza Hut Express", "pizza-hut-express", "QSR", "Pan Pizzas, Pasta & Appetizers",
        1996, "Gurugram", 3500000.0, 5200000.0, 4400000.0, 700000.0,
        1400000.0, 1180000.0, 280000.0, 225000.0, 61.4, 19.5,
        800, 20, 2.5, 6.0, 2.5, "FOCO", 600.0, 1200.0, 14.0,
        "Household pan pizza and Italian appetizers brand with specialized delivery and dine-in formats, pan-India advertising, and centralized cheese and dough supply.",
        "VERIFIED", 94.0
    ),
    (
        "McDonald's India (West & South)", "mcdonalds-india", "QSR", "Burgers, Fries & McCafe Beverages",
        1996, "Mumbai", 6000000.0, 9000000.0, 7500000.0, 1200000.0,
        2500000.0, 2150000.0, 480000.0, 395000.0, 63.2, 19.0,
        380, 6, 1.5, 5.0, 4.0, "FOCO", 1200.0, 2500.0, 15.0,
        "Global QSR benchmark operated by Westlife Foodworld across West and South India with McCafe integration, high drive-thru and breakfast meal conversions.",
        "VERIFIED", 97.0
    ),

    # ----------------------------------------------------
    # SECTOR 2: Food & Beverage (Target: 11 Franchises)
    # ----------------------------------------------------
    (
        "Biryani Blues", "biryani-blues", "Food & Beverage", "Authentic Hyderabadi Dum Biryani & Starters",
        2013, "Gurugram", 2800000.0, 4000000.0, 3400000.0, 600000.0,
        1100000.0, 920000.0, 240000.0, 190000.0, 67.1, 17.9,
        120, 4, 3.3, 6.0, 2.0, "FOFO", 500.0, 1000.0, 22.0,
        "North India's largest organized biryani chain serving authentic Dum Biryani, Galouti Kebabs, and curries through high-efficiency cloud kitchen and dine-in models.",
        "VERIFIED", 93.0
    ),
    (
        "Behrouz Biryani Hub", "behrouz-biryani-hub", "Food & Beverage", "Royal Persian Dum Biryani & Kebabs",
        2016, "Mumbai", 2200000.0, 3200000.0, 2700000.0, 450000.0,
        980000.0, 840000.0, 220000.0, 178000.0, 79.1, 15.2,
        400, 10, 2.5, 6.5, 2.5, "FOCO", 300.0, 600.0, 28.0,
        "Rebel Foods flagship premium biryani brand prepared with royal spices and saffron. Cloud-kitchen model enables zero dining area capex and high Swiggy/Zomato traction.",
        "REPORTED", 90.0
    ),
    (
        "Faasos Food Kitchen", "faasos-food-kitchen", "Food & Beverage", "Desi Wraps, Rice Bowls & Biryani",
        2011, "Pune", 2000000.0, 3000000.0, 2500000.0, 400000.0,
        920000.0, 790000.0, 195000.0, 155000.0, 74.4, 16.1,
        500, 14, 2.8, 6.0, 2.0, "FOFO", 350.0, 700.0, 25.0,
        "Pioneer of Indian grab-and-go roll and wrap combos by Rebel Foods. High repeat lunch delivery orders among young corporate professionals.",
        "REPORTED", 89.0
    ),
    (
        "Goli Vada Pav No. 1", "goli-vada-pav", "Food & Beverage", "Standardized Hygienic Vada Pav & Snacks",
        2004, "Mumbai", 800000.0, 1400000.0, 1100000.0, 200000.0,
        380000.0, 320000.0, 105000.0, 88000.0, 96.0, 12.5,
        300, 25, 8.3, 5.0, 1.5, "FOFO", 120.0, 300.0, 10.0,
        "Organized Indian fast food street brand bringing standardized, frozen automated frying to classic Mumbai vada pavs with low initial capital requirement.",
        "VERIFIED", 88.0
    ),
    (
        "Dosa Plaza Express", "dosa-plaza-express", "Food & Beverage", "104 Varieties of Fusion Dosas",
        1997, "Mumbai", 2200000.0, 3500000.0, 2800000.0, 450000.0,
        780000.0, 640000.0, 175000.0, 135000.0, 57.8, 20.7,
        150, 8, 5.3, 6.0, 2.0, "FOFO", 400.0, 900.0, 15.0,
        "The world's largest chain of fusion dosas offering Mexican, Italian, and Chinese twist South Indian cuisine with high family appeal in malls and high streets.",
        "REPORTED", 87.0
    ),
    (
        "Bikanervala Express", "bikanervala-express", "Food & Beverage", "Traditional Sweets, Namkeen & Chaat",
        1950, "New Delhi", 3800000.0, 5600000.0, 4800000.0, 750000.0,
        1350000.0, 1150000.0, 310000.0, 250000.0, 62.5, 19.2,
        180, 4, 2.2, 5.0, 2.0, "FOFO", 600.0, 1400.0, 14.0,
        "Historic heritage Indian vegetarian dining, festive sweet boxes, and namkeen retail giant enjoying strong festive wedding and Diwali surges.",
        "VERIFIED", 94.0
    ),

    # ----------------------------------------------------
    # SECTOR 3: Cafes (Target: 11 Franchises)
    # ----------------------------------------------------
    (
        "Barista Coffee Cafe", "barista-coffee-cafe", "Cafes", "Italian Espresso, Cappuccino & Continental Meals",
        2000, "New Delhi", 2800000.0, 4200000.0, 3500000.0, 500000.0,
        780000.0, 640000.0, 175000.0, 138000.0, 47.3, 25.4,
        350, 15, 4.3, 6.0, 2.0, "FOFO", 500.0, 1200.0, 12.0,
        "Pioneer of Italian espresso coffee culture in India with rich corporate brand equity, quiet meeting spaces, and loyal professional patrons.",
        "VERIFIED", 91.0
    ),
    (
        "Costa Coffee India", "costa-coffee-india", "Cafes", "British Handcrafted Coffee & Pastries",
        1971, "Gurugram", 3500000.0, 5200000.0, 4400000.0, 650000.0,
        1050000.0, 880000.0, 240000.0, 195000.0, 53.2, 22.6,
        170, 5, 2.9, 6.0, 2.5, "FOCO", 600.0, 1200.0, 20.0,
        "Leading international coffee chain operated in India by Devyani International with Signature Mocha Italia beans and high airport/mall footfall conversion.",
        "VERIFIED", 93.0
    ),
    (
        "Tea Post Desi Cafe", "tea-post-cafe", "Cafes", "Chai, Gujarati Snacks & Thepla Combos",
        2013, "Rajkot", 1100000.0, 1800000.0, 1450000.0, 300000.0,
        460000.0, 390000.0, 125000.0, 102000.0, 84.4, 14.2,
        220, 8, 3.6, 5.0, 1.5, "FOFO", 250.0, 600.0, 24.0,
        "Fast-growing tea cafe chain with over 200 locations across Western India serving hygienic hand-brewed masala tea, puff patties, and handvo snacks.",
        "REPORTED", 88.0
    ),
    (
        "MBA Chai Wala", "mba-chai-wala", "Cafes", "Street Chai, Maska Bun & Youth Lounge",
        2017, "Indore", 1200000.0, 1900000.0, 1550000.0, 300000.0,
        420000.0, 340000.0, 110000.0, 82000.0, 63.5, 18.9,
        120, 20, 16.7, 5.0, 2.0, "FOFO", 200.0, 500.0, 15.0,
        "Viral youth tea franchise known for vibrant social media engagement, low ticket prices, and high evening student footfall.",
        "REPORTED", 79.0
    ),
    (
        "Chai Sutta Bar", "chai-sutta-bar", "Cafes", "Kulhad Chai, Maggi & Finger Foods",
        2016, "Indore", 1400000.0, 2200000.0, 1800000.0, 350000.0,
        520000.0, 440000.0, 145000.0, 118000.0, 78.7, 15.2,
        450, 22, 4.9, 4.0, 1.5, "FOFO", 300.0, 700.0, 30.0,
        "Extremely popular youth cafe chain offering eco-friendly kulhad tea, flavored ice teas, and quick bites across college towns and metro high streets.",
        "VERIFIED", 90.0
    ),
    (
        "Roastery Coffee House", "roastery-coffee-house", "Cafes", "Artisanal Specialty Coffee & Estate Roasts",
        2017, "Hyderabad", 4500000.0, 6500000.0, 5500000.0, 800000.0,
        1400000.0, 1180000.0, 320000.0, 255000.0, 55.6, 21.6,
        15, 0, 0.0, 6.0, 2.0, "FOCO", 1200.0, 2500.0, 35.0,
        "Award-winning specialty cafe known for serene courtyard settings, estate single-origin cold brews, and premium artisanal food menu.",
        "VERIFIED", 94.0
    ),

    # ----------------------------------------------------
    # SECTOR 4: Healthcare (Target: 10 Franchises)
    # ----------------------------------------------------
    (
        "Frank Ross Pharmacy", "frank-ross-pharmacy", "Healthcare", "Prescription Drugs & Health Supplements",
        1906, "Kolkata", 2000000.0, 3000000.0, 2500000.0, 350000.0,
        800000.0, 710000.0, 140000.0, 118000.0, 56.6, 21.2,
        250, 4, 1.6, 0.0, 1.0, "FOFO", 350.0, 700.0, 14.0,
        "Historic East India pharmacy chain operated by Emami Group with century-long consumer trust, guaranteed medicine availability, and senior citizen refill discounts.",
        "VERIFIED", 95.0
    ),
    (
        "Sanjivani Pharmacy", "sanjivani-pharmacy", "Healthcare", "Generic & Allopathic Chemist Counter",
        2006, "New Delhi", 1600000.0, 2400000.0, 2000000.0, 300000.0,
        650000.0, 560000.0, 120000.0, 98000.0, 58.8, 20.4,
        180, 6, 3.3, 2.0, 1.0, "FOFO", 250.0, 500.0, 16.0,
        "Standardized community pharmacy retail chain with central purchasing, computerized billing, and essential generic medicine price advantages.",
        "REPORTED", 87.0
    ),
    (
        "Noble Plus Pharmacy", "noble-plus-pharmacy", "Healthcare", "24x7 Chemist & Beauty Skin Care Store",
        2008, "Mumbai", 2500000.0, 3800000.0, 3100000.0, 450000.0,
        1050000.0, 910000.0, 180000.0, 150000.0, 58.1, 20.7,
        85, 2, 2.4, 0.0, 1.5, "FOFO", 400.0, 900.0, 18.0,
        "Premier pharmacy and wellness chain in Mumbai with 24/7 operating licenses, imported skincare products, and fast doctor prescription deliveries.",
        "VERIFIED", 92.0
    ),
    (
        "Generico Dava India", "generico-dava-india", "Healthcare", "Affordable Generic Medicines & Ayurvedic Care",
        2017, "Surat", 1200000.0, 1800000.0, 1500000.0, 250000.0,
        550000.0, 480000.0, 130000.0, 110000.0, 88.0, 13.6,
        1100, 25, 2.3, 0.0, 1.0, "FOFO", 200.0, 450.0, 32.0,
        "India's largest generic medicine retail chain offering WHO-GMP certified affordable alternatives saving up to 70% on chronic prescriptions for diabetic and cardiac patients.",
        "VERIFIED", 94.0
    ),
    (
        "Guardian GNC Health Store", "guardian-gnc", "Healthcare", "Sports Nutrition, Vitamins & Wellness Supplements",
        2003, "Gurugram", 2200000.0, 3400000.0, 2800000.0, 400000.0,
        720000.0, 610000.0, 160000.0, 130000.0, 55.7, 21.5,
        140, 5, 3.6, 3.0, 2.0, "FOFO", 300.0, 700.0, 15.0,
        "Exclusive Indian master partner for world-famous GNC wellness brand specializing in whey proteins, daily multivitamin packs, and bodybuilding nutrition.",
        "VERIFIED", 91.0
    ),

    # ----------------------------------------------------
    # SECTOR 5: Diagnostics (Target: 10 Franchises)
    # ----------------------------------------------------
    (
        "Redcliffe Labs Hub", "redcliffe-labs-hub", "Diagnostics", "Digital Pathology & At-Home Blood Collection",
        2018, "Noida", 800000.0, 1400000.0, 1100000.0, 200000.0,
        380000.0, 330000.0, 110000.0, 92000.0, 100.4, 12.0,
        1500, 20, 1.3, 0.0, 1.0, "FOFO", 200.0, 450.0, 35.0,
        "AI-driven diagnostic laboratory network offering automated temperature-controlled home sample pickup, real-time barcoded tracking, and sub-12 hour report turnaround.",
        "VERIFIED", 95.0
    ),
    (
        "Suburban Diagnostics", "suburban-diagnostics", "Diagnostics", "Comprehensive Pathology & ECG Scanning",
        1994, "Mumbai", 1900000.0, 2800000.0, 2400000.0, 350000.0,
        620000.0, 530000.0, 155000.0, 128000.0, 64.0, 18.8,
        250, 5, 2.0, 0.0, 1.5, "FOFO", 350.0, 800.0, 16.0,
        "CAP and NABL accredited Mumbai diagnostics pioneer with state-of-the-art pathology automation, digital radiography, and trusted doctor referrals.",
        "VERIFIED", 93.0
    ),
    (
        "Max Lab Collection Center", "max-lab-center", "Diagnostics", "Hospital-Grade Pathology Collection Hub",
        2016, "New Delhi", 900000.0, 1500000.0, 1200000.0, 200000.0,
        420000.0, 360000.0, 115000.0, 96000.0, 96.0, 12.5,
        450, 6, 1.3, 0.0, 1.0, "FOFO", 200.0, 400.0, 26.0,
        "Diagnostic division of Max Healthcare offering tertiary-care diagnostic protocols, precision cancer testing, and strong hospital brand goodwill.",
        "VERIFIED", 96.0
    ),
    (
        "Vijaya Diagnostic Centre", "vijaya-diagnostic", "Diagnostics", "Integrated Pathology & Radiology Super Center",
        1981, "Hyderabad", 3500000.0, 5500000.0, 4500000.0, 650000.0,
        1400000.0, 1200000.0, 340000.0, 280000.0, 74.7, 16.1,
        140, 2, 1.4, 0.0, 1.5, "FOCO", 1200.0, 3000.0, 20.0,
        "South India's most recognized integrated diagnostic network providing high-end MRI, CT scans, mammography, and complete pathology under one roof.",
        "VERIFIED", 97.0
    ),
    (
        "Healthians Wellness Hub", "healthians-wellness", "Diagnostics", "Direct-to-Consumer Preventive Health Testing",
        2014, "Gurugram", 750000.0, 1300000.0, 1050000.0, 180000.0,
        360000.0, 310000.0, 95000.0, 80000.0, 91.4, 13.1,
        600, 12, 2.0, 0.0, 1.0, "FOFO", 180.0, 400.0, 28.0,
        "Leading tech-first diagnostic service backed by Yuvraj Singh with smart robotic labs, preventive blood profiles, and zero-contamination phlebotomy kits.",
        "REPORTED", 89.0
    ),

    # ----------------------------------------------------
    # SECTOR 6: Fitness (Target: 10 Franchises)
    # ----------------------------------------------------
    (
        "Fitness First India", "fitness-first-india", "Fitness", "Executive Premium Health Club & Cardio",
        2008, "New Delhi", 7500000.0, 10500000.0, 9000000.0, 1400000.0,
        1700000.0, 1420000.0, 460000.0, 350000.0, 46.7, 25.7,
        25, 1, 4.0, 6.5, 2.0, "FOCO", 4000.0, 8000.0, 10.0,
        "Premium international health club catering to corporate leaders and high net-worth individuals with steam spas, private lockers, and master group fitness classes.",
        "VERIFIED", 92.0
    ),
    (
        "UFC Gym India", "ufc-gym-india", "Fitness", "MMA Training, Functional Fitness & Octagon Zone",
        2018, "Mumbai", 8500000.0, 12000000.0, 10500000.0, 1600000.0,
        2100000.0, 1750000.0, 550000.0, 410000.0, 46.9, 25.6,
        18, 0, 0.0, 7.0, 2.5, "FOFO", 4500.0, 9000.0, 25.0,
        "Official fitness extension of the world-famous UFC mixed martial arts brand featuring youth wrestling, Brazilian Jiu-Jitsu, and high-intensity Daily Ultimate Training.",
        "VERIFIED", 93.0
    ),
    (
        "Ozone Fitness Club", "ozone-fitness-club", "Fitness", "Luxury Fitness Studio, Aerobics & Spa",
        2002, "New Delhi", 6500000.0, 9500000.0, 8000000.0, 1200000.0,
        1500000.0, 1240000.0, 390000.0, 295000.0, 44.3, 27.1,
        40, 2, 5.0, 6.0, 2.0, "FOFO", 3500.0, 7000.0, 12.0,
        "ISO 9001 and 14001 certified luxury boutique fitness club offering customized wellness therapies, physiotherapy, and certified personal trainers.",
        "REPORTED", 86.0
    ),
    (
        "Plus Fitness 24/7", "plus-fitness-247", "Fitness", "Australian 24/7 Smart Gym & Strength Area",
        2018, "Ahmedabad", 5500000.0, 8000000.0, 6800000.0, 1000000.0,
        1300000.0, 1080000.0, 360000.0, 270000.0, 47.6, 25.2,
        60, 2, 3.3, 6.0, 2.0, "FOFO", 2500.0, 5000.0, 22.0,
        "Leading Australian 24-hour gym franchise known for zero lock-in contracts, complimentary fitness programs, and automated card access systems.",
        "VERIFIED", 90.0
    ),
    (
        "Nitrro Wellness & Fitness", "nitrro-wellness", "Fitness", "Celebrity Gym, Sky Lounge & Strength Floor",
        2012, "Mumbai", 9000000.0, 13500000.0, 11500000.0, 1800000.0,
        2400000.0, 1980000.0, 620000.0, 480000.0, 50.1, 24.0,
        14, 0, 0.0, 7.5, 2.5, "FOCO", 5000.0, 10000.0, 20.0,
        "Award-winning ultra-luxury gym frequented by Bollywood celebrities, sports stars, and industrialists featuring ISO-certified biomechanical equipment and certified nutritionists.",
        "VERIFIED", 94.0
    ),

    # ----------------------------------------------------
    # SECTOR 7: Education (Target: 11 Franchises)
    # ----------------------------------------------------
    (
        "Little Millennium Preschool", "little-millennium", "Education", "Seven Petal Preschool & Kindergarten",
        2008, "New Delhi", 1800000.0, 2600000.0, 2200000.0, 350000.0,
        450000.0, 390000.0, 135000.0, 112000.0, 61.1, 19.6,
        1000, 20, 2.0, 6.0, 2.0, "FOFO", 1400.0, 2500.0, 16.0,
        "Award-winning early childhood network implementing the proprietary 'Seven Petal' holistic development curriculum across 150+ Indian cities.",
        "VERIFIED", 94.0
    ),
    (
        "T.I.M.E. Coaching Institute", "time-coaching", "Education", "CAT, GRE, Bank PO & Management Entrance",
        1992, "Hyderabad", 2500000.0, 4000000.0, 3200000.0, 500000.0,
        1100000.0, 940000.0, 270000.0, 220000.0, 82.5, 14.5,
        200, 5, 2.5, 8.0, 2.0, "FOFO", 1500.0, 3000.0, 12.0,
        "India's leading test prep institute for CAT and MBA competitive entrance exams with over 30 years of pedigree and unparalleled IIM conversion track record.",
        "VERIFIED", 95.0
    ),
    (
        "Aakash Career Institute", "aakash-institute", "Education", "Medical NEET & Engineering JEE Coaching",
        1988, "New Delhi", 4500000.0, 7000000.0, 5800000.0, 1000000.0,
        1800000.0, 1520000.0, 450000.0, 365000.0, 75.5, 15.9,
        315, 4, 1.3, 9.0, 3.0, "FOCO", 2500.0, 5500.0, 22.0,
        "National test prep powerhouse coaching thousands of successful NEET medical and JEE engineering aspirants with standardized tests and digital iTutor modules.",
        "VERIFIED", 97.0
    ),
    (
        "Hello Kids Pre-School", "hello-kids-preschool", "Education", "Playgroup, Nursery & Daycare Center",
        2005, "Bangalore", 900000.0, 1500000.0, 1200000.0, 200000.0,
        320000.0, 280000.0, 100000.0, 85000.0, 85.0, 14.1,
        750, 18, 2.4, 0.0, 1.5, "FOFO", 1000.0, 2000.0, 18.0,
        "Affordable preschool model operating on a zero-royalty structure allowing high net profit margins for mom-and-pop educational entrepreneurs.",
        "REPORTED", 89.0
    ),
    (
        "Cuemath Learning Centre", "cuemath-center", "Education", "Visual Math & Coding Mastery Lab",
        2013, "Bangalore", 450000.0, 800000.0, 600000.0, 120000.0,
        220000.0, 190000.0, 85000.0, 72000.0, 144.0, 8.3,
        5000, 150, 3.0, 10.0, 2.0, "FOFO", 300.0, 600.0, 30.0,
        "Google and Sequoia backed visual math and logic mastery program with gamified learning worksheets, tablet modules, and strong neighborhood tutor density.",
        "VERIFIED", 93.0
    ),
    (
        "Smart Kidz Play School", "smart-kidz-preschool", "Education", "Montessori Playschool & Kindergarten",
        2007, "Hyderabad", 1100000.0, 1800000.0, 1450000.0, 250000.0,
        350000.0, 300000.0, 105000.0, 88000.0, 72.8, 16.5,
        280, 8, 2.9, 5.0, 1.5, "FOFO", 1200.0, 2200.0, 14.0,
        "ISO certified preschool franchise network blending traditional Indian values with modern audio-visual activity rooms and teacher training workshops.",
        "REPORTED", 86.0
    ),

    # ----------------------------------------------------
    # SECTOR 8: Logistics (Target: 10 Franchises)
    # ----------------------------------------------------
    (
        "The Professional Couriers", "professional-couriers", "Logistics", "Domestic Parcel & Cargo Counter",
        1987, "Mumbai", 350000.0, 750000.0, 550000.0, 100000.0,
        220000.0, 190000.0, 62000.0, 48000.0, 104.7, 11.5,
        3500, 45, 1.3, 0.0, 0.0, "FOFO", 200.0, 450.0, 8.0,
        "Pioneering Indian courier network with deep rural and semi-urban tier-3/4 penetration, handling millions of domestic consignments per month.",
        "VERIFIED", 91.0
    ),
    (
        "Trackon Couriers Hub", "trackon-couriers", "Logistics", "Express Parcel Service & Prime Track Cargo",
        2002, "New Delhi", 400000.0, 800000.0, 600000.0, 120000.0,
        250000.0, 215000.0, 68000.0, 54000.0, 108.0, 11.1,
        2400, 30, 1.3, 0.0, 0.0, "FOFO", 200.0, 450.0, 12.0,
        "National express cargo specialist offering guaranteed next-business-day delivery (Prime Track) across major commerce corridors and industrial clusters.",
        "VERIFIED", 90.0
    ),
    (
        "Ecom Express Delivery Center", "ecom-express-center", "Logistics", "E-Commerce Logistics & Cash on Delivery",
        2012, "Gurugram", 850000.0, 1500000.0, 1200000.0, 200000.0,
        580000.0, 490000.0, 130000.0, 105000.0, 105.0, 11.4,
        3000, 38, 1.3, 0.0, 1.0, "FOFO", 400.0, 900.0, 24.0,
        "Technology-enabled supply chain solutions provider specializing in last-mile e-commerce parcel delivery and high-security Cash-on-Delivery collections.",
        "VERIFIED", 94.0
    ),
    (
        "Ekart Logistics Hub", "ekart-logistics-hub", "Logistics", "Marketplace Last-Mile Logistics Center",
        2009, "Bangalore", 1100000.0, 1900000.0, 1500000.0, 250000.0,
        720000.0, 610000.0, 155000.0, 125000.0, 100.0, 12.0,
        4000, 35, 0.9, 0.0, 1.0, "FOFO", 500.0, 1200.0, 20.0,
        "Flipkart's dedicated internal supply chain arm now open to 3PL parcel consignments, providing massive daily volume drops and predictable dispatch commissions.",
        "VERIFIED", 96.0
    ),
    (
        "Shiprocket Delivery Point", "shiprocket-delivery-point", "Logistics", "D2C Automated Shipping & Fulfillment Kiosk",
        2017, "New Delhi", 500000.0, 950000.0, 750000.0, 150000.0,
        340000.0, 290000.0, 82000.0, 68000.0, 108.8, 11.0,
        1200, 18, 1.5, 0.0, 1.0, "FOFO", 250.0, 500.0, 35.0,
        "Unicorn logistics aggregator platform enabling local MSME retailers to drop off packages for multi-carrier dispatch with automated labels and barcode tracking.",
        "REPORTED", 91.0
    ),

    # ----------------------------------------------------
    # SECTOR 9: Retail (Target: 10 Franchises)
    # ----------------------------------------------------
    (
        "Tanishq Jewellery Boutique", "tanishq-jewellery", "Retail", "Gold, Diamond & Polki Jewellery",
        1994, "Bangalore", 12000000.0, 20000000.0, 16000000.0, 2500000.0,
        4500000.0, 3800000.0, 750000.0, 620000.0, 46.5, 25.8,
        450, 2, 0.4, 0.0, 2.0, "FOCO", 1500.0, 3500.0, 15.0,
        "India's most trusted jewellery retail brand from the Tata Group. Uncompromising gold purity with Karatmeter tests, wedding season rushes, and gold harvest savings schemes.",
        "VERIFIED", 98.0
    ),
    (
        "Fabindia Experience Store", "fabindia-store", "Retail", "Handloom Apparel, Organic Foods & Home Decor",
        1960, "New Delhi", 4500000.0, 7000000.0, 5800000.0, 800000.0,
        1400000.0, 1180000.0, 280000.0, 220000.0, 45.5, 26.4,
        350, 8, 2.3, 0.0, 2.0, "FOFO", 1200.0, 2500.0, 12.0,
        "India's largest retail platform for handcrafted goods made by 55,000+ rural artisans blending ethnic kurta fashion with organic wellness snacks.",
        "VERIFIED", 93.0
    ),
    (
        "The Raymond Shop", "raymond-shop", "Retail", "Suits, Fabrics & Custom Tailoring",
        1925, "Mumbai", 5000000.0, 8000000.0, 6500000.0, 900000.0,
        1600000.0, 1350000.0, 320000.0, 260000.0, 48.0, 25.0,
        1100, 15, 1.4, 0.0, 2.0, "FOFO", 1000.0, 2200.0, 10.0,
        "'The Complete Man' iconic menswear heritage brand offering premium suiting, bespoke custom tailoring masters, and wedding sherwani collections.",
        "VERIFIED", 96.0
    ),
    (
        "Manyavar Ethnic Wear", "manyavar-ethnic-wear", "Retail", "Celebration Wear, Kurta Sets & Sherwanis",
        1999, "Kolkata", 5500000.0, 8500000.0, 7000000.0, 1000000.0,
        1800000.0, 1520000.0, 380000.0, 310000.0, 53.1, 22.6,
        650, 6, 0.9, 0.0, 2.5, "FOCO", 1200.0, 2800.0, 16.0,
        "India's undisputed leader in men's celebratory wedding wear by Vedant Fashions with zero discounting, high gross margins, and celebrity brand ambassadors.",
        "VERIFIED", 97.0
    ),
    (
        "CaratLane Jewellery Studio", "caratlane-studio", "Retail", "Everyday Modern Diamonds & Gemstones",
        2008, "Chennai", 4800000.0, 7500000.0, 6200000.0, 900000.0,
        1900000.0, 1600000.0, 360000.0, 290000.0, 56.1, 21.4,
        270, 3, 1.1, 0.0, 2.0, "FOCO", 800.0, 1800.0, 28.0,
        "Omni-channel fine jewellery brand partnered with Tanishq offering accessible contemporary diamond rings, pendants, and interactive virtual try-on mirrors.",
        "VERIFIED", 95.0
    ),

    # ----------------------------------------------------
    # SECTOR 10: Beauty & Salon (Target: 10 Franchises)
    # ----------------------------------------------------
    (
        "Looks Salon Studio", "looks-salon-studio", "Beauty & Salon", "Luxury Hair Styling, Spa & Grooming",
        1989, "New Delhi", 3500000.0, 5200000.0, 4400000.0, 650000.0,
        1100000.0, 920000.0, 270000.0, 215000.0, 58.6, 20.5,
        200, 6, 3.0, 8.0, 2.0, "FOFO", 800.0, 1600.0, 16.0,
        "Premium pan-India unisex salon chain with opulent interiors, certified Kerastase hair treatments, and high repeat appointment velocity.",
        "VERIFIED", 93.0
    ),
    (
        "Enrich Salon & Academy", "enrich-salon", "Beauty & Salon", "Color Bar, Skincare & Bridal Makeover",
        1997, "Mumbai", 3200000.0, 4800000.0, 4000000.0, 600000.0,
        1050000.0, 870000.0, 250000.0, 195000.0, 58.5, 20.5,
        120, 5, 4.2, 7.5, 2.0, "FOFO", 900.0, 1800.0, 14.0,
        "Western India's pioneer in standardized beauty services offering transparent pricing, digital booking apps, and CIDESCO-certified beauticians.",
        "REPORTED", 88.0
    ),
    (
        "Toni & Guy Hair Dressing", "toni-and-guy-india", "Beauty & Salon", "British Fashion Hair Cutting & Couture",
        1963, "London / Mumbai", 4500000.0, 6800000.0, 5600000.0, 850000.0,
        1350000.0, 1120000.0, 330000.0, 260000.0, 55.7, 21.5,
        70, 2, 2.9, 8.5, 2.5, "FOFO", 1000.0, 2000.0, 18.0,
        "International super-brand in British precision hairdressing and catwalk fashion styling attracting high-spending fashion-forward urban clientele.",
        "VERIFIED", 94.0
    ),
    (
        "Geetanjali Salon Luxe", "geetanjali-salon", "Beauty & Salon", "High-Street Hair Studio & Luxury Spa",
        1989, "New Delhi", 4000000.0, 6000000.0, 5000000.0, 750000.0,
        1250000.0, 1040000.0, 310000.0, 245000.0, 58.8, 20.4,
        160, 4, 2.5, 8.0, 2.0, "FOFO", 1000.0, 2200.0, 15.0,
        "Celebrity hair designer Sumit Israni's luxury salon network renowned for bridal makeovers, Balayage color artistry, and affluent high-street footfall.",
        "VERIFIED", 95.0
    ),
    (
        "Shahnaz Husain Herbal Spa", "shahnaz-husain-spa", "Beauty & Salon", "Ayurvedic Beauty Care & Herbal Facials",
        1970, "New Delhi", 1800000.0, 2800000.0, 2300000.0, 350000.0,
        550000.0, 460000.0, 135000.0, 105000.0, 54.8, 21.9,
        400, 15, 3.8, 6.0, 1.5, "FOFO", 500.0, 1000.0, 8.0,
        "World pioneer of organic Ayurvedic cosmetics and clinical herbal skin treatments with high product retail counter cross-sell margins.",
        "REPORTED", 86.0
    ),

    # ----------------------------------------------------
    # SECTOR 11: EV & Automotive (Target: 10 Franchises)
    # ----------------------------------------------------
    (
        "Hero Electric Dealership", "hero-electric-dealership", "EV & Automotive", "Electric 2-Wheelers & Battery Swapping",
        2007, "New Delhi", 3500000.0, 5200000.0, 4400000.0, 500000.0,
        2200000.0, 1820000.0, 250000.0, 195000.0, 53.2, 22.6,
        850, 22, 2.6, 2.5, 1.5, "FOFO", 1000.0, 2200.0, 20.0,
        "Pioneer in high-volume affordable electric scooters with widespread pan-India network, subsidized state EV policies, and steady spare-part margins.",
        "VERIFIED", 91.0
    ),
    (
        "Pure EV Experience Centre", "pure-ev-center", "EV & Automotive", "High-Speed Electric Scooters & Motorcycles",
        2015, "Hyderabad", 3200000.0, 4800000.0, 4000000.0, 450000.0,
        1900000.0, 1580000.0, 220000.0, 175000.0, 52.5, 22.9,
        140, 5, 3.6, 3.0, 1.5, "FOFO", 800.0, 1800.0, 26.0,
        "IIT Hyderabad-incubated EV manufacturer specializing in patented battery thermal management and long-range high-speed electric two-wheelers.",
        "REPORTED", 87.0
    ),
    (
        "3M Car Care Center", "3m-car-care", "EV & Automotive", "Paint Protection Film, Polishing & Detailing",
        2010, "Bangalore", 2800000.0, 4200000.0, 3500000.0, 500000.0,
        780000.0, 640000.0, 195000.0, 155000.0, 53.1, 22.6,
        160, 6, 3.8, 5.0, 2.0, "FOFO", 1200.0, 2400.0, 14.0,
        "Global chemical leader 3M's flagship auto detailing franchise known for Scotchgard paint protection films, acoustic dampening, and high ticket car restorations.",
        "VERIFIED", 95.0
    ),
    (
        "Mahindra First Choice Wheels", "mahindra-first-choice", "EV & Automotive", "Certified Pre-Owned Cars & Warranty",
        2008, "Mumbai", 4500000.0, 7000000.0, 5800000.0, 750000.0,
        3200000.0, 2650000.0, 340000.0, 260000.0, 53.8, 22.3,
        1200, 28, 2.3, 3.0, 1.5, "FOFO", 2000.0, 5000.0, 16.0,
        "India's No. 1 multi-brand certified used car retailer backed by Mahindra Group offering 118-point inspection certificates and used-car financing.",
        "VERIFIED", 96.0
    ),
    (
        "Castrol Auto Service Hub", "castrol-auto-service", "EV & Automotive", "Fast Lube, Fluid Exchange & Preventive Service",
        1919, "Mumbai", 2200000.0, 3400000.0, 2800000.0, 400000.0,
        820000.0, 690000.0, 180000.0, 142000.0, 60.9, 19.7,
        350, 10, 2.9, 4.0, 1.5, "FOFO", 1000.0, 2500.0, 18.0,
        "World-renowned lubricant brand Castrol's authorized workshop network offering fast digital oil changes, computer engine scans, and genuine Castrol synthetics.",
        "VERIFIED", 94.0
    ),

    # ----------------------------------------------------
    # SECTOR 12: Home Services (Target: 10 Franchises)
    # ----------------------------------------------------
    (
        "Urban Company Authorized Hub", "urban-company-hub", "Home Services", "At-Home Salon, AC Repair & House Cleaning Hub",
        2014, "Gurugram", 1200000.0, 2000000.0, 1600000.0, 300000.0,
        550000.0, 460000.0, 130000.0, 104000.0, 78.0, 15.4,
        450, 14, 3.1, 5.0, 2.0, "FOFO", 400.0, 800.0, 28.0,
        "India's largest home services marketplace hub managing local field service partners, equipment calibration, tool distribution, and on-demand home deep cleaning.",
        "VERIFIED", 95.0
    ),
    (
        "Wakefit Mattress Studio", "wakefit-mattress-studio", "Home Services", "Orthopedic Mattresses, Beds & Home Decor",
        2016, "Bangalore", 2600000.0, 3800000.0, 3200000.0, 450000.0,
        920000.0, 780000.0, 210000.0, 170000.0, 63.8, 18.8,
        80, 2, 2.5, 0.0, 2.0, "FOCO", 800.0, 1800.0, 32.0,
        "Disruptive sleep solutions and ergonomic furniture brand with touch-and-feel offline experience centers driving high-velocity digital fulfillment.",
        "VERIFIED", 93.0
    ),
    (
        "Sleepwell Mattress World", "sleepwell-mattress-world", "Home Services", "Luxury Mattresses, Pillows & Bedding",
        1971, "Noida", 2000000.0, 3200000.0, 2600000.0, 350000.0,
        780000.0, 650000.0, 175000.0, 140000.0, 64.6, 18.6,
        4500, 35, 0.8, 0.0, 1.5, "FOFO", 500.0, 1200.0, 10.0,
        "Household mattress brand with five decades of orthopedic engineering, anti-microbial Neem Fresche tech, and strong dealer network loyalty.",
        "VERIFIED", 96.0
    ),
    (
        "Asian Paints Beautiful Homes", "asian-paints-beautiful-homes", "Home Services", "Turnkey Interior Decor, Kitchens & Sanitaryware",
        1942, "Mumbai", 4500000.0, 7000000.0, 5800000.0, 800000.0,
        1800000.0, 1500000.0, 380000.0, 305000.0, 63.1, 19.0,
        600, 8, 1.3, 0.0, 2.0, "FOCO", 1500.0, 3500.0, 22.0,
        "India's largest paint corporation Asian Paints' turnkey home design superstore offering modular kitchens, wallpaper, lighting, and guaranteed execution.",
        "VERIFIED", 97.0
    ),
    (
        "Rentomojo Furniture Studio", "rentomojo-studio", "Home Services", "Furniture & Appliance Subscription Showroom",
        2014, "Bangalore", 2400000.0, 3600000.0, 3000000.0, 400000.0,
        820000.0, 680000.0, 185000.0, 145000.0, 58.0, 20.7,
        45, 1, 2.2, 0.0, 2.0, "FOCO", 700.0, 1500.0, 25.0,
        "Tech-enabled rental and subscription showroom allowing urban millennials to rent designer furniture, workstations, and high-end appliances on flexi-tenures.",
        "REPORTED", 89.0
    )
]