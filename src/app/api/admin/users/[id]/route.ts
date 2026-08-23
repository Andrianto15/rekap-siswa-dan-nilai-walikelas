import { NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

// PATCH/PUT: Update user profile and auth metadata
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { full_name, role, password } = body;

    const supabaseAdmin = await createAdminClient();

    // Update profile
    const updateData: { full_name?: string; role?: 'admin' | 'guru'; updated_at: string } = {
      updated_at: new Date().toISOString(),
    };
    if (full_name) updateData.full_name = full_name;
    if (role) updateData.role = role;

    const { data: updatedProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    // Update auth user if metadata or password changed
    const authUpdatePayload: { user_metadata?: Record<string, unknown>; password?: string } = {};
    if (full_name || role) {
      authUpdatePayload.user_metadata = {
        ...(full_name ? { full_name } : {}),
        ...(role ? { role } : {}),
      };
    }
    if (password && password.trim() !== '') {
      authUpdatePayload.password = password;
    }

    if (Object.keys(authUpdatePayload).length > 0) {
      await supabaseAdmin.auth.admin.updateUserById(id, authUpdatePayload);
    }

    return NextResponse.json({ user: updatedProfile });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE: Soft delete user profile
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabaseUser = await createClient();
    const {
      data: { user },
    } = await supabaseUser.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Prevent admin from deleting themselves
    if (user.id === id) {
      return NextResponse.json({ error: 'Tidak dapat menghapus akun Anda sendiri' }, { status: 400 });
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

    // Soft delete profile
    const { error: deleteError } = await supabaseAdmin
      .from('profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'User berhasil dihapus' });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
