import React, { useState } from 'react';
import { Loader } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api';

export default function TransactionModal({ show, transactionType, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rfid: '',
    amount: ''
  });

  const handleTransaction = async () => {
    if (!formData.rfid || !formData.amount || !transactionType) {
      alert('Semua field harus diisi!');
      return;
    }
    const amountValue = parseInt(formData.amount);
    if (amountValue <= 0 || isNaN(amountValue)) {
        alert('Jumlah harus angka positif!');
        return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/transaction`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfid_tag: formData.rfid,
          jumlah: amountValue,
          jenis_transaksi: transactionType.toUpperCase(),
        })
      });

      const result = await response.json(); 
      
      if (response.ok) {
        const formattedBalance = parseFloat(result.saldo_baru).toLocaleString('id-ID');
        alert(`Transaksi ${transactionType.toUpperCase()} berhasil!\nSaldo Baru: Rp ${formattedBalance}`);
        setFormData({ rfid: '', amount: '' });
        if (onSuccess) onSuccess();
        onClose();
      } else {
        throw new Error(result.message || 'Transaksi gagal diproses oleh server.');
      }
    } catch (err) {
      alert(`Transaksi gagal: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          {transactionType.toUpperCase()} Money
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">RFID Tag</label>
            <input
              type="text"
              maxLength="14"
              value={formData.rfid}
              onChange={e => setFormData({ ...formData, rfid: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 font-mono"
              placeholder="Scan or enter RFID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (Rp)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Enter amount"
            />
          </div>
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleTransaction}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
            >
              {loading ? <Loader className="animate-spin mr-2" size={20} /> : null}
              {loading ? 'Processing...' : 'Confirm'}
            </button>
            <button
              onClick={() => {
                setFormData({ rfid: '', amount: '' });
                onClose();
              }}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}