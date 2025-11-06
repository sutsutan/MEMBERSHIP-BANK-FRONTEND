import { useEffect, useState } from "react";

function AdminPanel() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/test")
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Fetch error:", err));
  }, []);

  return (
    <div>
      <h1>Koneksi ke Backend:</h1>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default AdminPanel;
