import React from 'react';
import { Loader, CreditCard, Users } from 'lucide-react';

// Fungsi Bantuan untuk Format Rupiah
const formatRupiah = (number) => {
    if (number === undefined || number === null) return '0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

export default function UserList({ members, loading }) {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Member Directory</h2>
            
            {members.length === 0 && !loading ? (
                <div className="text-center p-10 bg-white rounded-lg shadow-md">
                    <Users size={48} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-lg text-gray-600">Tidak ada anggota yang terdaftar.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Data members dari API: { id, nama, rfid_tag, saldo, tanggal_lahir } */}
                    {members.map(member => (
                        <div key={member.rfid_tag} className="bg-white rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {member.nama.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{member.nama}</p>
                                    <p className="text-sm text-gray-500">Member</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 flex items-center"><CreditCard size={14} className="mr-1" /> RFID:</span>
                                    {/* Menggunakan property rfid_tag dari API */}
                                    <span className="font-mono font-medium">{member.rfid_tag}</span> 
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Balance:</span>
                                    {/* Menggunakan property saldo dari API */}
                                    <span className="font-semibold text-green-600">{formatRupiah(member.saldo)}</span> 
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}