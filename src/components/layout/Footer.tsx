import React from 'react';
import packageJson from '../../../package.json';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xs mt-auto pb-24 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        <div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Rekap Siswa &amp; Nilai Wali Kelas
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            &copy; {currentYear === 2026 ? '2026' : `2026 - ${currentYear}`} Andrianto Nur Iskandar. Hak cipta dilindungi undang-undang.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
            v{packageJson.version}
          </span>
          <span className="text-slate-300 dark:text-slate-700">&bull;</span>
          <span className="text-[11px]">Lisensi MIT</span>
        </div>
      </div>
    </footer>
  );
}
