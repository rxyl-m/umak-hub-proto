/* ═══════════════════════════════════════════════
   auth.js — UMAK HUB · Auth Guard & Utilities
   ═══════════════════════════════════════════════
   Supabase "profiles" table required:
   CREATE TABLE profiles (
     id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
     first_name text NOT NULL,
     last_name text NOT NULL,
     section text DEFAULT 'G12-01CPG',
     school text DEFAULT 'University of Makati',
     hours float DEFAULT 0,
     days int DEFAULT 0,
     total int DEFAULT 80,
     avatar_url text,
     bio text,
     pin text DEFAULT '1234',
     created_at timestamptz DEFAULT now()
   );
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Users can manage own profile" ON profiles
     USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
   CREATE POLICY "Profiles are viewable by all authenticated users" ON profiles
     FOR SELECT USING (auth.role() = 'authenticated');
   ═══════════════════════════════════════════════ */

import { supabase } from './supabase.js';

/**
 * Require the user to be logged in.
 * Call at the top of protected pages.
 * Returns { session, profile } or redirects to login.
 */
export async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.replace('loginsignup.html');
    return null;
  }
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', session.user.id).single();
  if (!profile) {
    window.location.replace('profile-setup.html');
    return null;
  }
  return { session, profile };
}

/**
 * On public pages (landing, login): redirect away if already logged in.
 */
export async function redirectIfAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;
  const { data: profile } = await supabase
    .from('profiles').select('id').eq('id', session.user.id).single();
  window.location.replace(profile ? 'dashboard.html' : 'profile-setup.html');
  return true;
}

/**
 * Sign out and go home.
 */
export async function signOut() {
  await supabase.auth.signOut();
  window.location.replace('landingpage.html');
}

/**
 * Get current session without redirect.
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}