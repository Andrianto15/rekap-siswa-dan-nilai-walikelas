'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  GraduationCap,
  Menu,
  X,
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

export function BottomNav() {
  const pathname = usePathname();
  const { isAdmin } = useRole();
  const { signOut, profile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mainItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Siswa', href: '/siswa', icon: Users },
    { name: 'Absen', href: '/kehadiran', icon: CalendarCheck2 },
    { name: 'Nilai', href: '/nilai', icon: GraduationCap },
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
    <>
      {/* Mobile Drawer Menu for Admin / Profile */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="relative bg-white rounded-t-3xl border-t border-slate-200 p-6 z-10 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900">{profile?.full_name || 'Pengguna'}</h3>
                <p className="text-xs text-slate-500 capitalize">{profile?.role || 'Guru'}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isAdmin && (
              <div className="mb-6">
                <div className="flex items-center gap-1.5 mb-3 text-blue-600">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Menu Admin</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition text-center gap-2 border border-slate-100"
                      >
                        <Icon className="w-5 h-5 text-slate-600" />
                        <span className="text-xs font-medium text-slate-800">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={signOut}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-rose-50 text-rose-600 font-semibold text-sm hover:bg-rose-100 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar Akun</span>
            </button>
          </div>
        </div>
      )}

      {/* Fixed Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 safe-bottom">
        <div className="flex items-center justify-around">
          {mainItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150',
                  isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
                )}
              >
                <Icon className={cn('w-5 h-5 mb-0.5', isActive && 'stroke-[2.5px]')} />
                <span className="text-[10px]">{item.name}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Lainnya</span>
          </button>
        </div>
      </nav>
    </>
  );
}
