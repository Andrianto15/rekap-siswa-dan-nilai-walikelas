'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { School, Plus, Edit2, Trash2, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/Table';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import type { Kelas } from '@/lib/types';

interface KelasWithCount extends Kelas {
  siswaCount?: number;
}

export default function KelasAdminPage() {
  const supabase = useMemo(() => createClient(), []);
  const { success: toastSuccess, error: toastError } = useToast();
  const confirm = useConfirm();

  const [kelasList, setKelasList] = useState<KelasWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
  const [namaKelas, setNamaKelas] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchKelas = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('kelas')
        .select(`
          *,
          siswa (count)
        `)
        .is('deleted_at', null)
        .order('nama', { ascending: true });

      if (error) throw error;

      interface SupabaseKelasQueryItem {
        id: string;
        nama: string;
        created_at?: string;
        siswa?: { count: number }[];
      }

      const formatted: KelasWithCount[] = ((data || []) as unknown as SupabaseKelasQueryItem[]).map((item) => ({
        id: item.id,
        nama: item.nama,
        created_at: item.created_at,
        siswaCount: item.siswa?.[0]?.count ?? 0,
      }));

      setKelasList(formatted);
    } catch (err: unknown) {
      toastError('Gagal Mengambil Data', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [supabase, toastError]);

  useEffect(() => {
    fetchKelas();
  }, [fetchKelas]);

  const openModal = (kelas?: Kelas) => {
    if (kelas) {
      setEditingKelas(kelas);
      setNamaKelas(kelas.nama);
    } else {
      setEditingKelas(null);
      setNamaKelas('');
    }
    setIsModalOpen(true);
  };

  const handleSaveKelas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKelas.trim()) return;
    setSubmitting(true);

    try {
      if (editingKelas) {
        const { error } = await supabase
          .from('kelas')
          .update({
            nama: namaKelas.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingKelas.id);
        if (error) throw error;
        toastSuccess('Berhasil', 'Data kelas berhasil diperbarui');
      } else {
        const { error } = await supabase
          .from('kelas')
          .insert({ nama: namaKelas.trim() });
        if (error) throw error;
        toastSuccess('Berhasil', 'Kelas baru berhasil ditambahkan');
      }

      setIsModalOpen(false);
      fetchKelas();
    } catch (err: unknown) {
      toastError('Gagal Menyimpan', (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteKelas = async (id: string, nama: string) => {
    const isConfirmed = await confirm({
      title: 'Hapus Kelas',
      message: `Hapus kelas ${nama}? Seluruh data siswa dan riwayat di kelas ini akan terhapus.`,
      confirmText: 'Hapus Kelas',
      variant: 'danger',
    });
    if (!isConfirmed) return;

    try {
      const { error } = await supabase
        .from('kelas')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
      toastSuccess('Berhasil', `Kelas ${nama} berhasil dihapus`);
      fetchKelas();
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
            <div className="p-2 bg-[#4682b4]/10 dark:bg-[#4682b4]/20 text-[#4682b4] dark:text-[#6ba3ce] rounded-xl">
              <School className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Kelola Kelas</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tambah, ubah nama, atau hapus data kelas (rombongan belajar).
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => openModal()}
        >
          Tambah Kelas
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">No</TableHead>
            <TableHead>Nama Kelas</TableHead>
            <TableHead>Jumlah Siswa</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableEmpty colSpan={4} message="Memuat data kelas..." />
          ) : kelasList.length === 0 ? (
            <TableEmpty colSpan={4} message="Belum ada data kelas yang terdaftar." />
          ) : (
            kelasList.map((k, index) => (
              <TableRow key={k.id}>
                <TableCell className="font-semibold text-slate-500 dark:text-slate-400">{index + 1}</TableCell>
                <TableCell>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">Kelas {k.nama}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <Users className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <span>{k.siswaCount ?? 0} siswa</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => openModal(k)}
                      className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Edit Nama Kelas"
                      aria-label={`Edit nama kelas ${k.nama}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteKelas(k.id, k.nama)}
                      className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      title="Hapus Kelas"
                      aria-label={`Hapus kelas ${k.nama}`}
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
        title={editingKelas ? 'Edit Nama Kelas' : 'Tambah Kelas Baru'}
      >
        <form onSubmit={handleSaveKelas} className="space-y-4">
          <Input
            label="Nama Kelas"
            placeholder="Contoh: 7A, 8B, 9C"
            value={namaKelas}
            onChange={(e) => setNamaKelas(e.target.value)}
            required
            helperText="Masukkan nama atau kode kelas rombel."
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
