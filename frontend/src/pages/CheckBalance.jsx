import React from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const formatRupiah = (number) => {
    if (number === undefined || number === null) return '0';
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0
    }).format(number);
};

// Fungsi Bantuan untuk Format Tanggal/Waktu
const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) 
         + ' ' + date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};


export default function CheckBalance({ transactions }) {
    // Diasumsikan `transactions` di-fetch dari App.jsx menggunakan GET /api/transaksi/riwayat
    if (!transactions || transactions.length === 0) {
        return <div className="p-6 text-center text-gray-500">Tidak ada riwayat transaksi.</div>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Transaction History</h2>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            {['Date', 'Type', 'RFID', 'Member', 'Amount'].map(h => (
                                <th key={h} className={`text-${h === 'Amount' ? 'right' : 'left'} p-4 text-sm font-semibold text-gray-600`}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(tx => {
                            // PENTING: Menyesuaikan dengan format API backend (jenis_transaksi, jumlah, nama, rfid_tag, waktu_transaksi)
                            const isDeposit = tx.jenis_transaksi === 'DEPOSIT';
                            
                            return (
                                <tr key={tx.id} className="border-t hover:bg-gray-50">
                                    <td className="p-4 text-sm text-gray-600">{formatDate(tx.waktu_transaksi)}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            isDeposit ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {tx.jenis_transaksi}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm font-mono text-gray-600">{tx.rfid_tag}</td>
                                    <td className="p-4 text-sm text-gray-800 font-medium">{tx.nama || 'N/A'}</td>
                                    <td className="p-4 text-right">
                                        <span className={`font-semibold ${isDeposit ? 'text-green-600' : 'text-red-600'}`}>
                                            {isDeposit ? '+' : '-'} Rp {formatRupiah(tx.jumlah)}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}