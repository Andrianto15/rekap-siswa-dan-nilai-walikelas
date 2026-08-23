'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Users,
  Plus,
  FileSpreadsheet,
  Download,
  Upload,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  FileUp,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/Table';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { downloadExcelTemplate, parseExcelFile } from '@/lib/excel';
import type { Siswa, Kelas, Semester, GuruKelas } from '@/lib/types';

interface ParsedExcelRow {
  NIS?: string | number;
  'Nama Lengkap'?: string;
  nis?: string | number;
  nama?: string;
  nama_lengkap?: string;
  [key: string]: unknown;
}

interface ParsedSiswa {
  nis: string;
  nama: string;
  isValid: boolean;
  error?: string;
}

export default function SiswaPage() {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();
  const { isAdmin } = useRole();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const confirm = useConfirm();

  const [activeSemester, setActiveSemester] = useState<Semester | null>(null);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelasId, setSelectedKelasId] = useState<string>('');

  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal: Add / Edit Single Student
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
  const [nis, setNis] = useState('');
  const [nama, setNama] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal: Import Excel
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [parsedList, setParsedList] = useState<ParsedSiswa[]>([]);
  const [importing, setImporting] = useState(false);

  // Fetch initial active semester and class assignment
  const initData = useCallback(async () => {
    try {
      // 1. Get active semester
      const { data: semData } = await supabase
        .from('semester')
        .select(`*, tahun_ajaran (*)`)
        .eq('is_active', true)
        .is('deleted_at', null)
        .single();

      if (semData) {
        setActiveSemester(semData as unknown as Semester);

        // 2. Get all classes
        const { data: kData } = await supabase
          .from('kelas')
          .select('*')
          .is('deleted_at', null)
          .order('nama', { ascending: true });

        if (kData) setKelasList(kData);

        // 3. If teacher, find assigned class
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
        } else if (kData && kData.length > 0) {
          setSelectedKelasId(kData[0].id);
        }
      }
    } catch (err: unknown) {
      toastError('Gagal Mengambil Data Awal', (err as Error).message);
    }
  }, [supabase, user, isAdmin, toastError]);

  // Fetch student list for selected class & active semester
  const fetchSiswa = useCallback(async () => {
    if (!selectedKelasId || !activeSemester) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('siswa')
        .select('*')
        .eq('kelas_id', selectedKelasId)
        .eq('semester_id', activeSemester.id)
        .is('deleted_at', null)
        .order('nama', { ascending: true });

      if (error) throw error;
      setSiswaList(data || []);
    } catch (err: unknown) {
      toastError('Gagal Memuat Daftar Siswa', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [supabase, selectedKelasId, activeSemester, toastError]);

  useEffect(() => {
    initData();
  }, [initData]);

  useEffect(() => {
    if (selectedKelasId && activeSemester) {
      fetchSiswa();
    }
  }, [selectedKelasId, activeSemester, fetchSiswa]);

  // Filtered students by search query
  const filteredSiswa = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return siswaList;
    return siswaList.filter(
      (s) => s.nama.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q)
    );
  }, [siswaList, searchQuery]);

  // Open modal add / edit single student
  const openModal = (siswa?: Siswa) => {
    if (siswa) {
      setEditingSiswa(siswa);
      setNis(siswa.nis);
      setNama(siswa.nama);
    } else {
      setEditingSiswa(null);
      setNis('');
      setNama('');
    }
    setIsModalOpen(true);
  };

  // Submit add / edit single student
  const handleSaveSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis.trim() || !nama.trim() || !selectedKelasId || !activeSemester) return;
    setSubmitting(true);

    try {
      if (editingSiswa) {
        const { error } = await supabase
          .from('siswa')
          .update({
            nis: nis.trim(),
            nama: nama.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingSiswa.id);

        if (error) throw error;
        toastSuccess('Berhasil', 'Data siswa berhasil diperbarui');
      } else {
        const { error } = await supabase.from('siswa').insert({
          nis: nis.trim(),
          nama: nama.trim(),
          kelas_id: selectedKelasId,
          semester_id: activeSemester.id,
        });

        if (error) throw error;
        toastSuccess('Berhasil', 'Siswa baru berhasil ditambahkan');
      }

      setIsModalOpen(false);
      fetchSiswa();
    } catch (err: unknown) {
      toastError('Gagal Menyimpan', (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  // Soft delete student
  const handleDeleteSiswa = async (id: string, studentName: string) => {
    const isConfirmed = await confirm({
      title: 'Hapus Siswa',
      message: `Hapus data siswa "${studentName}"? Siswa ini akan dinonaktifkan.`,
      confirmText: 'Hapus Siswa',
      variant: 'danger',
    });
    if (!isConfirmed) return;

    try {
      const { error } = await supabase
        .from('siswa')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      toastSuccess('Berhasil', `Data siswa ${studentName} berhasil dihapus`);
      fetchSiswa();
    } catch (err: unknown) {
      toastError('Gagal Menghapus', (err as Error).message);
    }
  };

  // Download template Excel
  const handleDownloadTemplate = () => {
    const headers = ['NIS', 'Nama Lengkap'];
    const sampleRows = [
      ['1001', 'Ahmad Dani Pratama'],
      ['1002', 'Bunga Citra Lestari'],
      ['1003', 'Citra Kirana Dewi'],
    ];
    downloadExcelTemplate('Template_Impor_Siswa.xlsx', headers, sampleRows);
    toastInfo('Mengunduh Template', 'File template Excel berhasil diunduh.');
  };

  // Handle file select for Excel
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFile(file);

    try {
      const rows = await parseExcelFile<ParsedExcelRow>(file);
      const parsed: ParsedSiswa[] = rows.map((row) => {
        const nisVal = String(row['NIS'] || row['nis'] || '').trim();
        const namaVal = String(row['Nama Lengkap'] || row['nama_lengkap'] || row['nama'] || '').trim();

        const isValid = Boolean(nisVal && namaVal);
        return {
          nis: nisVal,
          nama: namaVal,
          isValid,
          error: !nisVal ? 'NIS kosong' : !namaVal ? 'Nama kosong' : undefined,
        };
      });

      setParsedList(parsed);
    } catch (err: unknown) {
      toastError('Gagal Membaca File Excel', (err as Error).message);
      setParsedList([]);
    }
  };

  // Confirm bulk insert from parsed Excel
  const handleImportExcel = async () => {
    if (!parsedList.length || !selectedKelasId || !activeSemester) return;
    const validRows = parsedList.filter((r) => r.isValid);
    if (!validRows.length) {
      toastError('Tidak Ada Data Valid', 'Periksa kembali kolom NIS dan Nama Lengkap pada file.');
      return;
    }

    setImporting(true);
    try {
      const insertPayload = validRows.map((r) => ({
        nis: r.nis,
        nama: r.nama,
        kelas_id: selectedKelasId,
        semester_id: activeSemester.id,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('siswa')
        .upsert(insertPayload, { onConflict: 'nis,semester_id' });

      if (error) throw error;

      toastSuccess('Impor Berhasil', `${validRows.length} siswa berhasil dimasukkan ke kelas.`);
      setIsExcelModalOpen(false);
      setExcelFile(null);
      setParsedList([]);
      fetchSiswa();
    } catch (err: unknown) {
      toastError('Gagal Mengimpor Data', (err as Error).message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Kelola Data Siswa</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftar siswa aktif di kelas binaan pada semester berjalan.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
            onClick={() => {
              setExcelFile(null);
              setParsedList([]);
              setIsExcelModalOpen(true);
            }}
          >
            Impor Excel
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => openModal()}
          >
            Tambah Siswa
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-600 shrink-0">Pilih Kelas:</span>
          <div className="w-full sm:w-48">
            <Select
              value={selectedKelasId}
              onChange={(e) => setSelectedKelasId(e.target.value)}
              options={kelasList.map((k) => ({
                value: k.id,
                label: `Kelas ${k.nama}`,
              }))}
            />
          </div>
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Cari berdasarkan Nama atau NIS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">No</TableHead>
            <TableHead className="w-36">NIS</TableHead>
            <TableHead>Nama Lengkap</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableEmpty colSpan={4} message="Memuat data siswa..." />
          ) : filteredSiswa.length === 0 ? (
            <TableEmpty
              colSpan={4}
              message={
                searchQuery
                  ? `Tidak ada siswa yang cocok dengan "${searchQuery}".`
                  : 'Belum ada siswa di kelas ini. Klik "Tambah Siswa" atau "Impor Excel".'
              }
            />
          ) : (
            filteredSiswa.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="font-semibold text-slate-400">{index + 1}</TableCell>
                <TableCell className="font-mono text-xs font-semibold text-slate-700">
                  {item.nis}
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-slate-900">{item.nama}</span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => openModal(item)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      title="Edit Siswa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSiswa(item.id, item.nama)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="Hapus Siswa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Modal Add / Edit Single Student */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSiswa ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
      >
        <form onSubmit={handleSaveSiswa} className="space-y-4">
          <Input
            label="Nomor Induk Siswa (NIS)"
            placeholder="Contoh: 20260101"
            value={nis}
            onChange={(e) => setNis(e.target.value)}
            required
            helperText="Nomor Induk Siswa unik."
          />

          <Input
            label="Nama Lengkap"
            placeholder="Contoh: Ahmad Maulana"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Import Excel */}
      <Modal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        title="Impor Data Siswa via Excel"
        maxWidth="lg"
      >
        <div className="space-y-5">
          {/* Step 1: Download template */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-800">1. Unduh Format Template Excel</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pastikan format kolom sesuai (kolom <code>NIS</code> dan <code>Nama Lengkap</code>).
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleDownloadTemplate}
            >
              Unduh Template
            </Button>
          </div>

          {/* Step 2: Upload file */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-2">
              2. Pilih File Excel (.xlsx / .xls)
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 text-center bg-slate-50/50 transition relative cursor-pointer">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FileUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-700">
                {excelFile ? excelFile.name : 'Klik atau seret file Excel ke sini'}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Mendukung format .xlsx dan .xls</p>
            </div>
          </div>

          {/* Step 3: Preview parsed data */}
          {parsedList.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-800">
                  Pratinjau Data ({parsedList.filter((p) => p.isValid).length} Valid dari {parsedList.length} Baris)
                </span>
              </div>
              <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 sticky top-0 text-slate-700 font-semibold border-b">
                    <tr>
                      <th className="p-2 w-10">Status</th>
                      <th className="p-2 w-28">NIS</th>
                      <th className="p-2">Nama Lengkap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedList.map((item, idx) => (
                      <tr key={idx} className={item.isValid ? 'bg-white' : 'bg-rose-50/70'}>
                        <td className="p-2">
                          {item.isValid ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <span title={item.error}>
                              <AlertCircle className="w-4 h-4 text-rose-600" />
                            </span>
                          )}
                        </td>
                        <td className="p-2 font-mono font-medium">{item.nis || '-'}</td>
                        <td className="p-2">{item.nama || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsExcelModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={!parsedList.some((p) => p.isValid)}
              isLoading={importing}
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={handleImportExcel}
            >
              Impor ke Database
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
