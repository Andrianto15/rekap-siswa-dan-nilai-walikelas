'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { BookOpen, Plus, Edit2, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/Table';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import type { Mapel } from '@/lib/types';

export default function MapelAdminPage() {
  const supabase = createClient();
  const { success: toastSuccess, error: toastError } = useToast();
  const confirm = useConfirm();

  const [mapelList, setMapelList] = useState<Mapel[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMapel, setEditingMapel] = useState<Mapel | null>(null);
  const [namaMapel, setNamaMapel] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMapel = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mapel')
        .select('*')
        .is('deleted_at', null)
        .order('nama', { ascending: true });

      if (error) throw error;
      setMapelList(data || []);
    } catch (err: unknown) {
      toastError('Gagal Mengambil Data', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [supabase, toastError]);

  useEffect(() => {
    fetchMapel();
  }, [fetchMapel]);

  const openModal = (mapel?: Mapel) => {
    if (mapel) {
      setEditingMapel(mapel);
      setNamaMapel(mapel.nama);
    } else {
      setEditingMapel(null);
      setNamaMapel('');
    }
    setIsModalOpen(true);
  };

  const handleSaveMapel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaMapel.trim()) return;
    setSubmitting(true);

    try {
      if (editingMapel) {
        const { error } = await supabase
          .from('mapel')
          .update({
            nama: namaMapel.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingMapel.id);
        if (error) throw error;
        toastSuccess('Berhasil', 'Mata pelajaran berhasil diperbarui');
      } else {
        const { error } = await supabase
          .from('mapel')
          .insert({ nama: namaMapel.trim() });
        if (error) throw error;
        toastSuccess('Berhasil', 'Mata pelajaran berhasil ditambahkan');
      }

      setIsModalOpen(false);
      fetchMapel();
    } catch (err: unknown) {
      toastError('Gagal Menyimpan', (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMapel = async (id: string, nama: string) => {
    const isConfirmed = await confirm({
      title: 'Hapus Mata Pelajaran',
      message: `Hapus mata pelajaran ${nama}? Seluruh data nilai terkait mapel ini akan terhapus.`,
      confirmText: 'Hapus Mapel',
      variant: 'danger',
    });
    if (!isConfirmed) return;

    try {
      const { error } = await supabase
        .from('mapel')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
      toastSuccess('Berhasil', `Mata pelajaran ${nama} berhasil dihapus`);
      fetchMapel();
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
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Mata Pelajaran</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftar mata pelajaran untuk kurikulum sekolah.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => openModal()}
        >
          Tambah Mata Pelajaran
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">No</TableHead>
            <TableHead>Nama Mata Pelajaran</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableEmpty colSpan={3} message="Memuat data mata pelajaran..." />
          ) : mapelList.length === 0 ? (
            <TableEmpty colSpan={3} message="Belum ada data mata pelajaran." />
          ) : (
            mapelList.map((m, index) => (
              <TableRow key={m.id}>
                <TableCell className="font-semibold text-slate-400">{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-900">{m.nama}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => openModal(m)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      title="Edit Nama Mapel"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMapel(m.id, m.nama)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="Hapus Mapel"
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
        title={editingMapel ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
      >
        <form onSubmit={handleSaveMapel} className="space-y-4">
          <Input
            label="Nama Mata Pelajaran"
            placeholder="Contoh: Matematika, Bahasa Indonesia"
            value={namaMapel}
            onChange={(e) => setNamaMapel(e.target.value)}
            required
            helperText="Masukkan nama lengkap mata pelajaran."
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
