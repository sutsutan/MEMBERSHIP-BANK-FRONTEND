import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Copy, Check, DollarSign, History, TrendingUp, Users, ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

// Custom Tooltip for Chart
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                <p className="font-semibold text-gray-800 mb-2">{payload[0].payload.name}</p>
                <p className="text-green-600 text-sm">
                    Deposit: Rp {formatRupiah(payload[0].value)}
                </p>
                <p className="text-red-600 text-sm">
                    Withdraw: Rp {formatRupiah(payload[1].value)}
                </p>
            </div>
        );
    }
    return null;
};

export default function AdminPanel({ setActiveTab, onTransactionClick, refreshKey }) {
    const [stats, setStats] = useState(null);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chartPeriod, setChartPeriod] = useState('weekly');
    const [showBalance, setShowBalance] = useState(true);
    const [copied, setCopied] = useState(false);

    // Dummy data untuk fallback
    const getDummyChartData = (period) => {
        if (period === 'weekly') {
            return [
                { name: 'Sen', deposit: 4500000, withdraw: 3200000 },
                { name: 'Sel', deposit: 5200000, withdraw: 4100000 },
                { name: 'Rab', deposit: 3800000, withdraw: 2900000 },
                { name: 'Kam', deposit: 6100000, withdraw: 4500000 },
                { name: 'Jum', deposit: 7200000, withdraw: 5300000 },
                { name: 'Sab', deposit: 5800000, withdraw: 3800000 },
                { name: 'Min', deposit: 4200000, withdraw: 2800000 }
            ];
        } else {
            return [
                { name: 'Week 1', deposit: 22000000, withdraw: 18000000 },
                { name: 'Week 2', deposit: 25000000, withdraw: 21000000 },
                { name: 'Week 3', deposit: 13000000, withdraw: 21000000 },
                { name: 'Week 4', deposit: 24000000, withdraw: 19000000 }
            ];
        }
    };

    const [chartData, setChartData] = useState(getDummyChartData('weekly'));
    const [chartLoading, setChartLoading] = useState(false);

    // Fetch chart data from backend
    useEffect(() => {
        let isMounted = true;

        const fetchChartData = async () => {
            setChartLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/statistics/chart?period=${chartPeriod}`);
                const data = await response.json();
                
                if (!response.ok) throw new Error(data.message || 'Gagal ambil data chart.');
                
                if (isMounted) {
                    setChartData(data);
                }
            } catch (err) {
                console.error("Error fetching chart data:", err);
                if (isMounted) {
                    setChartData(getDummyChartData(chartPeriod));
                }
            } finally {
                if (isMounted) {
                    setChartLoading(false);
                }
            }
        };

        fetchChartData();

        return () => {
            isMounted = false;
        };
    }, [chartPeriod]);

    // Fetch dashboard data
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const statsResponse = await fetch(`${API_BASE_URL}/statistics`);
                const statsData = await statsResponse.json();
                if (!statsResponse.ok) throw new Error(statsData.message || 'Gagal ambil statistik.');
                
                const transResponse = await fetch(`${API_BASE_URL}/transaksi/riwayat?limit=5`);
                const transData = await transResponse.json();
                if (!transResponse.ok) throw new Error(transData.message || 'Gagal ambil transaksi terbaru.');
                
                if (isMounted) {
                    setStats(statsData);
                    setRecentTransactions(transData);
                }
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                if (isMounted) {
                    setError(err.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [refreshKey]);

    const currentUser = {
        name: 'Admin dashboard',
        accountNumber: '7799021650880',
        currency: 'IDR'
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(currentUser.accountNumber);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-800" />
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
    

    return (
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-900 to-blue-500 rounded-2xl p-6 text-white shadow-lg">
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
                        <button onClick={() => setShowBalance(!showBalance)} className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition">
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
                        <button onClick={handleCopy} className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition">
                            {copied ? <Check size={20} /> : <Copy size={20} />}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-4">Account Statistics</h3>
                    <div className="space-y-4">
                        {[
                            { icon: DollarSign, label: 'Total Balance', value: statsDisplay.totalBalance, bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
                            { icon: History, label: 'Pending Trans.', value: statsDisplay.pendingTransactions, bgColor: 'bg-yellow-100', textColor: 'text-yellow-600' },
                            { icon: TrendingUp, label: 'Trans. Value', value: statsDisplay.transactionValue, bgColor: 'bg-green-100', textColor: 'text-green-600' },
                            { icon: Users, label: 'Active Member', value: statsDisplay.activeMember, bgColor: 'bg-purple-100', textColor: 'text-purple-600' }
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center space-x-3">
                                <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                                    <stat.icon className={stat.textColor} size={20} />
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
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-semibold text-gray-800">Transaction Trends</h3>
                        <p className="text-sm text-gray-500 mt-1">Deposit and withdraw overview</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setChartPeriod('weekly')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${
                                chartPeriod === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Weekly
                        </button>
                        <button
                            onClick={() => setChartPeriod('monthly')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${
                                chartPeriod === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Monthly
                        </button>
                    </div>
                </div>
                {chartLoading ? (
                    <div className="flex justify-center items-center h-80">
                        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                        <span className="ml-2 text-gray-500">Loading chart...</span>
                    </div>
                ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={chartData} margin={{ top: 20, right: 50, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis 
                                dataKey="name" 
                                stroke="#6b7280"
                                style={{ fontSize: '14px' }}
                            />
                            <YAxis 
                                stroke="#6b7280"
                                style={{ fontSize: '14px' }}
                                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                            />
                            <Tooltip 
                                content={<CustomTooltip />}
                                cursor={{ stroke: '#e5e7eb', strokeWidth: 2 }}
                                position={{ y: 0 }}
                            />
                            <Legend 
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="circle"
                            />
                            <Line 
                                type="monotone" 
                                dataKey="deposit" 
                                stroke="#10b981" 
                                strokeWidth={3}
                                dot={{ fill: '#10b981', r: 5 }}
                                activeDot={{ r: 7 }}
                                name="Deposit"
                            />
                            <Line 
                                type="monotone" 
                                dataKey="withdraw" 
                                stroke="#ef4444" 
                                strokeWidth={3}
                                dot={{ fill: '#ef4444', r: 5 }}
                                activeDot={{ r: 7 }}
                                name="Withdraw"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex justify-center items-center h-80 text-gray-500">
                        No chart data available
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">What would you like to do today?</h3>
                <p className="text-sm text-gray-500 mb-4">Choose from our popular actions below</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Deposit', icon: ArrowDownLeft, bgColor: 'bg-green-100', textColor: 'text-green-600', action: () => onTransactionClick('deposit') },
                        { label: 'Withdraw', icon: ArrowUpRight, bgColor: 'bg-red-100', textColor: 'text-red-600', action: () => onTransactionClick('withdraw') },
                        { label: 'History', icon: History, bgColor: 'bg-purple-100', textColor: 'text-purple-600', action: () => setActiveTab('transactions') },
                        { label: 'Members', icon: Users, bgColor: 'bg-blue-100', textColor: 'text-blue-600', action: () => setActiveTab('members') }
                    ].map((btn, i) => (
                        <button key={i} onClick={btn.action} className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition">
                            <div className={`w-12 h-12 ${btn.bgColor} rounded-xl flex items-center justify-center mb-3`}>
                                <btn.icon className={btn.textColor} size={24} />
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
                                            <p className="text-xs text-gray-500">Card Number: {tx.rfid_tag}</p>
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