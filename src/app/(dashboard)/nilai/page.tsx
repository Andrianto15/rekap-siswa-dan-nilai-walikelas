'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  GraduationCap,
  Download,
  Plus,
  Trophy,
  Award,
  TrendingUp,
  BarChart3,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/Table';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { exportToExcel } from '@/lib/excel';
import { formatNumber } from '@/lib/utils';
import type { Siswa, Kelas, Mapel, Semester, KomponenNilai, Nilai, NilaiAkhir, Kehadiran, GuruKelas, GuruMapel, RekapNilaiSiswa } from '@/lib/types';

export default function RekapNilaiPage() {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();
  const { isAdmin } = useRole();
  const { success: toastSuccess, error: toastError } = useToast();

  const [activeSemester, setActiveSemester] = useState<Semester | null>(null);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelasId, setSelectedKelasId] = useState<string>('');

  const [mapelList, setMapelList] = useState<Mapel[]>([]);
  const [selectedMapelId, setSelectedMapelId] = useState<string>('');

  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [komponenList, setKomponenList] = useState<KomponenNilai[]>([]);
  const [nilaiList, setNilaiList] = useState<Nilai[]>([]);
  const [nilaiAkhirList, setNilaiAkhirList] = useState<NilaiAkhir[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Kehadiran[]>([]);
  const [loading, setLoading] = useState(true);

  // Sorting mode: 'ranking' (highest final score first) or 'alphabetical' (by name)
  const [sortMode, setSortMode] = useState<'ranking' | 'alphabetical'>('ranking');

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

          const { data: guruMapelData } = await supabase
            .from('guru_mapel')
            .select('*')
            .eq('guru_id', user.id)
            .eq('semester_id', semData.id)
            .is('deleted_at', null)
            .limit(1)
            .single();

          if (guruMapelData) {
            setSelectedMapelId((guruMapelData as GuruMapel).mapel_id);
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

  // 2. Fetch components for selected mapel
  const fetchKomponen = useCallback(async () => {
    if (!selectedMapelId || !activeSemester) return;
    try {
      const { data, error } = await supabase
        .from('komponen_nilai')
        .select('*')
        .eq('mapel_id', selectedMapelId)
        .eq('semester_id', activeSemester.id)
        .is('deleted_at', null)
        .order('urutan', { ascending: true });

      if (error) throw error;
      setKomponenList(data || []);
    } catch (err: unknown) {
      toastError('Gagal Memuat Komponen', (err as Error).message);
    }
  }, [supabase, selectedMapelId, activeSemester, toastError]);

  // 3. Fetch grading, ranking, and subject attendance records
  const fetchGradingRecords = useCallback(async () => {
    if (!selectedKelasId || !selectedMapelId || !activeSemester) return;
    setLoading(true);

    try {
      // 3.1 Fetch students
      const { data: sData, error: sError } = await supabase
        .from('siswa')
        .select('*')
        .eq('kelas_id', selectedKelasId)
        .eq('semester_id', activeSemester.id)
        .is('deleted_at', null)
        .order('nama', { ascending: true });

      if (sError) throw sError;
      const students = sData || [];
      setSiswaList(students);

      if (students.length > 0) {
        const studentIds = students.map((s) => s.id);

        // 3.2 Component scores
        const { data: nData, error: nError } = await supabase
          .from('nilai')
          .select('*')
          .eq('semester_id', activeSemester.id)
          .in('siswa_id', studentIds)
          .is('deleted_at', null);

        if (nError) throw nError;
        setNilaiList((nData || []) as unknown as Nilai[]);

        // 3.3 Final scores
        const { data: naData, error: naError } = await supabase
          .from('nilai_akhir')
          .select('*')
          .eq('mapel_id', selectedMapelId)
          .eq('semester_id', activeSemester.id)
          .in('siswa_id', studentIds)
          .is('deleted_at', null);

        if (naError) throw naError;
        setNilaiAkhirList((naData || []) as unknown as NilaiAkhir[]);

        // 3.4 Attendance for this subject
        const { data: attData, error: attError } = await supabase
          .from('kehadiran')
          .select('*')
          .eq('semester_id', activeSemester.id)
          .eq('mapel_id', selectedMapelId)
          .in('siswa_id', studentIds)
          .is('deleted_at', null);

        if (attError) throw attError;
        setAttendanceRecords((attData || []) as unknown as Kehadiran[]);
      } else {
        setNilaiList([]);
        setNilaiAkhirList([]);
        setAttendanceRecords([]);
      }
    } catch (err: unknown) {
      toastError('Gagal Memuat Rekap Nilai', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [supabase, selectedKelasId, selectedMapelId, activeSemester, toastError]);

  useEffect(() => {
    initData();
  }, [initData]);

  useEffect(() => {
    if (selectedMapelId && activeSemester) {
      fetchKomponen();
    }
  }, [selectedMapelId, activeSemester, fetchKomponen]);

  useEffect(() => {
    if (selectedKelasId && selectedMapelId && activeSemester) {
      fetchGradingRecords();
    }
  }, [selectedKelasId, selectedMapelId, activeSemester, fetchGradingRecords]);

  // Aggregate and rank data with subject attendance
  const rankedData: RekapNilaiSiswa[] = useMemo(() => {
    const rawList: RekapNilaiSiswa[] = siswaList.map((siswa) => {
      // Map component scores
      const nilaiKomponen: Record<string, number | null> = {};
      let totalComp = 0;
      let compCount = 0;

      komponenList.forEach((comp) => {
        const record = nilaiList.find(
          (n) => n.siswa_id === siswa.id && n.komponen_nilai_id === comp.id
        );
        if (record && typeof record.nilai === 'number') {
          nilaiKomponen[comp.id] = record.nilai;
          totalComp += record.nilai;
          compCount += 1;
        } else {
          nilaiKomponen[comp.id] = null;
        }
      });

      const calculatedAvg = compCount > 0 ? parseFloat((totalComp / compCount).toFixed(1)) : 0;
      const finalScoreRecord = nilaiAkhirList.find((na) => na.siswa_id === siswa.id);
      const nilaiAkhir =
        finalScoreRecord && typeof finalScoreRecord.nilai_akhir === 'number'
          ? finalScoreRecord.nilai_akhir
          : calculatedAvg;

      // Calculate subject attendance
      const studentAtt = attendanceRecords.filter((r) => r.siswa_id === siswa.id);
      const sakit = studentAtt.filter((r) => r.status === 'S').length;
      const izin = studentAtt.filter((r) => r.status === 'I').length;
      const alpa = studentAtt.filter((r) => r.status === 'A').length;
      const dispen = studentAtt.filter((r) => r.status === 'D').length;
      const totalAbsen = sakit + izin + alpa + dispen;

      return {
        siswa,
        nilaiKomponen,
        rataRata: calculatedAvg,
        nilaiAkhir,
        kehadiranMapel: {
          sakit,
          izin,
          alpa,
          dispen,
          totalAbsen,
        },
      };
    });

    // Compute ranking based on nilaiAkhir descending
    const sortedForRanking = [...rawList].sort((a, b) => b.nilaiAkhir - a.nilaiAkhir);
    const rankedWithPositions = sortedForRanking.map((item, idx) => ({
      ...item,
      ranking: item.nilaiAkhir > 0 ? idx + 1 : undefined,
    }));

    if (sortMode === 'alphabetical') {
      return [...rankedWithPositions].sort((a, b) => a.siswa.nama.localeCompare(b.siswa.nama));
    }

    return rankedWithPositions;
  }, [siswaList, komponenList, nilaiList, nilaiAkhirList, attendanceRecords, sortMode]);

  // Statistics summaries
  const validScores = useMemo(
    () => rankedData.map((d) => d.nilaiAkhir).filter((val) => val > 0),
    [rankedData]
  );

  const classAverage = useMemo(() => {
    if (!validScores.length) return 0;
    const sum = validScores.reduce((acc, v) => acc + v, 0);
    return parseFloat((sum / validScores.length).toFixed(1));
  }, [validScores]);

  const maxScore = useMemo(() => {
    if (!validScores.length) return 0;
    return Math.max(...validScores);
  }, [validScores]);

  const minScore = useMemo(() => {
    if (!validScores.length) return 0;
    return Math.min(...validScores);
  }, [validScores]);

  // Predicate letter helper
  const getPredikat = (score: number): { label: string; variant: 'success' | 'info' | 'warning' | 'danger' } => {
    if (score >= 85) return { label: 'A (Sangat Baik)', variant: 'success' };
    if (score >= 75) return { label: 'B (Baik)', variant: 'info' };
    if (score >= 65) return { label: 'C (Cukup)', variant: 'warning' };
    return { label: 'D (Kurang)', variant: 'danger' };
  };

  // Export to Excel (T-042)
  const handleExportExcel = () => {
    if (!rankedData.length) {
      toastError('Tidak Ada Data', 'Tidak ada data nilai untuk diekspor.');
      return;
    }

    const currentKelas = kelasList.find((k) => k.id === selectedKelasId)?.nama || 'Kelas';
    const currentMapel = mapelList.find((m) => m.id === selectedMapelId)?.nama || 'Mapel';

    const compHeaders = komponenList.map((c) => c.nama);
    const headers = [
      'Peringkat',
      'NISN',
      'NIS',
      'Nama Siswa',
      ...compHeaders,
      'Rata-Rata',
      'Nilai Akhir',
      'Predikat',
      'Sakit (S)',
      'Izin (I)',
      'Alpa (A)',
      'Dispen (D)',
      'Total Absen Mapel',
    ];

    const rows = rankedData.map((item) => {
      const compScores = komponenList.map((c) => item.nilaiKomponen[c.id] ?? '-');
      const predikat = item.nilaiAkhir > 0 ? getPredikat(item.nilaiAkhir).label : '-';
      const att = item.kehadiranMapel;

      return [
        item.ranking || '-',
        item.siswa.nisn || '-',
        item.siswa.nis,
        item.siswa.nama,
        ...compScores,
        item.rataRata > 0 ? item.rataRata : '-',
        item.nilaiAkhir > 0 ? item.nilaiAkhir : '-',
        predikat,
        att ? att.sakit : 0,
        att ? att.izin : 0,
        att ? att.alpa : 0,
        att ? att.dispen : 0,
        att ? att.totalAbsen : 0,
      ];
    });

    exportToExcel(
      `Rekap_Nilai_${currentKelas}_${currentMapel}.xlsx`,
      'Rekap Nilai',
      rows,
      headers
    );

    toastSuccess('Ekspor Berhasil', 'File rekap nilai berhasil diunduh.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Rekap Nilai & Ranking</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rekapitulasi perolehan nilai, ranking siswa, dan absensi per mata pelajaran.
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

          <Link href="/nilai/input">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Input & Atur Nilai
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Rata-Rata Kelas</p>
            <p className="text-lg font-bold text-blue-600">
              {classAverage > 0 ? formatNumber(classAverage, 1) : '-'}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Nilai Tertinggi</p>
            <p className="text-lg font-bold text-emerald-600">
              {maxScore > 0 ? formatNumber(maxScore, 1) : '-'}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Nilai Terendah</p>
            <p className="text-lg font-bold text-amber-600">
              {minScore > 0 ? formatNumber(minScore, 1) : '-'}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Siswa Dinilai</p>
            <p className="text-lg font-bold text-indigo-600">
              {validScores.length} / {siswaList.length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Sorting Options */}
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

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Mapel:</span>
            <div className="w-48">
              <Select
                value={selectedMapelId}
                onChange={(e) => setSelectedMapelId(e.target.value)}
                options={mapelList.map((m) => ({
                  value: m.id,
                  label: m.nama,
                }))}
              />
            </div>
          </div>
        </div>

        {/* Sort Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Urutkan:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setSortMode('ranking')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                sortMode === 'ranking'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ranking (Tertinggi)
            </button>
            <button
              type="button"
              onClick={() => setSortMode('alphabetical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                sortMode === 'alphabetical'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nama Siswa (A-Z)
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20 text-center">Peringkat</TableHead>
            <TableHead className="w-32">NISN</TableHead>
            <TableHead className="w-28">NIS</TableHead>
            <TableHead>Nama Siswa</TableHead>
            {komponenList.map((comp) => (
              <TableHead key={comp.id} className="text-center">
                {comp.nama}
              </TableHead>
            ))}
            <TableHead className="text-center w-28 bg-slate-100/60">Rata-Rata</TableHead>
            <TableHead className="text-center w-28 bg-blue-50/60 text-blue-900">Nilai Akhir</TableHead>
            <TableHead className="text-center w-36">Predikat</TableHead>
            <TableHead className="text-center w-36 bg-amber-50/40 text-amber-900">Absensi Mapel</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableEmpty colSpan={komponenList.length + 8} message="Memuat rekap nilai..." />
          ) : rankedData.length === 0 ? (
            <TableEmpty colSpan={komponenList.length + 8} message="Belum ada siswa di kelas ini." />
          ) : (
            rankedData.map((item) => {
              const predikat = item.nilaiAkhir > 0 ? getPredikat(item.nilaiAkhir) : null;
              const att = item.kehadiranMapel;

              return (
                <TableRow key={item.siswa.id}>
                  {/* Ranking Medal Badge (T-041) */}
                  <TableCell className="text-center">
                    {item.ranking === 1 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs shadow-xs" title="Juara 1">
                        🥇 1
                      </span>
                    ) : item.ranking === 2 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-extrabold text-xs shadow-xs" title="Juara 2">
                        🥈 2
                      </span>
                    ) : item.ranking === 3 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-extrabold text-xs shadow-xs" title="Juara 3">
                        🥉 3
                      </span>
                    ) : item.ranking ? (
                      <span className="font-semibold text-slate-500 text-xs">#{item.ranking}</span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600">
                    {item.siswa.nisn || '-'}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-slate-700">
                    {item.siswa.nis}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-slate-900">{item.siswa.nama}</span>
                  </TableCell>

                  {/* Component Scores */}
                  {komponenList.map((comp) => {
                    const score = item.nilaiKomponen[comp.id];
                    return (
                      <TableCell key={comp.id} className="text-center font-medium">
                        {typeof score === 'number' ? formatNumber(score, 1) : <span className="text-slate-300">-</span>}
                      </TableCell>
                    );
                  })}

                  {/* Calculated Average */}
                  <TableCell className="text-center bg-slate-50/60 font-semibold text-slate-700">
                    {item.rataRata > 0 ? formatNumber(item.rataRata, 1) : <span className="text-slate-300">-</span>}
                  </TableCell>

                  {/* Materialized Final Score */}
                  <TableCell className="text-center bg-blue-50/30 font-bold text-blue-900">
                    {item.nilaiAkhir > 0 ? (
                      <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 font-bold text-xs">
                        {formatNumber(item.nilaiAkhir, 1)}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </TableCell>

                  {/* Predicate */}
                  <TableCell className="text-center">
                    {predikat ? (
                      <Badge variant={predikat.variant} size="sm">
                        {predikat.label}
                      </Badge>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </TableCell>

                  {/* Subject Attendance Information */}
                  <TableCell className="text-center bg-amber-50/20">
                    {att && att.totalAbsen > 0 ? (
                      <div className="flex items-center justify-center gap-1 font-semibold text-[11px]">
                        {att.sakit > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800" title={`Sakit: ${att.sakit}`}>
                            {att.sakit}S
                          </span>
                        )}
                        {att.izin > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800" title={`Izin: ${att.izin}`}>
                            {att.izin}I
                          </span>
                        )}
                        {att.alpa > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800" title={`Alpa: ${att.alpa}`}>
                            {att.alpa}A
                          </span>
                        )}
                        {att.dispen > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800" title={`Dispen: ${att.dispen}`}>
                            {att.dispen}D
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-emerald-600 text-xs font-medium">100% Hadir</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
