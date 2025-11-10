import { useEffect, useState } from "react";

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk form tambah/edit
  const [formData, setFormData] = useState({ id: null, name: "", email: "" });

  // Ambil semua user
  const fetchUsers = () => {
    fetch("http://localhost:5000/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Tambah / Update user
  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = formData.id ? "PUT" : "POST";
    const url = formData.id
      ? `http://localhost:5000/api/users/${formData.id}`
      : "http://localhost:5000/api/users";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
      }),
    });

    const data = await res.json();
    console.log(data);

    setFormData({ id: null, name: "", email: "" });
    fetchUsers();
  };

  // Hapus user
  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin hapus user ini?")) return;

    await fetch(`http://localhost:5000/api/users/${id}`, {
      method: "DELETE",
    });

    fetchUsers();
  };

  // Edit user
  const handleEdit = (user) => {
    setFormData(user);
  };

  if (loading) return <p>Loading data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ marginTop: "2rem", textAlign: "left" }}>
      <h2>📋 Daftar Pengguna</h2>

      <form
        onSubmit={handleSubmit}
        style={{
          marginBottom: "1rem",
          padding: "1rem",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h3>{formData.id ? "✏️ Edit User" : "➕ Tambah User"}</h3>
        <input
          type="text"
          placeholder="Nama"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          style={{ marginRight: "0.5rem" }}
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          style={{ marginRight: "0.5rem" }}
        />
        <button type="submit">
          {formData.id ? "Update" : "Tambah"}
        </button>
        {formData.id && (
          <button
            type="button"
            onClick={() => setFormData({ id: null, name: "", email: "" })}
            style={{ marginLeft: "0.5rem" }}
          >
            Batal
          </button>
        )}
      </form>

      {users.length === 0 ? (
        <p>Belum ada data pengguna.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama</th>
              <th>Email</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <button onClick={() => handleEdit(user)}>Edit</button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    style={{ marginLeft: "0.5rem" }}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UserList;
