// src/components/Layout.jsx
import { Outlet, NavLink } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-700 text-white p-5">
        <h2 className="text-2xl font-bold mb-8">Membership Bank</h2>
        <nav className="space-y-3">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md ${isActive ? "bg-blue-500" : "hover:bg-blue-600"}`
            }
          >
            Admin Panel
          </NavLink>
          <NavLink
            to="/register"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md ${isActive ? "bg-blue-500" : "hover:bg-blue-600"}`
            }
          >
            Pendaftaran Anggota
          </NavLink>
          <NavLink
            to="/balance"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md ${isActive ? "bg-blue-500" : "hover:bg-blue-600"}`
            }
          >
            Cek Saldo
          </NavLink>
        </nav>
      </aside>

      {/* Konten utama */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-700">Dashboard Teller</h1>
          <button className="text-sm text-gray-500 hover:text-gray-700">Logout</button>
        </header>

        {/* Tempat halaman tampil */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
