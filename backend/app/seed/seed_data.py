from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models.user import User, UserPreference, Watchlist, Notification, AuditLog
from app.models.franchise import (
    Sector, Franchise, FranchiseInvestment, FranchiseFinancial,
    OperatingCost, FranchiseFee, FranchisorSupport
)
from app.models.history import HistoricalFinancial, Outlet, OutletHistory
from app.models.verification import DataSource, DataVerification
from app.models.location import Location, LocationAnalysis, Competitor
from app.models.review import Review, FranchiseeReport
from app.services.auth import hash_password

def init_db():
    Base.metadata.create_all(bind=engine)

def seed_all_data():
    db: Session = SessionLocal()
    try:
        franchise_count = db.query(Franchise).count()
        if franchise_count >= 60:
            print(f"Database already populated with {franchise_count} franchises.")
            return
        elif franchise_count > 0:
            print(f"Current count {franchise_count} < 60. Rebuilding database with 60+ multi-sector franchises...")
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)

        print("Seeding FranchiseIQ database with 60+ multi-sector franchises...")

        # 1. Users
        investor_user = User(
            email="investor@franchiseiq.com",
            name="Rajesh Sharma",
            hashed_password=hash_password("Investor@123"),
            role="investor"
        )
        admin_user = User(
            email="admin@franchiseiq.com",
            name="Vikram Mehta (Chief Analyst)",
            hashed_password=hash_password("Admin@123"),
            role="admin"
        )
        db.add_all([investor_user, admin_user])
        db.commit()
        db.refresh(investor_user)
        db.refresh(admin_user)

        # Investor Preferences
        user_pref = UserPreference(
            user_id=investor_user.id,
            budget=2500000.0,
            city="Hyderabad",
            locality="Madhapur",
            shop_area_sqft=800.0,
            business_experience="0-2 years",
            desired_involvement="full-time",
            risk_preference="Medium",
            desired_return_pct=28.0,
            max_payback_months=30,
            goal="Maximum ROI"
        )
        db.add(user_pref)
        db.commit()

        # 2. 12 Core Primary Sectors
        sectors_data = [
            ("QSR", "F&B", "Quick-service food chains with fast table turnover, counters, and delivery sales", "FastForward"),
            ("Food & Beverage", "F&B", "Dine-in restaurants, bistros, cloud kitchens and specialty culinary brands", "UtensilsCrossed"),
            ("Cafes", "F&B", "Artisanal coffee roasteries, tea lounges and dessert patisseries", "Coffee"),
            ("Healthcare", "Health", "Primary community pharmacies, wellness clinics and health stores", "HeartPulse"),
            ("Diagnostics", "Health", "Pathology laboratories, scan centers and sample collection hubs", "Activity"),
            ("Fitness", "Wellness", "Smart gyms, CrossFit training boxes and functional fitness centers", "Dumbbell"),
            ("Education", "Education", "Early childhood preschools, day care, and competitive exam test prep", "GraduationCap"),
            ("Logistics", "B2B & Industrial", "Last-mile parcel delivery hubs, 3PL depots and express courier counters", "Truck"),
            ("Retail", "Retail", "Prescription eyewear, maternity & kids wear, specialty apparel and sports gear", "ShoppingBag"),
            ("Beauty & Salon", "Personal Care", "Unisex luxury hair salons, bridal grooming studios and wellness spas", "Scissors"),
            ("EV & Automotive", "Automotive", "Electric two-wheeler showrooms, high-pressure car wash and auto service hubs", "Zap"),
            ("Home Services", "Services", "Omnichannel furniture studios, interior experience centers and facility cleaning", "Sparkles")
        ]

        sector_objs = {}
        for name, cat, desc, icon in sectors_data:
            s = Sector(name=name, category=cat, description=desc, icon=icon, is_active=True)
            db.add(s)
            db.commit()
            db.refresh(s)
            sector_objs[name] = s

        # 3. Prime Commercial Catchment Locations (Expanded Metro Coverage)
        locations_data = [
            # Hyderabad Prime Localities
            ("Hyderabad", "Hitec City", "500081", "Telangana", "Tier-1 Metro", 92000, 135.0, 94.0, 75.0, 82.0, 95.0, 52.0),
            ("Hyderabad", "Jubilee Hills", "500033", "Telangana", "Tier-1 Metro", 78000, 180.0, 98.0, 78.0, 72.0, 96.0, 58.0),
            ("Hyderabad", "Banjara Hills", "500034", "Telangana", "Tier-1 Metro", 82000, 165.0, 96.0, 76.0, 75.0, 94.0, 55.0),
            ("Hyderabad", "Gachibowli", "500032", "Telangana", "Tier-1 Metro", 88000, 120.0, 92.0, 70.0, 85.0, 90.0, 48.0),
            ("Hyderabad", "Madhapur", "500081", "Telangana", "Tier-1 Metro", 89000, 115.0, 93.0, 72.0, 85.0, 92.0, 50.0),
            ("Hyderabad", "Kondapur", "500084", "Telangana", "Tier-1 Metro", 95000, 95.0, 88.0, 65.0, 88.0, 86.0, 45.0),
            ("Hyderabad", "Kukatpally", "500072", "Telangana", "Tier-1 Metro", 115000, 105.0, 90.0, 74.0, 86.0, 92.0, 52.0),
            ("Hyderabad", "Begumpet", "500016", "Telangana", "Tier-1 Metro", 85000, 110.0, 87.0, 68.0, 84.0, 88.0, 46.0),

            # Bangalore Prime Localities
            ("Bangalore", "Indiranagar", "560038", "Karnataka", "Tier-1 Metro", 95000, 150.0, 97.0, 82.0, 88.0, 95.0, 65.0),
            ("Bangalore", "Koramangala", "560034", "Karnataka", "Tier-1 Metro", 100000, 140.0, 95.0, 80.0, 89.0, 94.0, 62.0),
            ("Bangalore", "Whitefield", "560066", "Karnataka", "Tier-1 Metro", 92000, 110.0, 91.0, 68.0, 86.0, 90.0, 48.0),
            ("Bangalore", "HSR Layout", "560102", "Karnataka", "Tier-1 Metro", 98000, 125.0, 93.0, 74.0, 87.0, 92.0, 54.0),
            ("Bangalore", "Jayanagar", "560011", "Karnataka", "Tier-1 Metro", 88000, 115.0, 89.0, 70.0, 85.0, 90.0, 50.0),
            ("Bangalore", "MG Road", "560001", "Karnataka", "Tier-1 Metro", 80000, 210.0, 99.0, 86.0, 74.0, 97.0, 72.0),

            # Mumbai Prime Localities
            ("Mumbai", "Bandra West", "400050", "Maharashtra", "Tier-1 Metro", 120000, 230.0, 99.0, 88.0, 76.0, 98.0, 78.0),
            ("Mumbai", "Andheri West", "400053", "Maharashtra", "Tier-1 Metro", 135000, 175.0, 96.0, 85.0, 80.0, 96.0, 70.0),
            ("Mumbai", "Juhu", "400049", "Maharashtra", "Tier-1 Metro", 90000, 220.0, 95.0, 80.0, 75.0, 94.0, 68.0),
            ("Mumbai", "BKC", "400051", "Maharashtra", "Tier-1 Metro", 70000, 260.0, 98.0, 82.0, 68.0, 93.0, 65.0),
            ("Mumbai", "Lower Parel", "400013", "Maharashtra", "Tier-1 Metro", 95000, 210.0, 97.0, 84.0, 76.0, 95.0, 72.0),
            ("Mumbai", "Powai", "400076", "Maharashtra", "Tier-1 Metro", 98000, 145.0, 92.0, 72.0, 84.0, 91.0, 55.0),

            # Delhi NCR Prime Localities
            ("Delhi NCR", "Gurugram Cyber City", "122002", "Haryana", "Tier-1 Metro", 110000, 200.0, 98.0, 85.0, 80.0, 96.0, 72.0),
            ("Delhi NCR", "Connaught Place", "110001", "Delhi", "Tier-1 Metro", 85000, 240.0, 99.0, 88.0, 72.0, 97.0, 76.0),
            ("Delhi NCR", "South Extension", "110049", "Delhi", "Tier-1 Metro", 95000, 190.0, 95.0, 80.0, 78.0, 94.0, 66.0),
            ("Delhi NCR", "Noida Sector 18", "201301", "Uttar Pradesh", "Tier-1 Metro", 105000, 150.0, 94.0, 78.0, 82.0, 95.0, 62.0),
            ("Delhi NCR", "Golf Course Road", "122002", "Haryana", "Tier-1 Metro", 88000, 175.0, 96.0, 76.0, 80.0, 92.0, 60.0),
            ("Delhi NCR", "Hauz Khas", "110016", "Delhi", "Tier-1 Metro", 92000, 160.0, 93.0, 75.0, 82.0, 93.0, 58.0),

            # Pune Prime Localities
            ("Pune", "Koregaon Park", "411001", "Maharashtra", "Tier-1 Metro", 82000, 130.0, 94.0, 72.0, 85.0, 92.0, 52.0),
            ("Pune", "Baner", "411045", "Maharashtra", "Tier-1 Metro", 89000, 110.0, 92.0, 68.0, 88.0, 90.0, 48.0),
            ("Pune", "Kothrud", "411038", "Maharashtra", "Tier-1 Metro", 95000, 90.0, 86.0, 65.0, 90.0, 88.0, 42.0),
            ("Pune", "Viman Nagar", "411014", "Maharashtra", "Tier-1 Metro", 91000, 120.0, 93.0, 70.0, 86.0, 93.0, 50.0),
            ("Pune", "Hinjewadi", "411057", "Maharashtra", "Tier-1 Metro", 85000, 85.0, 90.0, 62.0, 91.0, 89.0, 40.0),

            # Chennai Prime Localities
            ("Chennai", "Anna Nagar", "600040", "Tamil Nadu", "Tier-1 Metro", 96000, 115.0, 92.0, 72.0, 85.0, 91.0, 50.0),
            ("Chennai", "T. Nagar", "600017", "Tamil Nadu", "Tier-1 Metro", 125000, 165.0, 98.0, 84.0, 78.0, 98.0, 70.0),
            ("Chennai", "Adyar", "600020", "Tamil Nadu", "Tier-1 Metro", 90000, 120.0, 91.0, 70.0, 86.0, 89.0, 48.0),
            ("Chennai", "OMR", "600096", "Tamil Nadu", "Tier-1 Metro", 94000, 95.0, 89.0, 66.0, 89.0, 88.0, 44.0),
            ("Chennai", "Velachery", "600042", "Tamil Nadu", "Tier-1 Metro", 102000, 100.0, 90.0, 70.0, 87.0, 90.0, 46.0),

            # Kolkata Prime Localities
            ("Kolkata", "Park Street", "700016", "West Bengal", "Tier-1 Metro", 92000, 170.0, 97.0, 80.0, 80.0, 95.0, 64.0),
            ("Kolkata", "Salt Lake Sector V", "700091", "West Bengal", "Tier-1 Metro", 88000, 85.0, 91.0, 64.0, 88.0, 89.0, 42.0),
            ("Kolkata", "New Town", "700156", "West Bengal", "Tier-1 Metro", 82000, 75.0, 88.0, 58.0, 90.0, 84.0, 38.0),
            ("Kolkata", "Ballygunge", "700019", "West Bengal", "Tier-1 Metro", 110000, 130.0, 94.0, 74.0, 84.0, 93.0, 56.0),

            # Ahmedabad Prime Localities
            ("Ahmedabad", "SG Highway", "380054", "Gujarat", "Tier-2 Metro", 92000, 95.0, 93.0, 65.0, 89.0, 90.0, 45.0),
            ("Ahmedabad", "Sindhu Bhavan Road", "380059", "Gujarat", "Tier-2 Metro", 80000, 140.0, 96.0, 75.0, 82.0, 93.0, 55.0),
            ("Ahmedabad", "Prahlad Nagar", "380015", "Gujarat", "Tier-2 Metro", 94000, 110.0, 92.0, 70.0, 86.0, 91.0, 50.0),
            ("Ahmedabad", "Bodakdev", "380054", "Gujarat", "Tier-2 Metro", 88000, 120.0, 94.0, 72.0, 85.0, 92.0, 52.0)
        ]

        loc_objs = []
        for city, loc, pin, state, tier, pop, rent_psq, dem, comp, r_eff, foot, sat in locations_data:
            l = Location(
                city=city,
                locality=loc,
                pin_code=pin,
                tier=tier,
                avg_rent_sqft=rent_psq,
                footfall_index=foot,
                population_density=pop,
                commercial_activity_score=dem,
                median_household_income=1200000.0
            )
            db.add(l)
            db.commit()
            db.refresh(l)
            loc_objs.append(l)

        # 4. Comprehensive Master List: 61 Active Franchises Across 12 Sectors (At Least 5 Per Sector)
        # Schema: (name, slug, sector_name, sub_sector, founded, hq, min_inv, max_inv, tot_inv, fee, claimed_rev, actual_rev, claimed_prof, actual_prof, roi, payback, outlets, closed, closure_pct, royalty, mkt_fee, model, space_min, space_max, exp_rate, desc, verified_status, conf_score)
        franchises_master = [
            # ----------------------------------------------------
            # SECTOR 1: QSR (6 Franchises)
            # ----------------------------------------------------
            (
                "Chai Point Express", "chai-point-express", "QSR", "Chai & Fresh Snacking Kiosk",
                2010, "Bangalore", 1800000.0, 2400000.0, 2200000.0, 400000.0,
                650000.0, 560000.0, 145000.0, 118000.0, 64.3, 18.6,
                240, 6, 2.5, 5.0, 2.0, "FOFO", 350.0, 750.0, 18.0,
                "India's largest organized chai-led QSR chain specializing in farm-fresh tea, filter coffee, healthy packaged snacks and quick bakery items utilizing smart IoT dispensers.",
                "VERIFIED", 94.0
            ),
            (
                "Wow! Momo Express", "wow-momo-express", "QSR", "Tibetan Dumplings & Asian Bowls",
                2008, "Kolkata", 1600000.0, 2400000.0, 2050000.0, 400000.0,
                620000.0, 510000.0, 140000.0, 108000.0, 63.2, 18.9,
                620, 16, 2.5, 6.0, 2.0, "FOFO", 250.0, 600.0, 20.0,
                "Leading Indian homegrown fast food brand known for pan-fried momos, burgers and combos. Exceptional footprint flexibility in food courts, metros and high streets.",
                "REPORTED", 87.0
            ),
            (
                "Burger King Kiosk", "burger-king-kiosk", "QSR", "Flame-Grilled Burgers & Shakes",
                1954, "Mumbai", 2800000.0, 4200000.0, 3500000.0, 600000.0,
                920000.0, 820000.0, 220000.0, 185000.0, 63.4, 18.9,
                450, 8, 1.8, 5.0, 3.0, "FOFO", 400.0, 800.0, 15.0,
                "Global burger icon offering standardized flame-grilled patties, high youth brand recall, and powerful nationwide TV/IPL marketing campaigns.",
                "VERIFIED", 95.0
            ),
            (
                "Haldiram's Express", "haldirams-express", "QSR", "Traditional Indian Street Food & Sweets",
                1937, "Nagpur", 3800000.0, 5200000.0, 4500000.0, 750000.0,
                1200000.0, 1050000.0, 280000.0, 240000.0, 64.0, 18.8,
                380, 5, 1.3, 4.0, 2.0, "FOFO", 600.0, 1200.0, 14.0,
                "Quintessential Indian culinary giant with unmatched family goodwill, high ticket snack combos, and packaged sweets sales buffer.",
                "VERIFIED", 96.0
            ),
            (
                "Tibbs Frankie Hub", "tibbs-frankie-hub", "QSR", "Indian Rolls & Wraps Kiosk",
                1969, "Mumbai", 900000.0, 1500000.0, 1200000.0, 250000.0,
                380000.0, 320000.0, 110000.0, 95000.0, 95.0, 12.6,
                290, 12, 4.1, 5.0, 1.5, "FOFO", 150.0, 350.0, 12.0,
                "The original inventor of the Indian Frankie wrap. Compact footprint with zero kitchen chimney requirement and rapid roll preparation.",
                "VERIFIED", 91.0
            ),
            (
                "Baskin Robbins Scoop Parlour", "baskin-robbins-parlour", "QSR", "Premium Ice Cream & Ice Cream Cakes",
                1945, "Mumbai", 1600000.0, 2300000.0, 1950000.0, 400000.0,
                460000.0, 390000.0, 110000.0, 88000.0, 54.1, 22.1,
                920, 22, 2.3, 5.0, 2.0, "FOFO", 250.0, 600.0, 14.0,
                "World's favorite 31-flavor ice cream boutique chain with extensive cold chain logistics, high birthday cake order frequency, and global recipe standards.",
                "REPORTED", 86.0
            ),

            # ----------------------------------------------------
            # SECTOR 2: Food & Beverage (5 Franchises)
            # ----------------------------------------------------
            (
                "Burger Singh Bistro", "burger-singh-bistro", "Food & Beverage", "Indianized Craft Burgers & Fast Food",
                2014, "Gurugram", 2200000.0, 2800000.0, 2500000.0, 500000.0,
                780000.0, 640000.0, 175000.0, 128000.0, 61.4, 19.5,
                160, 5, 3.1, 6.0, 2.5, "FOFO", 500.0, 1000.0, 22.0,
                "Spicy desi-flavored gourmet burger chain offering high-velocity dine-in, takeaway and delivery economics with localized spice palettes.",
                "VERIFIED", 91.0
            ),
            (
                "Barbeque Nation Express", "barbeque-nation-express", "Food & Beverage", "Live Grill & Buffet Casual Dining",
                2006, "Bangalore", 5500000.0, 7500000.0, 6500000.0, 1000000.0,
                1800000.0, 1550000.0, 390000.0, 310000.0, 57.2, 21.0,
                220, 4, 1.8, 6.0, 2.0, "FOCO", 1500.0, 2500.0, 16.0,
                "Pioneering live-table grill casual dining brand in India. High corporate team lunch bookings, party revenues, and premium average spend per head.",
                "VERIFIED", 94.0
            ),
            (
                "Mainland China Bistro", "mainland-china-bistro", "Food & Beverage", "Authentic Pan-Asian Dining",
                1994, "Kolkata", 4500000.0, 6500000.0, 5500000.0, 800000.0,
                1500000.0, 1300000.0, 340000.0, 280000.0, 61.1, 19.6,
                95, 3, 3.1, 6.5, 2.0, "FOFO", 1200.0, 2200.0, 10.0,
                "Premier fine-casual Chinese dining brand with three decades of legacy, master chef training protocols, and dedicated family clientele.",
                "REPORTED", 88.0
            ),
            (
                "Paradise Biryani Hub", "paradise-biryani-hub", "Food & Beverage", "Hyderabadi Dum Biryani & Kebabs",
                1953, "Hyderabad", 5800000.0, 8200000.0, 7000000.0, 1200000.0,
                2100000.0, 1850000.0, 420000.0, 345000.0, 59.1, 20.3,
                110, 2, 1.8, 5.0, 2.5, "FOCO", 1400.0, 2600.0, 18.0,
                "Legendary Hyderabadi culinary institution boasting massive delivery volumes, rich royal recipe heritage, and high table velocity.",
                "VERIFIED", 95.0
            ),
            (
                "Smoke House Deli Express", "smoke-house-deli-express", "Food & Beverage", "European Bistro & Gourmet Deli",
                2009, "Mumbai", 5000000.0, 7000000.0, 6000000.0, 900000.0,
                1400000.0, 1180000.0, 320000.0, 260000.0, 52.0, 23.1,
                45, 2, 4.4, 7.0, 2.0, "FOFO", 1000.0, 2000.0, 12.0,
                "Chic all-day cafe and deli serving handmade pasta, sourdough burgers, fresh salads, and premium coffee to high net-worth urban diners.",
                "ESTIMATED", 82.0
            ),

            # ----------------------------------------------------
            # SECTOR 3: Cafes (5 Franchises)
            # ----------------------------------------------------
            (
                "The Belgian Waffle Co.", "the-belgian-waffle-co", "Cafes", "Specialty Waffle Sandwiches & Shakes",
                2015, "Mumbai", 1400000.0, 2000000.0, 1750000.0, 350000.0,
                580000.0, 410000.0, 140000.0, 84000.0, 57.6, 20.8,
                480, 24, 5.0, 8.5, 2.5, "FOFO", 200.0, 500.0, 24.0,
                "Pioneering on-the-go waffle sandwich kiosk model. Excellent youth impulse dessert consumption but subject to raw material chocolate price variations.",
                "MARKETING CLAIM", 72.0
            ),
            (
                "Third Wave Coffee Roasters", "third-wave-coffee", "Cafes", "Artisanal Specialty Coffee & Bagels",
                2016, "Bangalore", 4000000.0, 5600000.0, 4800000.0, 700000.0,
                1150000.0, 960000.0, 250000.0, 195000.0, 48.8, 24.6,
                140, 4, 2.8, 6.0, 2.0, "FOCO", 800.0, 1600.0, 32.0,
                "Modern third-wave specialty coffee roaster chain offering single-origin Arabica pour-overs, artisanal bakes, and vibrant workspace ambience.",
                "VERIFIED", 93.0
            ),
            (
                "Chaayos Chai Bar", "chaayos-chai-bar", "Cafes", "Personalized Custom Chai & Desi Munchies",
                2012, "New Delhi", 2600000.0, 3800000.0, 3200000.0, 500000.0,
                880000.0, 750000.0, 210000.0, 165000.0, 61.9, 19.4,
                220, 6, 2.7, 5.5, 2.0, "FOCO", 400.0, 900.0, 25.0,
                "Tech-enabled chai cafe chain using proprietary Chai Monk automated dispensers offering 80,000 customizations and recurring daily breakfast traffic.",
                "VERIFIED", 92.0
            ),
            (
                "Theobroma Patisserie", "theobroma-patisserie", "Cafes", "Gourmet Brownies & Viennoiserie",
                2004, "Mumbai", 3200000.0, 4400000.0, 3800000.0, 600000.0,
                1100000.0, 980000.0, 270000.0, 235000.0, 74.2, 16.2,
                160, 3, 1.8, 5.0, 2.0, "FOCO", 350.0, 700.0, 28.0,
                "Iconic luxury bakery brand celebrated for signature chocolate brownies, sourdough, macarons, and dense gift-box seasonal festive sales.",
                "VERIFIED", 95.0
            ),
            (
                "Cafe Coffee Day Lounge", "ccd-lounge", "Cafes", "Coffee Lounge & Light Meals",
                1996, "Bangalore", 2200000.0, 3400000.0, 2800000.0, 400000.0,
                680000.0, 560000.0, 165000.0, 140000.0, 60.0, 20.0,
                550, 25, 4.5, 6.0, 1.5, "FOFO", 600.0, 1200.0, 8.0,
                "India's household coffee brand with deep real-estate partnerships, youth coffee habits, and consistent high-street conversation traffic.",
                "REPORTED", 84.0
            ),

            # ----------------------------------------------------
            # SECTOR 4: Healthcare (5 Franchises)
            # ----------------------------------------------------
            (
                "MedPlus Community Pharmacy", "medplus-pharmacy", "Healthcare", "Generic Medicine & FMCG Retail",
                2006, "Hyderabad", 2200000.0, 3200000.0, 2700000.0, 350000.0,
                850000.0, 760000.0, 135000.0, 112000.0, 49.7, 24.1,
                3800, 45, 1.1, 0.0, 1.0, "FOFO", 400.0, 750.0, 19.0,
                "India's 2nd largest organized pharmacy chain with chronic repeat prescription refills, omni-channel home delivery, and high consumer trust.",
                "VERIFIED", 97.0
            ),
            (
                "Apollo Pharmacy Hub", "apollo-pharmacy-hub", "Healthcare", "Pharma, Health Supplements & Medical Devices",
                1983, "Chennai", 2600000.0, 3800000.0, 3200000.0, 450000.0,
                1100000.0, 980000.0, 180000.0, 155000.0, 58.1, 20.6,
                5500, 50, 0.9, 0.0, 1.5, "FOFO", 450.0, 900.0, 16.0,
                "India's largest pharmacy retailer backed by Apollo Hospitals Group. Immense supply chain power, private-label margin expansion, and 24/7 sales.",
                "VERIFIED", 98.0
            ),
            (
                "Netmeds Wellness Store", "netmeds-wellness-store", "Healthcare", "Omnichannel Medicine & Personal Wellness",
                2015, "Chennai", 1900000.0, 2900000.0, 2400000.0, 350000.0,
                780000.0, 680000.0, 150000.0, 125000.0, 62.5, 19.2,
                850, 14, 1.6, 2.5, 1.0, "FOFO", 350.0, 650.0, 22.0,
                "Reliance Retail-backed omnichannel pharmacy chain combining hyper-local store pickup with nationwide e-commerce digital app presales.",
                "REPORTED", 90.0
            ),
            (
                "Wellness Forever 24/7", "wellness-forever", "Healthcare", "24/7 Chemist & Convenience Superstore",
                2008, "Mumbai", 3800000.0, 5200000.0, 4500000.0, 600000.0,
                1600000.0, 1420000.0, 260000.0, 215000.0, 57.3, 20.9,
                420, 6, 1.4, 0.0, 1.5, "FOFO", 800.0, 1500.0, 20.0,
                "Premium 24x7 pharmacy and lifestyle wellness mart with large format square footage, personal care FMCG, and elderly care rehabilitation gear.",
                "VERIFIED", 94.0
            ),
            (
                "Tata 1mg Health Shoppe", "tata-1mg-shoppe", "Healthcare", "E-Pharma Store & Diagnostic Consultation",
                2015, "Gurugram", 2000000.0, 3200000.0, 2600000.0, 400000.0,
                820000.0, 720000.0, 165000.0, 140000.0, 64.6, 18.6,
                650, 10, 1.5, 2.0, 1.0, "FOFO", 350.0, 700.0, 30.0,
                "Tata Digital healthcare ecosystem retail store integrating digitized prescription fulfillment, lab test sample pickups, and ayurvedic remedies.",
                "VERIFIED", 93.0
            ),

            # ----------------------------------------------------
            # SECTOR 5: Diagnostics (5 Franchises)
            # ----------------------------------------------------
            (
                "Apollo Diagnostics Center", "apollo-diagnostics-center", "Diagnostics", "Pathology & Preventive Health Lab",
                2015, "Hyderabad", 2000000.0, 2600000.0, 2350000.0, 350000.0,
                550000.0, 490000.0, 160000.0, 132000.0, 67.4, 17.8,
                1100, 18, 1.6, 0.0, 1.5, "FOCO", 400.0, 800.0, 24.0,
                "Leading laboratory diagnostics franchise backed by Apollo Hospitals Network. High repeat patient footfall and defensive recession-proof revenues.",
                "VERIFIED", 96.0
            ),
            (
                "Dr. Lal PathLabs Collection Center", "dr-lal-pathlabs", "Diagnostics", "Sample Collection & Diagnostic Point",
                1949, "New Delhi", 700000.0, 1200000.0, 950000.0, 150000.0,
                290000.0, 260000.0, 75000.0, 64000.0, 80.8, 14.8,
                5100, 62, 1.2, 0.0, 1.0, "FOFO", 200.0, 450.0, 14.0,
                "Prestigious 75-year-old NABL certified laboratory network. Collection hub model requires low initial capex, zero test equipment, and yields solid recurring margins.",
                "VERIFIED", 96.0
            ),
            (
                "Metropolis Healthcare Lab", "metropolis-healthcare", "Diagnostics", "Clinical Pathology & Specialized Genomics",
                1980, "Mumbai", 2200000.0, 3400000.0, 2800000.0, 400000.0,
                680000.0, 580000.0, 180000.0, 148000.0, 63.4, 18.9,
                1800, 28, 1.5, 0.0, 2.0, "FOFO", 400.0, 800.0, 18.0,
                "Multinational chain of diagnostic centers known for accurate oncopathology, molecular biology tests, and institutional corporate health checkups.",
                "VERIFIED", 94.0
            ),
            (
                "Thyrocare Wellness Point", "thyrocare-wellness", "Diagnostics", "Preventive Blood Chemistry & Thyroid Panel",
                1996, "Navi Mumbai", 600000.0, 1100000.0, 850000.0, 150000.0,
                310000.0, 270000.0, 90000.0, 78000.0, 110.1, 10.9,
                3200, 42, 1.3, 0.0, 1.0, "FOFO", 180.0, 400.0, 16.0,
                "India's pioneer in automated centralized biochemistry testing offering ultra-low cost preventive health checkup packages (Aarogyam series).",
                "REPORTED", 91.0
            ),
            (
                "SRL Diagnostics Express", "srl-diagnostics-express", "Diagnostics", "Pathology Hub & Radiology Kiosk",
                1995, "Gurugram", 1800000.0, 2600000.0, 2200000.0, 350000.0,
                520000.0, 460000.0, 145000.0, 120000.0, 65.5, 18.3,
                2400, 35, 1.4, 0.0, 1.5, "FOFO", 350.0, 700.0, 15.0,
                "Trusted nationwide diagnostics network with strong hospital attachments, digital test reporting app, and comprehensive preventive disease packages.",
                "VERIFIED", 93.0
            ),

            # ----------------------------------------------------
            # SECTOR 6: Fitness (5 Franchises)
            # ----------------------------------------------------
            (
                "Anytime Fitness 24/7", "anytime-fitness", "Fitness", "24/7 Smart Gym & Health Club",
                2002, "New Delhi", 7000000.0, 9500000.0, 8200000.0, 1200000.0,
                1400000.0, 1150000.0, 420000.0, 310000.0, 45.3, 26.4,
                135, 3, 2.2, 7.0, 2.0, "FOFO", 3000.0, 5500.0, 14.0,
                "Global 24/7 gym chain operating in 40+ countries. High recurring annual membership subscriptions, biometrics access control, and premium lifestyle demographics.",
                "REPORTED", 88.0
            ),
            (
                "Cult.fit Smart Gym", "cult-fit-gym", "Fitness", "Group Workouts, Boxing & Weight Training",
                2016, "Bangalore", 6000000.0, 8500000.0, 7200000.0, 1000000.0,
                1600000.0, 1320000.0, 450000.0, 325000.0, 54.1, 22.1,
                450, 12, 2.6, 6.0, 2.5, "FOCO", 2500.0, 4500.0, 28.0,
                "Modern fitness experience featuring celebrity trainer streams, proprietary app scheduling, high member engagement, and premium cross-sell merchandise.",
                "VERIFIED", 92.0
            ),
            (
                "Gold's Gym Pro", "golds-gym-pro", "Fitness", "Full-Service Strength & Bodybuilding Hub",
                1965, "Mumbai", 8000000.0, 11000000.0, 9500000.0, 1500000.0,
                1900000.0, 1550000.0, 520000.0, 380000.0, 48.0, 25.0,
                160, 5, 3.1, 7.0, 2.0, "FOFO", 4000.0, 8000.0, 10.0,
                "The world's most famous gym brand with legendary bodybuilding heritage, top certified personal trainers, and high corporate executive annual memberships.",
                "VERIFIED", 93.0
            ),
            (
                "Snap Fitness Club", "snap-fitness-club", "Fitness", "Compact Neighborhood Gym & Cardio",
                2003, "Bangalore", 5200000.0, 7800000.0, 6500000.0, 900000.0,
                1200000.0, 980000.0, 330000.0, 245000.0, 45.2, 26.5,
                110, 4, 3.6, 6.0, 2.0, "FOFO", 2500.0, 4500.0, 12.0,
                "Fast-growing 24/7 fitness club franchise with customized functional training zones, heart rate monitoring tech, and efficient footprint operations.",
                "REPORTED", 85.0
            ),
            (
                "Talwalkars Fitness Hub", "talwalkars-fitness", "Fitness", "Aerobics, Zumba & Weight Management",
                1932, "Mumbai", 4500000.0, 6500000.0, 5500000.0, 750000.0,
                1050000.0, 860000.0, 280000.0, 210000.0, 45.8, 26.2,
                180, 10, 5.5, 6.5, 1.5, "FOFO", 2000.0, 4000.0, 8.0,
                "One of India's oldest gym institutions with strong residential neighborhood appeal, diet counseling sessions, and loyal family memberships.",
                "ESTIMATED", 80.0
            ),

            # ----------------------------------------------------
            # SECTOR 7: Education (5 Franchises)
            # ----------------------------------------------------
            (
                "EuroKids Preschool & DayCare", "eurokids-preschool", "Education", "Early Childhood & Kindergarten",
                2001, "Mumbai", 2200000.0, 3000000.0, 2650000.0, 450000.0,
                480000.0, 430000.0, 140000.0, 120000.0, 54.3, 22.0,
                1400, 28, 2.0, 6.0, 2.0, "FOFO", 1200.0, 2200.0, 12.0,
                "Pioneer in structured preschool curriculum with over two decades of parental goodwill, certified teachers' training modules and annual fee stability.",
                "REPORTED", 89.0
            ),
            (
                "Kidzee Pre-School", "kidzee-preschool", "Education", "Early Childhood Development & Nursery",
                2003, "Mumbai", 1500000.0, 2200000.0, 1850000.0, 300000.0,
                380000.0, 330000.0, 110000.0, 92000.0, 59.6, 20.1,
                2100, 48, 2.2, 5.0, 2.0, "FOFO", 1500.0, 2500.0, 11.0,
                "Asia's largest preschool network nurturing over 1 million children with proprietary Illume pedagogy, parental mobile app, and teacher accreditation.",
                "VERIFIED", 93.0
            ),
            (
                "Bachpan Play School", "bachpan-play-school", "Education", "Montessori Playschool & Nursery Hub",
                2004, "New Delhi", 1200000.0, 2000000.0, 1600000.0, 250000.0,
                360000.0, 310000.0, 115000.0, 98000.0, 73.5, 16.3,
                1200, 32, 2.6, 5.0, 1.5, "FOFO", 1200.0, 2000.0, 14.0,
                "Rapidly expanding affordable preschool brand with smart robotic toys, digital audio-visual classrooms, and strong Tier-2/3 metro penetration.",
                "VERIFIED", 90.0
            ),
            (
                "Allen Career Digital Hub", "allen-career-hub", "Education", "IIT-JEE, NEET & Foundation Test Prep",
                1988, "Kota", 3500000.0, 5500000.0, 4500000.0, 800000.0,
                1400000.0, 1200000.0, 360000.0, 290000.0, 77.3, 15.5,
                250, 4, 1.6, 8.0, 3.0, "FOFO", 2000.0, 4000.0, 24.0,
                "Benchmark in national engineering and medical competitive exam coaching. Outstanding student selection ratios and high annual tuition payments.",
                "VERIFIED", 96.0
            ),
            (
                "Kangaroo Kids International", "kangaroo-kids", "Education", "Experiential Preschool & Day Care",
                1993, "Mumbai", 2800000.0, 4200000.0, 3500000.0, 500000.0,
                650000.0, 540000.0, 195000.0, 165000.0, 56.6, 21.2,
                280, 6, 2.1, 7.0, 2.0, "FOFO", 1500.0, 3000.0, 15.0,
                "Premium experiential learner-centric preschool curriculum with strong child-to-teacher ratios, sensory play labs, and premium school fees.",
                "REPORTED", 87.0
            ),

            # ----------------------------------------------------
            # SECTOR 8: Logistics (5 Franchises)
            # ----------------------------------------------------
            (
                "DTDC Express Logistics Hub", "dtdc-express-hub", "Logistics", "Express Courier & E-Commerce Cargo",
                1990, "Bangalore", 450000.0, 900000.0, 650000.0, 150000.0,
                240000.0, 210000.0, 68000.0, 52000.0, 96.0, 12.5,
                12500, 180, 1.4, 0.0, 0.0, "FOFO", 250.0, 500.0, 10.0,
                "India's premier domestic and international courier network franchise. Extremely low entry capital, high parcel volume, and rapid turnover.",
                "VERIFIED", 93.0
            ),
            (
                "Shadowfax Express Depo", "shadowfax-depo", "Logistics", "Hyperlocal Delivery & E-Com Fulfillment",
                2015, "Bangalore", 600000.0, 1100000.0, 850000.0, 150000.0,
                380000.0, 330000.0, 72000.0, 58000.0, 81.8, 14.6,
                1400, 35, 2.5, 0.0, 1.0, "FOFO", 400.0, 800.0, 32.0,
                "Tech-backed logistics and warehousing node fulfilling quick-commerce, pharmaceutical, and D2C parcels across urban delivery radiuses.",
                "REPORTED", 84.0
            ),
            (
                "Delhivery Express Hub", "delhivery-express-hub", "Logistics", "Automated Parcel Sorting & 3PL Express",
                2011, "Gurugram", 1000000.0, 1800000.0, 1400000.0, 250000.0,
                680000.0, 580000.0, 145000.0, 115000.0, 98.6, 12.2,
                3100, 42, 1.3, 0.0, 1.0, "FOFO", 500.0, 1000.0, 25.0,
                "India's largest fully-integrated logistics provider. Franchise hub handles high daily volume B2C e-commerce shipments with automated tracking.",
                "VERIFIED", 95.0
            ),
            (
                "Blue Dart Express Counter", "blue-dart-counter", "Logistics", "Air Express & Critical Cargo Center",
                1983, "Mumbai", 800000.0, 1600000.0, 1200000.0, 200000.0,
                480000.0, 420000.0, 120000.0, 95000.0, 95.0, 12.6,
                2600, 25, 0.9, 0.0, 1.0, "FOFO", 250.0, 500.0, 8.0,
                "South Asia's premier air express courier backed by DHL. Command of premium corporate document freight, temperature-controlled shipments and B2B parcels.",
                "VERIFIED", 97.0
            ),
            (
                "XpressBees Logistics Center", "xpressbees-center", "Logistics", "End-to-End Supply Chain & Reverse Logistics",
                2015, "Pune", 700000.0, 1300000.0, 1000000.0, 200000.0,
                450000.0, 390000.0, 105000.0, 82000.0, 98.4, 12.2,
                1800, 30, 1.6, 0.0, 1.0, "FOFO", 350.0, 700.0, 28.0,
                "High-velocity supply chain partner for top Indian marketplaces offering express parcel delivery, same-day dispatch, and secure reverse pickup logistics.",
                "REPORTED", 86.0
            ),

            # ----------------------------------------------------
            # SECTOR 9: Retail (5 Franchises)
            # ----------------------------------------------------
            (
                "Lenskart Eyewear Studio", "lenskart-studio", "Retail", "Prescription Eyewear & Sunglasses",
                2010, "Faridabad", 3500000.0, 4800000.0, 4200000.0, 500000.0,
                1100000.0, 920000.0, 260000.0, 205000.0, 58.5, 20.4,
                1600, 20, 1.2, 0.0, 2.0, "FOCO", 600.0, 1100.0, 26.0,
                "Technology-enabled eyewear retail powerhouse with 3D trial kiosks, automated inventory replenishment and zero dead-stock franchisee guarantee.",
                "VERIFIED", 95.0
            ),
            (
                "FirstCry Kids Store", "firstcry-store", "Retail", "Maternity, Baby Gear & Kids Apparel",
                2010, "Pune", 3800000.0, 5500000.0, 4600000.0, 600000.0,
                1250000.0, 1020000.0, 240000.0, 185000.0, 48.2, 24.8,
                980, 22, 2.2, 5.0, 2.0, "FOFO", 1000.0, 2200.0, 18.0,
                "Asia's largest online-to-offline baby and child care superstore format. High average basket size and immense consumer loyalty among young parents.",
                "REPORTED", 89.0
            ),
            (
                "Titan Eyeplus Studio", "titan-eyeplus", "Retail", "Opticals, Eye Testing & Contact Lenses",
                2007, "Bangalore", 3000000.0, 4200000.0, 3600000.0, 450000.0,
                950000.0, 810000.0, 220000.0, 175000.0, 58.3, 20.6,
                920, 14, 1.5, 0.0, 2.5, "FOFO", 500.0, 900.0, 14.0,
                "Tata Group's premium optical retail division known for free zero-error digital eye tests, scratch-resistant lenses, and fashionable frames.",
                "VERIFIED", 94.0
            ),
            (
                "Bata Shoes & Footwear", "bata-shoes", "Retail", "Formal, Casual & Sports Footwear",
                1894, "Gurugram", 3200000.0, 4800000.0, 4000000.0, 500000.0,
                1050000.0, 890000.0, 240000.0, 190000.0, 57.0, 21.0,
                1400, 25, 1.8, 0.0, 2.0, "FOFO", 800.0, 1500.0, 8.0,
                "India's most trusted heritage footwear brand with massive back-to-school surges, durable formal shoes, and sneaker studio extensions.",
                "VERIFIED", 92.0
            ),
            (
                "Decathlon Connect", "decathlon-connect", "Retail", "Sports Equipment, Fitness Gear & Apparel",
                1976, "Bangalore", 5000000.0, 8000000.0, 6500000.0, 1000000.0,
                1800000.0, 1500000.0, 410000.0, 320000.0, 59.1, 20.3,
                120, 2, 1.6, 4.0, 2.0, "FOFO", 1500.0, 3000.0, 22.0,
                "Global sports mega-brand compact neighborhood format with interactive sports zones, cycle repair desks, and competitive private-label pricing.",
                "VERIFIED", 96.0
            ),

            # ----------------------------------------------------
            # SECTOR 10: Beauty & Salon (5 Franchises)
            # ----------------------------------------------------
            (
                "Jawed Habib Hair & Beauty", "jawed-habib-salon", "Beauty & Salon", "Express Hair Grooming & Salon",
                2006, "Mumbai", 1900000.0, 2700000.0, 2300000.0, 350000.0,
                580000.0, 470000.0, 135000.0, 98000.0, 51.1, 23.4,
                850, 32, 3.7, 8.0, 1.5, "FOFO", 500.0, 900.0, 15.0,
                "Iconic household salon brand with high customer volume, standardized hairstyling protocols and proprietary academy-trained stylists.",
                "REPORTED", 84.0
            ),
            (
                "Naturals Lounge Salon", "naturals-salon", "Beauty & Salon", "Hair, Bridal Grooming & Skin Spa",
                2000, "Chennai", 2500000.0, 3600000.0, 3100000.0, 450000.0,
                680000.0, 540000.0, 160000.0, 115000.0, 44.5, 26.9,
                750, 35, 4.6, 7.0, 2.0, "FOFO", 800.0, 1400.0, 12.0,
                "South India's most prominent salon chain with robust bridal makeup bookings, VIP client loyalty programs and regional marketing support.",
                "REPORTED", 83.0
            ),
            (
                "Lakmé Salon Luxe", "lakme-salon-luxe", "Beauty & Salon", "Runway-Inspired Hair, Skin & Bridal Couture",
                1980, "Mumbai", 3800000.0, 5200000.0, 4500000.0, 700000.0,
                1150000.0, 980000.0, 310000.0, 240000.0, 64.0, 18.8,
                480, 10, 2.0, 8.0, 2.5, "FOFO", 900.0, 1800.0, 16.0,
                "Hindustan Unilever's flagship salon franchise blending Fashion Week beauty backstage trends with luxury dermatological skincare treatments.",
                "VERIFIED", 95.0
            ),
            (
                "Green Trends Unisex Salon", "green-trends", "Beauty & Salon", "Family Hair & Skincare Studio",
                2002, "Chennai", 2200000.0, 3400000.0, 2800000.0, 400000.0,
                690000.0, 580000.0, 175000.0, 135000.0, 57.8, 20.7,
                420, 15, 3.5, 7.5, 2.0, "FOFO", 600.0, 1200.0, 14.0,
                "CavinKare-backed neighborhood family salon chain with affordable premium styling, hygienic single-use kits, and high recurring footfall.",
                "VERIFIED", 89.0
            ),
            (
                "VLCC Wellness & Clinic", "vlcc-wellness", "Beauty & Salon", "Weight Management & Aesthetic Dermatology",
                1989, "New Delhi", 4000000.0, 6000000.0, 5000000.0, 800000.0,
                1200000.0, 980000.0, 290000.0, 210000.0, 50.4, 23.8,
                320, 12, 3.7, 7.0, 2.0, "FOFO", 1200.0, 2400.0, 10.0,
                "Pioneering holistic slimming, aesthetic laser treatments, and scientific nutrition consulting with high individual patient package values.",
                "REPORTED", 87.0
            ),

            # ----------------------------------------------------
            # SECTOR 11: EV & Automotive (5 Franchises)
            # ----------------------------------------------------
            (
                "Ather Space Experience Center", "ather-space-ev", "EV & Automotive", "Electric 2W Showroom & Fast Charging",
                2013, "Bangalore", 4500000.0, 6500000.0, 5500000.0, 600000.0,
                2800000.0, 2300000.0, 320000.0, 235000.0, 51.2, 23.4,
                210, 4, 1.9, 3.5, 1.5, "FOCO", 1500.0, 3000.0, 38.0,
                "Next-gen smart electric scooter retail hub with proprietary fast-charging grid, connected software vehicle telemetry, and high ticket sales.",
                "VERIFIED", 92.0
            ),
            (
                "Speed Car Wash Pro", "speed-car-wash", "EV & Automotive", "Automated High-Pressure Car Detailing",
                2012, "Ludhiana", 1600000.0, 2300000.0, 1950000.0, 300000.0,
                420000.0, 350000.0, 115000.0, 89000.0, 54.7, 21.9,
                180, 8, 4.4, 5.0, 1.0, "FOFO", 900.0, 1800.0, 16.0,
                "Eco-friendly mechanized steam wash, ceramic coating and paint protection studio catering to rising urban luxury and SUV ownership density.",
                "REPORTED", 82.0
            ),
            (
                "Ola Electric Experience Zone", "ola-electric-zone", "EV & Automotive", "EV Showroom & Hypercharger Hub",
                2017, "Bangalore", 4000000.0, 6000000.0, 5000000.0, 600000.0,
                2600000.0, 2100000.0, 290000.0, 210000.0, 50.4, 23.8,
                580, 15, 2.5, 3.5, 1.5, "FOCO", 1200.0, 2500.0, 45.0,
                "Mass-market electric two-wheeler market leader. D2C fulfillment center, test drive experience, and rapid charging infrastructure.",
                "REPORTED", 88.0
            ),
            (
                "Detailing Devils Studio", "detailing-devils", "EV & Automotive", "Nano Ceramic Coating & Paint Protection",
                2016, "Noida", 2200000.0, 3400000.0, 2800000.0, 400000.0,
                650000.0, 520000.0, 185000.0, 145000.0, 62.1, 19.3,
                115, 4, 3.4, 6.0, 1.5, "FOFO", 1000.0, 2000.0, 20.0,
                "Pioneering automotive paint protection film (PPF) and 10H ceramic coating studio catering to premium car and bike enthusiasts.",
                "VERIFIED", 91.0
            ),
            (
                "Bosch Car Service Station", "bosch-car-service", "EV & Automotive", "Multi-Brand Mechanical Diagnostic Workshop",
                1886, "Bangalore", 3800000.0, 5800000.0, 4800000.0, 650000.0,
                1250000.0, 1050000.0, 280000.0, 220000.0, 55.0, 21.8,
                380, 8, 2.1, 4.0, 1.5, "FOFO", 2500.0, 5000.0, 14.0,
                "World's largest independent multi-brand vehicle service network equipped with Bosch electronic diagnostics, genuine parts, and ECU remapping.",
                "VERIFIED", 94.0
            ),

            # ----------------------------------------------------
            # SECTOR 12: Home Services (5 Franchises)
            # ----------------------------------------------------
            (
                "Pepperfry Furniture Studio", "pepperfry-studio", "Home Services", "Omnichannel Furniture & Home Decor",
                2012, "Mumbai", 2600000.0, 3800000.0, 3200000.0, 450000.0,
                820000.0, 680000.0, 200000.0, 160000.0, 60.0, 20.0,
                220, 12, 5.4, 0.0, 2.0, "FOCO", 800.0, 1800.0, 14.0,
                "Omnichannel home furniture studio with zero inventory risk for franchisee; customers experience finishes in studio and order via digital catalog.",
                "ESTIMATED", 83.0
            ),
            (
                "Urban Clean Pro Hub", "urban-clean-hub", "Home Services", "Deep Cleaning & Facility Sanitization",
                2014, "Gurugram", 800000.0, 1400000.0, 1100000.0, 200000.0,
                360000.0, 310000.0, 85000.0, 71000.0, 77.4, 15.4,
                310, 12, 3.8, 4.0, 1.5, "FOFO", 300.0, 600.0, 25.0,
                "On-demand specialized facility and home sanitization services with high corporate client retainers and centralized customer acquisition.",
                "ESTIMATED", 82.0
            ),
            (
                "HomeLane Interior Hub", "homelane-interior-hub", "Home Services", "Modular Kitchens & 45-Day Interiors",
                2014, "Bangalore", 3500000.0, 5500000.0, 4500000.0, 600000.0,
                1600000.0, 1350000.0, 370000.0, 285000.0, 76.0, 15.8,
                140, 3, 2.1, 5.0, 2.0, "FOCO", 1200.0, 2500.0, 30.0,
                "Technology-first turnkey home interior design studio offering 3D design software (SpaceCraft) and a guaranteed 45-day move-in completion promise.",
                "VERIFIED", 95.0
            ),
            (
                "Livspace Design Studio", "livspace-design-studio", "Home Services", "Full-Home Renovation & Wardrobes",
                2014, "Bangalore", 4200000.0, 6200000.0, 5200000.0, 750000.0,
                1900000.0, 1580000.0, 420000.0, 310000.0, 71.5, 16.8,
                180, 5, 2.7, 5.5, 2.0, "FOCO", 1500.0, 3000.0, 28.0,
                "Unicorn home interiors platform connecting top architects, curated manufacturers, and homeowners with high-ticket turnkey interior projects.",
                "VERIFIED", 94.0
            ),
            (
                "Godrej Interio Showcase", "godrej-interio-showcase", "Home Services", "Ergonomic Home & Office Furniture",
                1897, "Mumbai", 3800000.0, 5800000.0, 4800000.0, 600000.0,
                1350000.0, 1150000.0, 310000.0, 250000.0, 62.5, 19.2,
                420, 10, 2.3, 0.0, 2.0, "FOFO", 1200.0, 2400.0, 12.0,
                "India's largest institutional and home furniture brand backed by Godrej Group. Strong corporate office contracts and durable consumer trust.",
                "VERIFIED", 93.0
            )
        ]

        print(f"Creating {len(franchises_master)} comprehensive franchise entities...")

        for (
            name, slug, sec_name, sub_sec, founded, hq, min_i, max_i, tot_i, fee,
            cl_rev, act_rev, cl_prof, act_prof, roi, payback,
            tot_out, closed_out, cls_pct, roy_pct, mkt_pct, model,
            min_sqft, max_sqft, exp_rate, desc, verif_status, conf_score
        ) in franchises_master:

            sec = sector_objs.get(sec_name, sector_objs["Food & Beverage"])

            f = Franchise(
                name=name,
                slug=slug,
                sector_id=sec.id,
                sub_sector=sub_sec,
                founded_year=founded,
                headquarters=hq,
                website=f"https://www.{slug}.example.com",
                franchise_model=model,
                space_min_sqft=min_sqft,
                space_max_sqft=max_sqft,
                expansion_rate=exp_rate,
                brand_age_years=2026 - founded,
                description=desc,
                availability="Available in Tier-1 & Tier-2 Metros"
            )
            db.add(f)
            db.commit()
            db.refresh(f)

            # Investment breakdown
            setup_c = tot_i * 0.35
            equip_c = tot_i * 0.25
            interior_c = tot_i * 0.15
            inv_stock = tot_i * 0.10
            work_cap = tot_i * 0.10
            other_init = tot_i - (fee + setup_c + equip_c + interior_c + inv_stock + work_cap)

            investment = FranchiseInvestment(
                franchise_id=f.id,
                min_investment=min_i,
                max_investment=max_i,
                franchise_fee=fee,
                security_deposit=100000.0,
                setup_cost=setup_c,
                equipment_cost=equip_c,
                interior_cost=interior_c,
                technology_cost=50000.0,
                initial_inventory=inv_stock,
                working_capital=work_cap,
                other_initial_expenses=max(25000.0, other_init),
                total_estimated_investment=tot_i,
                last_updated="September 2026"
            )
            db.add(investment)

            # Financial breakdown
            gross_m = 58.0 if "Food" in sec_name or "QSR" in sec_name or "Cafes" in sec_name else 70.0
            op_m = 24.0
            financial = FranchiseFinancial(
                franchise_id=f.id,
                claimed_monthly_revenue=cl_rev,
                actual_monthly_revenue=act_rev,
                claimed_annual_revenue=cl_rev * 12.0,
                actual_annual_revenue=act_rev * 12.0,
                gross_margin=gross_m,
                operating_margin=op_m,
                claimed_net_margin=round((cl_prof / cl_rev * 100.0), 1),
                actual_net_margin=round((act_prof / act_rev * 100.0), 1),
                claimed_monthly_profit=cl_prof,
                actual_monthly_profit=act_prof,
                claimed_annual_profit=cl_prof * 12.0,
                actual_annual_profit=act_prof * 12.0,
                break_even_months=int(payback * 0.8),
                roi_annual=roi,
                roic=round(roi * 0.9, 1),
                payback_months=payback,
                revenue_stability_score=85.0 if cls_pct < 3.0 else 72.0,
                profit_stability_score=82.0 if cls_pct < 3.0 else 70.0,
                last_updated="September 2026"
            )
            db.add(financial)

            # Operating Costs
            rent_est = min(act_rev * 0.15, 80000.0)
            salaries_est = min(act_rev * 0.14, 70000.0)
            cogs_est = act_rev * ((100.0 - gross_m) / 100.0)
            ops = OperatingCost(
                franchise_id=f.id,
                monthly_rent=round(rent_est, 2),
                employee_salaries=round(salaries_est, 2),
                utilities=22000.0,
                raw_materials_cogs=round(cogs_est, 2),
                inventory=25000.0,
                packaging=15000.0,
                maintenance=10000.0,
                marketing=18000.0,
                platform_delivery_commission=act_rev * 0.05,
                insurance=4000.0,
                technology_software=6000.0,
                other_operating_expenses=12000.0,
                total_monthly_expenses=round(act_rev - act_prof, 2)
            )
            db.add(ops)

            # Fees
            fees = FranchiseFee(
                franchise_id=f.id,
                royalty_percentage=roy_pct,
                royalty_fixed=0.0,
                marketing_fee_percentage=mkt_pct,
                technology_fee=5000.0,
                renewal_fee=50000.0,
                other_recurring_fees=2000.0
            )
            db.add(fees)

            # Support
            support = FranchisorSupport(
                franchise_id=f.id,
                training=True,
                store_setup_assistance=True,
                marketing_support=True,
                technology_stack=True,
                supply_chain_logistics=True,
                staff_training=True,
                location_site_selection=True,
                launch_support=True,
                operations_manual_sop=True,
                business_consulting=True,
                branding_assets=True,
                crm_provided=True,
                pos_billing_software=True,
                digital_marketing_leads=True
            )
            db.add(support)

            # Outlet Metrics
            outlet = Outlet(
                franchise_id=f.id,
                total_outlets=tot_out,
                company_owned=max(2, int(tot_out * 0.15)),
                franchise_owned=tot_out - max(2, int(tot_out * 0.15)),
                active_outlets=tot_out - closed_out,
                closed_outlets=closed_out,
                closure_rate_pct=cls_pct
            )
            db.add(outlet)

            # 5-Year Historical Financials & Outlets (2022 to 2026)
            years = [2022, 2023, 2024, 2025, 2026]
            growth_factors = [0.65, 0.76, 0.88, 0.95, 1.0]
            for idx, yr in enumerate(years):
                gf = growth_factors[idx]
                yr_rev = act_rev * 12.0 * gf
                yr_exp = (act_rev - act_prof) * 12.0 * (gf * 0.98)
                yr_prof = yr_rev - yr_exp
                yr_outlets = max(8, int(tot_out * gf))
                yr_openings = max(2, int(yr_outlets * 0.18))
                yr_closures = max(0, int(yr_outlets * (cls_pct / 100.0)))

                hist = HistoricalFinancial(
                    franchise_id=f.id,
                    year=yr,
                    total_investment=tot_i * (0.85 + (idx * 0.03)),
                    franchise_fee=fee * (0.85 + (idx * 0.03)),
                    annual_revenue=round(yr_rev, 2),
                    annual_expenses=round(yr_exp, 2),
                    annual_profit=round(yr_prof, 2),
                    roi_annual=round((yr_prof / tot_i * 100.0), 1),
                    royalty_percentage=roy_pct,
                    marketing_fee_percentage=mkt_pct,
                    total_outlets=yr_outlets,
                    outlet_openings=yr_openings,
                    outlet_closures=yr_closures,
                    closure_rate=cls_pct
                )
                db.add(hist)

                outlet_hist = OutletHistory(
                    franchise_id=f.id,
                    year=yr,
                    total_outlets=yr_outlets,
                    openings=yr_openings,
                    closures=yr_closures
                )
                db.add(outlet_hist)

            # Data Sources with 4 levels (VERIFIED, REPORTED, ESTIMATED, MARKETING_CLAIM)
            ds1 = DataSource(
                franchise_id=f.id,
                metric_name="Core Financials & Unit Economics",
                source_type=verif_status,
                source_name=f"{name} Corporate Filings & Unit Audit Report",
                methodology="Triangulated from audited unit disclosures, regional franchise filings, and operator field sampling.",
                confidence_level=conf_score,
                verification_date="September 2026",
                verified_by="FranchiseIQ Audit Team"
            )
            ds2 = DataSource(
                franchise_id=f.id,
                metric_name="Operating Expenses & Rental Range",
                source_type="REPORTED" if verif_status == "VERIFIED" else "ESTIMATED",
                source_name="Regional Franchisee Survey Sample (N=24)",
                methodology="Monthly operating P&L collected directly from verified unit operators in tier-1 commercial locations.",
                confidence_level=conf_score - 4.0,
                verification_date="August 2026",
                verified_by="Field Research Bureau"
            )
            db.add_all([ds1, ds2])

            # Location Analysis for Hyderabad / Madhapur
            loc_analysis = LocationAnalysis(
                franchise_id=f.id,
                location_id=loc_objs[0].id,  # Madhapur
                demand_score=88.0 if "QSR" in sec_name or "Food" in sec_name or "Diagnostics" in sec_name else 76.0,
                competition_score=68.0,
                rent_efficiency_score=75.0,
                footfall_score=92.0,
                market_saturation_score=55.0,
                growth_potential_score=84.0,
                overall_location_score=82.0 if "QSR" in sec_name or "Food" in sec_name else 74.0,
                existing_brand_outlets_nearby=1,
                recommended_min_sqft=min_sqft,
                estimated_daily_footfall=1850,
                summary_notes=f"Madhapur IT corridor offers high disposable tech-worker footfall. High affinity for {sub_sec} during peak weekday hours."
            )
            db.add(loc_analysis)

            # Franchisee Feedback Reports
            rep = FranchiseeReport(
                franchise_id=f.id,
                outlet_city="Hyderabad",
                operating_years=2.8,
                reported_investment=tot_i * 1.05,
                reported_monthly_revenue=act_rev * 0.98,
                reported_monthly_profit=act_prof * 0.96,
                support_quality=4.5 if conf_score > 90 else 3.8,
                training_quality=4.6,
                marketing_support=4.2,
                supply_chain_quality=4.4,
                overall_satisfaction=84.0 if conf_score > 90 else 72.0,
                would_invest_again=True if conf_score > 80 else False,
                would_recommend=True,
                comments=f"Headquarters support for {name} has been responsive. Breakeven occurred around month 16 in Hyderabad."
            )
            db.add(rep)

            # Sample Review
            rev = Review(
                franchise_id=f.id,
                user_id=investor_user.id,
                rating=4.5 if conf_score > 85 else 3.5,
                title=f"Consistent Cash Flow & Strong Field Support in {f.headquarters}",
                comment=f"Operating {name} has exceeded our conservative projections. Customer footfall has been steady through both weekday and weekend trade cycles.",
                is_approved=True
            )
            db.add(rev)

        # Prime Area Competitors in Hyderabad & Metros
        competitors_to_seed = [
            # Hyderabad - Hitec City (loc_objs[0])
            Competitor(
                location_id=loc_objs[0].id, franchise_id=1, competitor_name="Chaayos Cyber Towers",
                category="QSR / Beverage", distance_km=0.3, competitor_density=4.8,
                similar_brand="Specialty Chai & Kiosk", market_saturation_level="Medium",
                estimated_demand="Very High", competitive_intensity="Medium"
            ),
            Competitor(
                location_id=loc_objs[0].id, franchise_id=2, competitor_name="McDonald's Hitec City",
                category="QSR Burgers", distance_km=0.5, competitor_density=5.2,
                similar_brand="Global Burger Fast Food", market_saturation_level="High",
                estimated_demand="High", competitive_intensity="High"
            ),
            Competitor(
                location_id=loc_objs[0].id, franchise_id=3, competitor_name="Cult.fit Mindspace",
                category="Fitness / Gym", distance_km=0.6, competitor_density=3.5,
                similar_brand="Smart Fitness Centre", market_saturation_level="Medium",
                estimated_demand="High", competitive_intensity="Medium"
            ),

            # Hyderabad - Jubilee Hills (loc_objs[1])
            Competitor(
                location_id=loc_objs[1].id, franchise_id=1, competitor_name="Third Wave Coffee Road 36",
                category="Cafes / Premium Roastery", distance_km=0.4, competitor_density=4.2,
                similar_brand="Artisanal Cafe Lounge", market_saturation_level="Medium",
                estimated_demand="Very High", competitive_intensity="Medium"
            ),
            Competitor(
                location_id=loc_objs[1].id, franchise_id=2, competitor_name="Starbucks Jubilee Enclave",
                category="Cafes / Beverage", distance_km=0.7, competitor_density=4.6,
                similar_brand="International Coffee Chain", market_saturation_level="High",
                estimated_demand="Very High", competitive_intensity="High"
            ),
            Competitor(
                location_id=loc_objs[1].id, franchise_id=4, competitor_name="Apollo Pharmacy Road 45",
                category="Healthcare / Retail", distance_km=0.5, competitor_density=3.1,
                similar_brand="Omnichannel Pharmacy", market_saturation_level="Medium",
                estimated_demand="High", competitive_intensity="Low"
            ),

            # Hyderabad - Banjara Hills (loc_objs[2])
            Competitor(
                location_id=loc_objs[2].id, franchise_id=1, competitor_name="Blue Tokai Coffee Roasters Road 12",
                category="Cafes / Beverage", distance_km=0.5, competitor_density=3.8,
                similar_brand="Artisanal Roastery", market_saturation_level="Medium",
                estimated_demand="High", competitive_intensity="Medium"
            ),
            Competitor(
                location_id=loc_objs[2].id, franchise_id=5, competitor_name="Dr Lal Pathlabs Banjara",
                category="Healthcare / Diagnostics", distance_km=0.8, competitor_density=2.5,
                similar_brand="Clinical Diagnostic Lab", market_saturation_level="Low",
                estimated_demand="High", competitive_intensity="Low"
            ),

            # Bangalore - Indiranagar 100ft Rd (loc_objs[8])
            Competitor(
                location_id=loc_objs[8].id, franchise_id=1, competitor_name="Third Wave Coffee 12th Main",
                category="Cafes / Roastery", distance_km=0.3, competitor_density=5.0,
                similar_brand="Artisanal Specialty Coffee", market_saturation_level="High",
                estimated_demand="Very High", competitive_intensity="High"
            ),
            Competitor(
                location_id=loc_objs[8].id, franchise_id=3, competitor_name="Cult.fit Indiranagar",
                category="Fitness / Studio", distance_km=0.6, competitor_density=4.2,
                similar_brand="Smart Fitness Center", market_saturation_level="Medium",
                estimated_demand="Very High", competitive_intensity="Medium"
            ),

            # Mumbai - Bandra West (loc_objs[14])
            Competitor(
                location_id=loc_objs[14].id, franchise_id=1, competitor_name="Subko Specialty Coffee Pali Hill",
                category="Cafes / Specialty", distance_km=0.4, competitor_density=5.5,
                similar_brand="Artisanal Bakery & Coffee", market_saturation_level="High",
                estimated_demand="Very High", competitive_intensity="High"
            )
        ]
        db.add_all(competitors_to_seed)

        # Commit everything
        db.commit()
        print(f"Successfully seeded {len(franchises_master)} franchises across 12 sectors, {len(locations_data)} prime locations, 5-year historical records (2022-2026), and competitor radar metrics!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    seed_all_data()
