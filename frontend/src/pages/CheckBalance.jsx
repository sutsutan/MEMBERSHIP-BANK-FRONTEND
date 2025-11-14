import React, { useState, useMemo } from 'react';
import { Loader } from 'lucide-react';

const formatRupiah = (number) => {
    if (number === undefined || number === null) return '0';
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0
    }).format(number);
};

const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return (
        date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }) +
        ' ' +
        date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        })
    );
};

export default function CheckBalance({ transactions, loading }) {
    const [filterRange, setFilterRange] = useState("weekly");

    const filteredTransactions = useMemo(() => {
        if (!transactions) return [];

        const now = new Date();

        return transactions.filter((tx) => {
            const txDate = new Date(tx.waktu_transaksi);

            if (filterRange === "weekly") {
                const weekAgo = new Date();
                weekAgo.setDate(now.getDate() - 7);
                return txDate >= weekAgo;
            }

            if (filterRange === "monthly") {
                const monthAgo = new Date();
                monthAgo.setMonth(now.getMonth() - 1);
                return txDate >= monthAgo;
            }

            return true;
        });
    }, [transactions, filterRange]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="animate-spin text-blue-600" size={48} />
                <span className="ml-3 text-gray-600">Memuat Riwayat Transaksi...</span>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>

                {/* 🔥 SUPER SMOOTH WEEKLY / MONTHLY TOGGLE */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterRange("weekly")}
                        className={`
                            px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                            border 
                            ${filterRange === "weekly"
                                ? "bg-blue-600 text-white border-blue-700 shadow-md"
                                : "bg-gray-200 text-gray-700 border-transparent hover:bg-gray-300"}
                        `}
                    >
                        Weekly
                    </button>

                    <button
                        onClick={() => setFilterRange("monthly")}
                        className={`
                            px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                            border
                            ${filterRange === "monthly"
                                ? "bg-blue-600 text-white border-blue-700 shadow-md"
                                : "bg-gray-200 text-gray-700 border-transparent hover:bg-gray-300"}
                        `}
                    >
                        Monthly
                    </button>
                </div>
            </div>

            {/* WRAPPER SCROLL */}
            <div className="bg-white rounded-2xl shadow-sm flex-1 overflow-hidden">
                <div className="overflow-auto max-h-[75vh]">

                    {filteredTransactions.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            Tidak ada transaksi dalam range ini.
                        </div>
                    ) : (
                        <table className="w-full min-w-[700px] border-collapse">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    {['Date', 'Type', 'Card Number', 'Member', 'Amount'].map(h => (
                                        <th
                                            key={h}
                                            className={`text-${h === 'Amount' ? 'right' : 'left'} p-4 text-sm font-semibold text-gray-600`}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {filteredTransactions.map((tx, index) => {
                                    const isDeposit = tx.jenis_transaksi === 'DEPOSIT';

                                    return (
                                        <tr key={tx.id || index} className="border-t hover:bg-gray-50">
                                            <td className="ps-3 text-sm text-center text-gray-600">
                                                {formatDate(tx.waktu_transaksi)}
                                            </td>

                                            <td className="ps-4 text-center">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        isDeposit
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}
                                                >
                                                    {tx.jenis_transaksi}
                                                </span>
                                            </td>

                                            <td className="ps-4 text-sm text-center font-mono text-gray-600">
                                                {tx.rfid_tag}
                                            </td>

                                            <td className="text-sm text-center text-gray-800 font-medium">
                                                {tx.nama || 'N/A'}
                                            </td>

                                            <td className="p-4 text-right">
                                                <span
                                                    className={`font-semibold ${
                                                        isDeposit ? 'text-green-600' : 'text-red-600'
                                                    }`}
                                                >
                                                    {isDeposit ? '+' : '-'} Rp {formatRupiah(tx.jumlah)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
