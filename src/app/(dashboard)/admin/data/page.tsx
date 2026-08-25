'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Database,
  User,
  CalendarCheck2,
  GraduationCap,
  School,
  BookOpen,
  Edit,
  Download,
  AlertCircle,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/Table';
import { useToast } from '@/components/ui/Toast';
import { useRole } from '@/hooks/useRole';
import { exportToExcel } from '@/lib/excel';
import { formatNumber } from '@/lib/utils';
import type { Profile, Kelas, Mapel, Semester, Siswa, GuruKelas, GuruMapel, Kehadiran, KomponenNilai, Nilai, NilaiAkhir, RekapKehadiranSiswa, RekapNilaiSiswa } from '@/lib/types';

export default function AdminViewAllDataPage() {
  const supabase = useMemo(() => createClient(), []);
  const { isAdmin, loading: roleLoading } = useRole();
  const { success: toastSuccess, error: toastError } = useToast();

  const [activeSemester, setActiveSemester] = useState<Semester | null>(null);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'kehadiran' | 'nilai'>('kehadiran');
  const [loading, setLoading] = useState(true);

  // Selected Teacher metadata
  const [teacherWaliKelas, setTeacherWaliKelas] = useState<Kelas | null>(null);
  const [teacherMapels, setTeacherMapels] = useState<Mapel[]>([]);
  const [selectedMapelId, setSelectedMapelId] = useState<string>('');

  // Class & Student data for Attendance
  const [attendanceStudents, setAttendanceStudents] = useState<Siswa[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Kehadiran[]>([]);

  // Grading Data
  const [gradingClasses, setGradingClasses] = useState<Kelas[]>([]);
  const [selectedGradingKelasId, setSelectedGradingKelasId] = useState<string>('');
  const [gradingStudents, setGradingStudents] = useState<Siswa[]>([]);
  const [komponenList, setKomponenList] = useState<KomponenNilai[]>([]);
  const [nilaiList, setNilaiList] = useState<Nilai[]>([]);
  const [nilaiAkhirList, setNilaiAkhirList] = useState<NilaiAkhir[]>([]);

  // 1. Initial metadata
  const initData = useCallback(async () => {
    try {
      // 1. Active semester
      const { data: semData } = await supabase
        .from('semester')
        .select(`*, tahun_ajaran (*)`)
        .eq('is_active', true)
        .is('deleted_at', null)
        .single();

      if (semData) {
        setActiveSemester(semData as unknown as Semester);
      }

      // 2. Fetch all teachers (profiles)
      const { data: profData } = await supabase
        .from('profiles')
        .select('*')
        .is('deleted_at', null)
        .order('full_name', { ascending: true });

      if (profData && profData.length > 0) {
        setTeachers(profData);
        setSelectedTeacherId(profData[0].id);
      }

      // 3. Fetch all classes for grading filter
      const { data: kData } = await supabase
        .from('kelas')
        .select('*')
        .is('deleted_at', null)
        .order('nama', { ascending: true });
      if (kData && kData.length > 0) {
        setGradingClasses(kData);
        setSelectedGradingKelasId(kData[0].id);
      }
    } catch (err: unknown) {
      toastError('Gagal Mengambil Data Awal', (err as Error).message);
    }
  }, [supabase, toastError]);

  // 2. Fetch selected teacher assignments
  const fetchTeacherAssignments = useCallback(async () => {
    if (!selectedTeacherId || !activeSemester) return;
    setLoading(true);

    try {
      // Wali kelas assignment
      const { data: wkData } = await supabase
        .from('guru_kelas')
        .select(`*, kelas (*)`)
        .eq('guru_id', selectedTeacherId)
        .eq('semester_id', activeSemester.id)
        .is('deleted_at', null)
        .single();

      if (wkData && (wkData as unknown as GuruKelas).kelas) {
        const k = (wkData as unknown as GuruKelas).kelas as Kelas;
        setTeacherWaliKelas(k);

        // Fetch students in this class
        const { data: sData } = await supabase
          .from('siswa')
          .select('*')
          .eq('kelas_id', k.id)
          .eq('semester_id', activeSemester.id)
          .is('deleted_at', null)
          .order('nama', { ascending: true });

        const students = sData || [];
        setAttendanceStudents(students);

        // Fetch attendance
        if (students.length > 0) {
          const sIds = students.map((s) => s.id);
          const { data: attData } = await supabase
            .from('kehadiran')
            .select('*')
            .eq('semester_id', activeSemester.id)
            .in('siswa_id', sIds)
            .is('deleted_at', null);

          setAttendanceRecords((attData || []) as unknown as Kehadiran[]);
        } else {
          setAttendanceRecords([]);
        }
      } else {
        setTeacherWaliKelas(null);
        setAttendanceStudents([]);
        setAttendanceRecords([]);
      }

      // Mapel assignment
      const { data: gmData } = await supabase
        .from('guru_mapel')
        .select(`*, mapel (*)`)
        .eq('guru_id', selectedTeacherId)
        .eq('semester_id', activeSemester.id)
        .is('deleted_at', null);

      if (gmData && gmData.length > 0) {
        const mapels = gmData
          .map((item) => (item as unknown as GuruMapel).mapel)
          .filter(Boolean) as Mapel[];
        setTeacherMapels(mapels);
        if (mapels.length > 0) {
          setSelectedMapelId(mapels[0].id);
        }
      } else {
        setTeacherMapels([]);
        setSelectedMapelId('');
      }
    } catch (err: unknown) {
      toastError('Gagal Memuat Data Penugasan Guru', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [supabase, selectedTeacherId, activeSemester, toastError]);

  // 3. Fetch grading data when mapel or grading class changes
  const fetchTeacherGrading = useCallback(async () => {
    if (!selectedMapelId || !selectedGradingKelasId || !activeSemester) return;

    try {
      // 3.1 Fetch components
      const { data: compData } = await supabase
        .from('komponen_nilai')
        .select('*')
        .eq('mapel_id', selectedMapelId)
        .eq('semester_id', activeSemester.id)
        .is('deleted_at', null)
        .order('urutan', { ascending: true });

      setKomponenList(compData || []);

      // 3.2 Fetch students in grading class
      const { data: sData } = await supabase
        .from('siswa')
        .select('*')
        .eq('kelas_id', selectedGradingKelasId)
        .eq('semester_id', activeSemester.id)
        .is('deleted_at', null)
        .order('nama', { ascending: true });

      const students = sData || [];
      setGradingStudents(students);

      if (students.length > 0) {
        const sIds = students.map((s) => s.id);

        // 3.3 Component scores
        const { data: nData } = await supabase
          .from('nilai')
          .select('*')
          .eq('semester_id', activeSemester.id)
          .in('siswa_id', sIds)
          .is('deleted_at', null);

        setNilaiList((nData || []) as unknown as Nilai[]);

        // 3.4 Final scores
        const { data: naData } = await supabase
          .from('nilai_akhir')
          .select('*')
          .eq('mapel_id', selectedMapelId)
          .eq('semester_id', activeSemester.id)
          .in('siswa_id', sIds)
          .is('deleted_at', null);

        setNilaiAkhirList((naData || []) as unknown as NilaiAkhir[]);
      } else {
        setNilaiList([]);
        setNilaiAkhirList([]);
      }
    } catch (err: unknown) {
      toastError('Gagal Memuat Nilai', (err as Error).message);
    }
  }, [supabase, selectedMapelId, selectedGradingKelasId, activeSemester, toastError]);

  useEffect(() => {
    initData();
  }, [initData]);

  useEffect(() => {
    if (selectedTeacherId && activeSemester) {
      fetchTeacherAssignments();
    }
  }, [selectedTeacherId, activeSemester, fetchTeacherAssignments]);

  useEffect(() => {
    if (activeTab === 'nilai' && selectedMapelId && selectedGradingKelasId && activeSemester) {
      fetchTeacherGrading();
    }
  }, [activeTab, selectedMapelId, selectedGradingKelasId, activeSemester, fetchTeacherGrading]);

  // Aggregate attendance data
  const rekapKehadiran: RekapKehadiranSiswa[] = useMemo(() => {
    return attendanceStudents.map((siswa) => {
      const records = attendanceRecords.filter((r) => r.siswa_id === siswa.id);
      const sakit = records.filter((r) => r.status === 'S').length;
      const izin = records.filter((r) => r.status === 'I').length;
      const alpa = records.filter((r) => r.status === 'A').length;
      const dispen = records.filter((r) => r.status === 'D').length;
      return {
        siswa,
        sakit,
        izin,
        alpa,
        dispen,
        totalAbsen: sakit + izin + alpa + dispen,
      };
    });
  }, [attendanceStudents, attendanceRecords]);

  // Aggregate grading data
  const rekapNilai: RekapNilaiSiswa[] = useMemo(() => {
    const list = gradingStudents.map((siswa) => {
      const nilaiKomponen: Record<string, number | null> = {};
      let total = 0;
      let count = 0;

      komponenList.forEach((comp) => {
        const record = nilaiList.find(
          (n) => n.siswa_id === siswa.id && n.komponen_nilai_id === comp.id
        );
        if (record && typeof record.nilai === 'number') {
          nilaiKomponen[comp.id] = record.nilai;
          total += record.nilai;
          count += 1;
        } else {
          nilaiKomponen[comp.id] = null;
        }
      });

      const avg = count > 0 ? parseFloat((total / count).toFixed(1)) : 0;
      const finalRec = nilaiAkhirList.find((na) => na.siswa_id === siswa.id);
      const finalScore = finalRec && typeof finalRec.nilai_akhir === 'number' ? finalRec.nilai_akhir : avg;

      return {
        siswa,
        nilaiKomponen,
        rataRata: avg,
        nilaiAkhir: finalScore,
      };
    });

    return [...list]
      .sort((a, b) => b.nilaiAkhir - a.nilaiAkhir)
      .map((item, idx) => ({
        ...item,
        ranking: item.nilaiAkhir > 0 ? idx + 1 : undefined,
      }));
  }, [gradingStudents, komponenList, nilaiList, nilaiAkhirList]);

  // Export Attendance
  const handleExportAttendance = () => {
    if (!rekapKehadiran.length) {
      toastError('Tidak Ada Data', 'Tidak ada data kehadiran.');
      return;
    }
    const currentTeacher = teachers.find((t) => t.id === selectedTeacherId)?.full_name || 'Guru';
    const currentKelas = teacherWaliKelas?.nama || 'Kelas';

    const headers = ['No', 'NIS', 'NISN', 'Nama Siswa', 'Sakit', 'Izin', 'Alpa', 'Dispen', 'Total Absen'];
    const rows = rekapKehadiran.map((item, idx) => [
      idx + 1,
      item.siswa.nis,
      item.siswa.nisn || '-',
      item.siswa.nama,
      item.sakit,
      item.izin,
      item.alpa,
      item.dispen,
      item.totalAbsen,
    ]);

    exportToExcel(`Kehadiran_${currentKelas}_Guru_${currentTeacher}.xlsx`, 'Kehadiran', rows, headers);
    toastSuccess('Ekspor Berhasil', 'File rekap kehadiran telah diunduh.');
  };

  // Export Grading
  const handleExportGrading = () => {
    if (!rekapNilai.length) {
      toastError('Tidak Ada Data', 'Tidak ada data nilai.');
      return;
    }
    const currentTeacher = teachers.find((t) => t.id === selectedTeacherId)?.full_name || 'Guru';
    const currentMapel = teacherMapels.find((m) => m.id === selectedMapelId)?.nama || 'Mapel';
    const currentKelas = gradingClasses.find((k) => k.id === selectedGradingKelasId)?.nama || 'Kelas';

    const compHeaders = komponenList.map((c) => c.nama);
    const headers = ['Peringkat', 'NIS', 'NISN', 'Nama Siswa', ...compHeaders, 'Rata-Rata', 'Nilai Akhir'];
    const rows = rekapNilai.map((item) => [
      item.ranking || '-',
      item.siswa.nis,
      item.siswa.nisn || '-',
      item.siswa.nama,
      ...komponenList.map((c) => item.nilaiKomponen[c.id] ?? '-'),
      item.rataRata > 0 ? item.rataRata : '-',
      item.nilaiAkhir > 0 ? item.nilaiAkhir : '-',
    ]);

    exportToExcel(`Nilai_${currentMapel}_Kelas_${currentKelas}_Guru_${currentTeacher}.xlsx`, 'Nilai', rows, headers);
    toastSuccess('Ekspor Berhasil', 'File rekap nilai telah diunduh.');
  };

  if (!roleLoading && !isAdmin) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Akses Dibatasi</h2>
        <p className="text-xs text-slate-500 mt-1">Halaman ini hanya dapat diakses oleh Administrator.</p>
        <Link href="/dashboard" className="mt-4 inline-block">
          <Button variant="primary" size="sm">Kembali ke Dashboard</Button>
        </Link>
      </div>
    );
  }

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Lihat & Edit Semua Data Guru</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supervisi data kehadiran kelas dan penilaian seluruh guru dalam sistem.
          </p>
        </div>
      </div>

      {/* Teacher & Semester Selector Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pilih Guru yang Ingin Disupervisi:
            </label>
            <Select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              options={teachers.map((t) => ({
                value: t.id,
                label: `${t.full_name} (${t.role})`,
              }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Semester Aktif:
            </label>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800">
              {activeSemester
                ? `Semester ${activeSemester.tipe.toUpperCase()} (${activeSemester.tahun_ajaran?.nama || ''})`
                : 'Memuat...'}
            </div>
          </div>
        </div>

        {/* Selected Teacher Profile Pill */}
        {selectedTeacher && (
          <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                {selectedTeacher.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{selectedTeacher.full_name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant={selectedTeacher.role === 'admin' ? 'info' : 'default'} size="sm">
                    {selectedTeacher.role}
                  </Badge>
                  {teacherWaliKelas ? (
                    <span className="text-xs text-slate-600 font-medium">
                      Wali Kelas {teacherWaliKelas.nama}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Bukan Wali Kelas</span>
                  )}
                </div>
              </div>
            </div>

            {teacherMapels.length > 0 && (
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Mapel Diampu: </span>
                {teacherMapels.map((m) => m.nama).join(', ')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('kehadiran')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'kehadiran'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CalendarCheck2 className="w-4 h-4" />
          <span>Kehadiran Kelas Binaan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('nilai')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'nilai'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Nilai Mata Pelajaran</span>
        </button>
      </div>

      {/* TAB 1: KEHADIRAN */}
      {activeTab === 'kehadiran' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-900">
                Rekap Presensi Kelas {teacherWaliKelas ? teacherWaliKelas.nama : '(Belum Ditugaskan)'}
              </p>
              <p className="text-xs text-slate-500">
                Total {attendanceStudents.length} siswa di kelas binaan guru ini.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={handleExportAttendance}
              >
                Unduh Excel
              </Button>

              <Link href="/kehadiran/input">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Edit className="w-4 h-4" />}
                >
                  Edit Presensi
                </Button>
              </Link>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">No</TableHead>
                <TableHead className="w-28">NIS</TableHead>
                <TableHead className="w-32">NISN</TableHead>
                <TableHead>Nama Siswa</TableHead>
                <TableHead className="text-center w-24">Sakit</TableHead>
                <TableHead className="text-center w-24">Izin</TableHead>
                <TableHead className="text-center w-24">Alpa</TableHead>
                <TableHead className="text-center w-24">Dispen</TableHead>
                <TableHead className="text-center w-28">Total Absen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableEmpty colSpan={9} message="Memuat presensi..." />
              ) : !teacherWaliKelas ? (
                <TableEmpty colSpan={9} message="Guru ini tidak ditugaskan sebagai wali kelas di semester aktif." />
              ) : rekapKehadiran.length === 0 ? (
                <TableEmpty colSpan={9} message="Belum ada siswa di kelas ini." />
              ) : (
                rekapKehadiran.map((item, idx) => (
                  <TableRow key={item.siswa.id}>
                    <TableCell className="font-semibold text-slate-400">{idx + 1}</TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-slate-700">{item.siswa.nis}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">{item.siswa.nisn || '-'}</TableCell>
                    <TableCell className="font-semibold text-slate-900">{item.siswa.nama}</TableCell>
                    <TableCell className="text-center">
                      {item.sakit > 0 ? <Badge variant="sakit">{item.sakit}</Badge> : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.izin > 0 ? <Badge variant="izin">{item.izin}</Badge> : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.alpa > 0 ? <Badge variant="alpa">{item.alpa}</Badge> : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.dispen > 0 ? <Badge variant="dispen">{item.dispen}</Badge> : '-'}
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {item.totalAbsen > 0 ? `${item.totalAbsen} hari` : <span className="text-emerald-600 font-normal text-xs">100% Hadir</span>}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* TAB 2: NILAI */}
      {activeTab === 'nilai' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Pilih Mapel:</span>
                <div className="w-44">
                  <Select
                    value={selectedMapelId}
                    onChange={(e) => setSelectedMapelId(e.target.value)}
                    options={teacherMapels.map((m) => ({
                      value: m.id,
                      label: m.nama,
                    }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Pilih Kelas:</span>
                <div className="w-36">
                  <Select
                    value={selectedGradingKelasId}
                    onChange={(e) => setSelectedGradingKelasId(e.target.value)}
                    options={gradingClasses.map((k) => ({
                      value: k.id,
                      label: k.nama,
                    }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={handleExportGrading}
              >
                Unduh Excel
              </Button>

              <Link href="/nilai/input">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Edit className="w-4 h-4" />}
                >
                  Edit Nilai
                </Button>
              </Link>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20 text-center">Ranking</TableHead>
                <TableHead className="w-28">NIS</TableHead>
                <TableHead className="w-32">NISN</TableHead>
                <TableHead>Nama Siswa</TableHead>
                {komponenList.map((comp) => (
                  <TableHead key={comp.id} className="text-center">{comp.nama}</TableHead>
                ))}
                <TableHead className="text-center w-24 bg-slate-100/60">Rata-Rata</TableHead>
                <TableHead className="text-center w-24 bg-blue-50/60 text-blue-900">Nilai Akhir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!selectedMapelId ? (
                <TableEmpty colSpan={komponenList.length + 6} message="Guru ini tidak memiliki mata pelajaran yang diampu." />
              ) : rekapNilai.length === 0 ? (
                <TableEmpty colSpan={komponenList.length + 6} message="Belum ada data siswa di kelas yang dipilih." />
              ) : (
                rekapNilai.map((item) => (
                  <TableRow key={item.siswa.id}>
                    <TableCell className="text-center">
                      {item.ranking === 1 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs">
                          🥇 1
                        </span>
                      ) : item.ranking === 2 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-extrabold text-xs">
                          🥈 2
                        </span>
                      ) : item.ranking === 3 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-extrabold text-xs">
                          🥉 3
                        </span>
                      ) : item.ranking ? (
                        <span className="font-semibold text-slate-500 text-xs">#{item.ranking}</span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-slate-700">{item.siswa.nis}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">{item.siswa.nisn || '-'}</TableCell>
                    <TableCell className="font-semibold text-slate-900">{item.siswa.nama}</TableCell>
                    {komponenList.map((comp) => (
                      <TableCell key={comp.id} className="text-center font-medium">
                        {typeof item.nilaiKomponen[comp.id] === 'number' ? formatNumber(item.nilaiKomponen[comp.id], 1) : '-'}
                      </TableCell>
                    ))}
                    <TableCell className="text-center bg-slate-50/60 font-semibold text-slate-700">
                      {item.rataRata > 0 ? formatNumber(item.rataRata, 1) : '-'}
                    </TableCell>
                    <TableCell className="text-center bg-blue-50/30 font-bold text-blue-900">
                      {item.nilaiAkhir > 0 ? (
                        <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-900 font-bold text-xs">
                          {formatNumber(item.nilaiAkhir, 1)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
