'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { CalendarDays, Plus, CheckCircle2, Trash2, Edit2, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import type { TahunAjaran, Semester } from '@/lib/types';

interface TahunAjaranWithSemesters extends TahunAjaran {
  semesters: Semester[];
}

export default function PeriodeAdminPage() {
  const supabase = createClient();
  const { success: toastSuccess, error: toastError } = useToast();
  const confirm = useConfirm();

  const [periodes, setPeriodes] = useState<TahunAjaranWithSemesters[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states for Tahun Ajaran
  const [isTahunModalOpen, setIsTahunModalOpen] = useState(false);
  const [editingTahun, setEditingTahun] = useState<TahunAjaran | null>(null);
  const [namaTahun, setNamaTahun] = useState('');
  const [isTahunActive, setIsTahunActive] = useState(false);
  const [submittingTahun, setSubmittingTahun] = useState(false);

  // Modal states for Semester
  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false);
  const [selectedTahunId, setSelectedTahunId] = useState<string>('');
  const [tipeSemester, setTipeSemester] = useState<'ganjil' | 'genap'>('ganjil');
  const [isSemesterActive, setIsSemesterActive] = useState(false);
  const [submittingSemester, setSubmittingSemester] = useState(false);

  const fetchPeriodes = useCallback(async () => {
    setLoading(true);
    try {
      const { data: tahunData, error: tahunError } = await supabase
        .from('tahun_ajaran')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (tahunError) throw tahunError;

      const { data: semData, error: semError } = await supabase
        .from('semester')
        .select('*')
        .is('deleted_at', null)
        .order('tipe', { ascending: true });

      if (semError) throw semError;

      const combined: TahunAjaranWithSemesters[] = (tahunData || []).map((t) => ({
        ...t,
        semesters: (semData || []).filter((s) => s.tahun_ajaran_id === t.id),
      }));

      setPeriodes(combined);
    } catch (err: unknown) {
      toastError('Gagal Mengambil Data', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [supabase, toastError]);

  useEffect(() => {
    fetchPeriodes();
  }, [fetchPeriodes]);

  // Open modal create/edit Tahun Ajaran
  const openTahunModal = (tahun?: TahunAjaran) => {
    if (tahun) {
      setEditingTahun(tahun);
      setNamaTahun(tahun.nama);
      setIsTahunActive(tahun.is_active);
    } else {
      setEditingTahun(null);
      setNamaTahun('');
      setIsTahunActive(false);
    }
    setIsTahunModalOpen(true);
  };

  // Submit create/edit Tahun Ajaran
  const handleSaveTahun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaTahun.trim()) return;
    setSubmittingTahun(true);

    try {
      if (isTahunActive) {
        // Deactivate other tahun ajaran
        await supabase.from('tahun_ajaran').update({ is_active: false }).neq('id', editingTahun?.id || '00000000-0000-0000-0000-000000000000');
      }

      if (editingTahun) {
        const { error } = await supabase
          .from('tahun_ajaran')
          .update({ nama: namaTahun, is_active: isTahunActive })
          .eq('id', editingTahun.id);
        if (error) throw error;
        toastSuccess('Berhasil', 'Tahun ajaran berhasil diperbarui');
      } else {
        const { error } = await supabase
          .from('tahun_ajaran')
          .insert({ nama: namaTahun, is_active: isTahunActive });
        if (error) throw error;
        toastSuccess('Berhasil', 'Tahun ajaran berhasil ditambahkan');
      }

      setIsTahunModalOpen(false);
      fetchPeriodes();
    } catch (err: unknown) {
      toastError('Gagal Menyimpan', (err as Error).message);
    } finally {
      setSubmittingTahun(false);
    }
  };

  // Set active Tahun Ajaran
  const handleSetActiveTahun = async (tahunId: string) => {
    try {
      await supabase.from('tahun_ajaran').update({ is_active: false }).neq('id', tahunId);
      const { error } = await supabase.from('tahun_ajaran').update({ is_active: true }).eq('id', tahunId);
      if (error) throw error;
      toastSuccess('Status Diperbarui', 'Tahun ajaran aktif diubah');
      fetchPeriodes();
    } catch (err: unknown) {
      toastError('Gagal Mengubah Status', (err as Error).message);
    }
  };

  // Delete Tahun Ajaran
  const handleDeleteTahun = async (tahunId: string) => {
    const isConfirmed = await confirm({
      title: 'Hapus Tahun Ajaran',
      message: 'Hapus tahun ajaran ini beserta semua semester di dalamnya? Data tidak dapat dipulihkan.',
      confirmText: 'Hapus Tahun Ajaran',
      variant: 'danger',
    });
    if (!isConfirmed) return;
    try {
      const { error } = await supabase
        .from('tahun_ajaran')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', tahunId);
      if (error) throw error;
      toastSuccess('Berhasil', 'Tahun ajaran berhasil dihapus');
      fetchPeriodes();
    } catch (err: unknown) {
      toastError('Gagal Menghapus', (err as Error).message);
    }
  };

  // Open modal add Semester
  const openSemesterModal = (tahunId: string) => {
    setSelectedTahunId(tahunId);
    setTipeSemester('ganjil');
    setIsSemesterActive(false);
    setIsSemesterModalOpen(true);
  };

  // Submit add Semester
  const handleSaveSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSemester(true);

    try {
      if (isSemesterActive) {
        // Deactivate all semesters
        await supabase.from('semester').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');
      }

      const { error } = await supabase.from('semester').insert({
        tahun_ajaran_id: selectedTahunId,
        tipe: tipeSemester,
        is_active: isSemesterActive,
      });

      if (error) throw error;

      toastSuccess('Berhasil', `Semester ${tipeSemester} berhasil ditambahkan`);
      setIsSemesterModalOpen(false);
      fetchPeriodes();
    } catch (err: unknown) {
      toastError('Gagal Menyimpan', (err as Error).message);
    } finally {
      setSubmittingSemester(false);
    }
  };

  // Set active Semester
  const handleSetActiveSemester = async (semesterId: string) => {
    try {
      await supabase.from('semester').update({ is_active: false }).neq('id', semesterId);
      const { error } = await supabase.from('semester').update({ is_active: true }).eq('id', semesterId);
      if (error) throw error;
      toastSuccess('Status Diperbarui', 'Semester aktif berhasil diubah');
      fetchPeriodes();
    } catch (err: unknown) {
      toastError('Gagal Mengubah Status', (err as Error).message);
    }
  };

  // Delete Semester
  const handleDeleteSemester = async (semesterId: string) => {
    const isConfirmed = await confirm({
      title: 'Hapus Semester',
      message: 'Hapus semester ini? Riwayat data terkait semester ini mungkin terpengaruh.',
      confirmText: 'Hapus Semester',
      variant: 'danger',
    });
    if (!isConfirmed) return;
    try {
      const { error } = await supabase
        .from('semester')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', semesterId);
      if (error) throw error;
      toastSuccess('Berhasil', 'Semester berhasil dihapus');
      fetchPeriodes();
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
              <CalendarDays className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Tahun Ajaran & Semester</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola periode kalender akademik dan tentukan semester yang sedang aktif.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => openTahunModal()}
        >
          Tambah Tahun Ajaran
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Memuat data periode...</div>
      ) : periodes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
          Belum ada tahun ajaran. Silakan klik tombol di atas untuk menambahkan.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {periodes.map((tahun) => (
            <div
              key={tahun.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
            >
              {/* Tahun Ajaran Card Header */}
              <div className="p-5 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-slate-900">{tahun.nama}</span>
                  {tahun.is_active ? (
                    <Badge variant="success" size="sm">
                      Aktif
                    </Badge>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetActiveTahun(tahun.id)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium underline"
                    >
                      Set Sebagai Tahun Aktif
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => openSemesterModal(tahun.id)}
                  >
                    Tambah Semester
                  </Button>
                  <button
                    type="button"
                    onClick={() => openTahunModal(tahun)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition"
                    title="Edit Tahun"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTahun(tahun.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    title="Hapus Tahun"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Semesters List */}
              <div className="p-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Daftar Semester
                </h2>
                {tahun.semesters.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    Belum ada semester untuk tahun ajaran ini.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tahun.semesters.map((sem) => (
                      <div
                        key={sem.id}
                        className={`p-4 rounded-xl border flex items-center justify-between transition ${
                          sem.is_active
                            ? 'bg-blue-50/50 border-blue-200 ring-1 ring-blue-500/20'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                              sem.is_active
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {sem.tipe === 'ganjil' ? '1' : '2'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 capitalize">
                              Semester {sem.tipe}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {sem.is_active ? 'Sedang Aktif' : 'Tidak Aktif'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {sem.is_active ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-100/70 px-2.5 py-1 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Aktif
                            </span>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={<Check className="w-3 h-3" />}
                              onClick={() => handleSetActiveSemester(sem.id)}
                            >
                              Aktifkan
                            </Button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteSemester(sem.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                            title="Hapus Semester"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Tahun Ajaran */}
      <Modal
        isOpen={isTahunModalOpen}
        onClose={() => setIsTahunModalOpen(false)}
        title={editingTahun ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran Baru'}
      >
        <form onSubmit={handleSaveTahun} className="space-y-4">
          <Input
            label="Nama Tahun Ajaran"
            placeholder="Contoh: 2026/2027"
            value={namaTahun}
            onChange={(e) => setNamaTahun(e.target.value)}
            required
            helperText="Gunakan format tahun/tahun (contoh: 2026/2027)"
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isTahunActive"
              checked={isTahunActive}
              onChange={(e) => setIsTahunActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="isTahunActive" className="text-xs text-slate-700 font-medium cursor-pointer">
              Jadikan sebagai Tahun Ajaran Aktif
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsTahunModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={submittingTahun}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Semester */}
      <Modal
        isOpen={isSemesterModalOpen}
        onClose={() => setIsSemesterModalOpen(false)}
        title="Tambah Semester"
      >
        <form onSubmit={handleSaveSemester} className="space-y-4">
          <Select
            label="Tipe Semester"
            value={tipeSemester}
            onChange={(e) => setTipeSemester(e.target.value as 'ganjil' | 'genap')}
            options={[
              { value: 'ganjil', label: 'Semester Ganjil (1)' },
              { value: 'genap', label: 'Semester Genap (2)' },
            ]}
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isSemesterActive"
              checked={isSemesterActive}
              onChange={(e) => setIsSemesterActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="isSemesterActive" className="text-xs text-slate-700 font-medium cursor-pointer">
              Jadikan sebagai Semester Aktif saat ini
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSemesterModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={submittingSemester}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
