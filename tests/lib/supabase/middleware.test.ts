/* eslint-disable @typescript-eslint/no-explicit-any */
import { updateSession } from '@/lib/supabase/middleware';
import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

jest.mock('@supabase/ssr');

describe('Supabase Middleware updateSession', () => {
  let mockSupabase: Record<string, any>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'guru' },
            }),
          }),
        }),
      }),
    };

    (createServerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  function createMockRequest(urlStr: string) {
    const url = new URL(urlStr, 'http://localhost:3000');
    return new NextRequest(url);
  }

  it('should redirect unauthenticated users accessing protected route to /login', async () => {
    const req = createMockRequest('http://localhost:3000/dashboard');
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const res = await updateSession(req);

    expect(res.status).toBe(307); // NextResponse.redirect default status
    expect(res.headers.get('location')).toBe('http://localhost:3000/login');
  });

  it('should allow unauthenticated users accessing /login', async () => {
    const req = createMockRequest('http://localhost:3000/login');
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const res = await updateSession(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('should allow public routes like root and static assets without auth', async () => {
    const reqPublic = createMockRequest('http://localhost:3000/logo.png');
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const res = await updateSession(reqPublic);
    expect(res.status).toBe(200);
  });

  it('should redirect authenticated users accessing /login to /dashboard', async () => {
    const req = createMockRequest('http://localhost:3000/login');
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'user@test.com' } },
    });

    const res = await updateSession(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/dashboard');
  });

  it('should redirect non-admin user trying to access /admin to /dashboard', async () => {
    const req = createMockRequest('http://localhost:3000/admin/users');
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'guru@test.com' } },
    });
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { role: 'guru' },
          }),
        }),
      }),
    });

    const res = await updateSession(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/dashboard');
  });

  it('should allow admin user to access /admin routes', async () => {
    const req = createMockRequest('http://localhost:3000/admin/users');
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'admin1', email: 'admin@test.com' } },
    });
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { role: 'admin' },
          }),
        }),
      }),
    });

    const res = await updateSession(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });
});
