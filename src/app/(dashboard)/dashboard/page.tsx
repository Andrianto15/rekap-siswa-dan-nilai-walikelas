import React from 'react';
import { LayoutDashboard, Users, CalendarCheck2, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
        <h1 className="text-xl md:text-2xl font-bold">Selamat Datang di Portal Wali Kelas</h1>
        <p className="text-blue-100 text-sm mt-1">
          Sistem Rekap Kehadiran dan Penilaian Siswa Semester Ganjil 2026/2027.
        </p>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/siswa"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">Kelola Siswa</h2>
          <p className="text-xs text-slate-500 mt-1">
            Lihat daftar siswa, tambah murid baru, atau impor data dari Excel.
          </p>
        </Link>

        <Link
          href="/kehadiran"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <CalendarCheck2 className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">Input Kehadiran</h2>
          <p className="text-xs text-slate-500 mt-1">
            Catat presensi harian atau bulanan (Sakit, Izin, Alpa) dan unduh rekap.
          </p>
        </Link>

        <Link
          href="/nilai"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">Rekap Nilai & Ranking</h2>
          <p className="text-xs text-slate-500 mt-1">
            Input nilai per mata pelajaran, hitung rata-rata, dan lihat peringkat kelas.
          </p>
        </Link>
      </div>
    </div>
  );
}
