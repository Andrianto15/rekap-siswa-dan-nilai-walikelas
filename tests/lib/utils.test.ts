import { cn, formatDate, formatShortDate, formatNumber } from '@/lib/utils';

describe('utils.ts', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('px-2 py-1', 'bg-blue-500')).toBe('px-2 py-1 bg-blue-500');
    });

    it('should handle conditional classes', () => {
      const isHidden = false;
      const isVisible = true;
      expect(cn('base-class', isHidden && 'hidden', isVisible && 'visible')).toBe('base-class visible');
    });

    it('should handle falsy values and objects', () => {
      expect(cn('base', null, undefined, false, { 'text-red-500': true, 'opacity-0': false })).toBe(
        'base text-red-500'
      );
    });

    it('should merge conflicting Tailwind classes properly', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2');
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    });
  });

  describe('formatDate', () => {
    it('should return "-" when dateString is empty or falsy', () => {
      expect(formatDate('')).toBe('-');
      expect(formatDate(null as unknown as string)).toBe('-');
      expect(formatDate(undefined as unknown as string)).toBe('-');
    });

    it('should format valid date string in Indonesian format', () => {
      // 2026-08-17 -> 17 Agustus 2026
      const result = formatDate('2026-08-17T00:00:00Z');
      expect(result).toMatch(/17/);
      expect(result).toMatch(/2026/);
      expect(result).toMatch(/Agustus/i);
    });
  });

  describe('formatShortDate', () => {
    it('should return "-" when dateString is empty or falsy', () => {
      expect(formatShortDate('')).toBe('-');
      expect(formatShortDate(null as unknown as string)).toBe('-');
      expect(formatShortDate(undefined as unknown as string)).toBe('-');
    });

    it('should format valid date string in short Indonesian format', () => {
      const result = formatShortDate('2026-08-17T00:00:00Z');
      expect(result).toMatch(/17/);
      expect(result).toMatch(/Agt|Agu/i);
    });
  });

  describe('formatNumber', () => {
    it('should return "-" for null, undefined, or NaN', () => {
      expect(formatNumber(null)).toBe('-');
      expect(formatNumber(undefined)).toBe('-');
      expect(formatNumber(NaN)).toBe('-');
    });

    it('should format number with default 1 decimal place', () => {
      expect(formatNumber(85)).toBe('85.0');
      expect(formatNumber(85.56)).toBe('85.6');
      expect(formatNumber(0)).toBe('0.0');
    });

    it('should format number with custom decimal places', () => {
      expect(formatNumber(85.1234, 2)).toBe('85.12');
      expect(formatNumber(85.1234, 0)).toBe('85');
      expect(formatNumber(85.1234, 3)).toBe('85.123');
    });
  });
});
