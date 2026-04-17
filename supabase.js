import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://tbwrrmoalfaahkvwutqu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRid3JybW9hbGZhYWhrdnd1dHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MzI3NzgsImV4cCI6MjA5MTQwODc3OH0.PTt4inKdpd3MVksZafgCUX_KR9jxkWoMQSb0V0Tn0y8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);