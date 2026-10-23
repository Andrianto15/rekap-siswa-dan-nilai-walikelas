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
  Moon,
  Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/hooks/useAuth';

export function BottomNav() {
  const pathname = usePathname();
  const { isAdmin } = useRole();
  const { signOut, profile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));
    }
  }, [isMenuOpen]);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

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
          <div className="relative bg-white dark:bg-slate-900 rounded-t-2xl border-t border-slate-200 dark:border-slate-800 p-6 z-10 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 safe-bottom">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">{profile?.full_name || 'Pengguna'}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{profile?.role || 'Guru'}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-full"
                aria-label="Tutup menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isAdmin && (
              <div className="mb-6">
                <div className="flex items-center gap-1.5 mb-3 text-[#4682b4] dark:text-[#6ba3ce]">
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
                        className="flex flex-col items-center justify-center p-3 min-h-[56px] rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-[#4682b4]/10 dark:hover:bg-[#4682b4]/20 hover:text-[#4682b4] dark:hover:text-[#6ba3ce] transition text-center gap-1.5 border border-slate-100 dark:border-slate-800"
                      >
                        <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                {isDark ? <Moon className="w-4 h-4 text-[#6ba3ce]" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Tema Tampilan</span>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition"
              >
                {isDark ? 'Mode Gelap' : 'Mode Terang'}
              </button>
            </div>

            <button
              type="button"
              onClick={signOut}
              className="flex items-center justify-center gap-2 w-full min-h-[44px] py-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold text-sm hover:bg-rose-100 dark:hover:bg-rose-900/60 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar Akun</span>
            </button>
          </div>
        </div>
      )}

      {/* Fixed Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-1 safe-bottom">
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
                  'flex flex-col items-center justify-center min-h-[44px] py-1 px-3 rounded-lg transition-all duration-150',
                  isActive ? 'text-[#4682b4] dark:text-[#6ba3ce] font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
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
            className="flex flex-col items-center justify-center min-h-[44px] py-1 px-3 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
            aria-label="Menu lainnya"
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Lainnya</span>
          </button>
        </div>
      </nav>
    </>
  );
}
