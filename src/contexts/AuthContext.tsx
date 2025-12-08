import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile, getUserProfile, UserRole } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      // Get the current session to access user email
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserEmail = session?.user?.email;
      
      // First try to get profile by user_id
      let userProfile = await getUserProfile(userId);
      
      // If no profile found, try to get by email and link it
      if (!userProfile && currentUserEmail) {
        const { data: profileByEmail } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('email', currentUserEmail)
          .single();
        
        if (profileByEmail) {
          // Link the profile to this auth user
          const { data: updatedProfile } = await supabase
            .from('user_profiles')
            .update({ user_id: userId })
            .eq('email', currentUserEmail)
            .select()
            .single();
          
          userProfile = updatedProfile;
        } else {
          // Create a new profile for this user
          const demoRoles: Record<string, UserRole> = {
            'admin@resq-unified.lk': 'SUPER_ADMIN',
            'coordinator@resq-unified.lk': 'COORDINATOR',
            'casemanager@resq-unified.lk': 'CASE_MANAGER',
            'volunteer@resq-unified.lk': 'VOLUNTEER',
          };
          
          const { data: newProfile } = await supabase
            .from('user_profiles')
            .insert({
              user_id: userId,
              email: currentUserEmail,
              full_name: session?.user?.user_metadata?.full_name || currentUserEmail.split('@')[0],
              role: demoRoles[currentUserEmail] || 'USER',
              is_active: true
            })
            .select()
            .single();
          
          userProfile = newProfile;
        }
      }
      
      setProfile(userProfile);
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  const hasRole = (requiredRole: UserRole): boolean => {
    if (!profile) return false;
    const roleHierarchy: Record<UserRole, number> = {
      'USER': 1,
      'VOLUNTEER': 2,
      'CASE_MANAGER': 3,
      'COORDINATOR': 4,
      'ADMIN': 5,
      'SUPER_ADMIN': 6
    };
    return roleHierarchy[profile.role] >= roleHierarchy[requiredRole];
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isLoading,
      isAuthenticated: !!user,
      hasRole,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
