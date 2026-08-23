import { renderHook } from '@testing-library/react';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@/hooks/useAuth');

describe('useRole hook', () => {
  const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

  it('should return admin status when user has admin role', () => {
    mockedUseAuth.mockReturnValue({
      user: { id: 'u1' } as unknown as import('@supabase/supabase-js').User,
      profile: { id: 'u1', full_name: 'Admin User', role: 'admin' },
      loading: false,
      signOut: jest.fn(),
    });

    const { result } = renderHook(() => useRole());

    expect(result.current.role).toBe('admin');
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isGuru).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('should return guru status when user has guru role', () => {
    mockedUseAuth.mockReturnValue({
      user: { id: 'u2' } as unknown as import('@supabase/supabase-js').User,
      profile: { id: 'u2', full_name: 'Guru User', role: 'guru' },
      loading: false,
      signOut: jest.fn(),
    });

    const { result } = renderHook(() => useRole());

    expect(result.current.role).toBe('guru');
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isGuru).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it('should return null role when profile is not loaded or missing', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      profile: null,
      loading: true,
      signOut: jest.fn(),
    });

    const { result } = renderHook(() => useRole());

    expect(result.current.role).toBeNull();
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isGuru).toBe(false);
    expect(result.current.loading).toBe(true);
  });
});
