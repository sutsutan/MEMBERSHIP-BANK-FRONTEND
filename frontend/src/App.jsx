import React, { useState, useEffect } from 'react';
import { CreditCard, Users, TrendingUp, DollarSign, History, UserPlus, Wallet, ArrowUpRight, ArrowDownLeft, Menu, X, Copy, Check, Eye, EyeOff, Loader } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000/api';

export default function BankMembershipApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rfid: '',
    amount: '',
    name: '',
    dob: '',
    deposit: ''
  });
  
  const currentUser = {
    name: 'Admin Teller',
    accountNumber: '7799021650880',
    balance: 1191860,
    currency: 'IDR'
  };

  const [transactions, setTransactions] = useState([]);
  const [members, setMembers] = useState([]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/transactions`);
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      setTransactions([
        { id: 1, type: 'deposit', rfid: '12345678901234', amount: 500000, date: '2024-11-06 10:30', member: 'Budi Santoso' },
        { id: 2, type: 'withdraw', rfid: '98765432109876', amount: 200000, date: '2024-11-06 09:15', member: 'Siti Rahayu' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/members`);
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setMembers(data);
    } catch (err) {
      setMembers([
        { id: 1, name: 'Budi Santoso', rfid: '12345678901234', balance: 5000000 },
        { id: 2, name: 'Siti Rahayu', rfid: '98765432109876', balance: 3000000 }
      ]);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchMembers();
  }, []);

  const stats = {
    totalBalance: members.reduce((sum, m) => sum + (m.balance || 0), 0),
    pendingTransactions: 3200,
    transactionValue: transactions.reduce((sum, t) => sum + t.amount, 0),
    activeMember: members.length
  };

  const handleTransaction = async () => {
    if (!formData.rfid || !formData.amount || !transactionType) {
      alert('Semua field harus diisi!');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfid: formData.rfid,
          amount: parseInt(formData.amount),
          type: transactionType,
          date: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert('Transaksi berhasil!');
        setShowTransactionModal(false);
        setFormData({ ...formData, rfid: '', amount: '' });
        fetchTransactions();
        fetchMembers();
      } else {
        throw new Error('Failed');
      }
    } catch (err) {
      alert('Transaksi gagal! Periksa koneksi backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.dob || !formData.rfid || !formData.deposit) {
      alert('Semua field harus diisi!');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          dateOfBirth: formData.dob,
          rfid: formData.rfid,
          balance: parseInt(formData.deposit)
        })
      });

      if (response.ok) {
        alert('Member berhasil didaftarkan!');
        setFormData({ ...formData, name: '', dob: '', rfid: '', deposit: '' });
        fetchMembers();
      } else {
        throw new Error('Failed');
      }
    } catch (err) {
      alert('Pendaftaran gagal! Periksa koneksi backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white border-r transition-all duration-300 overflow-hidden shadow-sm flex-shrink-0`}>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <Wallet className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-800">BankMember</h1>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{currentUser.name}</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            </div>
            <button className="w-full mt-3 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700">
              Logout
            </button>
          </div>

          <nav className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Main Menu</p>
            {[
              { id: 'dashboard', icon: TrendingUp, label: 'Dashboard' },
              { id: 'transactions', icon: History, label: 'Transactions' },
              { id: 'members', icon: Users, label: 'Members' },
              { id: 'register', icon: UserPlus, label: 'Register Member' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${
                  activeTab === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">{new Date().toLocaleTimeString('id-ID')}</span>
            <span className="text-sm text-gray-500">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' && (
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
                      {showBalance ? `${stats.totalBalance.toLocaleString('id-ID')} ${currentUser.currency}` : '••••••••'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between bg-white/10 rounded-xl p-4">
                    <div>
                      <p className="text-xs opacity-75 mb-1">Your Account Number</p>
                      <p className="font-mono font-semibold">{currentUser.accountNumber}</p>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(currentUser.accountNumber);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }} 
                      className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
                    >
                      {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4">Account Statistics</h3>
                  <div className="space-y-4">
                    {[
                      { icon: DollarSign, label: 'Total Balance', value: stats.totalBalance, color: 'blue' },
                      { icon: History, label: 'Pending Trans.', value: stats.pendingTransactions, color: 'yellow' },
                      { icon: TrendingUp, label: 'Trans. Value', value: stats.transactionValue, color: 'green' },
                      { icon: Users, label: 'Active Member', value: stats.activeMember, color: 'purple' }
                    ].map((stat, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className={`w-10 h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                          <stat.icon className={`text-${stat.color}-600`} size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{stat.label}</p>
                          <p className="font-semibold text-gray-800">{stat.value.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">What would you like to do today?</h3>
                <p className="text-sm text-gray-500 mb-4">Choose from our popular actions below</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Deposit', icon: ArrowDownLeft, color: 'green', action: () => { setTransactionType('deposit'); setShowTransactionModal(true); } },
                    { label: 'Withdraw', icon: ArrowUpRight, color: 'red', action: () => { setTransactionType('withdraw'); setShowTransactionModal(true); } },
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

              {/* Recent Transactions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          tx.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {tx.type === 'deposit' ? 
                            <ArrowDownLeft className="text-green-600" size={20} /> : 
                            <ArrowUpRight className="text-red-600" size={20} />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{tx.member}</p>
                          <p className="text-xs text-gray-500">RFID: {tx.rfid}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'deposit' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-gray-500">{tx.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
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
                    {transactions.map(tx => (
                      <tr key={tx.id} className="border-t hover:bg-gray-50">
                        <td className="p-4 text-sm text-gray-600">{tx.date}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            tx.type === 'deposit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {tx.type === 'deposit' ? 'Deposit' : 'Withdraw'}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-mono text-gray-600">{tx.rfid}</td>
                        <td className="p-4 text-sm text-gray-800 font-medium">{tx.member}</td>
                        <td className="p-4 text-right">
                          <span className={`font-semibold ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type === 'deposit' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Member Directory</h2>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader className="animate-spin text-blue-600" size={48} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {members.map(member => (
                    <div key={member.id} className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{member.name}</p>
                          <p className="text-sm text-gray-500">Member</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">RFID:</span>
                          <span className="font-mono font-medium">{member.rfid}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Balance:</span>
                          <span className="font-semibold text-green-600">Rp {member.balance.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'register' && (
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
          )}
        </main>
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {transactionType === 'deposit' ? 'Deposit Money' : 'Withdraw Money'}
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
                    setShowTransactionModal(false);
                    setFormData({ ...formData, rfid: '', amount: '' });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}