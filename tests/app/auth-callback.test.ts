import { GET } from '@/app/auth/callback/route';
import { createClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server');

describe('Auth Callback Route Handler (SEC-05)', () => {
  let mockSupabase: {
    auth: {
      exchangeCodeForSession: jest.Mock;
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = {
      auth: {
        exchangeCodeForSession: jest.fn().mockResolvedValue({ error: null }),
      },
    };
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it('should exchange code and redirect to sanitized next path', async () => {
    const request = new Request('http://localhost:3000/auth/callback?code=valid-code&next=/siswa');
    const response = await GET(request);

    expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('valid-code');
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/siswa');
  });

  it('should neutralize open redirect attempts to external protocols or domains', async () => {
    const maliciousPaths = [
      '//evil.com',
      '/\\evil.com',
      'https://evil.com/phishing',
      'javascript:alert(1)',
    ];

    for (const badPath of maliciousPaths) {
      const request = new Request(
        `http://localhost:3000/auth/callback?code=valid-code&next=${encodeURIComponent(badPath)}`
      );
      const response = await GET(request);

      expect(response.status).toBe(307);
      // Malicious next must fallback to default safe /dashboard
      expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard');
    }
  });

  it('should redirect to login on code exchange error', async () => {
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
      error: new Error('Invalid code'),
    });

    const request = new Request('http://localhost:3000/auth/callback?code=bad-code');
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/login?error=auth_exchange_failed');
  });
});
