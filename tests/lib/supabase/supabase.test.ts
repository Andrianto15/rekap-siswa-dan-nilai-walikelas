import { createClient as createBrowserClientWrapper } from '@/lib/supabase/client';
import { createClient as createServerClientWrapper, createAdminClient } from '@/lib/supabase/server';
import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

jest.mock('@supabase/ssr');
jest.mock('next/headers');

describe('Supabase Client Factories', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Browser createClient', () => {
    it('should initialize browser client with env credentials or fallbacks', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://custom.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'custom-anon-key';

      createBrowserClientWrapper();

      expect(createBrowserClient).toHaveBeenCalledWith(
        'https://custom.supabase.co',
        'custom-anon-key'
      );
    });

    it('should use fallback values if env is not defined', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      createBrowserClientWrapper();

      expect(createBrowserClient).toHaveBeenCalledWith(
        'https://placeholder.supabase.co',
        'placeholder'
      );
    });
  });

  describe('Server createClient & createAdminClient', () => {
    const mockCookieStore = {
      getAll: jest.fn().mockReturnValue([{ name: 'sb-token', value: 'token123' }]),
      set: jest.fn(),
    };

    beforeEach(() => {
      (cookies as jest.Mock).mockResolvedValue(mockCookieStore);
    });

    it('should create server client and setup cookie handlers', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://server.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'server-anon-key';

      await createServerClientWrapper();

      expect(createServerClient).toHaveBeenCalledWith(
        'https://server.supabase.co',
        'server-anon-key',
        expect.objectContaining({
          cookies: expect.objectContaining({
            getAll: expect.any(Function),
            setAll: expect.any(Function),
          }),
        })
      );

      // Verify cookie getAll handler
      const cookieConfig = (createServerClient as jest.Mock).mock.calls[0][2].cookies;
      const cookiesResult = cookieConfig.getAll();
      expect(cookiesResult).toEqual([{ name: 'sb-token', value: 'token123' }]);

      // Verify cookie setAll handler
      cookieConfig.setAll([{ name: 'new-cookie', value: 'val', options: {} }]);
      expect(mockCookieStore.set).toHaveBeenCalledWith('new-cookie', 'val', {});
    });

    it('should create server admin client with service role key', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://server.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-secret-key';

      await createAdminClient();

      expect(createServerClient).toHaveBeenCalledWith(
        'https://server.supabase.co',
        'service-role-secret-key',
        expect.any(Object)
      );
    });
  });
});
