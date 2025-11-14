import { useState, useEffect } from "react";
import { Wallet, TrendingUp, History, Users, UserPlus, Menu, X } from 'lucide-react';

export default function Layout({ children, activeTab, setActiveTab }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ⬇⬇⬇ TAMBAHAN REALTIME CLOCK DI SINI ⬇⬇⬇
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      // Format jam real-time (HH.MM.SS)
      const h = now.getHours().toString().padStart(2, "0");
      const m = now.getMinutes().toString().padStart(2, "0");
      const s = now.getSeconds().toString().padStart(2, "0");
      setTime(`${h}.${m}.${s}`);

      // Format tanggal
      const options = {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      };
      setDate(now.toLocaleDateString("id-ID", options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);
  // ⬆⬆⬆ REALTIME CLOCK SAMPAI SINI ⬆⬆⬆


  const currentUser = {
    name: 'Membership',
    accountNumber: '7799021650880'
  };

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white border-r transition-all duration-300 overflow-hidden shadow-sm flex-shrink-0`}>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-blue-800 rounded-lg flex items-center justify-center">
              <img src="public/img/logo-metland.png" alt="Bank Logo" className="w-8 h-8 object-contain rounded" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">Metschoo Bank</h1>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-tr from-blue-800 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{currentUser.name}</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            </div>
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

          {/* Real-time clock output */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">{time}</span>
            <span className="text-sm text-gray-500">{date}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
