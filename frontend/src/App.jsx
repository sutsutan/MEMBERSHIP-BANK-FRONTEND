import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
// AdminPanel adalah Dashboard kita
import AdminPanel from './pages/AdminPanel'; 
import CheckBalance from './pages/CheckBalance';
import RegisterMember from './pages/RegisterMember';
import UserList from './pages/UserList';
import TransactionModal from './components/TransactionModal'; 

// --- PENTING: Perbaiki Base URL agar sesuai dengan server Express.js (Port 5000) ---
const API_BASE_URL = 'http://localhost:8080/api';

export default function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [transactionType, setTransactionType] = useState('');
    
    // Loading global digunakan untuk halaman yang menggunakan data global (Transactions & Members)
    const [loading, setLoading] = useState(false); 
    const [transactions, setTransactions] = useState([]);
    const [members, setMembers] = useState([]);

    // Fungsi untuk mengambil SEMUA riwayat transaksi (untuk halaman Transactions)
    const fetchTransactions = async () => {
        try {
            setLoading(true);
            // API Backend: GET /api/transaksi/riwayat
            const response = await fetch(`${API_BASE_URL}/transaksi/riwayat`);
            if (!response.ok) throw new Error('Gagal mengambil riwayat transaksi.');
            const data = await response.json();
            // Data yang diterima: array of { id, jenis_transaksi, jumlah, nama, rfid_tag, waktu_transaksi }
            setTransactions(data); 
        } catch (err) {
            console.error('Error fetching all transactions:', err.message);
            setTransactions([]); 
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk mengambil SEMUA daftar anggota (untuk halaman Members)
    const fetchMembers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/anggota`);
            if (!response.ok) throw new Error('Gagal mengambil daftar anggota.');
            const data = await response.json();
            // Data yang diterima: array of { id, nama, rfid_tag, saldo, tanggal_lahir }
            setMembers(data); 
        } catch (err) {
            console.error('Error fetching all members:', err.message);
            setMembers([]);
        }
    };

    useEffect(() => {
        fetchTransactions();
        fetchMembers();
    }, []);

    const handleTransactionClick = (type) => {
        setTransactionType(type);
        setShowTransactionModal(true);
    };

    // PENTING: Refresh data setelah transaksi atau registrasi berhasil
    const handleTransactionSuccess = () => {
        fetchTransactions();
        fetchMembers();
    };

    const handleRegisterSuccess = () => {
        fetchMembers();
        setActiveTab('members');
    };

    // --- RENDER ---
    return (
        <>
            <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
                {/* AdminPanel (Dashboard) tidak lagi menerima props members/transactions, karena ia fetch sendiri data statistik */}
                {activeTab === 'dashboard' && (
                    <AdminPanel 
                        onTransactionClick={handleTransactionClick}
                    />
                )}
                {/* CheckBalance (Riwayat Transaksi) menerima data transactions global */}
                {activeTab === 'transactions' && (
                    <CheckBalance transactions={transactions} loading={loading} />
                )}
                {/* UserList (Anggota) menerima data members global */}
                {activeTab === 'members' && (
                    <UserList members={members} loading={loading} />
                )}
                {activeTab === 'register' && (
                    <RegisterMember onRegisterSuccess={handleRegisterSuccess} />
                )}
            </Layout>

            <TransactionModal 
                show={showTransactionModal}
                transactionType={transactionType}
                onClose={() => setShowTransactionModal(false)}
                onSuccess={handleTransactionSuccess}
            />
        </>
    );
}