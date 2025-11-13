import React, { useState } from 'react';
import { Loader } from 'lucide-react';

// --- PENTING: Perbaiki Base URL ke port 5000 ---
const API_BASE_URL = 'http://localhost:8080/api';

export default function RegisterMember({ onRegisterSuccess }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        rfid: '',
        deposit: ''
    });

    const handleRegister = async () => {
        if (!formData.name || !formData.dob || !formData.rfid || !formData.deposit) {
            alert('Semua field harus diisi!');
            return;
        }

        const initialBalance = parseInt(formData.deposit);
        if (initialBalance < 0 || isNaN(initialBalance)) {
            alert('Initial Deposit harus angka positif!');
            return;
        }

        try {
            setLoading(true);
            
            // --- PERBAIKAN ENDPOINT DAN PAYLOAD ---
            // Endpoint Backend: POST /api/anggota
            // Payload Backend: { nama, tanggal_lahir, rfid_tag, saldo }
            const response = await fetch(`${API_BASE_URL}/anggota`, { // Menggunakan /anggota
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nama: formData.name,            // Ganti name menjadi nama
                    tanggal_lahir: formData.dob,    // Ganti dateOfBirth menjadi tanggal_lahir
                    rfid_tag: formData.rfid,        // Ganti rfid menjadi rfid_tag
                    saldo: initialBalance           // Ganti balance menjadi saldo
                })
            });

            const result = await response.json(); // Ambil pesan respons dari backend
            
            if (response.ok) {
                alert(`Member ${formData.name} berhasil didaftarkan!`);
                setFormData({ name: '', dob: '', rfid: '', deposit: '' });
                if (onRegisterSuccess) onRegisterSuccess();
            } else {
                // Tampilkan pesan error spesifik dari backend jika ada
                throw new Error(result.message || 'Pendaftaran gagal diproses oleh server.');
            }
        } catch (err) {
            alert(`Pendaftaran gagal: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // --- (Rendering tidak berubah) ---
    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Register New Member</h2>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="space-y-4">
                    {[
                        { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Enter full name' },
                        { label: 'Date of Birth', key: 'dob', type: 'date' },
                        { label: 'RFID Tag', key: 'rfid', type: 'text', placeholder: '14 digit RFID', maxLength: 14 },
                        { label: 'Initial Deposit', key: 'deposit', type: 'number', placeholder: 'Minimum Rp 50,000' }
                    ].map(field => (
                        <div key={field.key}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                            <input
                                type={field.type}
                                maxLength={field.maxLength}
                                placeholder={field.placeholder}
                                value={formData[field.key]}
                                onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3"
                            />
                        </div>
                    ))}
                    <button
                        onClick={handleRegister}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? <Loader className="animate-spin mr-2" size={20} /> : null}
                        {loading ? 'Processing...' : 'Register Member'}
                    </button>
                </div>
            </div>
        </div>
    );
}