'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, School } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const router = useRouter();
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
        toastError('Gagal Masuk', error.message || 'Email atau password salah');
        setLoading(false);
        return;
      }

      if (data.user) {
        toastSuccess('Berhasil Masuk', 'Mengarahkan ke dashboard...');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: unknown) {
      toastError('Terjadi Kesalahan', (err as Error).message || 'Gagal menghubungkan ke server');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
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

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="nama@sekolah.sch.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Kata Sandi"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <div className="pt-2">
            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
              Masuk ke Aplikasi
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Sistem Informasi Rekap Wali Kelas & Guru Mapel
          </p>
        </div>
      </div>
    </div>
  );
}
