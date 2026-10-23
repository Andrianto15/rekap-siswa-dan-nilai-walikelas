'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  CalendarCheck2,
  Calendar,
  Download,
  Plus,
  Eye,
  FileSpreadsheet,
  AlertTriangle,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  BookOpen,
  Layers,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/Table';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { exportToExcel } from '@/lib/excel';
import { formatDate } from '@/lib/utils';
import type { Siswa, Kelas, Mapel, Semester, Kehadiran, GuruKelas, GuruMapel, RekapKehadiranSiswa } from '@/lib/types';

export default function RekapKehadiranPage() {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();
  const { isAdmin } = useRole();
  const { success: toastSuccess, error: toastError } = useToast();

  const [activeSemester, setActiveSemester] = useState<Semester | null>(null);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelasId, setSelectedKelasId] = useState<string>('');

  // Sub-Menu: 'mapel' (Kehadiran Wali Kelas per Mapel) | 'keseluruhan' (Kehadiran Keseluruhan tanpa Mapel)
  const [subMode, setSubMode] = useState<'mapel' | 'keseluruhan'>('mapel');

  // Mapel States
  const [mapelList, setMapelList] = useState<Mapel[]>([]);
  const [selectedMapelId, setSelectedMapelId] = useState<string>('');
  const [assignedMapel, setAssignedMapel] = useState<Mapel | null>(null);

  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter View Mode: 'bulan' (monthly) or 'semester' (full semester)
  const [viewMode, setViewMode] = useState<'bulan' | 'semester'>('bulan');

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1); // 1-12

  // Raw attendance records
  const [attendanceRecords, setAttendanceRecords] = useState<Kehadiran[]>([]);

  // Student Detail Modal (T-035)
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSiswaForDetail, setSelectedSiswaForDetail] = useState<Siswa | null>(null);
  const [studentDetailAbsences, setStudentDetailAbsences] = useState<Kehadiran[]>([]);

  // 1. Initial metadata
  const initData = useCallback(async () => {
    try {
      const { data: semData } = await supabase
        .from('semester')
        .select(`*, tahun_ajaran (*)`)
        .eq('is_active', true)
        .is('deleted_at', null)
        .single();

      if (semData) {
        setActiveSemester(semData as unknown as Semester);

        // Fetch Kelas
        const { data: kData } = await supabase
          .from('kelas')
          .select('*')
          .is('deleted_at', null)
          .order('nama', { ascending: true });
        if (kData) setKelasList(kData);

        // Fetch Mapel
        const { data: mData } = await supabase
          .from('mapel')
          .select('*')
          .is('deleted_at', null)
          .order('nama', { ascending: true });
        if (mData) setMapelList(mData);

        if (user && !isAdmin) {
          // Wali kelas class mapping
          const { data: guruKelasData } = await supabase
            .from('guru_kelas')
            .select('*')
            .eq('guru_id', user.id)
            .eq('semester_id', semData.id)
            .is('deleted_at', null)
            .single();

          if (guruKelasData) {
            setSelectedKelasId((guruKelasData as GuruKelas).kelas_id);
          } else if (kData && kData.length > 0) {
            setSelectedKelasId(kData[0].id);
          }

          // Teacher mapel mapping
          const { data: guruMapelData } = await supabase
            .from('guru_mapel')
            .select(`*, mapel (*)`)
            .eq('guru_id', user.id)
            .eq('semester_id', semData.id)
            .is('deleted_at', null)
            .limit(1)
            .single();

          if (guruMapelData && (guruMapelData as unknown as GuruMapel).mapel) {
            const mappedMapel = (guruMapelData as unknown as GuruMapel).mapel as Mapel;
            setAssignedMapel(mappedMapel);
            setSelectedMapelId(mappedMapel.id);
          } else if (mData && mData.length > 0) {
            setSelectedMapelId(mData[0].id);
          }
        } else {
          if (kData && kData.length > 0) setSelectedKelasId(kData[0].id);
          if (mData && mData.length > 0) setSelectedMapelId(mData[0].id);
        }
      }
    } catch (err: unknown) {
      toastError('Gagal Mengambil Data Awal', (err as Error).message);
    }
  }, [supabase, user, isAdmin, toastError]);

  // 2. Fetch students & attendance records
  const fetchData = useCallback(async () => {
    if (!selectedKelasId || !activeSemester) return;
    if (subMode === 'mapel' && !selectedMapelId) return;

    setLoading(true);

    try {
      // Get students
      const { data: sData, error: sError } = await supabase
        .from('siswa')
        .select('*')
        .eq('kelas_id', selectedKelasId)
        .eq('semester_id', activeSemester.id)
        .is('deleted_at', null)
        .order('nama', { ascending: true });

      if (sError) throw sError;
      setSiswaList(sData || []);

      if (sData && sData.length > 0) {
        const sIds = sData.map((s) => s.id);

        let query = supabase
          .from('kehadiran')
          .select('*, siswa:siswa(*)')
          .eq('semester_id', activeSemester.id)
          .in('siswa_id', sIds)
          .is('deleted_at', null);

        // Filter by mapel or general
        if (subMode === 'mapel') {
          query = query.eq('mapel_id', selectedMapelId);
        } else {
          query = query.is('mapel_id', null);
        }

        // If monthly filter applied
        if (viewMode === 'bulan') {
          const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
          const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
          const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
          query = query.gte('tanggal', startDate).lte('tanggal', endDate);
        }

        const { data: attData, error: attError } = await query;
        if (attError) throw attError;
        setAttendanceRecords((attData || []) as unknown as Kehadiran[]);
      } else {
        setAttendanceRecords([]);
      }
    } catch (err: unknown) {
      toastError('Gagal Memuat Data Kehadiran', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [supabase, selectedKelasId, activeSemester, subMode, selectedMapelId, viewMode, selectedYear, selectedMonth, toastError]);

  useEffect(() => {
    initData();
  }, [initData]);

  useEffect(() => {
    if (selectedKelasId && activeSemester) {
      fetchData();
    }
  }, [selectedKelasId, activeSemester, subMode, selectedMapelId, fetchData]);

  // Compute aggregated stats per student
  const rekapData: RekapKehadiranSiswa[] = useMemo(() => {
    return siswaList.map((siswa) => {
      const records = attendanceRecords.filter((r) => r.siswa_id === siswa.id);
      const sakit = records.filter((r) => r.status === 'S').length;
      const izin = records.filter((r) => r.status === 'I').length;
      const alpa = records.filter((r) => r.status === 'A').length;
      const dispen = records.filter((r) => r.status === 'D').length;
      const totalAbsen = sakit + izin + alpa + dispen;

      return {
        siswa,
        sakit,
        izin,
        alpa,
        dispen,
        totalAbsen,
      };
    });
  }, [siswaList, attendanceRecords]);

  // Overall totals
  const totalSakit = useMemo(() => rekapData.reduce((acc, r) => acc + r.sakit, 0), [rekapData]);
  const totalIzin = useMemo(() => rekapData.reduce((acc, r) => acc + r.izin, 0), [rekapData]);
  const totalAlpa = useMemo(() => rekapData.reduce((acc, r) => acc + r.alpa, 0), [rekapData]);
  const totalDispen = useMemo(() => rekapData.reduce((acc, r) => acc + r.dispen, 0), [rekapData]);

  // Active Mapel Name Helper
  const currentMapelName = useMemo(() => {
    if (subMode !== 'mapel') return '';
    return mapelList.find((m) => m.id === selectedMapelId)?.nama || assignedMapel?.nama || 'Mapel';
  }, [subMode, mapelList, selectedMapelId, assignedMapel]);

  // Open detail breakdown modal for a student
  const openStudentDetail = async (siswa: Siswa) => {
    setSelectedSiswaForDetail(siswa);
    setDetailModalOpen(true);

    try {
      let query = supabase
        .from('kehadiran')
        .select('*')
        .eq('siswa_id', siswa.id)
        .eq('semester_id', activeSemester?.id || '')
        .is('deleted_at', null);

      if (subMode === 'mapel') {
        query = query.eq('mapel_id', selectedMapelId);
      } else {
        query = query.is('mapel_id', null);
      }

      const { data } = await query.order('tanggal', { ascending: false });
      setStudentDetailAbsences((data || []) as unknown as Kehadiran[]);
    } catch (err: unknown) {
      toastError('Gagal Memuat Detail Siswa', (err as Error).message);
    }
  };

  // Export to Excel (T-036)
  const handleExportExcel = () => {
    if (!rekapData.length) {
      toastError('Tidak Ada Data', 'Tidak ada data rekap untuk diekspor.');
      return;
    }

    const currentKelas = kelasList.find((k) => k.id === selectedKelasId)?.nama || 'Kelas';
    const periodeLabel =
      viewMode === 'bulan'
        ? `Bulan_${selectedMonth}_${selectedYear}`
        : `Semester_${activeSemester?.tipe || 'Ganjil'}`;

    const headers = ['No', 'NISN', 'NIS', 'Nama Siswa', 'Sakit (S)', 'Izin (I)', 'Alpa (A)', 'Dispen (D)', 'Total Absen'];
    const rows = rekapData.map((item, idx) => [
      idx + 1,
      item.siswa.nisn || '-',
      item.siswa.nis,
      item.siswa.nama,
      item.sakit,
      item.izin,
      item.alpa,
      item.dispen,
      item.totalAbsen,
    ]);

    const filename =
      subMode === 'mapel'
        ? `Rekap_Kehadiran_${currentMapelName}_${currentKelas}_${periodeLabel}.xlsx`
        : `Rekap_Kehadiran_Keseluruhan_${currentKelas}_${periodeLabel}.xlsx`;

    const sheetName =
      subMode === 'mapel'
        ? `Kehadiran ${currentMapelName}`
        : 'Kehadiran Keseluruhan';

    exportToExcel(filename, sheetName, rows, headers);

    toastSuccess('Ekspor Berhasil', 'File rekap kehadiran telah diunduh.');
  };

  const inputHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set('type', subMode);
    if (selectedKelasId) params.set('kelasId', selectedKelasId);
    if (subMode === 'mapel' && selectedMapelId) params.set('mapelId', selectedMapelId);
    return `/kehadiran/input?${params.toString()}`;
  }, [subMode, selectedKelasId, selectedMapelId]);

  return (
    <div className="space-y-6">
      {/* Sub-Menu Tabs Switcher */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-lg border border-slate-200/80">
        <button
          type="button"
          onClick={() => setSubMode('mapel')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            subMode === 'mapel'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span>Kehadiran Mapel</span>
        </button>
        <button
          type="button"
          onClick={() => setSubMode('keseluruhan')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            subMode === 'keseluruhan'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span>Kehadiran Keseluruhan</span>
        </button>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {subMode === 'mapel' ? 'Rekap Kehadiran Mapel' : 'Rekap Kehadiran Keseluruhan'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {subMode === 'mapel'
              ? `Rekapitulasi presensi ketidakhadiran siswa khusus mapel ${currentMapelName || ''}.`
              : 'Rekapitulasi presensi ketidakhadiran siswa umum (tanpa memandang mapel).'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4 text-slate-600" />}
            onClick={handleExportExcel}
          >
            Unduh Excel
          </Button>

          <Link href={inputHref}>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Input Presensi
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Siswa</p>
            <p className="text-lg font-bold text-slate-900">{siswaList.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            S
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Sakit</p>
            <p className="text-lg font-bold text-amber-600">{totalSakit}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            I
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Izin</p>
            <p className="text-lg font-bold text-blue-600">{totalIzin}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            A
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Alpa</p>
            <p className="text-lg font-bold text-rose-600">{totalAlpa}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            D
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Dispen</p>
            <p className="text-lg font-bold text-purple-600">{totalDispen}</p>
          </div>
        </div>
      </div>

      {/* Filter and View Mode Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Kelas:</span>
            <div className="w-36">
              <Select
                value={selectedKelasId}
                onChange={(e) => setSelectedKelasId(e.target.value)}
                options={kelasList.map((k) => ({
                  value: k.id,
                  label: k.nama,
                }))}
              />
            </div>
          </div>

          {/* Mapel Filter: Admin has dropdown, Teacher is auto-mapped (info badge) */}
          {subMode === 'mapel' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Mapel:</span>
              {isAdmin ? (
                <div className="w-44">
                  <Select
                    value={selectedMapelId}
                    onChange={(e) => setSelectedMapelId(e.target.value)}
                    options={mapelList.map((m) => ({
                      value: m.id,
                      label: m.nama,
                    }))}
                  />
                </div>
              ) : (
                <div className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl border border-blue-100">
                  {assignedMapel?.nama || currentMapelName || 'Mapel Diampu'}
                </div>
              )}
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('bulan')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === 'bulan'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rekap Bulanan
            </button>
            <button
              type="button"
              onClick={() => setViewMode('semester')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === 'semester'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Keseluruhan Semester
            </button>
          </div>
        </div>

        {/* Month selector if monthly view */}
        {viewMode === 'bulan' && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                if (selectedMonth === 1) {
                  setSelectedMonth(12);
                  setSelectedYear((y) => y - 1);
                } else {
                  setSelectedMonth((m) => m - 1);
                }
              }}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 px-3">
              {new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(
                new Date(selectedYear, selectedMonth - 1, 1)
              )}
            </span>
            <button
              type="button"
              onClick={() => {
                if (selectedMonth === 12) {
                  setSelectedMonth(1);
                  setSelectedYear((y) => y + 1);
                } else {
                  setSelectedMonth((m) => m + 1);
                }
              }}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">No</TableHead>
            <TableHead className="w-32">NISN</TableHead>
            <TableHead className="w-28">NIS</TableHead>
            <TableHead>Nama Siswa</TableHead>
            <TableHead className="text-center w-24">Sakit (S)</TableHead>
            <TableHead className="text-center w-24">Izin (I)</TableHead>
            <TableHead className="text-center w-24">Alpa (A)</TableHead>
            <TableHead className="text-center w-24">Dispen (D)</TableHead>
            <TableHead className="text-center w-28">Total Absen</TableHead>
            <TableHead className="text-right w-24">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableEmpty colSpan={10} message="Memuat rekap kehadiran..." />
          ) : rekapData.length === 0 ? (
            <TableEmpty colSpan={10} message="Belum ada data siswa di kelas ini." />
          ) : (
            rekapData.map((item, index) => (
              <TableRow key={item.siswa.id}>
                <TableCell className="font-semibold text-slate-400">{index + 1}</TableCell>
                <TableCell className="font-mono text-xs text-slate-600">
                  {item.siswa.nisn || '-'}
                </TableCell>
                <TableCell className="font-mono text-xs font-semibold text-slate-700">
                  {item.siswa.nis}
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-slate-900">{item.siswa.nama}</span>
                </TableCell>
                <TableCell className="text-center">
                  {item.sakit > 0 ? (
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      {item.sakit}
                    </span>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {item.izin > 0 ? (
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      {item.izin}
                    </span>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {item.alpa > 0 ? (
                    <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                      {item.alpa}
                    </span>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {item.dispen > 0 ? (
                    <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                      {item.dispen}
                    </span>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center font-bold text-slate-800">
                  {item.totalAbsen > 0 ? (
                    `${item.totalAbsen} hari`
                  ) : (
                    <span className="text-emerald-600 font-normal text-xs">100% Hadir</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <button
                    type="button"
                    onClick={() => openStudentDetail(item.siswa)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                    title="Lihat Riwayat Ketidakhadiran"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Modal: Student Absence History (T-035) */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Riwayat Ketidakhadiran — ${selectedSiswaForDetail?.nama || ''}`}
        description={`NIS: ${selectedSiswaForDetail?.nis || '-'}${selectedSiswaForDetail?.nisn ? ` • NISN: ${selectedSiswaForDetail.nisn}` : ''} • ${subMode === 'mapel' ? `Mapel: ${currentMapelName}` : 'Kehadiran Keseluruhan'}`}
      >
        <div className="space-y-4">
          {studentDetailAbsences.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-800">Kehadiran Sempurna</p>
              <p className="mt-0.5">Siswa ini tidak memiliki catatan ketidakhadiran (S/I/A/D) di periode ini.</p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
              {studentDetailAbsences.map((record) => (
                <div key={record.id} className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      {formatDate(record.tanggal)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">{record.tanggal}</p>
                  </div>
                  <div>
                    {record.status === 'S' && <Badge variant="sakit">Sakit</Badge>}
                    {record.status === 'I' && <Badge variant="izin">Izin</Badge>}
                    {record.status === 'A' && <Badge variant="alpa">Alpa</Badge>}
                    {record.status === 'D' && <Badge variant="dispen">Dispen</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDetailModalOpen(false)}
            >
              Tutup
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
