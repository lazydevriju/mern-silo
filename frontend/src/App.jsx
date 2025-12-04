import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:4000";

// variables
function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // fetching from backend
  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_BASE}/api/files`);
      setFiles(res.data.files || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // UI
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Silo Dashboard</h1>
      <p>Secure file sharing server</p>

      <button onClick={fetchFiles} style={{ marginBottom: "10px" }}>
        Refresh files
      </button>

      {loading && <p>Loading files...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {files.length === 0 && !loading && <p>No files found in Silo folder.</p>}

      {files.length > 0 && (
        <ul>
          {files.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
