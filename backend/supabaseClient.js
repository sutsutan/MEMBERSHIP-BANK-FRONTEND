// server.js (Bagian dari Express App)
const express = require('express');
const supabase = require('./db/server'); // Impor client yang sudah diamankan
const app = express();
app.use(express.json());

// Endpoint untuk Cek Saldo (GET /api/user/12345678)
app.get('/api/user/:rfidTag', async (req, res) => {
    const { rfidTag } = req.params;

    // Menggunakan client yang sudah terautentikasi dengan Service Role Key
    const { data, error } = await supabase
        .from('anggota')
        .select('nama, saldo, transaksi(waktu_transaksi, jenis_transaksi, jumlah)')
        .eq('rfid_tag', rfidTag)
        .limit(1);

    if (error) {
        console.error('Database Error:', error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data.' });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({ message: 'Anggota tidak ditemukan.' });
    }

    // Mengembalikan data ke Tim Frontend/Hardware
    res.json({
        nama: data[0].nama,
        saldo: data[0].saldo,
        riwayat: data[0].transaksi,
    });
});

app.listen(3000, () => console.log('Server berjalan di port 3000'));