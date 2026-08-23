'use client';

import React from 'react';
import { Sparkles, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/Badge';

export function Header() {
  const { profile, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 px-4 md:px-8 flex items-center justify-between">
      {/* Left: Active Semester & Breadcrumb status */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span>Semester Aktif: Ganjil 2026/2027</span>
        </div>
      </div>

      {/* Right: User profile pill & desktop logout */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 pl-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs">
            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-none truncate max-w-[140px]">
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
          onClick={signOut}
          className="hidden md:flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
          title="Keluar"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
