import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const demoUsers = [
  { email: 'admin@resq-unified.lk', password: 'Admin@123!', fullName: 'System Administrator', role: 'SUPER_ADMIN' },
  { email: 'coordinator@resq-unified.lk', password: 'Coord@123!', fullName: 'Relief Coordinator', role: 'COORDINATOR' },
  { email: 'casemanager@resq-unified.lk', password: 'Case@123!', fullName: 'Case Manager', role: 'CASE_MANAGER' },
  { email: 'volunteer@resq-unified.lk', password: 'Vol@123!', fullName: 'Field Volunteer', role: 'VOLUNTEER' },
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    // Try both possible env variable names for service role key
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const results = [];

    for (const user of demoUsers) {
      try {
        // Check if user already exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === user.email);

        if (existingUser) {
          // User exists, update profile if needed
          const { data: existingProfile } = await supabaseAdmin
            .from('user_profiles')
            .select('*')
            .eq('email', user.email)
            .single();

          if (existingProfile && existingProfile.user_id !== existingUser.id) {
            await supabaseAdmin
              .from('user_profiles')
              .update({ user_id: existingUser.id })
              .eq('email', user.email);
          }

          results.push({ email: user.email, success: true, message: 'User already exists' });
          continue;
        }

        // Create user with admin API
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: { full_name: user.fullName }
        });

        if (createError) {
          results.push({ email: user.email, success: false, error: createError.message });
          continue;
        }

        // Check if profile exists by email
        const { data: existingProfile } = await supabaseAdmin
          .from('user_profiles')
          .select('*')
          .eq('email', user.email)
          .single();

        if (existingProfile) {
          // Update existing profile with new user_id
          await supabaseAdmin
            .from('user_profiles')
            .update({ user_id: newUser.user.id })
            .eq('email', user.email);
        } else {
          // Create new profile
          await supabaseAdmin
            .from('user_profiles')
            .insert({
              user_id: newUser.user.id,
              email: user.email,
              full_name: user.fullName,
              role: user.role,
              is_active: true
            });
        }

        results.push({ email: user.email, success: true });
      } catch (err: any) {
        results.push({ email: user.email, success: false, error: err.message });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
