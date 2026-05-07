-- Migration: Storage bucket + RLS policies
-- Run this in the Supabase SQL Editor AFTER 001_create_photos_table.sql

-- ─────────────────────────────────────────
-- 1. Storage bucket
-- ─────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Allow anyone to read objects in the photos bucket
create policy "photos bucket: public read"
  on storage.objects for select
  to public
  using (bucket_id = 'photos');

-- Allow anonymous users to upload to the photos bucket
create policy "photos bucket: anon insert"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'photos');

-- ─────────────────────────────────────────
-- 2. Row Level Security on photos table
-- ─────────────────────────────────────────

alter table photos enable row level security;

-- Anonymous SELECT: open — anyone can read all pins
create policy "photos: anon select"
  on photos for select
  to anon
  using (true);

-- Anonymous INSERT: open — anyone can upload a photo
create policy "photos: anon insert"
  on photos for insert
  to anon
  with check (true);

-- UPDATE and DELETE: no policy defined = denied by default
-- This is intentional — pins cannot be removed or edited once placed
