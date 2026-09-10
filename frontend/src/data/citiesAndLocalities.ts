export interface LocalityInfo {
  locality: string;
  pinCode: string;
  defaultRent: number;
  typicalSqft: number;
  footfall: number;
  tag: string;
}

export interface CityInfo {
  city: string;
  state: string;
  label: string;
  localities: LocalityInfo[];
}

export const CITIES_AND_LOCALITIES: CityInfo[] = [
  {
    city: 'Hyderabad',
    state: 'Telangana',
    label: 'Hyderabad (Cyberabad & Prime High Streets)',
    localities: [
      { locality: 'Hitec City', pinCode: '500081', defaultRent: 108000, typicalSqft: 800, footfall: 2200, tag: 'IT & Corporate Corridor' },
      { locality: 'Jubilee Hills', pinCode: '500033', defaultRent: 144000, typicalSqft: 800, footfall: 2100, tag: 'Ultra-Luxury & F&B Hub' },
      { locality: 'Banjara Hills', pinCode: '500034', defaultRent: 132000, typicalSqft: 800, footfall: 1900, tag: 'High Street Retail & Healthcare' },
      { locality: 'Gachibowli', pinCode: '500032', defaultRent: 96000, typicalSqft: 800, footfall: 1900, tag: 'Financial District & Tech Hub' },
      { locality: 'Madhapur', pinCode: '500081', defaultRent: 92000, typicalSqft: 800, footfall: 1950, tag: 'Cyber Towers Commercial Hub' },
      { locality: 'Kondapur', pinCode: '500084', defaultRent: 76000, typicalSqft: 800, footfall: 1600, tag: 'High-Density Residential & Tech' },
      { locality: 'Kukatpally', pinCode: '500072', defaultRent: 84000, typicalSqft: 800, footfall: 2400, tag: 'Dense Retail & Transit Corridor' },
      { locality: 'Begumpet', pinCode: '500016', defaultRent: 88000, typicalSqft: 800, footfall: 1750, tag: 'Central Commercial & Banking' },
    ]
  },
  {
    city: 'Bangalore',
    state: 'Karnataka',
    label: 'Bangalore (Silicon Plateau)',
    localities: [
      { locality: 'Indiranagar', pinCode: '560038', defaultRent: 120000, typicalSqft: 800, footfall: 2100, tag: '100ft Rd / Premium Retail' },
      { locality: 'Koramangala', pinCode: '560034', defaultRent: 112000, typicalSqft: 800, footfall: 2000, tag: 'Startup & Youth Hub' },
      { locality: 'Whitefield', pinCode: '560066', defaultRent: 88000, typicalSqft: 800, footfall: 1700, tag: 'IT Tech Parks & Malls' },
      { locality: 'HSR Layout', pinCode: '560102', defaultRent: 100000, typicalSqft: 800, footfall: 1800, tag: 'Commercial Sector 1 & 27th Main' },
      { locality: 'Jayanagar', pinCode: '560011', defaultRent: 92000, typicalSqft: 800, footfall: 1850, tag: 'Established South Bangalore Catchment' },
      { locality: 'MG Road', pinCode: '560001', defaultRent: 168000, typicalSqft: 800, footfall: 2500, tag: 'Central Business District' },
    ]
  },
  {
    city: 'Mumbai',
    state: 'Maharashtra',
    label: 'Mumbai (MMR Region)',
    localities: [
      { locality: 'Bandra West', pinCode: '400050', defaultRent: 184000, typicalSqft: 800, footfall: 2600, tag: 'Linking Rd & Hill Rd Retail' },
      { locality: 'Andheri West', pinCode: '400053', defaultRent: 140000, typicalSqft: 800, footfall: 2400, tag: 'Lokhandwala Commercial Corridor' },
      { locality: 'Juhu', pinCode: '400049', defaultRent: 176000, typicalSqft: 800, footfall: 1900, tag: 'Tara Road & Prime Beachside' },
      { locality: 'BKC', pinCode: '400051', defaultRent: 208000, typicalSqft: 800, footfall: 2100, tag: 'Financial District & MNCs' },
      { locality: 'Lower Parel', pinCode: '400013', defaultRent: 168000, typicalSqft: 800, footfall: 2300, tag: 'Kamala Mills & Phoenix High Street' },
      { locality: 'Powai', pinCode: '400076', defaultRent: 116000, typicalSqft: 800, footfall: 1700, tag: 'Hiranandani Corporate & Residential' },
    ]
  },
  {
    city: 'Delhi NCR',
    state: 'Delhi / Haryana',
    label: 'Delhi NCR (Capital Region)',
    localities: [
      { locality: 'Gurugram Cyber City', pinCode: '122002', defaultRent: 160000, typicalSqft: 800, footfall: 2400, tag: 'Cyber Hub & Corporate Corridor' },
      { locality: 'Connaught Place', pinCode: '110001', defaultRent: 192000, typicalSqft: 800, footfall: 2800, tag: 'Inner/Outer Circle High Street' },
      { locality: 'South Extension', pinCode: '110049', defaultRent: 152000, typicalSqft: 800, footfall: 2000, tag: 'Part 1 & 2 Luxury Retail' },
      { locality: 'Noida Sector 18', pinCode: '201301', defaultRent: 120000, typicalSqft: 800, footfall: 2200, tag: 'Atta Market & Mall Hub' },
      { locality: 'Golf Course Road', pinCode: '122002', defaultRent: 140000, typicalSqft: 800, footfall: 1800, tag: 'Gurugram Premium Residential' },
      { locality: 'Hauz Khas', pinCode: '110016', defaultRent: 128000, typicalSqft: 800, footfall: 1900, tag: 'Youth & F&B Hub' },
    ]
  },
  {
    city: 'Pune',
    state: 'Maharashtra',
    label: 'Pune (Metro)',
    localities: [
      { locality: 'Koregaon Park', pinCode: '411001', defaultRent: 104000, typicalSqft: 800, footfall: 1850, tag: 'North Main Road F&B Hub' },
      { locality: 'Baner', pinCode: '411045', defaultRent: 88000, typicalSqft: 800, footfall: 1750, tag: 'Balewadi High Street' },
      { locality: 'Kothrud', pinCode: '411038', defaultRent: 72000, typicalSqft: 800, footfall: 1650, tag: 'Established Cultural & Retail' },
      { locality: 'Viman Nagar', pinCode: '411014', defaultRent: 96000, typicalSqft: 800, footfall: 2100, tag: 'Phoenix Marketcity Catchment' },
      { locality: 'Hinjewadi', pinCode: '411057', defaultRent: 68000, typicalSqft: 800, footfall: 1700, tag: 'Phase 1 & 2 IT Park Corridor' },
    ]
  },
  {
    city: 'Chennai',
    state: 'Tamil Nadu',
    label: 'Chennai (Metro)',
    localities: [
      { locality: 'Anna Nagar', pinCode: '600040', defaultRent: 92000, typicalSqft: 800, footfall: 1900, tag: '2nd Avenue & Shanti Colony' },
      { locality: 'T. Nagar', pinCode: '600017', defaultRent: 132000, typicalSqft: 800, footfall: 3000, tag: 'Pondy Bazaar Retail Hub' },
      { locality: 'Adyar', pinCode: '600020', defaultRent: 96000, typicalSqft: 800, footfall: 1700, tag: 'LB Road High Street' },
      { locality: 'OMR', pinCode: '600096', defaultRent: 76000, typicalSqft: 800, footfall: 1650, tag: 'Thoraipakkam IT Highway' },
      { locality: 'Velachery', pinCode: '600042', defaultRent: 80000, typicalSqft: 800, footfall: 1950, tag: 'Bypass Road & Transit Hub' },
    ]
  },
  {
    city: 'Kolkata',
    state: 'West Bengal',
    label: 'Kolkata (Metro)',
    localities: [
      { locality: 'Park Street', pinCode: '700016', defaultRent: 136000, typicalSqft: 800, footfall: 2400, tag: 'Heritage High Street' },
      { locality: 'Salt Lake Sector V', pinCode: '700091', defaultRent: 68000, typicalSqft: 800, footfall: 1800, tag: 'IT & Commercial Complex' },
      { locality: 'New Town', pinCode: '700156', defaultRent: 60000, typicalSqft: 800, footfall: 1500, tag: 'Planned Growth Corridor' },
      { locality: 'Ballygunge', pinCode: '700019', defaultRent: 104000, typicalSqft: 800, footfall: 2100, tag: 'Gariahat Retail Belt' },
    ]
  },
  {
    city: 'Ahmedabad',
    state: 'Gujarat',
    label: 'Ahmedabad (Metro)',
    localities: [
      { locality: 'SG Highway', pinCode: '380054', defaultRent: 76000, typicalSqft: 800, footfall: 1800, tag: 'Commercial & High Street' },
      { locality: 'Sindhu Bhavan Road', pinCode: '380059', defaultRent: 112000, typicalSqft: 800, footfall: 2000, tag: 'SBR Luxury Lifestyle Corridor' },
      { locality: 'Prahlad Nagar', pinCode: '380015', defaultRent: 88000, typicalSqft: 800, footfall: 1850, tag: 'Corporate Road Hub' },
      { locality: 'Bodakdev', pinCode: '380054', defaultRent: 96000, typicalSqft: 800, footfall: 1900, tag: 'Judges Bungalow High Street' },
    ]
  }
];

export const getCityInfo = (cityName: string): CityInfo | undefined => {
  return CITIES_AND_LOCALITIES.find(
    (c) => c.city.toLowerCase() === cityName.toLowerCase()
  );
};
