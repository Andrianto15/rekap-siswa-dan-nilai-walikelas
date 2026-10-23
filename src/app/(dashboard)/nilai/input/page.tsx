'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  GraduationCap,
  Settings2,
  Plus,
  Trash2,
  Edit2,
  Save,
  Calculator,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { formatNumber } from '@/lib/utils';
import type { Siswa, Kelas, Mapel, Semester, KomponenNilai, GuruKelas, GuruMapel } from '@/lib/types';

export default function InputNilaiPage() {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();
  const { isAdmin } = useRole();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const confirm = useConfirm();

  const [activeSemester, setActiveSemester] = useState<Semester | null>(null);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelasId, setSelectedKelasId] = useState<string>('');

  const [mapelList, setMapelList] = useState<Mapel[]>([]);
  const [selectedMapelId, setSelectedMapelId] = useState<string>('');

  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [komponenList, setKomponenList] = useState<KomponenNilai[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Scores matrix: { [siswa_id]: { [komponen_id]: number | '' } }
  const [scoresMap, setScoresMap] = useState<Record<string, Record<string, number | ''>>>({});

  // Final scores override matrix: { [siswa_id]: number | '' }
  const [finalScoresMap, setFinalScoresMap] = useState<Record<string, number | ''>>({});

  // Modal: Manage Components (T-037)
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [compName, setCompName] = useState('');
  const [compOrder, setCompOrder] = useState<number>(1);
  const [editingComp, setEditingComp] = useState<KomponenNilai | null>(null);
  const [savingComp, setSavingComp] = useState(false);

  // 1. Initial metadata
  const initData = useCallback(async () => {
    try {
      const { data: semData } = await supabase
        .from('semester')
        .select(`*, tahun_ajaran (*)`)
        .eq('is_active', true)
        .is('deleted_at', null)
        .single();

      if (semData) {
        setActiveSemester(semData as unknown as Semester);

        // Fetch Kelas
        const { data: kData } = await supabase
          .from('kelas')
          .select('*')
          .is('deleted_at', null)
          .order('nama', { ascending: true });
        if (kData) setKelasList(kData);

        // Fetch Mapel
        const { data: mData } = await supabase
          .from('mapel')
          .select('*')
          .is('deleted_at', null)
          .order('nama', { ascending: true });
        if (mData) setMapelList(mData);

        // Teacher assignments
        if (user && !isAdmin) {
          const { data: guruKelasData } = await supabase
            .from('guru_kelas')
            .select('*')
            .eq('guru_id', user.id)
            .eq('semester_id', semData.id)
            .is('deleted_at', null)
            .single();

          if (guruKelasData) {
            setSelectedKelasId((guruKelasData as GuruKelas).kelas_id);
          } else if (kData && kData.length > 0) {
            setSelectedKelasId(kData[0].id);
          }

          const { data: guruMapelData } = await supabase
            .from('guru_mapel')
            .select('*')
            .eq('guru_id', user.id)
            .eq('semester_id', semData.id)
            .is('deleted_at', null)
            .limit(1)
            .single();

          if (guruMapelData) {
            setSelectedMapelId((guruMapelData as GuruMapel).mapel_id);
          } else if (mData && mData.length > 0) {
            setSelectedMapelId(mData[0].id);
          }
        } else {
          if (kData && kData.length > 0) setSelectedKelasId(kData[0].id);
          if (mData && mData.length > 0) setSelectedMapelId(mData[0].id);
        }
      }
    } catch (err: unknown) {
      toastError('Gagal Mengambil Data Awal', (err as Error).message);
    }
  }, [supabase, user, isAdmin, toastError]);

  // 2. Fetch components for selected mapel & semester
  const fetchKomponen = useCallback(async () => {
    if (!selectedMapelId || !activeSemester) return;
    try {
      const { data, error } = await supabase
        .from('komponen_nilai')
        .select('*')
        .eq('mapel_id', selectedMapelId)
        .eq('semester_id', activeSemester.id)
        .is('deleted_at', null)
        .order('urutan', { ascending: true });

      if (error) throw error;
      setKomponenList(data || []);
    } catch (err: unknown) {
      toastError('Gagal Memuat Komponen Nilai', (err as Error).message);
    }
  }, [supabase, selectedMapelId, activeSemester, toastError]);

  // 3. Fetch students and existing scores
  const fetchGradingData = useCallback(async () => {
    if (!selectedKelasId || !selectedMapelId || !activeSemester) return;
    setLoading(true);

    try {
      // 3.1 Get students
      const { data: sData, error: sError } = await supabase
        .from('siswa')
        .select('*')
        .eq('kelas_id', selectedKelasId)
        .eq('semester_id', activeSemester.id)
        .is('deleted_at', null)
        .order('nama', { ascending: true });

      if (sError) throw sError;
      const students: Siswa[] = sData || [];
      setSiswaList(students);

      if (students.length > 0) {
        const studentIds = students.map((s) => s.id);

        // 3.2 Get existing component scores
        const { data: nData, error: nError } = await supabase
          .from('nilai')
          .select('*')
          .eq('semester_id', activeSemester.id)
          .in('siswa_id', studentIds)
          .is('deleted_at', null);

        if (nError) throw nError;

        // Populate scores map
        const newScoresMap: Record<string, Record<string, number | ''>> = {};
        students.forEach((s) => {
          newScoresMap[s.id] = {};
        });

        (nData || []).forEach((row) => {
          if (newScoresMap[row.siswa_id]) {
            newScoresMap[row.siswa_id][row.komponen_nilai_id] = row.nilai;
          }
        });
        setScoresMap(newScoresMap);

        // 3.3 Get existing final scores (nilai_akhir)
        const { data: naData, error: naError } = await supabase
          .from('nilai_akhir')
          .select('*')
          .eq('mapel_id', selectedMapelId)
          .eq('semester_id', activeSemester.id)
          .in('siswa_id', studentIds)
          .is('deleted_at', null);

        if (naError) throw naError;

        const newFinalMap: Record<string, number | ''> = {};
        students.forEach((s) => {
          newFinalMap[s.id] = '';
        });

        (naData || []).forEach((row) => {
          newFinalMap[row.siswa_id] = row.nilai_akhir;
        });
        setFinalScoresMap(newFinalMap);
      }
    } catch (err: unknown) {
      toastError('Gagal Memuat Data Nilai', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [supabase, selectedKelasId, selectedMapelId, activeSemester, toastError]);

  useEffect(() => {
    initData();
  }, [initData]);

  useEffect(() => {
    if (selectedMapelId && activeSemester) {
      fetchKomponen();
    }
  }, [selectedMapelId, activeSemester, fetchKomponen]);

  useEffect(() => {
    if (selectedKelasId && selectedMapelId && activeSemester) {
      fetchGradingData();
    }
  }, [selectedKelasId, selectedMapelId, activeSemester, fetchGradingData]);

  // Handle score change in matrix cell
  const handleScoreChange = (siswaId: string, compId: string, val: string) => {
    let numVal: number | '' = '';
    if (val !== '') {
      const parsed = parseFloat(val);
      if (!isNaN(parsed)) {
        numVal = Math.min(Math.max(parsed, 0), 100);
      }
    }

    setScoresMap((prev) => ({
      ...prev,
      [siswaId]: {
        ...(prev[siswaId] || {}),
        [compId]: numVal,
      },
    }));
  };

  // Calculate average for student
  const calculateStudentAvg = (siswaId: string): number => {
    const studentScores = scoresMap[siswaId] || {};
    let total = 0;
    let count = 0;

    komponenList.forEach((comp) => {
      const val = studentScores[comp.id];
      if (typeof val === 'number') {
        total += val;
        count += 1;
      }
    });

    if (count === 0) return 0;
    return parseFloat((total / count).toFixed(1));
  };

  // Handle final score override change
  const handleFinalScoreChange = (siswaId: string, val: string) => {
    let numVal: number | '' = '';
    if (val !== '') {
      const parsed = parseFloat(val);
      if (!isNaN(parsed)) {
        numVal = Math.min(Math.max(parsed, 0), 100);
      }
    }

    setFinalScoresMap((prev) => ({
      ...prev,
      [siswaId]: numVal,
    }));
  };

  // Fill final score with calculated average
  const handleAutoFillFinalScores = () => {
    const updated: Record<string, number | ''> = {};
    siswaList.forEach((s) => {
      const avg = calculateStudentAvg(s.id);
      updated[s.id] = avg > 0 ? avg : '';
    });
    setFinalScoresMap(updated);
    toastInfo('Kalkulasi Otomatis', 'Nilai akhir diisi otomatis dengan nilai rata-rata.');
  };

  // Save all scores & final scores
  const handleSaveAllGrades = async () => {
    if (!activeSemester || !selectedMapelId || !siswaList.length) return;
    setSaving(true);

    try {
      const effectiveGuruId = user?.id || '00000000-0000-0000-0000-000000000000';
      const studentIds = siswaList.map((s) => s.id);
      const compIds = komponenList.map((c) => c.id);

      // 1. Prepare component scores payload
      const nilaiRows: {
        siswa_id: string;
        komponen_nilai_id: string;
        semester_id: string;
        nilai: number;
        updated_at: string;
      }[] = [];

      siswaList.forEach((s) => {
        const studentScores = scoresMap[s.id] || {};
        komponenList.forEach((c) => {
          const score = studentScores[c.id];
          if (typeof score === 'number') {
            nilaiRows.push({
              siswa_id: s.id,
              komponen_nilai_id: c.id,
              semester_id: activeSemester.id,
              nilai: score,
              updated_at: new Date().toISOString(),
            });
          }
        });
      });

      // Save / Update nilai
      if (nilaiRows.length > 0) {
        const { data: existingNilai, error: fetchNilaiErr } = await supabase
          .from('nilai')
          .select('id, siswa_id, komponen_nilai_id')
          .in('siswa_id', studentIds)
          .in('komponen_nilai_id', compIds);

        if (fetchNilaiErr) throw fetchNilaiErr;

        const existingNilaiMap = new Map(
          (existingNilai || []).map((n) => [`${n.siswa_id}_${n.komponen_nilai_id}`, n.id])
        );

        const nilaiToInsert: {
          siswa_id: string;
          komponen_nilai_id: string;
          semester_id: string;
          nilai: number;
          created_at: string;
          updated_at: string;
        }[] = [];
        const nilaiUpdatePromises: Promise<{ error: unknown }>[] = [];

        nilaiRows.forEach((row) => {
          const key = `${row.siswa_id}_${row.komponen_nilai_id}`;
          const existingId = existingNilaiMap.get(key);
          if (existingId) {
            nilaiUpdatePromises.push(
              supabase
                .from('nilai')
                .update({
                  nilai: row.nilai,
                  deleted_at: null,
                  updated_at: row.updated_at,
                })
                .eq('id', existingId) as unknown as Promise<{ error: unknown }>
            );
          } else {
            nilaiToInsert.push({
              ...row,
              created_at: row.updated_at,
            });
          }
        });

        if (nilaiToInsert.length > 0) {
          const { error: insertNilaiErr } = await supabase.from('nilai').insert(nilaiToInsert);
          if (insertNilaiErr) throw insertNilaiErr;
        }
        if (nilaiUpdatePromises.length > 0) {
          const results = await Promise.all(nilaiUpdatePromises);
          const firstErr = results.find((r) => r.error)?.error;
          if (firstErr) throw firstErr;
        }
      }

      // 2. Prepare final scores payload
      const nilaiAkhirRows: {
        siswa_id: string;
        mapel_id: string;
        guru_id: string;
        semester_id: string;
        rata_rata: number;
        nilai_akhir: number;
        updated_at: string;
      }[] = [];

      siswaList.forEach((s) => {
        const avg = calculateStudentAvg(s.id);
        const finalVal = typeof finalScoresMap[s.id] === 'number' ? (finalScoresMap[s.id] as number) : avg;

        if (avg > 0 || finalVal > 0) {
          nilaiAkhirRows.push({
            siswa_id: s.id,
            mapel_id: selectedMapelId,
            guru_id: effectiveGuruId,
            semester_id: activeSemester.id,
            rata_rata: avg,
            nilai_akhir: finalVal,
            updated_at: new Date().toISOString(),
          });
        }
      });

      // Save / Update nilai_akhir
      if (nilaiAkhirRows.length > 0) {
        const { data: existingNA, error: fetchNAErr } = await supabase
          .from('nilai_akhir')
          .select('id, siswa_id')
          .in('siswa_id', studentIds)
          .eq('mapel_id', selectedMapelId)
          .eq('semester_id', activeSemester.id);

        if (fetchNAErr) throw fetchNAErr;

        const existingNAMap = new Map((existingNA || []).map((na) => [na.siswa_id, na.id]));
        const naToInsert: {
          siswa_id: string;
          mapel_id: string;
          guru_id: string;
          semester_id: string;
          rata_rata: number;
          nilai_akhir: number;
          created_at: string;
          updated_at: string;
        }[] = [];
        const naUpdatePromises: Promise<{ error: unknown }>[] = [];

        nilaiAkhirRows.forEach((row) => {
          const existingId = existingNAMap.get(row.siswa_id);
          if (existingId) {
            naUpdatePromises.push(
              supabase
                .from('nilai_akhir')
                .update({
                  guru_id: row.guru_id,
                  rata_rata: row.rata_rata,
                  nilai_akhir: row.nilai_akhir,
                  deleted_at: null,
                  updated_at: row.updated_at,
                })
                .eq('id', existingId) as unknown as Promise<{ error: unknown }>
            );
          } else {
            naToInsert.push({
              ...row,
              created_at: row.updated_at,
            });
          }
        });

        if (naToInsert.length > 0) {
          const { error: insertNAErr } = await supabase.from('nilai_akhir').insert(naToInsert);
          if (insertNAErr) throw insertNAErr;
        }
        if (naUpdatePromises.length > 0) {
          const naResults = await Promise.all(naUpdatePromises);
          const firstErr = naResults.find((r) => r.error)?.error;
          if (firstErr) throw firstErr;
        }
      }

      toastSuccess('Berhasil Disimpan', 'Nilai komponen dan nilai akhir berhasil disimpan.');
      fetchGradingData();
    } catch (err: unknown) {
      toastError('Gagal Menyimpan Nilai', (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Manage component save (T-037)
  const handleSaveComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim() || !selectedMapelId || !activeSemester) return;
    setSavingComp(true);

    try {
      const effectiveGuruId = user?.id || '00000000-0000-0000-0000-000000000000';

      if (editingComp) {
        const { error } = await supabase
          .from('komponen_nilai')
          .update({
            nama: compName.trim(),
            urutan: compOrder,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingComp.id);

        if (error) throw error;
        toastSuccess('Berhasil', 'Komponen nilai diperbarui.');
      } else {
        if (komponenList.length >= 5) {
          toastError('Batas Maksimal', 'Maksimal 5 komponen nilai per mata pelajaran.');
          setSavingComp(false);
          return;
        }

        const { error } = await supabase.from('komponen_nilai').insert({
          mapel_id: selectedMapelId,
          guru_id: effectiveGuruId,
          semester_id: activeSemester.id,
          nama: compName.trim(),
          urutan: compOrder,
        });

        if (error) throw error;
        toastSuccess('Berhasil', 'Komponen nilai baru ditambahkan.');
      }

      setCompName('');
      setEditingComp(null);
      fetchKomponen();
    } catch (err: unknown) {
      toastError('Gagal Menyimpan Komponen', (err as Error).message);
    } finally {
      setSavingComp(false);
    }
  };

  // Delete Component
  const handleDeleteComponent = async (id: string, name: string) => {
    const isConfirmed = await confirm({
      title: 'Hapus Komponen Nilai',
      message: `Hapus komponen "${name}"? Seluruh nilai terkait komponen ini akan dihapus.`,
      confirmText: 'Hapus Komponen',
      variant: 'danger',
    });
    if (!isConfirmed) return;

    try {
      const { error } = await supabase
        .from('komponen_nilai')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
      toastSuccess('Berhasil', `Komponen ${name} dihapus.`);
      fetchKomponen();
      fetchGradingData();
    } catch (err: unknown) {
      toastError('Gagal Menghapus Komponen', (err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/nilai"
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
            title="Kembali ke Rekap Nilai"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Input Nilai Siswa</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Input nilai per komponen (0-100), kalkulasi rata-rata otomatis, dan sesuaikan nilai akhir.
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Settings2 className="w-4 h-4 text-slate-600" />}
            onClick={() => {
              setEditingComp(null);
              setCompName('');
              setCompOrder(komponenList.length + 1);
              setIsCompModalOpen(true);
            }}
          >
            Atur Komponen ({komponenList.length}/5)
          </Button>

          <Button
            variant="primary"
            size="sm"
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
            onClick={handleSaveAllGrades}
          >
            Simpan Nilai
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Kelas:</span>
            <div className="w-36">
              <Select
                value={selectedKelasId}
                onChange={(e) => setSelectedKelasId(e.target.value)}
                options={kelasList.map((k) => ({
                  value: k.id,
                  label: k.nama,
                }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Mata Pelajaran:</span>
            <div className="w-48">
              <Select
                value={selectedMapelId}
                onChange={(e) => setSelectedMapelId(e.target.value)}
                options={mapelList.map((m) => ({
                  value: m.id,
                  label: m.nama,
                }))}
              />
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<Calculator className="w-4 h-4 text-blue-600" />}
          onClick={handleAutoFillFinalScores}
        >
          Isi Nilai Akhir = Rata-Rata
        </Button>
      </div>

      {/* Grading Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Tabel Nilai Siswa ({siswaList.length})
          </span>
          <span className="text-[11px] text-slate-500">
            {komponenList.length === 0
              ? 'Belum ada komponen nilai. Klik "Atur Komponen" di atas.'
              : `${komponenList.length} komponen penilaian aktif`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100/90 text-slate-700 font-semibold border-b">
              <tr>
                <th className="p-3 w-12 text-center">No</th>
                <th className="p-3 w-32">NISN</th>
                <th className="p-3 w-28">NIS</th>
                <th className="p-3 min-w-[160px]">Nama Siswa</th>
                {komponenList.map((comp) => (
                  <th key={comp.id} className="p-3 text-center min-w-[100px]">
                    <div className="font-bold text-slate-800">{comp.nama}</div>
                    <div className="text-[10px] text-slate-400 font-normal">Urutan #{comp.urutan}</div>
                  </th>
                ))}
                <th className="p-3 text-center w-28 bg-slate-200/50">Rata-Rata</th>
                <th className="p-3 text-center w-36 bg-blue-50/60 text-blue-900">
                  Nilai Akhir (Raport)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={komponenList.length + 6} className="py-12 text-center text-slate-400">
                    Memuat matriks nilai...
                  </td>
                </tr>
              ) : siswaList.length === 0 ? (
                <tr>
                  <td colSpan={komponenList.length + 6} className="py-12 text-center text-slate-400">
                    Belum ada siswa di kelas ini.
                  </td>
                </tr>
              ) : (
                siswaList.map((siswa, idx) => {
                  const studentScores = scoresMap[siswa.id] || {};
                  const avg = calculateStudentAvg(siswa.id);
                  const finalVal = finalScoresMap[siswa.id] ?? '';

                  return (
                    <tr key={siswa.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3 text-center font-semibold text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-mono font-medium text-slate-500 text-xs">{siswa.nisn || '-'}</td>
                      <td className="p-3 font-mono font-medium text-slate-700 text-xs">{siswa.nis}</td>
                      <td className="p-3 font-bold text-slate-900">{siswa.nama}</td>

                      {/* Component score inputs */}
                      {komponenList.map((comp) => {
                        const val = studentScores[comp.id] ?? '';
                        return (
                          <td key={comp.id} className="p-2 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              placeholder="0"
                              value={val}
                              onChange={(e) => handleScoreChange(siswa.id, comp.id, e.target.value)}
                              className="w-20 mx-auto text-center font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-2 py-1.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                            />
                          </td>
                        );
                      })}

                      {/* Calculated Average */}
                      <td className="p-3 text-center bg-slate-50/60 font-bold text-slate-800">
                        {avg > 0 ? formatNumber(avg, 1) : '-'}
                      </td>

                      {/* Editable Final Score */}
                      <td className="p-2 text-center bg-blue-50/30">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          placeholder={avg > 0 ? String(avg) : '0'}
                          value={finalVal}
                          onChange={(e) => handleFinalScoreChange(siswa.id, e.target.value)}
                          className="w-24 mx-auto text-center font-bold text-blue-900 bg-white border border-blue-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 shadow-xs"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Manage Components (T-037) */}
      <Modal
        isOpen={isCompModalOpen}
        onClose={() => setIsCompModalOpen(false)}
        title="Pengaturan Komponen Nilai"
        description="Maksimal 5 komponen per mata pelajaran (misal: Tugas, UH1, UTS, UAS)."
        maxWidth="lg"
      >
        <div className="space-y-5">
          {/* Form add / edit component */}
          <form onSubmit={handleSaveComponent} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {editingComp ? 'Edit Komponen' : 'Tambah Komponen Baru'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Input
                  label="Nama Komponen"
                  placeholder="Contoh: Tugas 1, UH 1, UTS, UAS"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Select
                  label="Urutan Tampil"
                  value={compOrder}
                  onChange={(e) => setCompOrder(parseInt(e.target.value, 10))}
                  options={[
                    { value: 1, label: 'Urutan 1' },
                    { value: 2, label: 'Urutan 2' },
                    { value: 3, label: 'Urutan 3' },
                    { value: 4, label: 'Urutan 4' },
                    { value: 5, label: 'Urutan 5' },
                  ]}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {editingComp && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingComp(null);
                    setCompName('');
                    setCompOrder(komponenList.length + 1);
                  }}
                >
                  Batal Edit
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={savingComp}
                disabled={!editingComp && komponenList.length >= 5}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                {editingComp ? 'Simpan Perubahan' : 'Tambah Komponen'}
              </Button>
            </div>
          </form>

          {/* List of existing components */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Daftar Komponen Saat Ini ({komponenList.length}/5)
            </h4>
            {komponenList.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                Belum ada komponen nilai yang dibuat.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {komponenList.map((comp) => (
                  <div key={comp.id} className="p-3 flex items-center justify-between bg-white hover:bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center">
                        {comp.urutan}
                      </span>
                      <span className="font-semibold text-slate-800 text-sm">{comp.nama}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingComp(comp);
                          setCompName(comp.nama);
                          setCompOrder(comp.urutan);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                        title="Edit Komponen"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteComponent(comp.id, comp.nama)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Hapus Komponen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCompModalOpen(false)}
            >
              Selesai
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
