-- Migration: Add 'D' (Dispen) to kehadiran status check constraint
-- ------------------------------------------------------------------------------
alter table public.kehadiran drop constraint if exists kehadiran_status_check;
alter table public.kehadiran add constraint kehadiran_status_check check (status in ('S', 'I', 'A', 'D'));
