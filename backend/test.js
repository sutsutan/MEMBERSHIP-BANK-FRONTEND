const supabase = require('./server');

async function testConnection() {
  const { data, error } = await supabase.from('anggota').select('*');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Data:', data);
  }
}

testConnection();


// const { createClient } = require('@supabase/supabase-js');

// const SUPABASE_URL = '';
// const SUPABASE_KEY = '';

// const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
// (async () => {
//   // Ganti 'users' dengan nama tabel yang kamu punya di Supabase
//   const { data, error } = await supabase.from('anggota').select('*').limit(1);

//   if (error) {
//     console.error('❌ Koneksi gagal atau error query:', error.message);
//   } else {
//     console.log('✅ Koneksi berhasil! Data contoh:', data);
//   }
// })();