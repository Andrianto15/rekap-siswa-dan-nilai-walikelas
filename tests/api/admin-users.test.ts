/* eslint-disable @typescript-eslint/no-explicit-any */
import { GET, POST } from '@/app/api/admin/users/route';
import { createAdminClient, createClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server');

describe('API /api/admin/users', () => {
  let mockUserClient: any;
  let mockAdminClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'admin-id', email: 'admin@school.test' } },
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'admin' },
            }),
          }),
        }),
      }),
    };

    mockAdminClient = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [
              { id: 'u1', full_name: 'Guru 1', role: 'guru', created_at: '2026-01-01' },
            ],
            error: null,
          }),
        }),
        upsert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'u2', full_name: 'Guru 2', role: 'guru' },
              error: null,
            }),
          }),
        }),
      }),
      auth: {
        admin: {
          listUsers: jest.fn().mockResolvedValue({
            data: {
              users: [{ id: 'u1', email: 'guru1@school.test' }],
            },
          }),
          createUser: jest.fn().mockResolvedValue({
            data: {
              user: { id: 'u2', email: 'guru2@school.test' },
            },
            error: null,
          }),
        },
      },
    };

    (createClient as jest.Mock).mockResolvedValue(mockUserClient);
    (createAdminClient as jest.Mock).mockResolvedValue(mockAdminClient);
  });

  describe('GET handler', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockUserClient.auth.getUser.mockResolvedValue({ data: { user: null } });

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toBe('Unauthorized');
    });

    it('should return 403 if user is not an admin', async () => {
      mockUserClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'guru' },
            }),
          }),
        }),
      });

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.error).toContain('Forbidden');
    });

    it('should return list of users enriched with email on success', async () => {
      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.users).toHaveLength(1);
      expect(json.users[0]).toEqual(
        expect.objectContaining({
          id: 'u1',
          full_name: 'Guru 1',
          email: 'guru1@school.test',
        })
      );
    });
  });

  describe('POST handler', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = new Request('http://localhost/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@mail.com' }),
      });

      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Email, password, and name are required');
    });

    it('should create user and return user object on success', async () => {
      const req = new Request('http://localhost/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          email: 'guru2@school.test',
          password: 'Password123!',
          full_name: 'Guru 2',
          role: 'guru',
        }),
      });

      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.user).toEqual({
        id: 'u2',
        full_name: 'Guru 2',
        role: 'guru',
        email: 'guru2@school.test',
      });
      expect(mockAdminClient.auth.admin.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'guru2@school.test',
          password: 'Password123!',
        })
      );
    });
  });
});
