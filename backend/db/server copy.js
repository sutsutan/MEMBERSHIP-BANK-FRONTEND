// server.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Ambil variabel dari file .env
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Validasi apakah sudah diisi
if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment variables');
}

// Buat koneksi Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
  },
});

module.exports = supabase;
