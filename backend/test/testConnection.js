const supabase = require('../db/index');

(async () => {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  if (error) {
    console.error('❌ Koneksi gagal:', error.message);
  } else {
    console.log('✅ Koneksi berhasil! Contoh data:', data);
  }
})();
