'use client';

import { useAuth } from './useAuth';

export function useRole() {
  const { profile, loading } = useAuth();

  const role = profile?.role || null;
  const isAdmin = role === 'admin';
  const isGuru = role === 'guru';

  return {
    role,
    isAdmin,
    isGuru,
    loading,
  };
}
