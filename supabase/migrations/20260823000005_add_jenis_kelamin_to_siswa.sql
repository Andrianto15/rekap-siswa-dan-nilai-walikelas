-- ==============================================================================
-- Migration: Add Jenis Kelamin column (L/P) to Siswa table
-- Date: 2026-08-23
-- ==============================================================================

alter table public.siswa add column if not exists jenis_kelamin text null check (jenis_kelamin in ('L', 'P'));
