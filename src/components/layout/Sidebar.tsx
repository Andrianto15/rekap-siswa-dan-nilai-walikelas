'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  GraduationCap,
  CalendarDays,
  School,
  BookOpen,
  UserCheck,
  GitFork,
  Database,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/hooks/useAuth';

export function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useRole();
  const { signOut } = useAuth();

  const guruNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Data Siswa', href: '/siswa', icon: Users },
    { name: 'Kehadiran', href: '/kehadiran', icon: CalendarCheck2 },
    { name: 'Rekap Nilai', href: '/nilai', icon: GraduationCap },
  ];

  const adminNavItems = [
    { name: 'Tahun & Semester', href: '/admin/periode', icon: CalendarDays },
    { name: 'Kelola Kelas', href: '/admin/kelas', icon: School },
    { name: 'Mata Pelajaran', href: '/admin/mapel', icon: BookOpen },
    { name: 'Manajemen User', href: '/admin/users', icon: UserCheck },
    { name: 'Mapping Guru', href: '/admin/mapping', icon: GitFork },
    { name: 'Lihat Semua Data', href: '/admin/data', icon: Database },
  ];

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-100 dark:border-slate-800">
        <div className="w-9 h-9 rounded-lg bg-[#4682b4] flex items-center justify-center text-white shadow-xs font-bold text-lg">
          R
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">Rekap Siswa</h1>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Wali Kelas & Guru</p>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Menu Utama
          </p>
          <nav className="space-y-1">
            {guruNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
                    isActive
                      ? 'bg-[#4682b4]/10 dark:bg-[#4682b4]/20 text-[#4682b4] dark:text-[#6ba3ce] font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                  )}
                >
                  <Icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-[#4682b4] dark:text-[#6ba3ce]' : 'text-slate-400 dark:text-slate-500')} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {isAdmin && (
          <div>
            <div className="flex items-center gap-1.5 px-3 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4682b4] dark:text-[#6ba3ce]" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#4682b4] dark:text-[#6ba3ce]">
                Administrator
              </p>
            </div>
            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
                      isActive
                        ? 'bg-[#4682b4]/10 dark:bg-[#4682b4]/20 text-[#4682b4] dark:text-[#6ba3ce] font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                    )}
                  >
                    <Icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-[#4682b4] dark:text-[#6ba3ce]' : 'text-slate-400 dark:text-slate-500')} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer min-h-[44px]"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
