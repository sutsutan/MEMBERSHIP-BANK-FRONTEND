import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Copy, Check, DollarSign, History, TrendingUp, Users, ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api';

const formatRupiah = (number) => {
    if (number === undefined || number === null) return '0';
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0
    }).format(number);
};

const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID', { year: '2-digit', month: '2-digit', day: '2-digit' }) 
         + ' ' + date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};


export default function AdminPanel({ setActiveTab, onTransactionClick, refreshKey }) {
    const [stats, setStats] = useState(null);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showBalance, setShowBalance] = useState(true);
    const [copied, setCopied] = useState(false);

    // Fetch data statistik dan 5 transaksi terbaru
    useEffect(() => {
        const fetchData = async () => {
            
            setLoading(true);
            setError(null);
            try {
                const statsResponse = await fetch(`${API_BASE_URL}/statistics`);
                const statsData = await statsResponse.json();
                if (!statsResponse.ok) throw new Error(statsData.message || 'Gagal ambil statistik.');
                setStats(statsData);

                const transResponse = await fetch(`${API_BASE_URL}/transaksi/riwayat?limit=5`);
                const transData = await transResponse.json();
                if (!transResponse.ok) throw new Error(transData.message || 'Gagal ambil transaksi terbaru.');
                setRecentTransactions(transData);

            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [refreshKey]);

    // Hardcoded user info
    const currentUser = {
        name: 'Admin Teller',
        accountNumber: '7799021650880',
        currency: 'IDR'
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Memuat Dashboard...</span>
            </div>
        );
    }

    if (error || !stats) {
        return <div className="p-6 text-red-600 bg-red-50 border border-red-200 rounded-xl">
            Error: {error || "Gagal memuat data statistik."}
        </div>;
    }

    const statsDisplay = {
        totalBalance: stats.total_balance ?? 0,
        pendingTransactions: stats.pending_trans ?? stats.total_transactions ?? 0,
        transactionValue: stats.total_transactions ?? 0,
        activeMember: stats.active_members ?? 0
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(currentUser.accountNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Balance Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-lg font-bold">{currentUser.name.charAt(0)}</span>
                            </div>
                            <div>
                                <p className="text-sm opacity-90">Good Evening</p>
                                <p className="font-semibold">{currentUser.name}</p>
                            </div>
                        </div>
                        <button onClick={() => setShowBalance(!showBalance)} className="p-2 bg-white/20 rounded-lg hover:bg-white/30">
                            {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>
                    </div>

                    <div className="mb-6">
                        <p className="text-sm opacity-90 mb-1">Available Balance</p>
                        <p className="text-4xl font-bold">
                            {showBalance ? `${formatRupiah(statsDisplay.totalBalance)} ${currentUser.currency}` : '••••••••'}
                        </p>
                    </div>

                    <div className="flex items-center justify-between bg-white/10 rounded-xl p-4">
                        <div>
                            <p className="text-xs opacity-75 mb-1">Your Account Number</p>
                            <p className="font-mono font-semibold">{currentUser.accountNumber}</p>
                        </div>
                        <button onClick={handleCopy} className="p-2 bg-white/20 rounded-lg hover:bg-white/30">
                            {copied ? <Check size={20} /> : <Copy size={20} />}
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-4">Account Statistics</h3>
                    <div className="space-y-4">
                        {[
                            { icon: DollarSign, label: 'Total Balance', value: statsDisplay.totalBalance, color: 'blue' },
                            { icon: History, label: 'Pending Trans.', value: statsDisplay.pendingTransactions, color: 'yellow' },
                            { icon: TrendingUp, label: 'Trans. Value', value: statsDisplay.transactionValue, color: 'green' },
                            { icon: Users, label: 'Active Member', value: statsDisplay.activeMember, color: 'purple' }
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center space-x-3">
                                <div className={`w-10 h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                                    <stat.icon className={`text-${stat.color}-600`} size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{stat.label}</p>
                                    <p className="font-semibold text-gray-800">{formatRupiah(stat.value)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">What would you like to do today?</h3>
                <p className="text-sm text-gray-500 mb-4">Choose from our popular actions below</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Deposit', icon: ArrowDownLeft, color: 'green', action: () => onTransactionClick('deposit') },
                        { label: 'Withdraw', icon: ArrowUpRight, color: 'red', action: () => onTransactionClick('withdraw') },
                        { label: 'History', icon: History, color: 'purple', action: () => setActiveTab('transactions') },
                        { label: 'Members', icon: Users, color: 'blue', action: () => setActiveTab('members') }
                    ].map((btn, i) => (
                        <button key={i} onClick={btn.action} className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                            <div className={`w-12 h-12 bg-${btn.color}-100 rounded-xl flex items-center justify-center mb-3`}>
                                <btn.icon className={`text-${btn.color}-600`} size={24} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{btn.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                    {recentTransactions.length === 0 ? (
                        <p className="text-center text-gray-500">Tidak ada transaksi terbaru.</p>
                    ) : (
                        recentTransactions.map(tx => {
                            const isDeposit = tx.jenis_transaksi === 'DEPOSIT';
                            
                            return (
                                <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                            isDeposit ? 'bg-green-100' : 'bg-red-100'
                                        }`}>
                                            {isDeposit ? 
                                                <ArrowDownLeft className="text-green-600" size={20} /> : 
                                                <ArrowUpRight className="text-red-600" size={20} />
                                            }
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{tx.nama || 'Anggota Tidak Dikenal'}</p>
                                            <p className="text-xs text-gray-500">RFID: {tx.rfid_tag}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-semibold ${isDeposit ? 'text-green-600' : 'text-red-600'}`}>
                                            {isDeposit ? '+' : '-'} Rp {formatRupiah(tx.jumlah)}
                                        </p>
                                        <p className="text-xs text-gray-500">{formatTime(tx.waktu_transaksi)}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}