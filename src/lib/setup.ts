/**
 * ResQ-Unified - Setup & Configuration Guide
 * This file contains helper functions for system setup and initialization
 */

import { supabase } from '@/lib/supabase';

// Default admin accounts to create
const DEFAULT_ADMINS = [
  {
    email: 'admin@resq-unified.lk',
    password: 'Admin@123!',
    fullName: 'System Administrator',
    role: 'SUPER_ADMIN'
  },
  {
    email: 'coordinator@resq-unified.lk',
    password: 'Coord@123!',
    fullName: 'Emergency Coordinator',
    role: 'COORDINATOR'
  },
  {
    email: 'casemanager@resq-unified.lk',
    password: 'Case@123!',
    fullName: 'Case Manager',
    role: 'CASE_MANAGER'
  },
  {
    email: 'volunteer@resq-unified.lk',
    password: 'Vol@123!',
    fullName: 'Field Volunteer',
    role: 'VOLUNTEER'
  }
];

/**
 * Initialize system admin accounts
 * Run this once during setup
 */
export async function initializeAdminAccounts() {
  console.log('Initializing admin accounts...');
  
  for (const admin of DEFAULT_ADMINS) {
    try {
      // Check if user already exists
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', admin.email)
        .single();
      
      if (existing) {
        console.log(`Admin ${admin.email} already exists`);
        continue;
      }
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: admin.email,
        password: admin.password,
        options: {
          data: { full_name: admin.fullName }
        }
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authData.user.id,
            email: admin.email,
            full_name: admin.fullName,
            role: admin.role,
            is_active: true,
            district: 'Colombo'
          });
        
        if (profileError) throw profileError;
        
        console.log(`✓ Created admin: ${admin.email}`);
      }
    } catch (error) {
      console.error(`Error creating admin ${admin.email}:`, error);
    }
  }
  
  console.log('Admin account initialization complete!');
}

/**
 * Initialize system settings and defaults
 */
export async function initializeSystemSettings() {
  console.log('Initializing system settings...');
  
  const defaultSettings = [
    { key: 'sla_critical_hours', value: 4 },
    { key: 'sla_high_hours', value: 24 },
    { key: 'sla_medium_hours', value: 48 },
    { key: 'sla_low_hours', value: 72 },
    { key: 'weather_sync_interval', value: 15 },
    { key: 'river_sync_interval', value: 30 },
    { key: 'sms_enabled', value: true },
    { key: 'email_enabled', value: true },
    { key: 'push_enabled', value: true },
    { key: 'use_free_apis', value: true }
  ];
  
  for (const setting of defaultSettings) {
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: setting.key,
          value: setting.value,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
      
      if (error) throw error;
      console.log(`✓ Setting ${setting.key} initialized`);
    } catch (error) {
      console.error(`Error initializing setting ${setting.key}:`, error);
    }
  }
  
  console.log('System settings initialization complete!');
}

/**
 * Initialize API services configuration
 */
export async function initializeApiServices() {
  console.log('Initializing API services configuration...');
  
  const apiConfig = {
    weather: { free: 'OPEN_METEO', paid: 'OPENWEATHERMAP', current: 'OPEN_METEO' },
    sms: { free: 'AWS_SNS', paid: 'TWILIO', current: 'AWS_SNS' },
    maps: { free: 'OPENSTREETMAP', paid: 'GOOGLE_MAPS', current: 'OPENSTREETMAP' },
    ai: { paid: 'OPENAI' }
  };
  
  try {
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        key: 'api_services',
        value: apiConfig,
        description: 'API service configuration',
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
    
    if (error) throw error;
    console.log('✓ API services configuration initialized');
  } catch (error) {
    console.error('Error initializing API services:', error);
  }
}

/**
 * Create sample districts data
 */
export async function initializeDistricts() {
  console.log('Initializing districts...');
  
  const districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Mullaitivu', 'Vavuniya', 'Trincomalee', 'Batticaloa', 'Ampara',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Monaragala', 'Ratnapura', 'Kegalle'
  ];
  
  // Store in system settings for reference
  try {
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        key: 'sri_lanka_districts',
        value: districts,
        description: 'List of Sri Lankan districts',
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
    
    if (error) throw error;
    console.log('✓ Districts initialized');
  } catch (error) {
    console.error('Error initializing districts:', error);
  }
}

/**
 * Complete setup function
 */
export async function completeSetup() {
  console.log('Starting ResQ-Unified setup...\n');
  
  try {
    await initializeSystemSettings();
    console.log();
    
    await initializeApiServices();
    console.log();
    
    await initializeDistricts();
    console.log();
    
    await initializeAdminAccounts();
    console.log();
    
    console.log('✅ Setup complete! ResQ-Unified is ready to use.');
    console.log('\nDefault Admin Credentials:');
    console.log('─'.repeat(50));
    DEFAULT_ADMINS.forEach(admin => {
      console.log(`${admin.role.padEnd(15)} | ${admin.email.padEnd(30)} | ${admin.password}`);
    });
    console.log('─'.repeat(50));
    console.log('\n⚠️  IMPORTANT: Change these credentials in production!');
    
    return true;
  } catch (error) {
    console.error('Setup failed:', error);
    return false;
  }
}

/**
 * Test Supabase connection
 */
export async function testSupabaseConnection() {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      console.log('✓ Supabase connection OK (unauthenticated)');
    } else {
      console.log('✓ Supabase connection OK (authenticated)');
    }
    return true;
  } catch (error) {
    console.error('✗ Supabase connection failed:', error);
    return false;
  }
}

/**
 * Reset system (DANGEROUS - deletes all data)
 */
export async function resetSystem() {
  if (!confirm('⚠️  This will DELETE ALL DATA from the system. This cannot be undone!')) {
    return;
  }
  
  if (!confirm('Are you absolutely sure? Type "I understand" to confirm.')) {
    return;
  }
  
  try {
    console.log('Resetting system...');
    
    // Delete in reverse order of dependencies
    const tables = [
      'case_notes', 'case_attachments', 'aid_items',
      'emergency_reports', 'notification_queue',
      'analytics_events', 'audit_logs',
      'cases', 'missing_persons', 'flood_predictions',
      'river_levels', 'weather_data',
      'alerts', 'broadcasts', 'donations',
      'resources', 'shelters', 'volunteers',
      'beneficiaries', 'uploaded_documents',
      'api_keys', 'system_settings', 'user_profiles'
    ];
    
    for (const table of tables) {
      const { error } = await supabase.from(table).delete().neq('id', 'null');
      if (error) console.warn(`Warning deleting ${table}:`, error.message);
      else console.log(`✓ Cleared ${table}`);
    }
    
    console.log('✅ System reset complete!');
    console.log('\nRun completeSetup() to reinitialize the system.');
  } catch (error) {
    console.error('Error during reset:', error);
  }
}

// Export for CLI or manual execution
export const SetupCommand = {
  init: completeSetup,
  test: testSupabaseConnection,
  reset: resetSystem
};
