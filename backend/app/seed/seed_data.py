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
        # Check if already seeded
        if db.query(User).filter(User.email == "investor@franchiseiq.com").first():
            print("Database already seeded.")
            return

        print("Seeding FranchiseIQ database with comprehensive DEMO data...")

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

        # 2. Sectors (30+ sectors from specification)
        sectors_data = [
            ("Food & Beverage", "F&B", "Dining, cafes, cloud kitchens and specialty culinary brands", "UtensilsCrossed"),
            ("QSR", "F&B", "Quick-service food chains with fast table turnover and delivery sales", "FastForward"),
            ("Restaurants", "F&B", "Casual and fine-dining dine-in restaurant formats", "Store"),
            ("Cafes", "F&B", "Artisanal coffee, tea lounges and bakery cafes", "Coffee"),
            ("Education", "Education", "K-12 supplementary schools and academic learning institutions", "GraduationCap"),
            ("Coaching", "Education", "Competitive exam test prep and professional skill bootcamps", "BookOpen"),
            ("Healthcare", "Health", "Primary clinics, specialized treatment and wellness centers", "HeartPulse"),
            ("Diagnostics", "Health", "Pathology labs, scan centers and medical testing chains", "Activity"),
            ("Beauty & Salon", "Personal Care", "Unisex luxury hair salons, spa and grooming studios", "Scissors"),
            ("Fitness", "Wellness", "Gymnasiums, CrossFit boxes and functional fitness centers", "Dumbbell"),
            ("Retail", "Retail", "Convenience marts, consumer goods and specialty merchandise", "ShoppingBag"),
            ("Fashion", "Retail", "Apparel, footwear and designer ethnic fashion boutiques", "Shirt"),
            ("Electronics", "Retail", "Consumer electronics, mobile stores and smart home gadget retail", "Laptop"),
            ("Automotive", "Automotive", "Vehicle dealerships and auto spares retail outlets", "Car"),
            ("Logistics", "B2B & Industrial", "Last-mile freight, warehousing and 3PL fulfillment depots", "Truck"),
            ("Courier", "Logistics", "Express parcel booking counters and hyper-local delivery hubs", "Package"),
            ("Travel", "Services", "Holiday booking, visa consulting and corporate travel desks", "Plane"),
            ("Financial Services", "Finance", "Micro-banking kiosks, loan consulting and tax centers", "Landmark"),
            ("B2B Services", "Corporate", "Corporate procurement, staffing and outsourced operations", "Building2"),
            ("Home Services", "Services", "Home repair, interior renovation and maintenance franchises", "Wrench"),
            ("Cleaning Services", "Services", "Commercial facility management and domestic deep-cleaning", "Sparkles"),
            ("Pet Care", "Services", "Veterinary clinics, pet grooming spas and pet food retail", "Heart"),
            ("Child Care", "Education", "Early childhood day-care centers and preschool franchises", "Baby"),
            ("Senior Care", "Healthcare", "Assisted living support and elderly wellness monitoring", "ShieldAlert"),
            ("EV", "CleanTech", "Electric two-wheeler showrooms, EV charging stations and battery swap", "Zap"),
            ("Automotive Services", "Automotive", "Express car wash, detailing and quick repair studios", "Fuel"),
            ("Manufacturing", "Industrial", "Micro-manufacturing, packaging and assembly franchises", "Factory"),
            ("Distribution", "B2B & Industrial", "FMCG super-stockist and wholesale supply operations", "Boxes"),
            ("Dealership", "Commercial", "Heavy machinery, agricultural equipment and hardware dealership", "Award"),
            ("Other", "General", "Niche and emerging alternative franchise formats", "Layers")
        ]

        sector_objs = {}
        for name, cat, desc, icon in sectors_data:
            s = Sector(name=name, category=cat, description=desc, icon=icon, is_active=True)
            db.add(s)
            db.commit()
            db.refresh(s)
            sector_objs[name] = s

        # 3. Locations (Prime Indian Hubs with demographic data)
        locations_data = [
            ("Hyderabad", "Madhapur", "500081", "Tier-1", 130.0, 92.0, 18500.0, 94.0, 1450000.0),
            ("Hyderabad", "Gachibowli", "500032", "Tier-1", 115.0, 88.0, 16200.0, 91.0, 1550000.0),
            ("Hyderabad", "Jubilee Hills", "500033", "Tier-1", 190.0, 85.0, 12000.0, 96.0, 2400000.0),
            ("Hyderabad", "Kukatpally", "500072", "Tier-1", 95.0, 94.0, 24000.0, 86.0, 1050000.0),
            ("Bangalore", "Indiranagar", "560038", "Tier-1", 180.0, 94.0, 17500.0, 96.0, 2100000.0),
            ("Bangalore", "Koramangala", "560034", "Tier-1", 165.0, 95.0, 19000.0, 95.0, 1900000.0),
            ("Bangalore", "HSR Layout", "560102", "Tier-1", 125.0, 90.0, 16000.0, 92.0, 1650000.0),
            ("Mumbai", "Andheri West", "400053", "Tier-1", 240.0, 98.0, 32000.0, 97.0, 1800000.0),
            ("Pune", "Kothrud", "411038", "Tier-1", 90.0, 86.0, 19000.0, 84.0, 1150000.0),
            ("Delhi", "Connaught Place", "110001", "Tier-1", 280.0, 97.0, 14000.0, 98.0, 2600000.0)
        ]

        loc_objs = []
        for city, loc, pin, tier, rent_sqft, foot, pop_dens, comm_act, med_inc in locations_data:
            l = Location(
                city=city,
                locality=loc,
                pin_code=pin,
                tier=tier,
                avg_rent_sqft=rent_sqft,
                footfall_index=foot,
                population_density=pop_dens,
                commercial_activity_score=comm_act,
                median_household_income=med_inc
            )
            db.add(l)
            db.commit()
            db.refresh(l)
            loc_objs.append(l)

        # 4. 22 Comprehensive Realistic Franchises Across 8+ Key Sectors
        # Structure: (name, slug, sector_name, sub_sector, founded, hq, min_inv, max_inv, tot_inv, fee, claimed_rev, actual_rev, claimed_prof, actual_prof, roi, payback, outlets, closed, closure_pct, royalty, mkt_fee, model, space_min, space_max, exp_rate, desc, verified_status, conf_score)
        franchises_master = [
            # 1. Chai Point Express (QSR) - Top Match for ₹25L Budget, Fast Payback
            (
                "Chai Point Express", "chai-point-express", "QSR", "Chai & Fresh Snacking Kiosk",
                2010, "Bangalore", 1800000.0, 2400000.0, 2200000.0, 400000.0,
                650000.0, 560000.0, 145000.0, 118000.0, 64.3, 18.6,
                240, 6, 2.5, 5.0, 2.0, "FOFO", 350.0, 750.0, 18.0,
                "India's largest organized chai-led QSR chain specializing in farm-fresh tea, filter coffee, healthy packaged snacks and quick bakery items utilizing smart IoT brewing dispensers.",
                "VERIFIED", 94.0
            ),
            # 2. Burger Singh Bistro (Food & Beverage) - Fits ₹25L Budget
            (
                "Burger Singh Bistro", "burger-singh-bistro", "Food & Beverage", "Indianized Craft Burgers & Fast Food",
                2014, "Gurugram", 2200000.0, 2800000.0, 2500000.0, 500000.0,
                780000.0, 640000.0, 175000.0, 128000.0, 61.4, 19.5,
                160, 5, 3.1, 6.0, 2.5, "FOFO", 500.0, 1000.0, 22.0,
                "Spicy desi-flavored gourmet burger chain offering high-velocity dine-in, takeaway and online delivery unit economics with localized spice palettes and proprietary sauces.",
                "VERIFIED", 91.0
            ),
            # 3. Apollo Diagnostics Center (Diagnostics) - Low Risk, Healthcare
            (
                "Apollo Diagnostics Center", "apollo-diagnostics-center", "Diagnostics", "Pathology & Preventive Health Lab",
                2015, "Hyderabad", 2000000.0, 2600000.0, 2350000.0, 350000.0,
                550000.0, 490000.0, 160000.0, 132000.0, 67.4, 17.8,
                1100, 18, 1.6, 0.0, 1.5, "FOCO", 400.0, 800.0, 24.0,
                "Leading laboratory diagnostics franchise backed by Apollo Hospitals Network. High repeat patient footfall, institutional B2B doctor referrals, and defensive recession-proof revenues.",
                "VERIFIED", 96.0
            ),
            # 4. EuroKids Preschool & DayCare (Child Care / Education)
            (
                "EuroKids Preschool & DayCare", "eurokids-preschool", "Child Care", "Early Childhood & Kindergarten",
                2001, "Mumbai", 2200000.0, 3000000.0, 2650000.0, 450000.0,
                480000.0, 430000.0, 140000.0, 120000.0, 54.3, 22.0,
                1400, 28, 2.0, 6.0, 2.0, "FOFO", 1200.0, 2200.0, 12.0,
                "Pioneer in structured preschool curriculum with over two decades of parental goodwill, certified teachers' training modules and annual fee collection stability.",
                "REPORTED", 89.0
            ),
            # 5. Anytime Fitness 24/7 (Fitness) - High Investment, High Return
            (
                "Anytime Fitness 24/7", "anytime-fitness", "Fitness", "24/7 Smart Gym & Health Club",
                2002, "New Delhi", 7000000.0, 9500000.0, 8200000.0, 1200000.0,
                1400000.0, 1150000.0, 420000.0, 310000.0, 45.3, 26.4,
                135, 3, 2.2, 7.0, 2.0, "FOFO", 3000.0, 5500.0, 14.0,
                "Global 24/7 gym chain operating in 40+ countries. High recurring annual membership subscriptions, biometrics access control, and premium lifestyle fitness demographics.",
                "REPORTED", 88.0
            ),
            # 6. Jawed Habib Hair & Beauty (Beauty & Salon)
            (
                "Jawed Habib Hair & Beauty", "jawed-habib-salon", "Beauty & Salon", "Express Hair Grooming & Luxury Salon",
                2006, "Mumbai", 1900000.0, 2700000.0, 2300000.0, 350000.0,
                580000.0, 470000.0, 135000.0, 98000.0, 51.1, 23.4,
                850, 32, 3.7, 8.0, 1.5, "FOFO", 500.0, 900.0, 15.0,
                "Iconic household salon brand with high customer volume, standardized hairstyling protocols and proprietary academy-trained stylists.",
                "REPORTED", 84.0
            ),
            # 7. DTDC Express Logistics Hub (Logistics / Courier) - Low Investment
            (
                "DTDC Express Logistics Hub", "dtdc-express-hub", "Courier", "Express Courier & E-Commerce Cargo",
                1990, "Bangalore", 450000.0, 900000.0, 650000.0, 150000.0,
                240000.0, 210000.0, 68000.0, 52000.0, 96.0, 12.5,
                12500, 180, 1.4, 0.0, 0.0, "FOFO", 250.0, 500.0, 10.0,
                "India's premier domestic and international courier network franchise. Extremely low entry capital, high e-commerce parcel volume, and rapid working capital turnover.",
                "VERIFIED", 93.0
            ),
            # 8. Ather Energy Experience Center (EV) - High Growth, Modern CleanTech
            (
                "Ather Space Experience Center", "ather-space-ev", "EV", "Electric 2W Showroom & Fast Charging",
                2013, "Bangalore", 4500000.0, 6500000.0, 5500000.0, 600000.0,
                2800000.0, 2300000.0, 320000.0, 235000.0, 51.2, 23.4,
                210, 4, 1.9, 3.5, 1.5, "FOCO", 1500.0, 3000.0, 38.0,
                "Next-gen smart electric scooter retail hub with proprietary fast-charging grid, connected software vehicle telemetry, and high unit ticket sales.",
                "VERIFIED", 92.0
            ),
            # 9. Lenskart Opticals (Retail / Fashion) - Omnichannel Leader
            (
                "Lenskart Eyewear Studio", "lenskart-studio", "Retail", "Prescription Eyewear & Sunglasses",
                2010, "Faridabad", 3500000.0, 4800000.0, 4200000.0, 500000.0,
                1100000.0, 920000.0, 260000.0, 205000.0, 58.5, 20.4,
                1600, 20, 1.2, 0.0, 2.0, "FOCO", 600.0, 1100.0, 26.0,
                "Technology-enabled eyewear retail powerhouse with 3D trial kiosks, automated inventory replenishment and zero dead-stock franchisee guarantee.",
                "VERIFIED", 95.0
            ),
            # 10. Speed Car Wash & Detailing (Automotive Services)
            (
                "Speed Car Wash Pro", "speed-car-wash", "Automotive Services", "Automated High-Pressure Detailing",
                2012, "Ludhiana", 1600000.0, 2300000.0, 1950000.0, 300000.0,
                420000.0, 350000.0, 115000.0, 89000.0, 54.7, 21.9,
                180, 8, 4.4, 5.0, 1.0, "FOFO", 900.0, 1800.0, 16.0,
                "Eco-friendly mechanized steam wash, ceramic coating and paint protection studio catering to rising urban luxury and SUV ownership density.",
                "REPORTED", 82.0
            ),
            # 11. MedPlus Pharmacy (Healthcare / Retail) - Recession Proof
            (
                "MedPlus Community Pharmacy", "medplus-pharmacy", "Healthcare", "Generic Medicine & FMCG Retail",
                2006, "Hyderabad", 2200000.0, 3200000.0, 2700000.0, 350000.0,
                850000.0, 760000.0, 135000.0, 112000.0, 49.7, 24.1,
                3800, 45, 1.1, 0.0, 1.0, "FOFO", 400.0, 750.0, 19.0,
                "India's 2nd largest pharmacy chain. High chronic medicine repeat prescription revenues, omnichannel home delivery, and robust localized inventory management.",
                "VERIFIED", 97.0
            ),
            # 12. Wow! Momo & Wow! China (QSR) - Popular Mall & High Street
            (
                "Wow! Momo Express", "wow-momo-express", "QSR", "Tibetan Dumplings & Asian Bowls",
                2008, "Kolkata", 1600000.0, 2400000.0, 2050000.0, 400000.0,
                620000.0, 510000.0, 140000.0, 108000.0, 63.2, 18.9,
                620, 16, 2.5, 6.0, 2.0, "FOFO", 250.0, 600.0, 20.0,
                "Leading Indian homegrown fast food brand known for pan-fried momos, burgers and combos. Exceptional footprint flexibility in food courts, metros and high streets.",
                "REPORTED", 87.0
            ),
            # 13. Dr. Lal PathLabs (Diagnostics)
            (
                "Dr. Lal PathLabs Collection Center", "dr-lal-pathlabs", "Diagnostics", "Sample Collection & Diagnostic Point",
                1949, "New Delhi", 700000.0, 1200000.0, 950000.0, 150000.0,
                290000.0, 260000.0, 75000.0, 64000.0, 80.8, 14.8,
                5100, 62, 1.2, 0.0, 1.0, "FOFO", 200.0, 450.0, 14.0,
                "Prestigious 75-year-old NABL certified laboratory network. Collection hub model requires low initial capex, zero test equipment, and yields solid recurring margins.",
                "VERIFIED", 96.0
            ),
            # 14. FirstCry Baby & Kids (Retail / Child Care)
            (
                "FirstCry Kids Store", "firstcry-store", "Retail", "Maternity, Baby Gear & Kids Apparel",
                2010, "Pune", 3800000.0, 5500000.0, 4600000.0, 600000.0,
                1250000.0, 1020000.0, 240000.0, 185000.0, 48.2, 24.8,
                980, 22, 2.2, 5.0, 2.0, "FOFO", 1000.0, 2200.0, 18.0,
                "Asia's largest online-to-offline baby and child care superstore format. High average basket size and immense consumer loyalty among young parents.",
                "REPORTED", 89.0
            ),
            # 15. Naturals Salon & Spa (Beauty & Salon)
            (
                "Naturals Lounge Salon", "naturals-salon", "Beauty & Salon", "Hair, Bridal Grooming & Skin Spa",
                2000, "Chennai", 2500000.0, 3600000.0, 3100000.0, 450000.0,
                680000.0, 540000.0, 160000.0, 115000.0, 44.5, 26.9,
                750, 35, 4.6, 7.0, 2.0, "FOFO", 800.0, 1400.0, 12.0,
                "South India's most prominent salon franchise chain with robust bridal makeup bookings, VIP client loyalty programs and dedicated regional marketing support.",
                "REPORTED", 83.0
            ),
            # 16. The Belgian Waffle Co. (Cafes / QSR) - High Claim Gap Candidate for Demonstration
            (
                "The Belgian Waffle Co.", "belgian-waffle-co", "Cafes", "Specialty On-the-Go Waffle Sandwiches",
                2015, "Mumbai", 1400000.0, 2000000.0, 1750000.0, 350000.0,
                580000.0, 410000.0, 140000.0, 84000.0, 57.6, 20.8,
                480, 24, 5.0, 8.5, 2.5, "FOFO", 200.0, 500.0, 24.0,
                "Pioneering quick-serve waffle sandwich kiosk model. Excellent youth appeal, but high franchisor marketing claims contrast with real-world ingredient inflation.",
                "MARKETING CLAIM", 72.0
            ),
            # 17. Kidzee Pre-School (Education)
            (
                "Kidzee Pre-School & Activity Hub", "kidzee-preschool", "Education", "Early Childhood Development & Nursery",
                2003, "Mumbai", 1500000.0, 2200000.0, 1850000.0, 300000.0,
                380000.0, 330000.0, 110000.0, 92000.0, 59.6, 20.1,
                2100, 48, 2.2, 5.0, 2.0, "FOFO", 1500.0, 2500.0, 11.0,
                "Asia's largest preschool network nurturing over 1 million children with proprietary Illume pedagogy, parental mobile app, and structured teacher accreditation.",
                "VERIFIED", 93.0
            ),
            # 18. Cult.fit Gym & Studio (Fitness) - Tech Driven
            (
                "Cult.fit Smart Gym", "cult-fit-gym", "Fitness", "Group Workouts, Boxing & Weight Training",
                2016, "Bangalore", 6000000.0, 8500000.0, 7200000.0, 1000000.0,
                1600000.0, 1320000.0, 450000.0, 325000.0, 54.1, 22.1,
                450, 12, 2.6, 6.0, 2.5, "FOCO", 2500.0, 4500.0, 28.0,
                "Modern fitness experience featuring celebrity trainer streams, proprietary app scheduling, high member engagement, and premium cross-sell merchandise.",
                "VERIFIED", 92.0
            ),
            # 19. Baskin Robbins Ice Cream (QSR / Cafes)
            (
                "Baskin Robbins Scoop Parlour", "baskin-robbins", "QSR", "Premium Ice Cream, Cakes & Sundaes",
                1945, "Mumbai", 1600000.0, 2300000.0, 1950000.0, 400000.0,
                460000.0, 390000.0, 110000.0, 88000.0, 54.1, 22.1,
                920, 22, 2.3, 5.0, 2.0, "FOFO", 250.0, 600.0, 14.0,
                "World's favorite 31-flavor ice cream boutique chain with extensive cold chain logistics, high birthday cake order frequency, and global recipe standards.",
                "REPORTED", 86.0
            ),
            # 20. Shadowfax Logistics Hub (Logistics)
            (
                "Shadowfax Express Depo", "shadowfax-depo", "Logistics", "Hyperlocal Delivery & E-Com Fulfillment",
                2015, "Bangalore", 600000.0, 1100000.0, 850000.0, 150000.0,
                380000.0, 330000.0, 72000.0, 58000.0, 81.8, 14.6,
                1400, 35, 2.5, 0.0, 1.0, "FOFO", 400.0, 800.0, 32.0,
                "Tech-backed logistics and warehousing node fulfilling quick-commerce, pharmaceutical, and D2C parcels across urban delivery radiuses.",
                "REPORTED", 84.0
            ),
            # 21. Pepperfry Studio (Retail / Home Services)
            (
                "Pepperfry Furniture Studio", "pepperfry-studio", "Home Services", "Furniture Experience & Design Studio",
                2011, "Mumbai", 2500000.0, 3800000.0, 3200000.0, 400000.0,
                750000.0, 620000.0, 150000.0, 110000.0, 41.2, 29.0,
                220, 14, 6.3, 0.0, 2.0, "FOCO", 800.0, 1800.0, 15.0,
                "Omnichannel home furniture studio with zero inventory risk for franchisee; customers experience finishes in studio and order via digital catalog.",
                "ESTIMATED", 78.0
            ),
            # 22. Urban Company Cleaning Hub (Cleaning Services)
            (
                "Urban Clean Pro Hub", "urban-clean-hub", "Cleaning Services", "Deep Home & Office Cleaning Logistics",
                2014, "Gurugram", 800000.0, 1400000.0, 1100000.0, 200000.0,
                360000.0, 310000.0, 85000.0, 71000.0, 77.4, 15.4,
                310, 12, 3.8, 4.0, 1.5, "FOFO", 300.0, 600.0, 25.0,
                "On-demand specialized facility and home sanitization services with high corporate client retainers and centralized customer acquisition.",
                "ESTIMATED", 79.0
            )
        ]

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
            gross_m = 58.0 if "Food" in sec_name or "QSR" in sec_name else 70.0
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
                other_recurring_fees=0.0
            )
            db.add(fees)

            # Support Checklist (14 dimensions)
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

            # Outlet Stats
            outlet_info = Outlet(
                franchise_id=f.id,
                total_outlets=tot_out,
                company_owned=max(5, int(tot_out * 0.15)),
                franchise_owned=max(10, int(tot_out * 0.85)),
                active_outlets=tot_out - closed_out,
                closed_outlets=closed_out,
                closure_rate_pct=cls_pct
            )
            db.add(outlet_info)

            # Historical Financials (2022 to 2026 yearly data)
            # Simulates 5-year evolution of Revenue, Expenses, Profit, Outlets, ROI
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
                methodology="Triangulated from audited unit disclosures, regional franchise filings, and operator sample sampling.",
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

        # Competitors in Hyderabad Madhapur
        comp1 = Competitor(
            location_id=loc_objs[0].id,
            franchise_id=1,
            competitor_name="Chaayos Cafe",
            category="QSR / Beverage",
            distance_km=0.4,
            competitor_density=4.5,
            similar_brand="Specialty Chai & Kiosk",
            market_saturation_level="Medium",
            estimated_demand="Very High",
            competitive_intensity="Medium"
        )
        comp2 = Competitor(
            location_id=loc_objs[0].id,
            franchise_id=2,
            competitor_name="McDonald's Cyber Towers",
            category="QSR Burgers",
            distance_km=0.7,
            competitor_density=5.2,
            similar_brand="Global Burger Fast Food",
            market_saturation_level="High",
            estimated_demand="High",
            competitive_intensity="High"
        )
        comp3 = Competitor(
            location_id=loc_objs[0].id,
            franchise_id=3,
            competitor_name="Vijaya Diagnostic Centre",
            category="Healthcare / Pathology",
            distance_km=1.1,
            competitor_density=2.8,
            similar_brand="Regional Clinical Lab",
            market_saturation_level="Low",
            estimated_demand="High",
            competitive_intensity="Low"
        )
        db.add_all([comp1, comp2, comp3])

        # Commit everything
        db.commit()
        print("Successfully seeded 22 franchises, 30+ sectors, 10 locations, 5-year historical records (2022-2026), and data verification metrics!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    seed_all_data()
