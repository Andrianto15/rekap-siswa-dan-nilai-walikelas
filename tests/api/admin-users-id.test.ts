/* eslint-disable @typescript-eslint/no-explicit-any */
import { PUT, DELETE } from '@/app/api/admin/users/[id]/route';
import { createAdminClient, createClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server');

describe('API /api/admin/users/[id]', () => {
  let mockUserClient: any;
  let mockAdminClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'admin-1', email: 'admin@school.test' } },
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { role: 'admin' },
              }),
            }),
          }),
        }),
      }),
    };

    mockAdminClient = {
      from: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { id: 'target-user-1', full_name: 'Updated Name', role: 'admin' },
                  error: null,
                }),
              }),
            }),
            error: null,
          }),
        }),
      }),
      auth: {
        admin: {
          updateUserById: jest.fn().mockResolvedValue({ data: {}, error: null }),
        },
      },
    };

    (createClient as jest.Mock).mockResolvedValue(mockUserClient);
    (createAdminClient as jest.Mock).mockResolvedValue(mockAdminClient);
  });

  describe('PUT handler', () => {
    it('should update user profile and auth credentials', async () => {
      const req = new Request('http://localhost/api/admin/users/target-user-1', {
        method: 'PUT',
        body: JSON.stringify({
          full_name: 'Updated Name',
          role: 'admin',
          password: 'NewPassword123!',
        }),
      });

      const params = Promise.resolve({ id: 'target-user-1' });
      const response = await PUT(req, { params });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.user).toEqual(
        expect.objectContaining({
          id: 'target-user-1',
          full_name: 'Updated Name',
          role: 'admin',
        })
      );
      expect(mockAdminClient.auth.admin.updateUserById).toHaveBeenCalledWith(
        'target-user-1',
        expect.objectContaining({
          password: 'NewPassword123!',
          user_metadata: { full_name: 'Updated Name', role: 'admin' },
        })
      );
    });
  });

  describe('DELETE handler', () => {
    it('should prevent admin from deleting own account', async () => {
      const req = new Request('http://localhost/api/admin/users/admin-1', {
        method: 'DELETE',
      });

      const params = Promise.resolve({ id: 'admin-1' });
      const response = await DELETE(req, { params });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Tidak dapat menghapus akun Anda sendiri');
    });

    it('should successfully soft-delete target user profile', async () => {
      const req = new Request('http://localhost/api/admin/users/target-user-1', {
        method: 'DELETE',
      });

      const params = Promise.resolve({ id: 'target-user-1' });
      const response = await DELETE(req, { params });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(mockAdminClient.from).toHaveBeenCalledWith('profiles');
      expect(mockAdminClient.from().update).toHaveBeenCalledWith(
        expect.objectContaining({
          deleted_at: expect.any(String),
        })
      );
    });
  });
});
