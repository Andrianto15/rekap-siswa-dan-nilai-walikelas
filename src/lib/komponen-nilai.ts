export interface KomponenUrutanItem {
  id: string;
  urutan: number;
  nama?: string;
}

export function validateKomponenUrutan(
  order: number,
  existingList: KomponenUrutanItem[],
  editingId?: string
): { valid: boolean; error?: string } {
  const isTaken = existingList.some(
    (item) => item.urutan === order && (!editingId || item.id !== editingId)
  );

  if (isTaken) {
    return {
      valid: false,
      error: `Nomor urutan ${order} sudah digunakan oleh komponen lain. Silakan pilih nomor urutan yang berbeda.`,
    };
  }

  return { valid: true };
}

export function getHumanizedKomponenError(
  err: unknown,
  order?: number
): { title: string; message: string } {
  const errMsg =
    err instanceof Error
      ? err.message
      : typeof err === 'object' && err !== null && 'message' in err
      ? String((err as { message: unknown }).message)
      : '';

  if (errMsg.includes('uq_komponen_nilai_urutan_active') || errMsg.includes('duplicate key')) {
    return {
      title: 'Urutan Sudah Digunakan',
      message: order
        ? `Nomor urutan ${order} sudah digunakan oleh komponen lain. Silakan pilih nomor urutan yang berbeda.`
        : 'Nomor urutan ini sudah digunakan oleh komponen lain. Silakan pilih nomor urutan yang berbeda.',
    };
  }

  return {
    title: 'Gagal Menyimpan Komponen',
    message: errMsg || 'Terjadi kesalahan saat menyimpan komponen nilai.',
  };
}

export function getNextAvailableOrder(
  existingList: { urutan: number }[],
  max: number = 5
): number {
  const used = new Set(existingList.map((item) => item.urutan));
  for (let i = 1; i <= max; i++) {
    if (!used.has(i)) {
      return i;
    }
  }
  return max;
}
