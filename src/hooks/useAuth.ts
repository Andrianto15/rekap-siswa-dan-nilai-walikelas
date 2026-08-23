'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetchProfile = useCallback(async (currentUser: User) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      } else {
        setProfile({
          id: currentUser.id,
          full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Pengguna',
          role: currentUser.user_metadata?.role || 'guru',
        });
      }
    } catch {
      setProfile({
        id: currentUser.id,
        full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Pengguna',
        role: currentUser.user_metadata?.role || 'guru',
      });
    }
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const {
          data: { user: initialUser },
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        setUser(initialUser);
        if (initialUser) {
          await fetchProfile(initialUser);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return { user, profile, loading, signOut };
}
