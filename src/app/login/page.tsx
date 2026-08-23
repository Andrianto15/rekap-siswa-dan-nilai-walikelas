'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, School, ShieldAlert } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

import packageJson from '../../../package.json';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const errorParam = searchParams.get('error');

  const { error: toastError, success: toastSuccess } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toastError('Gagal Masuk', error.message || 'Email atau kata sandi tidak valid');
        setLoading(false);
        return;
      }

      if (data.user) {
        // Fetch user profile to verify role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        toastSuccess('Berhasil Masuk', 'Selamat datang kembali!');

        // Role-based target redirect
        if (redirectUrl && redirectUrl !== '/login') {
          router.push(redirectUrl);
        } else if (profile?.role === 'admin') {
          router.push('/dashboard');
        } else {
          router.push('/dashboard');
        }

        router.refresh();
      }
    } catch (err: unknown) {
      toastError('Terjadi Kesalahan', (err as Error).message || 'Gagal terhubung ke server');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
          <School className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Rekap Siswa & Nilai</h1>
        <p className="text-sm text-slate-500 mt-1">
          Masuk dengan akun guru atau administrator
        </p>
      </div>

      {errorParam && (
        <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-amber-800 text-xs">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Sesi login telah berakhir atau gagal. Silakan masuk kembali.</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="nama@sekolah.sch.id"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <Input
          label="Kata Sandi"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          leftIcon={<Lock className="w-4 h-4" />}
        />

        <div className="pt-2">
          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
            Masuk ke Aplikasi
          </Button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-1.5">
        <p className="text-xs text-slate-500">
          Sistem Informasi Rekap Wali Kelas &amp; Guru Mapel
        </p>
        <p className="text-[11px] text-slate-400">
          v{packageJson.version} &bull; &copy; 2026 - {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-slate-400 text-sm">Memuat form login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
