import { supabase } from '@/lib/supabase';

export interface ProcessedDocument {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  extracted_data: any;
  processing_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  error_message?: string;
  uploaded_by_id?: string;
  created_at: string;
  processed_at?: string;
}

export interface ExtractedData {
  type: string;
  records: any[];
  summary: {
    total_records: number;
    valid_records: number;
    invalid_records: number;
    columns: string[];
  };
  errors: string[];
}

// Parse CSV content
export function parseCSV(content: string): { headers: string[]; rows: string[][] } {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows = lines.slice(1).map(line => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  });

  return { headers, rows };
}

// Detect data type from headers
export function detectDataType(headers: string[]): string {
  const headerLower = headers.map(h => h.toLowerCase());
  
  if (headerLower.some(h => h.includes('beneficiary') || h.includes('household'))) {
    return 'beneficiaries';
  }
  if (headerLower.some(h => h.includes('volunteer') || h.includes('skill'))) {
    return 'volunteers';
  }
  if (headerLower.some(h => h.includes('shelter') || h.includes('capacity'))) {
    return 'shelters';
  }
  if (headerLower.some(h => h.includes('case') || h.includes('priority'))) {
    return 'cases';
  }
  if (headerLower.some(h => h.includes('river') || h.includes('water_level'))) {
    return 'river_levels';
  }
  if (headerLower.some(h => h.includes('alert') || h.includes('severity'))) {
    return 'alerts';
  }
  if (headerLower.some(h => h.includes('donation') || h.includes('donor'))) {
    return 'donations';
  }
  if (headerLower.some(h => h.includes('resource') || h.includes('inventory'))) {
    return 'resources';
  }
  
  return 'unknown';
}

// Map CSV row to beneficiary
function mapToBeneficiary(headers: string[], row: string[]): any {
  const data: any = {};
  headers.forEach((header, i) => {
    const value = row[i] || '';
    const key = header.toLowerCase().replace(/\s+/g, '_');
    
    if (key.includes('name')) data.name = value;
    else if (key.includes('phone') && !key.includes('alternate')) data.phone = value;
    else if (key.includes('alternate') && key.includes('phone')) data.alternate_phone = value;
    else if (key.includes('email')) data.email = value;
    else if (key.includes('national_id') || key.includes('nic')) data.national_id = value;
    else if (key.includes('household') || key.includes('family_size')) data.household_size = parseInt(value) || 1;
    else if (key.includes('address')) data.address = value;
    else if (key.includes('district')) data.district = value;
    else if (key.includes('gs_division') || key.includes('gn_division')) data.gs_division = value;
    else if (key.includes('village')) data.village = value;
    else if (key.includes('latitude') || key.includes('lat')) data.latitude = parseFloat(value) || null;
    else if (key.includes('longitude') || key.includes('lng') || key.includes('lon')) data.longitude = parseFloat(value) || null;
    else if (key.includes('vulnerabilities')) data.vulnerabilities = value.split(';').map(v => v.trim()).filter(Boolean);
  });
  
  return data;
}

// Map CSV row to volunteer
function mapToVolunteer(headers: string[], row: string[]): any {
  const data: any = {};
  headers.forEach((header, i) => {
    const value = row[i] || '';
    const key = header.toLowerCase().replace(/\s+/g, '_');
    
    if (key.includes('name')) data.name = value;
    else if (key.includes('phone')) data.phone = value;
    else if (key.includes('email')) data.email = value;
    else if (key.includes('district')) data.district = value;
    else if (key.includes('skills')) data.skills = value.split(';').map(v => v.trim()).filter(Boolean);
    else if (key.includes('equipment')) data.equipment = value.split(';').map(v => v.trim()).filter(Boolean);
    else if (key.includes('availability')) data.availability = value.toUpperCase() || 'ON_CALL';
    else if (key.includes('role')) data.role = value.toUpperCase() || 'FIELD_WORKER';
  });
  
  return data;
}

// Map CSV row to shelter
function mapToShelter(headers: string[], row: string[]): any {
  const data: any = {};
  headers.forEach((header, i) => {
    const value = row[i] || '';
    const key = header.toLowerCase().replace(/\s+/g, '_');
    
    if (key.includes('name')) data.name = value;
    else if (key.includes('type')) data.type = value;
    else if (key.includes('address')) data.address = value;
    else if (key.includes('district')) data.district = value;
    else if (key.includes('latitude') || key.includes('lat')) data.latitude = parseFloat(value) || null;
    else if (key.includes('longitude') || key.includes('lng')) data.longitude = parseFloat(value) || null;
    else if (key.includes('capacity') && key.includes('total')) data.total_capacity = parseInt(value) || 0;
    else if (key.includes('occupancy') || key.includes('current')) data.current_occupancy = parseInt(value) || 0;
    else if (key.includes('contact') && key.includes('name')) data.contact_name = value;
    else if (key.includes('contact') && key.includes('phone')) data.contact_phone = value;
    else if (key.includes('medical')) data.has_medical = value.toLowerCase() === 'yes' || value === '1' || value.toLowerCase() === 'true';
    else if (key.includes('food')) data.has_food = value.toLowerCase() === 'yes' || value === '1' || value.toLowerCase() === 'true';
    else if (key.includes('water')) data.has_water = value.toLowerCase() === 'yes' || value === '1' || value.toLowerCase() === 'true';
  });
  
  return data;
}

// Map CSV row to case
function mapToCase(headers: string[], row: string[]): any {
  const data: any = {};
  headers.forEach((header, i) => {
    const value = row[i] || '';
    const key = header.toLowerCase().replace(/\s+/g, '_');
    
    if (key.includes('case_number')) data.case_number = value || `CASE-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    else if (key.includes('category')) data.category = value.toUpperCase().replace(/\s+/g, '_');
    else if (key.includes('priority')) data.priority = value.toUpperCase();
    else if (key.includes('description')) data.description = value;
    else if (key.includes('address')) data.address = value;
    else if (key.includes('district')) data.district = value;
    else if (key.includes('people') || key.includes('affected')) data.people_affected = parseInt(value) || 1;
    else if (key.includes('latitude') || key.includes('lat')) data.latitude = parseFloat(value) || null;
    else if (key.includes('longitude') || key.includes('lng')) data.longitude = parseFloat(value) || null;
  });
  
  if (!data.case_number) {
    data.case_number = `CASE-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }
  
  return data;
}

// Map CSV row to river level
function mapToRiverLevel(headers: string[], row: string[]): any {
  const data: any = {};
  headers.forEach((header, i) => {
    const value = row[i] || '';
    const key = header.toLowerCase().replace(/\s+/g, '_');
    
    if (key.includes('river') && key.includes('name')) data.river_name = value;
    else if (key.includes('station')) data.station_name = value;
    else if (key.includes('district')) data.district = value;
    else if (key.includes('current') || key.includes('level')) data.current_level = parseFloat(value) || null;
    else if (key.includes('warning')) data.warning_level = parseFloat(value) || null;
    else if (key.includes('danger')) data.danger_level = parseFloat(value) || null;
    else if (key.includes('latitude') || key.includes('lat')) data.latitude = parseFloat(value) || null;
    else if (key.includes('longitude') || key.includes('lng')) data.longitude = parseFloat(value) || null;
  });
  
  return data;
}

// Process uploaded document
export async function processDocument(documentId: string): Promise<ExtractedData> {
  // Update status to processing
  await supabase
    .from('uploaded_documents')
    .update({ processing_status: 'PROCESSING' })
    .eq('id', documentId);

  try {
    // Get document info
    const { data: doc, error: docError } = await supabase
      .from('uploaded_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !doc) throw new Error('Document not found');

    // Download file content
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(doc.storage_path);

    if (downloadError || !fileData) throw new Error('Failed to download file');

    const content = await fileData.text();
    
    // Parse based on file type
    let extractedData: ExtractedData;
    
    if (doc.file_type.includes('csv') || doc.filename.endsWith('.csv')) {
      extractedData = await processCSVContent(content);
    } else if (doc.file_type.includes('json') || doc.filename.endsWith('.json')) {
      extractedData = processJSONContent(content);
    } else if (doc.file_type.includes('text') || doc.filename.endsWith('.txt')) {
      extractedData = processTextContent(content);
    } else {
      throw new Error(`Unsupported file type: ${doc.file_type}`);
    }

    // Import data to database
    if (extractedData.records.length > 0 && extractedData.type !== 'unknown') {
      await importRecords(extractedData.type, extractedData.records);
    }

    // Update document with extracted data
    await supabase
      .from('uploaded_documents')
      .update({
        processing_status: 'COMPLETED',
        extracted_data: extractedData,
        processed_at: new Date().toISOString()
      })
      .eq('id', documentId);

    return extractedData;
  } catch (error: any) {
    await supabase
      .from('uploaded_documents')
      .update({
        processing_status: 'FAILED',
        error_message: error.message
      })
      .eq('id', documentId);

    throw error;
  }
}

// Process CSV content
async function processCSVContent(content: string): Promise<ExtractedData> {
  const { headers, rows } = parseCSV(content);
  const dataType = detectDataType(headers);
  
  const records: any[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    try {
      let record: any;
      switch (dataType) {
        case 'beneficiaries':
          record = mapToBeneficiary(headers, row);
          break;
        case 'volunteers':
          record = mapToVolunteer(headers, row);
          break;
        case 'shelters':
          record = mapToShelter(headers, row);
          break;
        case 'cases':
          record = mapToCase(headers, row);
          break;
        case 'river_levels':
          record = mapToRiverLevel(headers, row);
          break;
        default:
          record = headers.reduce((acc, h, i) => {
            acc[h.toLowerCase().replace(/\s+/g, '_')] = row[i];
            return acc;
          }, {} as any);
      }
      
      if (Object.keys(record).length > 0) {
        records.push(record);
      }
    } catch (err: any) {
      errors.push(`Row ${index + 2}: ${err.message}`);
    }
  });

  return {
    type: dataType,
    records,
    summary: {
      total_records: rows.length,
      valid_records: records.length,
      invalid_records: rows.length - records.length,
      columns: headers
    },
    errors
  };
}

// Process JSON content
function processJSONContent(content: string): ExtractedData {
  try {
    const data = JSON.parse(content);
    const records = Array.isArray(data) ? data : [data];
    
    // Try to detect type from first record
    const firstRecord = records[0] || {};
    const keys = Object.keys(firstRecord);
    const dataType = detectDataType(keys);

    return {
      type: dataType,
      records,
      summary: {
        total_records: records.length,
        valid_records: records.length,
        invalid_records: 0,
        columns: keys
      },
      errors: []
    };
  } catch (error: any) {
    return {
      type: 'unknown',
      records: [],
      summary: {
        total_records: 0,
        valid_records: 0,
        invalid_records: 0,
        columns: []
      },
      errors: [`JSON parse error: ${error.message}`]
    };
  }
}

// Process text content
function processTextContent(content: string): ExtractedData {
  const lines = content.split('\n').filter(line => line.trim());
  
  // Try to extract key-value pairs
  const records: any[] = [];
  let currentRecord: any = {};
  
  lines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim().toLowerCase().replace(/\s+/g, '_');
      const value = line.substring(colonIndex + 1).trim();
      currentRecord[key] = value;
    } else if (line.startsWith('---') || line.startsWith('===')) {
      if (Object.keys(currentRecord).length > 0) {
        records.push(currentRecord);
        currentRecord = {};
      }
    }
  });
  
  if (Object.keys(currentRecord).length > 0) {
    records.push(currentRecord);
  }

  const columns = records.length > 0 ? Object.keys(records[0]) : [];
  const dataType = detectDataType(columns);

  return {
    type: dataType,
    records,
    summary: {
      total_records: records.length,
      valid_records: records.length,
      invalid_records: 0,
      columns
    },
    errors: []
  };
}

// Import records to database
async function importRecords(dataType: string, records: any[]): Promise<void> {
  if (records.length === 0) return;

  const tableName = dataType;
  const batchSize = 100;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from(tableName)
      .upsert(batch, { onConflict: 'id', ignoreDuplicates: true });

    if (error) {
      console.error(`Error importing batch to ${tableName}:`, error);
    }
  }
}

// Get document processing status
export async function getDocumentStatus(documentId: string): Promise<ProcessedDocument | null> {
  const { data, error } = await supabase
    .from('uploaded_documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (error) return null;
  return data;
}

// Subscribe to document processing updates
export function subscribeToDocumentUpdates(
  documentId: string,
  callback: (doc: ProcessedDocument) => void
) {
  return supabase
    .channel(`document_${documentId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'uploaded_documents',
        filter: `id=eq.${documentId}`
      },
      (payload) => callback(payload.new as ProcessedDocument)
    )
    .subscribe();
}
