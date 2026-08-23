'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { UserCheck, Plus, Edit2, Trash2, Shield, User, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/Table';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import type { Profile, Role } from '@/lib/types';

interface UserItem extends Profile {
  email?: string;
}

export default function UsersAdminPage() {
  const { success: toastSuccess, error: toastError } = useToast();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('guru');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memuat pengguna');
      setUsers(data.users || []);
    } catch (err: unknown) {
      toastError('Gagal Mengambil Data', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openModal = (user?: UserItem) => {
    if (user) {
      setEditingUser(user);
      setFullName(user.full_name);
      setEmail(user.email || '');
      setPassword('');
      setRole(user.role);
    } else {
      setEditingUser(null);
      setFullName('');
      setEmail('');
      setPassword('');
      setRole('guru');
    }
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingUser) {
        const res = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: fullName,
            role,
            password: password || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal memperbarui pengguna');
        toastSuccess('Berhasil', 'Pengguna berhasil diperbarui');
      } else {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: fullName,
            email,
            password,
            role,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menambahkan pengguna');
        toastSuccess('Berhasil', 'Pengguna baru berhasil didaftarkan');
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      toastError('Gagal Menyimpan', (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Hapus akun pengguna "${name}"? Tindakan ini tidak dapat dibatalkan.`)) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus pengguna');
      toastSuccess('Berhasil', 'Pengguna berhasil dihapus');
      fetchUsers();
    } catch (err: unknown) {
      toastError('Gagal Menghapus', (err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Manajemen Pengguna</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola akun guru dan administrator sistem.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => openModal()}
        >
          Tambah Pengguna
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">No</TableHead>
            <TableHead>Nama Lengkap</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Peran (Role)</TableHead>
            <TableHead>Terdaftar Sejak</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableEmpty colSpan={6} message="Memuat data pengguna..." />
          ) : users.length === 0 ? (
            <TableEmpty colSpan={6} message="Belum ada pengguna terdaftar." />
          ) : (
            users.map((u, index) => (
              <TableRow key={u.id}>
                <TableCell className="font-semibold text-slate-400">{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                      {u.full_name ? u.full_name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <span className="font-semibold text-slate-900">{u.full_name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600 font-mono text-xs">{u.email || '-'}</TableCell>
                <TableCell>
                  <Badge variant={u.role === 'admin' ? 'info' : 'default'} size="sm">
                    {u.role === 'admin' ? (
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-blue-600" />
                        Admin
                      </span>
                    ) : (
                      'Guru'
                    )}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                  {u.created_at ? formatDate(u.created_at) : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => openModal(u)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      title="Edit Pengguna"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(u.id, u.full_name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="Hapus Pengguna"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <Input
            label="Nama Lengkap"
            placeholder="Contoh: Budi Santoso, S.Pd."
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            leftIcon={<User className="w-4 h-4" />}
          />

          {!editingUser && (
            <Input
              label="Email Akun"
              type="email"
              placeholder="nama@sekolah.sch.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />
          )}

          <Input
            label={editingUser ? 'Kata Sandi Baru (Kosongkan jika tidak diubah)' : 'Kata Sandi'}
            type="password"
            placeholder="Minimal 6 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!editingUser}
            minLength={6}
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Select
            label="Peran (Role)"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            options={[
              { value: 'guru', label: 'Guru / Wali Kelas' },
              { value: 'admin', label: 'Administrator' },
            ]}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
