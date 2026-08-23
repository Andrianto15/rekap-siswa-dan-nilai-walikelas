'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { GitFork, Plus, Trash2, School, BookOpen, User, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/Table';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import type { Profile, Kelas, Mapel, Semester, GuruKelas, GuruMapel } from '@/lib/types';

export default function MappingAdminPage() {
  const supabase = createClient();
  const { success: toastSuccess, error: toastError } = useToast();
  const confirm = useConfirm();

  const [activeTab, setActiveTab] = useState<'wali' | 'mapel'>('wali');
  const [activeSemester, setActiveSemester] = useState<Semester | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');

  const [gurus, setGurus] = useState<Profile[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [mapelList, setMapelList] = useState<Mapel[]>([]);

  const [waliMappings, setWaliMappings] = useState<GuruKelas[]>([]);
  const [mapelMappings, setMapelMappings] = useState<GuruMapel[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Wali Kelas
  const [isWaliModalOpen, setIsWaliModalOpen] = useState(false);
  const [selectedGuruIdWali, setSelectedGuruIdWali] = useState('');
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [submittingWali, setSubmittingWali] = useState(false);

  // Modal Guru Mapel
  const [isMapelModalOpen, setIsMapelModalOpen] = useState(false);
  const [selectedGuruIdMapel, setSelectedGuruIdMapel] = useState('');
  const [selectedMapelId, setSelectedMapelId] = useState('');
  const [submittingMapel, setSubmittingMapel] = useState(false);

  // Fetch base metadata: Semesters, Gurus, Kelas, Mapel
  const fetchMetadata = useCallback(async () => {
    try {
      // Semesters with tahun ajaran
      const { data: semData } = await supabase
        .from('semester')
        .select(`
          *,
          tahun_ajaran (*)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (semData && semData.length > 0) {
        setSemesters(semData as unknown as Semester[]);
        const active = semData.find((s) => s.is_active) || semData[0];
        setActiveSemester(active as unknown as Semester);
        setSelectedSemesterId(active.id);
      }

      // Gurus (role = 'guru' or 'admin')
      const { data: guruData } = await supabase
        .from('profiles')
        .select('*')
        .is('deleted_at', null)
        .order('full_name', { ascending: true });
      if (guruData) setGurus(guruData);

      // Kelas
      const { data: kData } = await supabase
        .from('kelas')
        .select('*')
        .is('deleted_at', null)
        .order('nama', { ascending: true });
      if (kData) setKelasList(kData);

      // Mapel
      const { data: mData } = await supabase
        .from('mapel')
        .select('*')
        .is('deleted_at', null)
        .order('nama', { ascending: true });
      if (mData) setMapelList(mData);
    } catch (err: unknown) {
      toastError('Gagal Mengambil Metadata', (err as Error).message);
    }
  }, [supabase, toastError]);

  // Fetch mappings for the selected semester
  const fetchMappings = useCallback(async (semId: string) => {
    if (!semId) return;
    setLoading(true);
    try {
      // Fetch Wali Kelas
      const { data: waliData, error: waliError } = await supabase
        .from('guru_kelas')
        .select(`
          *,
          guru:profiles (*),
          kelas:kelas (*)
        `)
        .eq('semester_id', semId)
        .is('deleted_at', null);

      if (waliError) throw waliError;
      setWaliMappings((waliData || []) as unknown as GuruKelas[]);

      // Fetch Guru Mapel
      const { data: mapelData, error: mapelError } = await supabase
        .from('guru_mapel')
        .select(`
          *,
          guru:profiles (*),
          mapel:mapel (*)
        `)
        .eq('semester_id', semId)
        .is('deleted_at', null);

      if (mapelError) throw mapelError;
      setMapelMappings((mapelData || []) as unknown as GuruMapel[]);
    } catch (err: unknown) {
      toastError('Gagal Mengambil Data Mapping', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [supabase, toastError]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  useEffect(() => {
    if (selectedSemesterId) {
      fetchMappings(selectedSemesterId);
    }
  }, [selectedSemesterId, fetchMappings]);

  // Save Wali Kelas Mapping
  const handleSaveWali = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuruIdWali || !selectedKelasId || !selectedSemesterId) return;
    setSubmittingWali(true);

    try {
      const { error } = await supabase.from('guru_kelas').upsert(
        {
          guru_id: selectedGuruIdWali,
          kelas_id: selectedKelasId,
          semester_id: selectedSemesterId,
          deleted_at: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'guru_id,semester_id' }
      );

      if (error) throw error;
      toastSuccess('Berhasil', 'Penetapan Wali Kelas berhasil disimpan');
      setIsWaliModalOpen(false);
      fetchMappings(selectedSemesterId);
    } catch (err: unknown) {
      toastError('Gagal Menyimpan', (err as Error).message);
    } finally {
      setSubmittingWali(false);
    }
  };

  // Delete Wali Kelas Mapping
  const handleDeleteWali = async (id: string) => {
    const isConfirmed = await confirm({
      title: 'Hapus Penugasan Wali Kelas',
      message: 'Hapus penugasan wali kelas ini? Guru tidak akan lagi memiliki akses sebagai wali kelas untuk kelas tersebut.',
      confirmText: 'Hapus Penugasan',
      variant: 'danger',
    });
    if (!isConfirmed) return;
    try {
      const { error } = await supabase
        .from('guru_kelas')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
      toastSuccess('Berhasil', 'Penugasan wali kelas dihapus');
      fetchMappings(selectedSemesterId);
    } catch (err: unknown) {
      toastError('Gagal Menghapus', (err as Error).message);
    }
  };

  // Save Guru Mapel Mapping
  const handleSaveMapel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuruIdMapel || !selectedMapelId || !selectedSemesterId) return;
    setSubmittingMapel(true);

    try {
      const { error } = await supabase.from('guru_mapel').upsert(
        {
          guru_id: selectedGuruIdMapel,
          mapel_id: selectedMapelId,
          semester_id: selectedSemesterId,
          deleted_at: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'guru_id,mapel_id,semester_id' }
      );

      if (error) throw error;
      toastSuccess('Berhasil', 'Penugasan Guru Mata Pelajaran berhasil disimpan');
      setIsMapelModalOpen(false);
      fetchMappings(selectedSemesterId);
    } catch (err: unknown) {
      toastError('Gagal Menyimpan', (err as Error).message);
    } finally {
      setSubmittingMapel(false);
    }
  };

  // Delete Guru Mapel Mapping
  const handleDeleteMapel = async (id: string) => {
    const isConfirmed = await confirm({
      title: 'Hapus Penugasan Guru Mapel',
      message: 'Hapus penugasan mata pelajaran ini? Guru tidak akan lagi memiliki akses input nilai untuk mapel tersebut.',
      confirmText: 'Hapus Penugasan',
      variant: 'danger',
    });
    if (!isConfirmed) return;
    try {
      const { error } = await supabase
        .from('guru_mapel')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
      toastSuccess('Berhasil', 'Penugasan guru mapel dihapus');
      fetchMappings(selectedSemesterId);
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
              <GitFork className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Mapping Guru</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Petakan guru sebagai wali kelas atau pengampu mata pelajaran pada tiap semester.
          </p>
        </div>

        {/* Semester Filter */}
        <div className="w-full sm:w-64">
          <Select
            value={selectedSemesterId}
            onChange={(e) => setSelectedSemesterId(e.target.value)}
            options={semesters.map((s) => ({
              value: s.id,
              label: `${s.tahun_ajaran?.nama || ''} - Semester ${s.tipe.toUpperCase()} ${s.is_active ? '(Aktif)' : ''}`,
            }))}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('wali')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'wali'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <School className="w-4 h-4" />
          <span>Wali Kelas ({waliMappings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mapel')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'mapel'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Guru Mata Pelajaran ({mapelMappings.length})</span>
        </button>
      </div>

      {/* Tab 1: Wali Kelas */}
      {activeTab === 'wali' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">
              Satu guru menjadi wali kelas untuk satu rombel kelas per semester.
            </p>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setSelectedGuruIdWali('');
                setSelectedKelasId('');
                setIsWaliModalOpen(true);
              }}
            >
              Tugaskan Wali Kelas
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">No</TableHead>
                <TableHead>Nama Guru</TableHead>
                <TableHead>Kelas Binaan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableEmpty colSpan={4} message="Memuat penugasan wali kelas..." />
              ) : waliMappings.length === 0 ? (
                <TableEmpty colSpan={4} message="Belum ada guru yang ditugaskan sebagai wali kelas di semester ini." />
              ) : (
                waliMappings.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold text-slate-400">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-slate-900">{item.guru?.full_name || 'Guru'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                        Kelas {item.kelas?.nama}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteWali(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Hapus Penugasan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Tab 2: Guru Mapel */}
      {activeTab === 'mapel' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">
              Guru dapat mengampu satu atau lebih mata pelajaran pada semester ini.
            </p>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setSelectedGuruIdMapel('');
                setSelectedMapelId('');
                setIsMapelModalOpen(true);
              }}
            >
              Tugaskan Guru Mapel
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">No</TableHead>
                <TableHead>Nama Guru</TableHead>
                <TableHead>Mata Pelajaran yang Diampu</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableEmpty colSpan={4} message="Memuat penugasan guru mata pelajaran..." />
              ) : mapelMappings.length === 0 ? (
                <TableEmpty colSpan={4} message="Belum ada penugasan guru mata pelajaran di semester ini." />
              ) : (
                mapelMappings.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold text-slate-400">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-slate-900">{item.guru?.full_name || 'Guru'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200">
                        {item.mapel?.nama}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteMapel(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Hapus Penugasan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal: Assign Wali Kelas */}
      <Modal
        isOpen={isWaliModalOpen}
        onClose={() => setIsWaliModalOpen(false)}
        title="Tugaskan Wali Kelas"
        description="Pilih guru dan rombongan kelas binaan."
      >
        <form onSubmit={handleSaveWali} className="space-y-4">
          <Select
            label="Pilih Guru"
            value={selectedGuruIdWali}
            onChange={(e) => setSelectedGuruIdWali(e.target.value)}
            placeholder="-- Pilih Guru --"
            required
            options={gurus.map((g) => ({
              value: g.id,
              label: `${g.full_name} (${g.role})`,
            }))}
          />

          <Select
            label="Pilih Kelas"
            value={selectedKelasId}
            onChange={(e) => setSelectedKelasId(e.target.value)}
            placeholder="-- Pilih Kelas --"
            required
            options={kelasList.map((k) => ({
              value: k.id,
              label: k.nama,
            }))}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsWaliModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={submittingWali}>
              Tugaskan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Assign Guru Mapel */}
      <Modal
        isOpen={isMapelModalOpen}
        onClose={() => setIsMapelModalOpen(false)}
        title="Tugaskan Guru Mata Pelajaran"
        description="Pilih guru dan mata pelajaran yang diampu."
      >
        <form onSubmit={handleSaveMapel} className="space-y-4">
          <Select
            label="Pilih Guru"
            value={selectedGuruIdMapel}
            onChange={(e) => setSelectedGuruIdMapel(e.target.value)}
            placeholder="-- Pilih Guru --"
            required
            options={gurus.map((g) => ({
              value: g.id,
              label: `${g.full_name} (${g.role})`,
            }))}
          />

          <Select
            label="Pilih Mata Pelajaran"
            value={selectedMapelId}
            onChange={(e) => setSelectedMapelId(e.target.value)}
            placeholder="-- Pilih Mata Pelajaran --"
            required
            options={mapelList.map((m) => ({
              value: m.id,
              label: m.nama,
            }))}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsMapelModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={submittingMapel}>
              Tugaskan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
