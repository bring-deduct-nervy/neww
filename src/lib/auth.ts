import { supabase } from '@/lib/supabase';

export type UserRole = 'USER' | 'VOLUNTEER' | 'CASE_MANAGER' | 'COORDINATOR' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  district?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export async function signUp(email: string, password: string, fullName: string, role: UserRole = 'USER') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  });
  if (error) throw error;
  
  // Create user profile with role
  if (data.user) {
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: data.user.id,
        email: email,
        full_name: fullName,
        role: role,
        is_active: true
      });
    if (profileError) console.error('Error creating profile:', profileError);
  }
  
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  
  if (data.user) {
    // Check if profile exists, if not create one
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();
    
    if (!existingProfile) {
      // Create profile for existing auth user
      await supabase
        .from('user_profiles')
        .insert({
          user_id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          role: 'USER',
          is_active: true
        });
    } else {
      // Update last login
      await supabase
        .from('user_profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('user_id', data.user.id);
    }
  }
  
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) return null;
  return data;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateUserRole(userId: string, role: UserRole) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    'USER': 1,
    'VOLUNTEER': 2,
    'CASE_MANAGER': 3,
    'COORDINATOR': 4,
    'ADMIN': 5,
    'SUPER_ADMIN': 6
  };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function canAccessRoute(userRole: UserRole, route: string): boolean {
  const routePermissions: Record<string, UserRole> = {
    '/admin': 'ADMIN',
    '/admin/settings': 'ADMIN',
    '/admin/users': 'ADMIN',
    '/admin/analytics': 'ADMIN',
    '/admin/data-import': 'ADMIN',
    '/broadcast': 'COORDINATOR',
    '/cases': 'CASE_MANAGER',
    '/beneficiaries': 'CASE_MANAGER',
    '/resources': 'COORDINATOR',
    '/volunteer-dashboard': 'VOLUNTEER',
  };
  
  const requiredRole = routePermissions[route];
  if (!requiredRole) return true;
  return hasPermission(userRole, requiredRole);
}

// Demo users are pre-created in the database
// This function just verifies they exist
export async function createDemoUsers() {
  const demoEmails = [
    'admin@resq-unified.lk',
    'coordinator@resq-unified.lk', 
    'casemanager@resq-unified.lk',
    'volunteer@resq-unified.lk'
  ];
  
  const results = [];
  
  for (const email of demoEmails) {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      
      if (error) {
        console.error(`Error checking profile for ${email}:`, error);
        results.push({ email, success: false, error: error.message });
      } else if (profile) {
        results.push({ email, success: true, message: 'Account ready' });
      } else {
        results.push({ email, success: false, error: 'Profile not found' });
      }
    } catch (err: any) {
      console.error(`Exception checking profile for ${email}:`, err);
      results.push({ email, success: false, error: err.message });
    }
  }
  
  return results;
}

// Sign in with demo credentials - handles profile linking
export async function signInDemo(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  
  if (data.user) {
    // Check if profile exists by email (might have been seeded)
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (existingProfile) {
      // Link profile to auth user if not already linked
      if (existingProfile.user_id !== data.user.id) {
        await supabase
          .from('user_profiles')
          .update({ 
            user_id: data.user.id,
            last_login_at: new Date().toISOString() 
          })
          .eq('email', email);
      } else {
        // Just update last login
        await supabase
          .from('user_profiles')
          .update({ last_login_at: new Date().toISOString() })
          .eq('user_id', data.user.id);
      }
    } else {
      // Create profile for this auth user
      const roleMap: Record<string, UserRole> = {
        'admin@resq-unified.lk': 'SUPER_ADMIN',
        'coordinator@resq-unified.lk': 'COORDINATOR',
        'casemanager@resq-unified.lk': 'CASE_MANAGER',
        'volunteer@resq-unified.lk': 'VOLUNTEER',
      };
      
      await supabase
        .from('user_profiles')
        .insert({
          user_id: data.user.id,
          email: email,
          full_name: data.user.user_metadata?.full_name || email.split('@')[0],
          role: roleMap[email] || 'USER',
          is_active: true
        });
    }
  }
  
  return data;
}
