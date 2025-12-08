import { EmergencyQuickOption, EmergencyContact } from './types';

export const EMERGENCY_OPTIONS: EmergencyQuickOption[] = [
  {
    id: 'FLOOD_TRAPPED',
    icon: '🌊',
    label: 'Flood/Trapped',
    description: 'Stranded by water, need rescue',
    defaultSeverity: 'HIGH',
    color: 'blue'
  },
  {
    id: 'MEDICAL',
    icon: '🚑',
    label: 'Medical Emergency',
    description: 'Urgent health emergency',
    defaultSeverity: 'CRITICAL',
    color: 'red'
  },
  {
    id: 'RESCUE',
    icon: '🚁',
    label: 'Rescue Needed',
    description: 'Immediate evacuation required',
    defaultSeverity: 'CRITICAL',
    color: 'orange'
  },
  {
    id: 'SUPPLIES',
    icon: '📦',
    label: 'Need Supplies',
    description: 'Food, water, medicine needs',
    defaultSeverity: 'MEDIUM',
    color: 'green'
  },
  {
    id: 'INFRASTRUCTURE',
    icon: '🏚️',
    label: 'Infrastructure Damage',
    description: 'Building, road, bridge damage',
    defaultSeverity: 'MEDIUM',
    color: 'gray'
  },
  {
    id: 'FIRE',
    icon: '🔥',
    label: 'Fire',
    description: 'Fire emergency',
    defaultSeverity: 'CRITICAL',
    color: 'red'
  },
  {
    id: 'LANDSLIDE',
    icon: '⛰️',
    label: 'Landslide',
    description: 'Landslide or earth movement',
    defaultSeverity: 'HIGH',
    color: 'brown'
  },
  {
    id: 'OTHER',
    icon: '⚠️',
    label: 'Other Emergency',
    description: 'Other type of emergency',
    defaultSeverity: 'MEDIUM',
    color: 'yellow'
  }
];

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: '1',
    name: 'Police Emergency',
    organization: 'Sri Lanka Police',
    category: 'POLICE',
    phone: '119',
    isNational: true
  },
  {
    id: '2',
    name: 'Ambulance / Suwa Seriya',
    organization: '1990 Suwa Seriya Foundation',
    category: 'AMBULANCE',
    phone: '1990',
    isNational: true
  },
  {
    id: '3',
    name: 'Fire & Rescue',
    organization: 'Fire Services Department',
    category: 'FIRE',
    phone: '110',
    isNational: true
  },
  {
    id: '4',
    name: 'Disaster Management',
    organization: 'Disaster Management Centre',
    category: 'DISASTER_MANAGEMENT',
    phone: '117',
    isNational: true
  },
  {
    id: '5',
    name: 'Sri Lanka Army',
    organization: 'Sri Lanka Army',
    category: 'MILITARY',
    phone: '011-2432682',
    isNational: true
  },
  {
    id: '6',
    name: 'Sri Lanka Navy',
    organization: 'Sri Lanka Navy',
    category: 'NAVY',
    phone: '011-2212231',
    isNational: true
  },
  {
    id: '7',
    name: 'Sri Lanka Air Force',
    organization: 'Sri Lanka Air Force',
    category: 'AIR_FORCE',
    phone: '011-2441044',
    isNational: true
  },
  {
    id: '8',
    name: 'National Hospital',
    organization: 'National Hospital of Sri Lanka',
    category: 'HOSPITAL',
    phone: '011-2691111',
    district: 'Colombo',
    isNational: false
  },
  {
    id: '9',
    name: 'Electricity Board',
    organization: 'Ceylon Electricity Board',
    category: 'UTILITY',
    phone: '1987',
    isNational: true
  },
  {
    id: '10',
    name: 'Water Board',
    organization: 'National Water Supply & Drainage Board',
    category: 'UTILITY',
    phone: '1939',
    isNational: true
  }
];

export const SRI_LANKA_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

export const WEATHER_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: 'Clear sky', icon: '☀️' },
  1: { description: 'Mainly clear', icon: '🌤️' },
  2: { description: 'Partly cloudy', icon: '⛅' },
  3: { description: 'Overcast', icon: '☁️' },
  45: { description: 'Foggy', icon: '🌫️' },
  48: { description: 'Depositing rime fog', icon: '🌫️' },
  51: { description: 'Light drizzle', icon: '🌧️' },
  53: { description: 'Moderate drizzle', icon: '🌧️' },
  55: { description: 'Dense drizzle', icon: '🌧️' },
  61: { description: 'Slight rain', icon: '🌧️' },
  63: { description: 'Moderate rain', icon: '🌧️' },
  65: { description: 'Heavy rain', icon: '🌧️' },
  71: { description: 'Slight snow', icon: '🌨️' },
  73: { description: 'Moderate snow', icon: '🌨️' },
  75: { description: 'Heavy snow', icon: '🌨️' },
  80: { description: 'Slight rain showers', icon: '🌦️' },
  81: { description: 'Moderate rain showers', icon: '🌦️' },
  82: { description: 'Violent rain showers', icon: '⛈️' },
  95: { description: 'Thunderstorm', icon: '⛈️' },
  96: { description: 'Thunderstorm with hail', icon: '⛈️' },
  99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' }
};

export const SEVERITY_CONFIG = {
  LOW: {
    label: 'Low',
    color: 'bg-green-500',
    textColor: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30'
  },
  MEDIUM: {
    label: 'Medium',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30'
  },
  HIGH: {
    label: 'High',
    color: 'bg-orange-500',
    textColor: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30'
  },
  CRITICAL: {
    label: 'Critical',
    color: 'bg-red-500',
    textColor: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30'
  }
};

export const SHELTER_STATUS_CONFIG = {
  ACTIVE: { label: 'Available', color: 'bg-green-500', textColor: 'text-green-400' },
  FULL: { label: 'Full', color: 'bg-yellow-500', textColor: 'text-yellow-400' },
  CLOSED: { label: 'Closed', color: 'bg-red-500', textColor: 'text-red-400' },
  EVACUATING: { label: 'Evacuating', color: 'bg-orange-500', textColor: 'text-orange-400' }
};
