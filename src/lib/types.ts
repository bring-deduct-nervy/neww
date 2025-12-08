// Weather Types
export interface WeatherConditions {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  cloudCover: number;
  visibility: number;
  uvIndex: number;
  feelsLike: number;
  weatherCode: number;
  weatherDescription: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  rainfall: number;
  precipitationProbability: number;
  windSpeed: number;
  humidity: number;
  weatherCode: number;
  weatherDescription: string;
}

export interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  rainfallSum: number;
  precipitationProbability: number;
  sunrise: string;
  sunset: string;
  weatherCode: number;
  weatherDescription: string;
}

export interface FloodRiskAssessment {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number;
  factors: {
    rainfall24h: number;
    rainfall72h: number;
    soilSaturation: number;
    riverLevels: number;
    forecast: number;
  };
  recommendations: string[];
}

// Emergency Types
export type EmergencyCategory =
  | 'FLOOD_TRAPPED'
  | 'MEDICAL'
  | 'RESCUE'
  | 'SUPPLIES'
  | 'INFRASTRUCTURE'
  | 'FIRE'
  | 'LANDSLIDE'
  | 'MISSING_PERSON'
  | 'OTHER';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface EmergencyQuickOption {
  id: EmergencyCategory;
  icon: string;
  label: string;
  description: string;
  defaultSeverity: SeverityLevel;
  color: string;
}

export interface EmergencyReport {
  id: string;
  category: EmergencyCategory;
  severity: SeverityLevel;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  district?: string;
  peopleAffected: number;
  hasChildren: boolean;
  hasElderly: boolean;
  hasDisabled: boolean;
  hasMedicalNeeds: boolean;
  contactName: string;
  contactPhone: string;
  isAnonymous: boolean;
  images: string[];
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ReportStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CANCELLED';

// Shelter Types
export interface Shelter {
  id: string;
  name: string;
  type: ShelterType;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  totalCapacity: number;
  currentOccupancy: number;
  availableSpace: number;
  status: ShelterStatus;
  facilities: ShelterFacilities;
  contact?: {
    name: string;
    phone: string;
  };
  needs: ShelterNeed[];
  distance?: number;
}

export type ShelterType =
  | 'RELIEF_CAMP'
  | 'SCHOOL'
  | 'COMMUNITY_CENTER'
  | 'TEMPLE'
  | 'CHURCH'
  | 'MOSQUE'
  | 'GOVERNMENT_BUILDING'
  | 'OTHER';

export type ShelterStatus = 'ACTIVE' | 'FULL' | 'CLOSED' | 'EVACUATING';

export interface ShelterFacilities {
  hasMedical: boolean;
  hasFood: boolean;
  hasWater: boolean;
  hasSanitation: boolean;
  hasElectricity: boolean;
  hasInternet: boolean;
  isAccessible: boolean;
}

export interface ShelterNeed {
  id: string;
  category: string;
  item: string;
  quantity: number;
  urgency: SeverityLevel;
  fulfilled: boolean;
}

// Alert Types
export interface Alert {
  id: string;
  type: AlertType;
  severity: SeverityLevel;
  title: string;
  message: string;
  districts: string[];
  source: string;
  startsAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export type AlertType =
  | 'WEATHER'
  | 'FLOOD'
  | 'LANDSLIDE'
  | 'DAM'
  | 'EVACUATION'
  | 'ROAD_CLOSURE'
  | 'GENERAL';

// Missing Person Types
export interface MissingPerson {
  id: string;
  name: string;
  age?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';
  height?: string;
  weight?: string;
  physicalDesc?: string;
  clothingDesc?: string;
  photo?: string;
  lastSeenAt: Date;
  lastSeenLocation: string;
  lastSeenLat?: number;
  lastSeenLng?: number;
  district?: string;
  contactName: string;
  contactPhone: string;
  status: MissingStatus;
  sightings: Sighting[];
  createdAt: Date;
}

export type MissingStatus = 'MISSING' | 'SIGHTED' | 'FOUND_SAFE' | 'FOUND_DECEASED';

export interface Sighting {
  id: string;
  location: string;
  latitude?: number;
  longitude?: number;
  description: string;
  reporterPhone: string;
  reporterName?: string;
  photo?: string;
  verified: boolean;
  createdAt: Date;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// Emergency Contact Types
export interface EmergencyContact {
  id: string;
  name: string;
  organization?: string;
  category: ContactCategory;
  phone: string;
  alternatePhone?: string;
  district?: string;
  isNational: boolean;
}

export type ContactCategory =
  | 'POLICE'
  | 'FIRE'
  | 'AMBULANCE'
  | 'HOSPITAL'
  | 'MILITARY'
  | 'NAVY'
  | 'AIR_FORCE'
  | 'DISASTER_MANAGEMENT'
  | 'GOVERNMENT'
  | 'NGO'
  | 'UTILITY'
  | 'OTHER';

// Location Types
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  district?: string;
  accuracy?: number;
}

// River Level Types
export interface RiverLevel {
  id: string;
  riverName: string;
  stationName: string;
  district: string;
  latitude: number;
  longitude: number;
  currentLevel: number;
  warningLevel: number;
  dangerLevel: number;
  status: RiverStatus;
  recordedAt: Date;
}

export type RiverStatus = 'NORMAL' | 'RISING' | 'WARNING' | 'DANGER' | 'FLOODING';
