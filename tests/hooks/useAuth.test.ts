/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

jest.mock('@/lib/supabase/client');

describe('useAuth hook', () => {
  let mockSupabase: Record<string, any>;
  let authStateCallback: ((event: string, session: unknown) => void) | null = null;
  const mockUnsubscribe = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    authStateCallback = null;

    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: {
            user: {
              id: 'user-1',
              email: 'teacher@school.test',
              user_metadata: { full_name: 'Teacher One', role: 'guru' },
            },
          },
        }),
        onAuthStateChange: jest.fn().mockImplementation((cb) => {
          authStateCallback = cb;
          return {
            data: {
              subscription: {
                unsubscribe: mockUnsubscribe,
              },
            },
          };
        }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 'user-1',
                  full_name: 'Teacher One Profile',
                  role: 'guru',
                },
                error: null,
              }),
            }),
          }),
        }),
      }),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('should initialize with user and profile data', async () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(
      expect.objectContaining({
        id: 'user-1',
        email: 'teacher@school.test',
      })
    );
    expect(result.current.profile).toEqual({
      id: 'user-1',
      full_name: 'Teacher One Profile',
      role: 'guru',
    });
  });

  it('should fallback to user metadata when profile query returns null', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          is: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('Profile not found'),
            }),
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile).toEqual({
      id: 'user-1',
      full_name: 'Teacher One',
      role: 'guru',
    });
  });

  it('should handle unauthenticated initial user state', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
  });

  it('should handle auth state change events', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Simulate SIGNED_IN event
    await act(async () => {
      if (authStateCallback) {
        await authStateCallback('SIGNED_IN', {
          user: {
            id: 'user-2',
            email: 'admin@school.test',
            user_metadata: { full_name: 'Admin User', role: 'admin' },
          },
        });
      }
    });

    expect(result.current.user?.id).toBe('user-2');

    // Simulate SIGNED_OUT event
    await act(async () => {
      if (authStateCallback) {
        await authStateCallback('SIGNED_OUT', null);
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
  });

  it('should unsubscribe on unmount', () => {
    const { unmount } = renderHook(() => useAuth());
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should call supabase signOut', async () => {
    // Suppress JSDOM navigation error in test output
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
