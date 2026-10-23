'use client';

import React, { useEffect, useState } from 'react';
import { CalendarDays, LogOut, Moon, Sun, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';

export function Header() {
  const { profile, signOut } = useAuth();
  const [activeSemester, setActiveSemester] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode =
      document.documentElement.classList.contains('dark') ||
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function fetchActiveSemester() {
      try {
        const { data, error } = await supabase
          .from('semester')
          .select('tipe, tahun_ajaran(nama)')
          .eq('is_active', true)
          .is('deleted_at', null)
          .single();

        if (!isMounted) return;

        if (error || !data) {
          setActiveSemester('Belum Diatur');
        } else {
          const tipe = data.tipe
            ? data.tipe.charAt(0).toUpperCase() + data.tipe.slice(1).toLowerCase()
            : '';
          const tahun = (data.tahun_ajaran as { nama?: string } | null)?.nama || '';
          setActiveSemester([tipe, tahun].filter(Boolean).join(' ') || 'Belum Diatur');
        }
      } catch {
        if (isMounted) setActiveSemester('Belum Diatur');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchActiveSemester();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16 px-4 md:px-8 flex items-center justify-between">
      {/* Left: Active Semester & Breadcrumb status */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4682b4]/10 dark:bg-[#4682b4]/20 border border-[#4682b4]/20 dark:border-[#4682b4]/40 text-[#4682b4] dark:text-[#6ba3ce] text-xs font-semibold">
          <CalendarDays className="w-3.5 h-3.5 text-[#4682b4] dark:text-[#6ba3ce] shrink-0" />
          <span>
            <span className="hidden sm:inline">Semester Aktif: </span>
            {loading ? '...' : (activeSemester || 'Belum Diatur')}
          </span>
        </div>
      </div>

      {/* Right: User profile pill & desktop logout */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 pl-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-semibold text-xs">
            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-none truncate max-w-[140px]">
              {profile?.full_name || 'Pengguna'}
            </p>
            <div className="mt-0.5">
              <Badge variant={profile?.role === 'admin' ? 'info' : 'default'} size="sm">
                {profile?.role === 'admin' ? 'Administrator' : 'Guru / Wali Kelas'}
              </Badge>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-slate-400 dark:text-slate-400 hover:text-[#4682b4] dark:hover:text-[#6ba3ce] hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          aria-label={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
        </button>

        <button
          type="button"
          onClick={signOut}
          className="hidden md:flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
          title="Keluar"
          aria-label="Keluar"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
