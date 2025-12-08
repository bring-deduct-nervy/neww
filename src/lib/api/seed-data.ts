import { supabase } from '@/lib/supabase';

// Sri Lanka districts
const SRI_LANKA_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Mullaitivu', 'Vavuniya', 'Trincomalee', 'Batticaloa', 'Ampara',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle'
];

const CASE_CATEGORIES = [
  'FOOD', 'WATER', 'MEDICAL', 'SHELTER', 'EVACUATION', 'RESCUE', 
  'CLOTHING', 'SANITATION', 'ELECTRICITY', 'COMMUNICATION', 'TRANSPORT', 'OTHER'
];

const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const STATUSES = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

// Generate random Sri Lankan names
const firstNames = ['Kamal', 'Nimal', 'Sunil', 'Priya', 'Kumari', 'Lakshmi', 'Ravi', 'Saman', 'Dilani', 'Chaminda', 'Anura', 'Malini', 'Ruwan', 'Sanduni', 'Thilak'];
const lastNames = ['Perera', 'Silva', 'Fernando', 'Jayawardena', 'Bandara', 'Wickramasinghe', 'Rathnayake', 'Dissanayake', 'Gunasekara', 'Herath'];

function randomName() {
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function randomPhone() {
  return `07${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
}

function randomDistrict() {
  return SRI_LANKA_DISTRICTS[Math.floor(Math.random() * SRI_LANKA_DISTRICTS.length)];
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Seed beneficiaries
export async function seedBeneficiaries(count: number = 50) {
  const beneficiaries = [];
  
  for (let i = 0; i < count; i++) {
    beneficiaries.push({
      name: randomName(),
      phone: randomPhone(),
      email: `beneficiary${i + 1}@example.com`,
      district: randomDistrict(),
      address: `${Math.floor(Math.random() * 500) + 1}, Main Street`,
      household_size: Math.floor(Math.random() * 6) + 1,
      vulnerabilities: Math.random() > 0.5 ? ['elderly', 'children'] : [],
      opt_in_sms: true
    });
  }

  const { data, error } = await supabase
    .from('beneficiaries')
    .insert(beneficiaries)
    .select();

  if (error) throw error;
  return data;
}

// Seed volunteers
export async function seedVolunteers(count: number = 30) {
  const skills = ['First Aid', 'Driving', 'Medical', 'Cooking', 'Construction', 'Communication', 'Logistics'];
  const equipment = ['Vehicle', 'Medical Kit', 'Tools', 'Communication Radio', 'Boat'];
  const roles = ['FIELD_WORKER', 'COORDINATOR', 'DRIVER', 'MEDICAL'];
  
  const volunteers = [];
  
  for (let i = 0; i < count; i++) {
    volunteers.push({
      name: randomName(),
      phone: randomPhone(),
      email: `volunteer${i + 1}@example.com`,
      district: randomDistrict(),
      skills: [randomElement(skills), randomElement(skills)].filter((v, i, a) => a.indexOf(v) === i),
      equipment: Math.random() > 0.5 ? [randomElement(equipment)] : [],
      availability: randomElement(['FULL_TIME', 'PART_TIME', 'ON_CALL']),
      status: randomElement(['ACTIVE', 'ACTIVE', 'ACTIVE', 'INACTIVE']),
      role: randomElement(roles),
      is_verified: Math.random() > 0.3,
      completed_cases: Math.floor(Math.random() * 50),
      sla_compliance_rate: 70 + Math.random() * 30,
      rating: 3 + Math.random() * 2
    });
  }

  const { data, error } = await supabase
    .from('volunteers')
    .insert(volunteers)
    .select();

  if (error) throw error;
  return data;
}

// Seed shelters
export async function seedShelters(count: number = 20) {
  const shelterTypes = ['School', 'Community Hall', 'Temple', 'Church', 'Government Building'];
  const shelters = [];
  
  for (let i = 0; i < count; i++) {
    const capacity = Math.floor(Math.random() * 200) + 50;
    shelters.push({
      name: `${randomDistrict()} ${randomElement(shelterTypes)} Shelter`,
      type: randomElement(shelterTypes),
      address: `${Math.floor(Math.random() * 100) + 1}, ${randomDistrict()} Road`,
      district: randomDistrict(),
      total_capacity: capacity,
      current_occupancy: Math.floor(Math.random() * capacity * 0.8),
      status: randomElement(['ACTIVE', 'ACTIVE', 'ACTIVE', 'FULL', 'CLOSED']),
      has_medical: Math.random() > 0.5,
      has_food: Math.random() > 0.3,
      has_water: Math.random() > 0.2,
      has_sanitation: Math.random() > 0.4,
      has_electricity: Math.random() > 0.3,
      contact_name: randomName(),
      contact_phone: randomPhone()
    });
  }

  const { data, error } = await supabase
    .from('shelters')
    .insert(shelters)
    .select();

  if (error) throw error;
  return data;
}

// Seed cases
export async function seedCases(count: number = 100, beneficiaryIds: string[] = [], volunteerIds: string[] = []) {
  const cases = [];
  
  for (let i = 0; i < count; i++) {
    const priority = randomElement(PRIORITIES);
    const status = randomElement(STATUSES);
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    
    cases.push({
      case_number: `CASE-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      beneficiary_id: beneficiaryIds.length > 0 ? randomElement(beneficiaryIds) : null,
      category: randomElement(CASE_CATEGORIES),
      priority,
      status,
      description: `Emergency assistance needed for ${randomElement(['flood damage', 'food shortage', 'medical emergency', 'shelter requirement', 'water supply'])}`,
      address: `${Math.floor(Math.random() * 500) + 1}, ${randomDistrict()} Road`,
      district: randomDistrict(),
      people_affected: Math.floor(Math.random() * 10) + 1,
      assigned_volunteer_id: status !== 'NEW' && volunteerIds.length > 0 ? randomElement(volunteerIds) : null,
      sla_deadline: new Date(createdAt.getTime() + (priority === 'CRITICAL' ? 4 : priority === 'HIGH' ? 24 : priority === 'MEDIUM' ? 48 : 72) * 60 * 60 * 1000).toISOString(),
      resolved_at: ['RESOLVED', 'CLOSED'].includes(status) ? new Date(createdAt.getTime() + Math.random() * 48 * 60 * 60 * 1000).toISOString() : null,
      created_at: createdAt.toISOString()
    });
  }

  const { data, error } = await supabase
    .from('cases')
    .insert(cases)
    .select();

  if (error) throw error;
  return data;
}

// Seed alerts
export async function seedAlerts(count: number = 10) {
  const alertTypes = ['FLOOD_WARNING', 'WEATHER_ALERT', 'EVACUATION', 'DAM_RELEASE', 'LANDSLIDE_WARNING'];
  const alerts = [];
  
  for (let i = 0; i < count; i++) {
    const severity = randomElement(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
    alerts.push({
      type: randomElement(alertTypes),
      severity,
      title: `${severity} Alert - ${randomDistrict()}`,
      message: `${randomElement(['Heavy rainfall expected', 'Water levels rising', 'Evacuation recommended', 'Road closures in effect'])} in the area.`,
      districts: [randomDistrict(), randomDistrict()].filter((v, i, a) => a.indexOf(v) === i),
      source: randomElement(['DMC', 'WEATHER_SERVICE', 'IRRIGATION_DEPT']),
      is_active: Math.random() > 0.3,
      expires_at: new Date(Date.now() + Math.random() * 48 * 60 * 60 * 1000).toISOString()
    });
  }

  const { data, error } = await supabase
    .from('alerts')
    .insert(alerts)
    .select();

  if (error) throw error;
  return data;
}

// Seed river levels
export async function seedRiverLevels() {
  const rivers = [
    { name: 'Kelani River', station: 'Nagalagam Street', district: 'Colombo', lat: 6.9497, lng: 79.8612 },
    { name: 'Kelani River', station: 'Hanwella', district: 'Colombo', lat: 6.9097, lng: 80.0812 },
    { name: 'Kalu River', station: 'Putupaula', district: 'Kalutara', lat: 6.5854, lng: 79.9607 },
    { name: 'Gin River', station: 'Baddegama', district: 'Galle', lat: 6.1535, lng: 80.1910 },
    { name: 'Nilwala River', station: 'Pitabeddara', district: 'Matara', lat: 6.0549, lng: 80.4550 },
    { name: 'Mahaweli River', station: 'Peradeniya', district: 'Kandy', lat: 7.2706, lng: 80.5937 },
    { name: 'Walawe River', station: 'Thimbolketiya', district: 'Ratnapura', lat: 6.4828, lng: 80.5992 },
    { name: 'Attanagalu Oya', station: 'Dunamale', district: 'Gampaha', lat: 7.0917, lng: 79.9500 }
  ];

  const riverLevels = rivers.map(river => {
    const warningLevel = 3 + Math.random() * 2;
    const dangerLevel = warningLevel + 1 + Math.random();
    const currentLevel = Math.random() * (dangerLevel + 1);
    
    let status = 'NORMAL';
    if (currentLevel >= dangerLevel) status = 'DANGER';
    else if (currentLevel >= warningLevel) status = 'WARNING';
    else if (currentLevel >= warningLevel * 0.8) status = 'RISING';

    return {
      river_name: river.name,
      station_name: river.station,
      district: river.district,
      latitude: river.lat,
      longitude: river.lng,
      current_level: Math.round(currentLevel * 100) / 100,
      warning_level: Math.round(warningLevel * 100) / 100,
      danger_level: Math.round(dangerLevel * 100) / 100,
      status,
      recorded_at: new Date().toISOString()
    };
  });

  const { data, error } = await supabase
    .from('river_levels')
    .insert(riverLevels)
    .select();

  if (error) throw error;
  return data;
}

// Seed weather data
export async function seedWeatherData() {
  const districtCoords: Record<string, { lat: number; lng: number }> = {
    'Colombo': { lat: 6.9271, lng: 79.8612 },
    'Gampaha': { lat: 7.0917, lng: 79.9500 },
    'Kalutara': { lat: 6.5854, lng: 79.9607 },
    'Kandy': { lat: 7.2906, lng: 80.6337 },
    'Galle': { lat: 6.0535, lng: 80.2210 },
    'Matara': { lat: 5.9549, lng: 80.5550 },
    'Ratnapura': { lat: 6.6828, lng: 80.3992 },
    'Kurunegala': { lat: 7.4867, lng: 80.3647 },
    'Anuradhapura': { lat: 8.3114, lng: 80.4037 },
    'Jaffna': { lat: 9.6615, lng: 80.0255 },
    'Batticaloa': { lat: 7.7310, lng: 81.6747 },
    'Trincomalee': { lat: 8.5874, lng: 81.2152 },
    'Badulla': { lat: 6.9934, lng: 81.0550 },
    'Nuwara Eliya': { lat: 6.9497, lng: 80.7891 }
  };

  const weatherData = Object.entries(districtCoords).map(([district, coords]) => {
    const rainfall = Math.random() * 50;
    let floodRisk = 'LOW';
    if (rainfall > 40) floodRisk = 'EXTREME';
    else if (rainfall > 30) floodRisk = 'VERY_HIGH';
    else if (rainfall > 20) floodRisk = 'HIGH';
    else if (rainfall > 10) floodRisk = 'MODERATE';

    return {
      district,
      latitude: coords.lat,
      longitude: coords.lng,
      temperature: 25 + Math.random() * 10,
      humidity: 60 + Math.random() * 30,
      rainfall: Math.round(rainfall * 10) / 10,
      wind_speed: Math.random() * 30,
      wind_direction: Math.floor(Math.random() * 360),
      pressure: 1010 + Math.random() * 20,
      cloud_cover: Math.floor(Math.random() * 100),
      visibility: 5 + Math.random() * 10,
      feels_like: 26 + Math.random() * 8,
      weather_code: randomElement([0, 1, 2, 3, 45, 51, 61, 63, 65, 80, 95]),
      flood_risk_level: floodRisk,
      recorded_at: new Date().toISOString()
    };
  });

  const { data, error } = await supabase
    .from('weather_data')
    .insert(weatherData)
    .select();

  if (error) throw error;
  return data;
}

// Seed missing persons
export async function seedMissingPersons(count: number = 10) {
  const missingPersons = [];
  
  for (let i = 0; i < count; i++) {
    const status = randomElement(['MISSING', 'MISSING', 'MISSING', 'FOUND']);
    missingPersons.push({
      name: randomName(),
      age: Math.floor(Math.random() * 60) + 10,
      gender: randomElement(['Male', 'Female']),
      description: `Last seen wearing ${randomElement(['blue shirt', 'red dress', 'white t-shirt', 'green jacket'])}`,
      last_seen_location: `${randomDistrict()} area`,
      last_seen_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      district: randomDistrict(),
      contact_name: randomName(),
      contact_phone: randomPhone(),
      status,
      found_at: status === 'FOUND' ? new Date().toISOString() : null,
      found_location: status === 'FOUND' ? `${randomDistrict()} shelter` : null
    });
  }

  const { data, error } = await supabase
    .from('missing_persons')
    .insert(missingPersons)
    .select();

  if (error) throw error;
  return data;
}

// Seed emergency reports
export async function seedEmergencyReports(count: number = 20) {
  const categories = ['FLOOD', 'LANDSLIDE', 'FIRE', 'MEDICAL', 'RESCUE', 'OTHER'];
  const reports = [];
  
  for (let i = 0; i < count; i++) {
    reports.push({
      reporter_name: randomName(),
      reporter_phone: randomPhone(),
      category: randomElement(categories),
      description: `Emergency situation reported: ${randomElement(['flooding in area', 'people stranded', 'medical assistance needed', 'road blocked', 'building damage'])}`,
      address: `${Math.floor(Math.random() * 500) + 1}, ${randomDistrict()} Road`,
      district: randomDistrict(),
      severity: randomElement(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
      status: randomElement(['PENDING', 'VERIFIED', 'ASSIGNED', 'RESOLVED'])
    });
  }

  const { data, error } = await supabase
    .from('emergency_reports')
    .insert(reports)
    .select();

  if (error) throw error;
  return data;
}

// Seed donations
export async function seedDonations(count: number = 30) {
  const donations = [];
  
  for (let i = 0; i < count; i++) {
    const type = randomElement(['MONETARY', 'IN_KIND']);
    donations.push({
      donor_name: randomName(),
      donor_phone: randomPhone(),
      donor_email: `donor${i + 1}@example.com`,
      type,
      amount: type === 'MONETARY' ? Math.floor(Math.random() * 50000) + 1000 : null,
      currency: 'LKR',
      items: type === 'IN_KIND' ? { items: [{ name: randomElement(['Rice', 'Water', 'Clothes', 'Medicine']), quantity: Math.floor(Math.random() * 100) + 10 }] } : null,
      status: randomElement(['PENDING', 'COMPLETED', 'COMPLETED', 'COMPLETED'])
    });
  }

  const { data, error } = await supabase
    .from('donations')
    .insert(donations)
    .select();

  if (error) throw error;
  return data;
}

// Seed resources
export async function seedResources() {
  const resources = [
    { category: 'FOOD_SUPPLIES', name: 'Rice Packs', unit: 'kg' },
    { category: 'FOOD_SUPPLIES', name: 'Dry Rations', unit: 'packs' },
    { category: 'DRINKING_WATER', name: 'Bottled Water', unit: 'liters' },
    { category: 'DRINKING_WATER', name: 'Water Purification Tablets', unit: 'tablets' },
    { category: 'MEDICAL', name: 'First Aid Kits', unit: 'kits' },
    { category: 'MEDICAL', name: 'Medicines', unit: 'packs' },
    { category: 'SHELTER', name: 'Tarpaulins', unit: 'sheets' },
    { category: 'SHELTER', name: 'Tents', unit: 'units' },
    { category: 'CLOTHING', name: 'Clothes', unit: 'sets' },
    { category: 'CLOTHING', name: 'Blankets', unit: 'units' },
    { category: 'BABY_SUPPLIES', name: 'Baby Food', unit: 'packs' },
    { category: 'BABY_SUPPLIES', name: 'Diapers', unit: 'packs' }
  ];

  const resourceData = resources.map(r => ({
    ...r,
    quantity: Math.floor(Math.random() * 1000) + 100,
    available: Math.floor(Math.random() * 500) + 50,
    needed: Math.floor(Math.random() * 500) + 100,
    urgency: randomElement(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    location: 'Central Warehouse',
    district: 'Colombo'
  }));

  const { data, error } = await supabase
    .from('resources')
    .insert(resourceData)
    .select();

  if (error) throw error;
  return data;
}

// Main seed function
export async function seedAllData() {
  console.log('Starting data seeding...');
  
  try {
    // Seed in order due to foreign key dependencies
    console.log('Seeding beneficiaries...');
    const beneficiaries = await seedBeneficiaries(50);
    const beneficiaryIds = beneficiaries?.map(b => b.id) || [];
    
    console.log('Seeding volunteers...');
    const volunteers = await seedVolunteers(30);
    const volunteerIds = volunteers?.map(v => v.id) || [];
    
    console.log('Seeding shelters...');
    await seedShelters(20);
    
    console.log('Seeding cases...');
    await seedCases(100, beneficiaryIds, volunteerIds);
    
    console.log('Seeding alerts...');
    await seedAlerts(10);
    
    console.log('Seeding river levels...');
    await seedRiverLevels();
    
    console.log('Seeding weather data...');
    await seedWeatherData();
    
    console.log('Seeding missing persons...');
    await seedMissingPersons(10);
    
    console.log('Seeding emergency reports...');
    await seedEmergencyReports(20);
    
    console.log('Seeding donations...');
    await seedDonations(30);
    
    console.log('Seeding resources...');
    await seedResources();
    
    console.log('Data seeding completed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}

// Clear all data
export async function clearAllData() {
  const tables = [
    'case_notes', 'case_attachments', 'aid_items', 'cases',
    'missing_persons', 'emergency_reports',
    'donations', 'resources', 'river_levels', 'weather_data',
    'flood_predictions', 'alerts', 'broadcasts', 'notification_queue',
    'volunteers', 'beneficiaries', 'shelters',
    'analytics_events', 'audit_logs'
  ];

  for (const table of tables) {
    try {
      await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (error) {
      console.error(`Error clearing ${table}:`, error);
    }
  }

  return { success: true };
}
