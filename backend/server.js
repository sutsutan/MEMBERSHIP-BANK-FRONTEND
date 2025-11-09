require('dotenv').config(); 

const supabase = require('./db/index');
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- ROUTES ---

app.get('/', (req, res) => {
    res.send('Metsoo Bank API is running! Use endpoints like /api/user/:rfidTag');
});

// Cek Saldo dan Riwayat (READ)
app.get('/api/anggota/:rfidTag', async (req, res) => {
    const rfidTag = req.params.rfidTag;

    try {
        // Query untuk mengambil data anggota dan semua riwayat transaksinya
        const { data, error } = await supabase
            .from('anggota')
            .select(`
                id,
                nama, 
                saldo, 
                transaksi(waktu_transaksi, jenis_transaksi, jumlah)
            `)
            .eq('rfid_tag', rfidTag)
            .limit(1);

        if (error) throw error;
        
        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'Anggota tidak ditemukan.' });
        }

        // Response ke Frontend/Hardware
        res.json(data[0]);

    } catch (error) {
        console.error('Error saat cek saldo:', error.message);
        res.status(500).json({ message: 'Gagal memproses permintaan.' });
    }
});


// Pendaftaran Anggota Baru (CREATE)
app.post('/api/register/member', async (req, res) => {
    const { nama, tanggal_lahir, rfid_tag, initial_deposit } = req.body;
    
    try {
        const { data, error } = await supabase.rpc('register_new_member', {
            p_nama: nama,
            p_tanggal_lahir: tanggal_lahir,
            p_rfid_tag: rfid_tag,
            p_initial_deposit: initial_deposit || 0 // Default setoran 0
        });

        if (error) throw error;
        
        res.status(201).json({ 
            message: 'Pendaftaran dan Setoran Awal Berhasil.', 
            member: data[0] 
        });

    } catch (error) {
        // Error 23505 adalah kode untuk duplikasi (RFID Tag sudah ada)
        if (error.code === '23505') {
            return res.status(409).json({ message: 'RFID Tag sudah terdaftar.' });
        }
        console.error('Error saat pendaftaran:', error.message);
        res.status(500).json({ message: 'Pendaftaran gagal.', detail: error.message });
    }
});


// Deposit atau Withdraw (UPDATE & CREATE)
app.post('/api/transaction', async (req, res) => {
    const { rfid_tag, jenis_transaksi, jumlah } = req.body;

    if (!['DEPOSIT', 'WITHDRAW'].includes(jenis_transaksi)) {
        return res.status(400).json({ message: 'jenis transaksi tidak valid.' });
    }
    if (jumlah <= 0) {
        return res.status(400).json({ message: 'Jumlah transaksi harus positif.' });
    }

    try {
        const { data: result, error } = await supabase.rpc('process_transaction', {
            p_rfid_tag: rfid_tag,
            p_jenis_transaksi: jenis_transaksi,
            p_jumlah: jumlah
        });

        if (error) throw error;
        
        if (result.success === false) {
            return res.status(400).json({ message: result.message });
        }

        res.status(200).json({ 
            message: result.message, 
            saldo_baru: result.saldo_baru
        });

    } catch (error) {
        console.error('Error saat transaksi:', error.message);
        res.status(500).json({ message: 'Transaksi gagal diproses.', detail: error.message });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));