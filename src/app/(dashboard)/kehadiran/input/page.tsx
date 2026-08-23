'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  CalendarCheck2,
  Calendar as CalendarIcon,
  Grid,
  Save,
  CheckCircle2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import type { Siswa, Kelas, Semester, KehadiranStatus, GuruKelas } from '@/lib/types';

export default function InputKehadiranPage() {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();
  const { isAdmin } = useRole();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  const [activeSemester, setActiveSemester] = useState<Semester | null>(null);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelasId, setSelectedKelasId] = useState<string>('');

  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Mode: 'daily' (per tanggal) or 'grid' (per bulan)
  const [mode, setMode] = useState<'daily' | 'grid'>('daily');

  // Daily Mode States
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  // Map: siswa_id -> 'S' | 'I' | 'A' | null (null means Hadir)
  const [dailyStatusMap, setDailyStatusMap] = useState<Record<string, KehadiranStatus | null>>({});

  // Grid Mode States
  const now = new Date();
  const [gridYear, setGridYear] = useState<number>(now.getFullYear());
  const [gridMonth, setGridMonth] = useState<number>(now.getMonth() + 1); // 1-12
  // Map: `${siswa_id}_${dateStr}` -> 'S' | 'I' | 'A' | null
  const [gridStatusMap, setGridStatusMap] = useState<Record<string, KehadiranStatus | null>>({});

  // 1. Initial metadata
  const initData = useCallback(async () => {
    try {
      const { data: semData } = await supabase
        .from('semester')
        .select(`*, tahun_ajaran (*)`)
        .eq('is_active', true)
        .single();

      if (semData) {
        setActiveSemester(semData as unknown as Semester);

        const { data: kData } = await supabase.from('kelas').select('*').order('nama', { ascending: true });
        if (kData) setKelasList(kData);

        if (user && !isAdmin) {
          const { data: guruKelasData } = await supabase
            .from('guru_kelas')
            .select('*')
            .eq('guru_id', user.id)
            .eq('semester_id', semData.id)
            .single();

          if (guruKelasData) {
            setSelectedKelasId((guruKelasData as GuruKelas).kelas_id);
          } else if (kData && kData.length > 0) {
            setSelectedKelasId(kData[0].id);
          }
        } else if (kData && kData.length > 0) {
          setSelectedKelasId(kData[0].id);
        }
      }
    } catch (err: unknown) {
      toastError('Gagal Mengambil Data Awal', (err as Error).message);
    }
  }, [supabase, user, isAdmin, toastError]);

  // 2. Fetch students for class
  const fetchSiswa = useCallback(async () => {
    if (!selectedKelasId || !activeSemester) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('siswa')
        .select('*')
        .eq('kelas_id', selectedKelasId)
        .eq('semester_id', activeSemester.id)
        .is('deleted_at', null)
        .order('nama', { ascending: true });

      if (error) throw error;
      setSiswaList(data || []);
    } catch (err: unknown) {
      toastError('Gagal Memuat Siswa', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [supabase, selectedKelasId, activeSemester, toastError]);

  // 3. Fetch daily attendance records
  const fetchDailyAttendance = useCallback(async () => {
    if (!activeSemester || !siswaList.length || !selectedDate) return;
    try {
      const siswaIds = siswaList.map((s) => s.id);
      const { data, error } = await supabase
        .from('kehadiran')
        .select('*')
        .eq('tanggal', selectedDate)
        .in('siswa_id', siswaIds);

      if (error) throw error;

      const map: Record<string, KehadiranStatus | null> = {};
      siswaList.forEach((s) => {
        map[s.id] = null; // Default: Hadir
      });
      (data || []).forEach((row) => {
        map[row.siswa_id] = row.status as KehadiranStatus;
      });
      setDailyStatusMap(map);
    } catch (err: unknown) {
      toastError('Gagal Memuat Presensi Harian', (err as Error).message);
    }
  }, [supabase, activeSemester, siswaList, selectedDate, toastError]);

  // 4. Fetch monthly grid attendance records
  const daysInMonth = useMemo(() => {
    return new Date(gridYear, gridMonth, 0).getDate();
  }, [gridYear, gridMonth]);

  const fetchMonthlyAttendance = useCallback(async () => {
    if (!activeSemester || !siswaList.length) return;
    try {
      const siswaIds = siswaList.map((s) => s.id);
      const startDate = `${gridYear}-${String(gridMonth).padStart(2, '0')}-01`;
      const endDate = `${gridYear}-${String(gridMonth).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

      const { data, error } = await supabase
        .from('kehadiran')
        .select('*')
        .gte('tanggal', startDate)
        .lte('tanggal', endDate)
        .in('siswa_id', siswaIds);

      if (error) throw error;

      const map: Record<string, KehadiranStatus | null> = {};
      (data || []).forEach((row) => {
        const key = `${row.siswa_id}_${row.tanggal}`;
        map[key] = row.status as KehadiranStatus;
      });
      setGridStatusMap(map);
    } catch (err: unknown) {
      toastError('Gagal Memuat Presensi Bulanan', (err as Error).message);
    }
  }, [supabase, activeSemester, siswaList, gridYear, gridMonth, daysInMonth, toastError]);

  useEffect(() => {
    initData();
  }, [initData]);

  useEffect(() => {
    if (selectedKelasId && activeSemester) {
      fetchSiswa();
    }
  }, [selectedKelasId, activeSemester, fetchSiswa]);

  useEffect(() => {
    if (mode === 'daily') {
      fetchDailyAttendance();
    } else {
      fetchMonthlyAttendance();
    }
  }, [mode, fetchDailyAttendance, fetchMonthlyAttendance]);

  // Handle daily status toggle
  const handleDailyStatusChange = (siswaId: string, status: KehadiranStatus | null) => {
    setDailyStatusMap((prev) => ({
      ...prev,
      [siswaId]: status,
    }));
  };

  // Set all students as present for the selected day
  const handleSetAllPresentDaily = () => {
    const updated: Record<string, KehadiranStatus | null> = {};
    siswaList.forEach((s) => {
      updated[s.id] = null;
    });
    setDailyStatusMap(updated);
    toastInfo('Tandai Hadir', 'Semua siswa ditandai hadir.');
  };

  // Save Daily Attendance (Absence-Only pattern)
  const handleSaveDaily = async () => {
    if (!activeSemester || !selectedDate || !siswaList.length) return;
    setSaving(true);

    try {
      const siswaIds = siswaList.map((s) => s.id);

      // 1. Delete existing records for this day and these students
      await supabase
        .from('kehadiran')
        .delete()
        .eq('tanggal', selectedDate)
        .in('siswa_id', siswaIds);

      // 2. Prepare absence rows only (S, I, A)
      const absenceRows: { siswa_id: string; semester_id: string; tanggal: string; status: KehadiranStatus }[] = [];
      Object.entries(dailyStatusMap).forEach(([siswaId, status]) => {
        if (status && ['S', 'I', 'A'].includes(status)) {
          absenceRows.push({
            siswa_id: siswaId,
            semester_id: activeSemester.id,
            tanggal: selectedDate,
            status,
          });
        }
      });

      // 3. Insert absences if any
      if (absenceRows.length > 0) {
        const { error: insertError } = await supabase.from('kehadiran').insert(absenceRows);
        if (insertError) throw insertError;
      }

      toastSuccess('Berhasil Disimpan', `Presensi tanggal ${selectedDate} telah diperbarui.`);
      fetchDailyAttendance();
    } catch (err: unknown) {
      toastError('Gagal Menyimpan Presensi', (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Grid cell cycle: Hadir (null) -> S -> I -> A -> Hadir (null)
  const handleCycleGridCell = (siswaId: string, day: number) => {
    const dateStr = `${gridYear}-${String(gridMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const key = `${siswaId}_${dateStr}`;
    const current = gridStatusMap[key] || null;

    let next: KehadiranStatus | null = null;
    if (current === null) next = 'S';
    else if (current === 'S') next = 'I';
    else if (current === 'I') next = 'A';
    else if (current === 'A') next = null;

    setGridStatusMap((prev) => ({
      ...prev,
      [key]: next,
    }));
  };

  // Save Monthly Grid Attendance
  const handleSaveGrid = async () => {
    if (!activeSemester || !siswaList.length) return;
    setSaving(true);

    try {
      const siswaIds = siswaList.map((s) => s.id);
      const startDate = `${gridYear}-${String(gridMonth).padStart(2, '0')}-01`;
      const endDate = `${gridYear}-${String(gridMonth).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

      // 1. Delete all records for this month and students
      await supabase
        .from('kehadiran')
        .delete()
        .gte('tanggal', startDate)
        .lte('tanggal', endDate)
        .in('siswa_id', siswaIds);

      // 2. Prepare absence rows
      const absenceRows: { siswa_id: string; semester_id: string; tanggal: string; status: KehadiranStatus }[] = [];
      Object.entries(gridStatusMap).forEach(([key, status]) => {
        if (status && ['S', 'I', 'A'].includes(status)) {
          const [sId, date] = key.split('_');
          if (date && date.startsWith(`${gridYear}-${String(gridMonth).padStart(2, '0')}`)) {
            absenceRows.push({
              siswa_id: sId,
              semester_id: activeSemester.id,
              tanggal: date,
              status,
            });
          }
        }
      });

      // 3. Insert absences if any
      if (absenceRows.length > 0) {
        const { error: insertError } = await supabase.from('kehadiran').insert(absenceRows);
        if (insertError) throw insertError;
      }

      toastSuccess('Berhasil Disimpan', `Presensi bulan ${gridMonth}/${gridYear} telah diperbarui.`);
      fetchMonthlyAttendance();
    } catch (err: unknown) {
      toastError('Gagal Menyimpan Presensi', (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/kehadiran"
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
            title="Kembali ke Rekap Kehadiran"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <CalendarCheck2 className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Input Kehadiran Siswa</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Catat absensi ketidakhadiran (Sakit, Izin, Alpa) harian atau bulanan.
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-slate-200/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('daily')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              mode === 'daily'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Harian (Per Tanggal)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('grid')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              mode === 'grid'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Grid Bulanan</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Class selector */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-slate-600">Kelas:</span>
          <div className="w-40">
            <Select
              value={selectedKelasId}
              onChange={(e) => setSelectedKelasId(e.target.value)}
              options={kelasList.map((k) => ({
                value: k.id,
                label: `Kelas ${k.nama}`,
              }))}
            />
          </div>
        </div>

        {/* Date or Month Picker */}
        {mode === 'daily' ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Tanggal:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Bulan:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  if (gridMonth === 1) {
                    setGridMonth(12);
                    setGridYear((y) => y - 1);
                  } else {
                    setGridMonth((m) => m - 1);
                  }
                }}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-800 px-2">
                {new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(
                  new Date(gridYear, gridMonth - 1, 1)
                )}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (gridMonth === 12) {
                    setGridMonth(1);
                    setGridYear((y) => y + 1);
                  } else {
                    setGridMonth((m) => m + 1);
                  }
                }}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center gap-2">
          {mode === 'daily' && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              onClick={handleSetAllPresentDaily}
            >
              Semua Hadir
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
            onClick={mode === 'daily' ? handleSaveDaily : handleSaveGrid}
          >
            Simpan Presensi
          </Button>
        </div>
      </div>

      {/* MODE 1: DAILY VIEW */}
      {mode === 'daily' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Daftar Siswa ({siswaList.length})
            </span>
            <span className="text-[11px] text-slate-500">
              Klik status untuk mengubah (S = Sakit, I = Izin, A = Alpa, H = Hadir)
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-10 text-center text-slate-400 text-sm">Memuat siswa...</div>
            ) : siswaList.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm">
                Belum ada siswa di kelas ini.
              </div>
            ) : (
              siswaList.map((siswa, idx) => {
                const currentStatus = dailyStatusMap[siswa.id] || null;

                return (
                  <div
                    key={siswa.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-400 text-xs w-6">{idx + 1}.</span>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{siswa.nama}</p>
                        <p className="text-xs font-mono text-slate-400">NIS: {siswa.nis}</p>
                      </div>
                    </div>

                    {/* Radio-like toggle buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleDailyStatusChange(siswa.id, null)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          currentStatus === null
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Hadir
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDailyStatusChange(siswa.id, 'S')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          currentStatus === 'S'
                            ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Sakit (S)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDailyStatusChange(siswa.id, 'I')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          currentStatus === 'I'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Izin (I)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDailyStatusChange(siswa.id, 'A')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          currentStatus === 'A'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Alpa (A)
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODE 2: MONTHLY GRID MATRIX VIEW */}
      {mode === 'grid' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Matrix Presensi Bulanan ({daysInMonth} Hari)
            </span>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>Keterangan:</span>
              <Badge variant="hadir" size="sm">Hadir (-)</Badge>
              <Badge variant="sakit" size="sm">S</Badge>
              <Badge variant="izin" size="sm">I</Badge>
              <Badge variant="alpa" size="sm">A</Badge>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b">
                <tr>
                  <th className="p-2.5 text-left sticky left-0 bg-slate-100 z-10 min-w-[160px] border-r">
                    Nama Siswa
                  </th>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                    <th key={d} className="p-2 w-8 border-r last:border-r-0">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={daysInMonth + 1} className="py-10 text-slate-400">
                      Memuat matrix kehadiran...
                    </td>
                  </tr>
                ) : siswaList.length === 0 ? (
                  <tr>
                    <td colSpan={daysInMonth + 1} className="py-10 text-slate-400">
                      Belum ada siswa di kelas ini.
                    </td>
                  </tr>
                ) : (
                  siswaList.map((siswa) => (
                    <tr key={siswa.id} className="hover:bg-slate-50/50">
                      <td className="p-2.5 text-left font-semibold text-slate-900 sticky left-0 bg-white z-10 border-r truncate max-w-[160px]">
                        {siswa.nama}
                      </td>
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                        const dateStr = `${gridYear}-${String(gridMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        const key = `${siswa.id}_${dateStr}`;
                        const status = gridStatusMap[key] || null;

                        return (
                          <td
                            key={d}
                            onClick={() => handleCycleGridCell(siswa.id, d)}
                            className={`p-1 border-r last:border-r-0 cursor-pointer font-bold select-none transition ${
                              status === 'S'
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : status === 'I'
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                : status === 'A'
                                ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                : 'hover:bg-slate-100 text-slate-300'
                            }`}
                            title={`Klik untuk ubah presensi (${siswa.nama}, Tanggal ${d})`}
                          >
                            {status || '·'}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
