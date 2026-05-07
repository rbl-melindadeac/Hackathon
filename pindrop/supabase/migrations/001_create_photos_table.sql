-- Migration: Create photos table
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)

create table photos (
  id               uuid             default gen_random_uuid() primary key,
  file_url         text             not null,
  lat              double precision,
  lng              double precision,
  is_manually_pinned boolean        default false,
  created_at       timestamptz      default now()
);

-- Verify: lat/lng are nullable — null means unlocated, never use 0,0
-- Verify: no user identity columns — anonymous by design
