-- ==============================================================================
-- Migration: Add NISN column to Siswa table
-- Date: 2026-08-23
-- ==============================================================================

alter table public.siswa add column if not exists nisn text null;
