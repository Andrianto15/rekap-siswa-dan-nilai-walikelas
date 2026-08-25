'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Users,
  CalendarCheck2,
  GraduationCap,
  Sparkles,
  School,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  CalendarDays,
  GitFork,
  Database,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import type { Semester, Kelas, Mapel, GuruKelas, GuruMapel, Kehadiran } from '@/lib/types';

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const { user, profile } = useAuth();
  const { isAdmin } = useRole();
  const { error: toastError } = useToast();

  const [activeSemester, setActiveSemester] = useState<Semester | null>(null);
  const [loading, setLoading] = useState(true);

  // Guru-specific states
  const [waliKelas, setWaliKelas] = useState<Kelas | null>(null);
  const [ampuMapels, setAmpuMapels] = useState<Mapel[]>([]);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [monthlyAbsences, setMonthlyAbsences] = useState<{ sakit: number; izin: number; alpa: number; dispen: number }>({
    sakit: 0,
    izin: 0,
    alpa: 0,
    dispen: 0,
  });

  // Admin-specific stats
  const [adminStats, setAdminStats] = useState<{
    totalKelas: number;
    totalGuru: number;
    totalSiswa: number;
    totalMapel: number;
  }>({
    totalKelas: 0,
    totalGuru: 0,
    totalSiswa: 0,
    totalMapel: 0,
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Get active semester
      const { data: semData } = await supabase
        .from('semester')
        .select(`*, tahun_ajaran (*)`)
        .eq('is_active', true)
        .is('deleted_at', null)
        .single();

      if (semData) {
        setActiveSemester(semData as unknown as Semester);

        if (isAdmin) {
          // Admin Stats
          const [kRes, gRes, sRes, mRes] = await Promise.all([
            supabase.from('kelas').select('id', { count: 'exact', head: true }).is('deleted_at', null),
            supabase.from('profiles').select('id', { count: 'exact', head: true }).is('deleted_at', null),
            supabase.from('siswa').select('id', { count: 'exact', head: true }).eq('semester_id', semData.id).is('deleted_at', null),
            supabase.from('mapel').select('id', { count: 'exact', head: true }).is('deleted_at', null),
          ]);

          setAdminStats({
            totalKelas: kRes.count || 0,
            totalGuru: gRes.count || 0,
            totalSiswa: sRes.count || 0,
            totalMapel: mRes.count || 0,
          });
        }

        // Guru Stats
        if (user) {
          // Wali Kelas assignment
          const { data: wkData } = await supabase
            .from('guru_kelas')
            .select(`*, kelas (*)`)
            .eq('guru_id', user.id)
            .eq('semester_id', semData.id)
            .is('deleted_at', null)
            .single();

          if (wkData && (wkData as unknown as GuruKelas).kelas) {
            const currentKelas = (wkData as unknown as GuruKelas).kelas as Kelas;
            setWaliKelas(currentKelas);

            // Student count for this class
            const { count: sCount, data: sData } = await supabase
              .from('siswa')
              .select('id', { count: 'exact' })
              .eq('kelas_id', currentKelas.id)
              .eq('semester_id', semData.id)
              .is('deleted_at', null);

            setStudentCount(sCount || 0);

            // Current month attendance records
            if (sData && sData.length > 0) {
              const now = new Date();
              const year = now.getFullYear();
              const month = now.getMonth() + 1;
              const daysInMonth = new Date(year, month, 0).getDate();
              const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
              const endDate = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

              const sIds = sData.map((s) => s.id);
              const { data: attData } = await supabase
                .from('kehadiran')
                .select('*')
                .eq('semester_id', semData.id)
                .gte('tanggal', startDate)
                .lte('tanggal', endDate)
                .in('siswa_id', sIds)
                .is('deleted_at', null);

              const records = (attData || []) as unknown as Kehadiran[];
              setMonthlyAbsences({
                sakit: records.filter((r) => r.status === 'S').length,
                izin: records.filter((r) => r.status === 'I').length,
                alpa: records.filter((r) => r.status === 'A').length,
                dispen: records.filter((r) => r.status === 'D').length,
              });
            }
          }

          // Mata Pelajaran yang diampu
          const { data: gmData } = await supabase
            .from('guru_mapel')
            .select(`*, mapel (*)`)
            .eq('guru_id', user.id)
            .eq('semester_id', semData.id)
            .is('deleted_at', null);

          if (gmData) {
            const mapels = gmData
              .map((item) => (item as unknown as GuruMapel).mapel)
              .filter(Boolean) as Mapel[];
            setAmpuMapels(mapels);
          }
        }
      }
    } catch (err: unknown) {
      toastError('Gagal Mengambil Data Dashboard', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [supabase, user, isAdmin, toastError]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const currentMonthName = useMemo(() => {
    return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date());
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 p-6 md:p-8 text-white shadow-xl shadow-blue-600/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {activeSemester
                  ? `Semester ${activeSemester.tipe.toUpperCase()} ${activeSemester.tahun_ajaran?.nama || ''}`
                  : 'Memuat Semester...'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Selamat Datang, {profile?.full_name || 'Bapak/Ibu Guru'}!
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              Portal Rekap Kehadiran dan Penilaian Siswa. Pantau presensi dan hasil belajar kelas binaan secara terpadu.
            </p>
          </div>

          {/* Quick status pill */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col gap-1 min-w-[200px]">
            <span className="text-[11px] text-blue-200 uppercase font-bold tracking-wider">
              Status Penugasan
            </span>
            <p className="text-sm font-bold text-white">
              {waliKelas ? `Wali Kelas ${waliKelas.nama}` : isAdmin ? 'Administrator Sistem' : 'Belum Ditugaskan'}
            </p>
            {ampuMapels.length > 0 && (
              <p className="text-xs text-blue-200 truncate max-w-[220px]">
                Mengajar: {ampuMapels.map((m) => m.nama).join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Admin Stats Grid (If Admin) */}
      {isAdmin && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Statistik Master Data Sekolah
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-2">
                <School className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-500 font-medium">Total Kelas</p>
              <p className="text-xl font-extrabold text-slate-900">{adminStats.totalKelas}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-2">
                <UserCheck className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-500 font-medium">Total Guru / Akun</p>
              <p className="text-xl font-extrabold text-slate-900">{adminStats.totalGuru}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-2">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-500 font-medium">Total Siswa Aktif</p>
              <p className="text-xl font-extrabold text-slate-900">{adminStats.totalSiswa}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-2">
                <BookOpen className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-500 font-medium">Mata Pelajaran</p>
              <p className="text-xl font-extrabold text-slate-900">{adminStats.totalMapel}</p>
            </div>
          </div>
        </div>
      )}

      {/* Guru / Wali Kelas Monthly Attendance Summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Presensi Kelas {waliKelas ? waliKelas.nama : ''} ({currentMonthName})
            </h2>
          </div>
          <Link href="/kehadiran" className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1">
            <span>Lihat Rekap Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 font-medium">Siswa di Kelas</span>
              <Badge variant="default" size="sm">Binaan</Badge>
            </div>
            <p className="text-2xl font-black text-slate-900">{loading ? '...' : studentCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Siswa terdaftar aktif</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 font-medium">Sakit (S)</span>
              <Badge variant="sakit" size="sm">Bulan Ini</Badge>
            </div>
            <p className="text-2xl font-black text-amber-600">{loading ? '...' : monthlyAbsences.sakit}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Hari tidak hadir</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 font-medium">Izin (I)</span>
              <Badge variant="izin" size="sm">Bulan Ini</Badge>
            </div>
            <p className="text-2xl font-black text-blue-600">{loading ? '...' : monthlyAbsences.izin}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Hari dengan keterangan</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 font-medium">Alpa (A)</span>
              <Badge variant="alpa" size="sm">Bulan Ini</Badge>
            </div>
            <p className="text-2xl font-black text-rose-600">{loading ? '...' : monthlyAbsences.alpa}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Tanpa keterangan</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 font-medium">Dispen (D)</span>
              <Badge variant="dispen" size="sm">Bulan Ini</Badge>
            </div>
            <p className="text-2xl font-black text-purple-600">{loading ? '...' : monthlyAbsences.dispen}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Dispensasi resmi</p>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
          Aksi Cepat & Navigasi
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/kehadiran/input"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <CalendarCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                Input Kehadiran Hari Ini
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Catat presensi harian atau perbarui grid absensi bulanan siswa kelas binaan.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-blue-600 gap-1">
              <span>Buka Presensi</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            href="/nilai/input"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-md transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                Input Nilai Siswa
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Masukkan nilai per komponen (UH/UTS/UAS), hitung rata-rata, dan tentukan nilai akhir.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 gap-1">
              <span>Buka Penilaian</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            href="/siswa"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition">
                Kelola Data Siswa
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Lihat daftar nama siswa, tambah siswa baru, atau impor data massal dari file Excel.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-emerald-600 gap-1">
              <span>Buka Data Siswa</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>
      </div>

      {/* Admin Quick Links (If Admin) */}
      {isAdmin && (
        <div className="bg-slate-100/70 p-5 rounded-3xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Pintasan Menu Administrator
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <Link
              href="/admin/periode"
              className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-400 text-center flex flex-col items-center gap-1.5 transition text-slate-800 hover:text-blue-600"
            >
              <CalendarDays className="w-5 h-5 text-slate-500" />
              <span className="text-xs font-semibold">Tahun & Sem</span>
            </Link>

            <Link
              href="/admin/kelas"
              className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-400 text-center flex flex-col items-center gap-1.5 transition text-slate-800 hover:text-blue-600"
            >
              <School className="w-5 h-5 text-slate-500" />
              <span className="text-xs font-semibold">Master Kelas</span>
            </Link>

            <Link
              href="/admin/mapel"
              className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-400 text-center flex flex-col items-center gap-1.5 transition text-slate-800 hover:text-blue-600"
            >
              <BookOpen className="w-5 h-5 text-slate-500" />
              <span className="text-xs font-semibold">Master Mapel</span>
            </Link>

            <Link
              href="/admin/users"
              className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-400 text-center flex flex-col items-center gap-1.5 transition text-slate-800 hover:text-blue-600"
            >
              <UserCheck className="w-5 h-5 text-slate-500" />
              <span className="text-xs font-semibold">Kelola User</span>
            </Link>

            <Link
              href="/admin/mapping"
              className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-400 text-center flex flex-col items-center gap-1.5 transition text-slate-800 hover:text-blue-600"
            >
              <GitFork className="w-5 h-5 text-slate-500" />
              <span className="text-xs font-semibold">Mapping Guru</span>
            </Link>

            <Link
              href="/admin/data"
              className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-400 text-center flex flex-col items-center gap-1.5 transition text-slate-800 hover:text-blue-600"
            >
              <Database className="w-5 h-5 text-slate-500" />
              <span className="text-xs font-semibold">Semua Data</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
