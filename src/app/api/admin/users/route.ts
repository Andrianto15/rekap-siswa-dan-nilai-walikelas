import { NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

// GET: List all users and profiles
export async function GET() {
  try {
    const supabaseUser = await createClient();
    const {
      data: { user },
    } = await supabaseUser.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: currentProfile } = await supabaseUser
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .is('deleted_at', null)
      .single();

    if (currentProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const supabaseAdmin = await createAdminClient();
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    // Also get email from auth users list
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
    const userEmailMap = new Map((authData?.users || []).map((u) => [u.id, u.email]));

    const enrichedProfiles = (profiles || []).map((p) => ({
      ...p,
      email: userEmailMap.get(p.id) || '-',
    }));

    return NextResponse.json({ users: enrichedProfiles });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST: Create a new user with Auth & Profile
export async function POST(request: Request) {
  try {
    const supabaseUser = await createClient();
    const {
      data: { user },
    } = await supabaseUser.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: currentProfile } = await supabaseUser
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .is('deleted_at', null)
      .single();

    if (currentProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, full_name, role } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 });
    }

    const supabaseAdmin = await createAdminClient();

    // Create user in Supabase Auth
    const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role: role || 'guru',
      },
    });

    if (authError || !newAuthUser.user) {
      return NextResponse.json({ error: authError?.message || 'Failed to create user' }, { status: 400 });
    }

    // Upsert into public.profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: newAuthUser.user.id,
        full_name,
        role: role || 'guru',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({
      user: {
        ...profile,
        email: newAuthUser.user.email,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
