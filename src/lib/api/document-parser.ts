import { supabase } from '@/lib/supabase';

export interface ParsedBeneficiary {
  name: string;
  phone: string;
  email?: string;
  address: string;
  district: string;
  household_size?: number;
  vulnerabilities?: string[];
}

export interface ParsedVolunteer {
  name: string;
  phone: string;
  email?: string;
  district: string;
  skills?: string[];
  equipment?: string[];
  availability?: string;
}

export interface ParsedShelter {
  name: string;
  address: string;
  district: string;
  total_capacity?: number;
  contact_name?: string;
  contact_phone?: string;
  has_medical?: boolean;
  has_food?: boolean;
  has_water?: boolean;
}

export interface ParsedCase {
  case_number?: string;
  description: string;
  category: string;
  priority: string;
  district: string;
  address?: string;
  people_affected?: number;
}

export interface ParsedData {
  type: 'beneficiaries' | 'volunteers' | 'shelters' | 'cases' | 'unknown';
  count: number;
  records: any[];
  summary?: Record<string, any>;
}

/**
 * Parse CSV content
 */
function parseCSV(content: string): string[][] {
  const lines = content.split('\n').filter(line => line.trim());
  const result: string[][] = [];
  
  for (const line of lines) {
    // Handle quoted fields
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current || line.endsWith(',')) {
      fields.push(current.trim());
    }
    
    if (fields.some(f => f.length > 0)) {
      result.push(fields);
    }
  }
  
  return result;
}

/**
 * Normalize header names
 */
function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[\s_-]/g, '').trim();
}

/**
 * Detect data type from headers and content
 */
function detectDataType(headers: string[], rows: any[][]): ParsedData['type'] {
  const normalizedHeaders = headers.map(normalizeHeader);
  
  // Check for beneficiary indicators
  if (normalizedHeaders.some(h => h.includes('household')) || 
      (normalizedHeaders.includes('name') && normalizedHeaders.includes('phone') && normalizedHeaders.includes('district'))) {
    return 'beneficiaries';
  }
  
  // Check for volunteer indicators
  if (normalizedHeaders.some(h => h.includes('skill')) || 
      normalizedHeaders.some(h => h.includes('availability'))) {
    return 'volunteers';
  }
  
  // Check for shelter indicators
  if (normalizedHeaders.some(h => h.includes('capacity')) || 
      normalizedHeaders.some(h => h.includes('shelter'))) {
    return 'shelters';
  }
  
  // Check for case indicators
  if (normalizedHeaders.some(h => h.includes('category')) || 
      normalizedHeaders.some(h => h.includes('priority'))) {
    return 'cases';
  }
  
  return 'unknown';
}

/**
 * Parse CSV data based on detected type
 */
function parseCSVData(rows: string[][], type: ParsedData['type']): ParsedData {
  if (rows.length < 2) {
    return { type: 'unknown', count: 0, records: [] };
  }
  
  const headers = rows[0].map(normalizeHeader);
  const records: any[] = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const record: any = {};
    
    for (let j = 0; j < headers.length; j++) {
      record[headers[j]] = row[j] || '';
    }
    
    records.push(record);
  }
  
  // Filter out empty records
  const filteredRecords = records.filter(r => Object.values(r).some(v => v && String(v).trim().length > 0));
  
  // Generate summary statistics
  const summary = generateSummary(filteredRecords, type);
  
  return {
    type,
    count: filteredRecords.length,
    records: filteredRecords,
    summary
  };
}

/**
 * Generate summary from parsed data
 */
function generateSummary(records: any[], type: ParsedData['type']): Record<string, any> {
  if (records.length === 0) return {};
  
  switch (type) {
    case 'beneficiaries':
      return {
        total_records: records.length,
        districts: [...new Set(records.map(r => r.district || r.loc || '').filter(Boolean))],
        avg_household_size: records.reduce((sum, r) => sum + (parseInt(r.householdsize || r.size || 1)), 0) / records.length,
        with_vulnerabilities: records.filter(r => r.vulnerabilities || r.vulnerable).length
      };
    case 'volunteers':
      return {
        total_records: records.length,
        districts: [...new Set(records.map(r => r.district || r.loc || '').filter(Boolean))],
        by_availability: records.reduce((acc, r) => {
          const avail = r.availability || r.avail || 'unknown';
          acc[avail] = (acc[avail] || 0) + 1;
          return acc;
        }, {}),
        with_skills: records.filter(r => r.skills || r.skill).length
      };
    case 'shelters':
      return {
        total_records: records.length,
        districts: [...new Set(records.map(r => r.district || r.loc || '').filter(Boolean))],
        total_capacity: records.reduce((sum, r) => sum + (parseInt(r.capacity || r.total || 0)), 0),
        by_type: records.reduce((acc, r) => {
          const type = r.type || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {})
      };
    case 'cases':
      return {
        total_records: records.length,
        districts: [...new Set(records.map(r => r.district || r.loc || '').filter(Boolean))],
        by_category: records.reduce((acc, r) => {
          const cat = r.category || r.type || 'unknown';
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {}),
        by_priority: records.reduce((acc, r) => {
          const pri = r.priority || 'medium';
          acc[pri] = (acc[pri] || 0) + 1;
          return acc;
        }, {}),
        total_affected: records.reduce((sum, r) => sum + (parseInt(r.peopleaffected || r.affected || 1)), 0)
      };
    default:
      return {
        total_records: records.length,
        fields: Object.keys(records[0] || {})
      };
  }
}

/**
 * Parse text file content
 */function parseTextFile(content: string): ParsedData {
  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      const type = detectDataType(Object.keys(parsed[0] || {}), []);
      return {
        type,
        count: parsed.length,
        records: parsed,
        summary: generateSummary(parsed, type)
      };
    }
  } catch (e) {
    // Not JSON, continue
  }
  
  // Parse as CSV-like content
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    return { type: 'unknown', count: 0, records: [] };
  }
  
  const rows = lines.map(line => line.split(/[,\t|]/).map(f => f.trim()));
  const type = detectDataType(rows[0], rows.slice(1));
  
  return parseCSVData(rows, type);
}

/**
 * Parse PDF text content
 */
function parsePDFContent(content: string): ParsedData {
  // Extract table-like structures from PDF text
  const lines = content.split('\n').filter(line => line.trim());
  
  // Try to identify headers (usually capitalized words)
  let headerIndex = -1;
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const words = lines[i].split(/\s+/);
    if (words.length >= 3 && words.filter(w => w[0] === w[0].toUpperCase()).length > 2) {
      headerIndex = i;
      break;
    }
  }
  
  if (headerIndex === -1) {
    return { type: 'unknown', count: 0, records: [] };
  }
  
  const headers = lines[headerIndex].split(/\s{2,}/).filter(h => h.trim());
  const records: any[] = [];
  
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const values = lines[i].split(/\s{2,}/).filter(v => v.trim());
    if (values.length >= headers.length * 0.5) {
      const record: any = {};
      for (let j = 0; j < headers.length; j++) {
        record[normalizeHeader(headers[j])] = values[j] || '';
      }
      records.push(record);
    }
  }
  
  const type = detectDataType(headers, []);
  return {
    type,
    count: records.length,
    records,
    summary: generateSummary(records, type)
  };
}

/**
 * Main document parsing function
 */
export async function parseDocument(file: File): Promise<ParsedData> {
  const content = await file.text();
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.csv')) {
    const rows = parseCSV(content);
    const type = detectDataType(rows[0] || [], rows.slice(1));
    return parseCSVData(rows, type);
  } else if (fileName.endsWith('.txt') || fileName.endsWith('.text')) {
    return parseTextFile(content);
  } else if (fileName.endsWith('.json')) {
    return parseTextFile(content);
  } else if (fileName.endsWith('.pdf')) {
    return parsePDFContent(content);
  }
  
  // Try text parsing as fallback
  return parseTextFile(content);
}

/**
 * Extract and import beneficiaries from parsed data
 */
export async function importBeneficiaries(records: any[]): Promise<any> {
  const beneficiaries = records.map(r => ({
    name: r.name || r.fullname || '',
    phone: r.phone || r.mobile || r.contact || '',
    email: r.email || r.emailaddress || '',
    address: r.address || r.location || r.addr || '',
    district: r.district || r.loc || r.area || '',
    gs_division: r.gsdivision || r.division || '',
    village: r.village || r.vill || '',
    household_size: parseInt(r.householdsize || r.size || 1),
    vulnerabilities: parseArray(r.vulnerabilities || r.vulnerable || ''),
    opt_in_sms: !r.optoutsms,
    opt_in_email: !r.optoutemail
  })).filter(b => b.name && b.phone);
  
  if (beneficiaries.length === 0) {
    throw new Error('No valid beneficiary records found');
  }
  
  const { data, error } = await supabase
    .from('beneficiaries')
    .insert(beneficiaries)
    .select();
  
  if (error) throw error;
  return data;
}

/**
 * Extract and import volunteers from parsed data
 */
export async function importVolunteers(records: any[]): Promise<any> {
  const volunteers = records.map(r => ({
    name: r.name || r.fullname || '',
    phone: r.phone || r.mobile || r.contact || '',
    email: r.email || r.emailaddress || '',
    district: r.district || r.loc || r.area || '',
    skills: parseArray(r.skills || r.skill || r.specialization || ''),
    equipment: parseArray(r.equipment || r.equip || ''),
    availability: r.availability || r.avail || 'ON_CALL',
    role: r.role || r.position || 'FIELD_WORKER'
  })).filter(v => v.name && v.phone);
  
  if (volunteers.length === 0) {
    throw new Error('No valid volunteer records found');
  }
  
  const { data, error } = await supabase
    .from('volunteers')
    .insert(volunteers)
    .select();
  
  if (error) throw error;
  return data;
}

/**
 * Extract and import shelters from parsed data
 */
export async function importShelters(records: any[]): Promise<any> {
  const shelters = records.map(r => ({
    name: r.name || r.sheltername || '',
    address: r.address || r.location || r.addr || '',
    district: r.district || r.loc || r.area || '',
    latitude: parseFloat(r.latitude || r.lat || 0),
    longitude: parseFloat(r.longitude || r.long || 0),
    type: r.type || r.sheltertype || 'TEMPORARY',
    total_capacity: parseInt(r.capacity || r.totalcapacity || 0),
    contact_name: r.contactname || r.contact || '',
    contact_phone: r.contactphone || r.phone || '',
    has_medical: parseBoolean(r.hasmedical || r.medical),
    has_food: parseBoolean(r.hasfood || r.food),
    has_water: parseBoolean(r.haswater || r.water),
    has_sanitation: parseBoolean(r.hassanitation || r.sanitation)
  })).filter(s => s.name && s.district);
  
  if (shelters.length === 0) {
    throw new Error('No valid shelter records found');
  }
  
  const { data, error } = await supabase
    .from('shelters')
    .insert(shelters)
    .select();
  
  if (error) throw error;
  return data;
}

/**
 * Parse array from string
 */
function parseArray(value: string | string[]): string[] {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'string') return [];
  
  return value
    .split(/[,;|]/)
    .map(v => v.trim())
    .filter(v => v.length > 0);
}

/**
 * Parse boolean from string
 */
function parseBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return false;
  
  return ['yes', 'true', '1', 'y', 't'].includes(value.toLowerCase());
}
