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
    res.send('Metschoo Bank API is running! Use endpoints like /api/user/:rfidTag');
});

// Cek Saldo dan Riwayat (READ)
app.get('/api/anggota/:rfidTag', async (req, res) => {
    const rfidTag = req.params.rfidTag;

    try {
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
        res.status(201).json({ 
        message: 'Pendaftaran Berhasil.', 
        member: data[0]
    });

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

// Ambil Semua Daftar Anggota (READ ALL)
app.get('/api/anggota', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('anggota')
            .select('nama, rfid_tag, saldo')
            .order('nama', { ascending: true });

        if (error) throw error;
        
        res.json(data);

    } catch (error) {
        console.error('Error saat mengambil daftar anggota:', error.message);
        res.status(500).json({ message: 'Gagal mengambil data anggota.' });
    }
});

// Ambil Riwayat Transaksi Lengkap (READ ALL)
app.get('/api/transaksi/riwayat', async (req, res) => {
    // Ambil parameter query 'limit' jika ada (misal: /api/transaksi/riwayat?limit=5)
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    
    try {
        // Gabungkan tabel transaksi dan anggota
        let query = supabase
            .from('transaksi')
            .select(`
                waktu_transaksi, 
                jenis_transaksi, 
                jumlah, 
                anggota!inner (nama, rfid_tag)
            `)
            .order('waktu_transaksi', { ascending: false }); // Urutkan dari yang terbaru

        if (limit && limit > 0) {
            query = query.limit(limit);
        }

        const { data, error } = await query;
        
        if (error) throw error;

        const formattedData = data.map(trx => ({
            waktu_transaksi: trx.waktu_transaksi,
            jenis_transaksi: trx.jenis_transaksi,
            jumlah: trx.jumlah,
            nama: trx.anggota.nama,
            rfid_tag: trx.anggota.rfid_tag,
        }));
        
        res.json(formattedData);

    } catch (error) {
        console.error('Error saat mengambil riwayat transaksi:', error.message);
        res.status(500).json({ message: 'Gagal mengambil riwayat transaksi.' });
    }
});

// Ambil Statistik Akun untuk Dashboard (LEBIH EFISIEN)
app.get('/api/statistics', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('dashboard_statistics')
            .select('*')
            .single();

        if (error) throw error;
        
        res.json({
            total_balance: data.total_balance,
            total_transactions: data.total_transactions,
            active_members: data.active_members,
            pending_trans: data.total_transactions 
        });

    } catch (error) {
        console.error('Error saat mengambil statistik dashboard (View):', error.message);
        res.status(500).json({ message: 'Gagal mengambil data statistik.' });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));