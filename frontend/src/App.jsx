import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const API_BASE = "http://localhost:4000";

function App() {
  // states
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [filesError, setFilesError] = useState("");

  const [selectedFile, setSelectedFile] = useState("");
  const [expiresInMinutes, setExpiresInMinutes] = useState(15);
  const [maxDownloads, setMaxDownloads] = useState(1);

  const [shareUrl, setShareUrl] = useState("");
  const [shareError, setShareError] = useState("");
  const [shareLoading, setShareLoading] = useState(false);

  // socket connection
  useEffect(() => {
    const socket = io(API_BASE);

    // Listen for real-time updates from Chokidar
    socket.on("file_update", () => {
      console.log("File system changed! Refreshing list...");
      fetchFiles(); // Auto-refresh the list
    });

    return () => socket.disconnect();
  }, []);

  // fetch file from backend
  const fetchFiles = async () => {
    try {
      setLoadingFiles(true);
      setFilesError("");
      const res = await axios.get(`${API_BASE}/api/files`);
      setFiles(res.data.files || []);
    } catch (err) {
      console.error(err);
      setFilesError("Failed to load files from Silo directory");
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleGenerateLink = async () => {
    if (!selectedFile) {
      setShareError("Please select a file first.");
      return;
    }

    try {
      setShareLoading(true);
      setShareError("");
      setShareUrl("");

      const res = await axios.post(`${API_BASE}/api/share`, {
        filename: selectedFile,
        expiresInMinutes: Number(expiresInMinutes),
        maxDownloads: Number(maxDownloads),
      });

      setShareUrl(res.data.url);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.error) {
        setShareError(err.response.data.error);
      } else {
        setShareError("Failed to generate share link.");
      }
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard.");
    } catch (err) {
      console.error("Clipboard error:", err);
      alert("Could not copy link. Copy it manually.");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Silo</h1>
      <p>Secure file sharing with expiring links.</p>

      <section style={{ marginBottom: "20px" }}>
        <h2>Files in Silo directory</h2>
        <button onClick={fetchFiles} disabled={loadingFiles}>
          {loadingFiles ? "Refreshing..." : "Refresh files"}
        </button>
        {filesError && <p style={{ color: "red" }}>{filesError}</p>}
        {files.length === 0 && !loadingFiles && (
          <p>No files found. Add some files to your BASE_DIR folder.</p>
        )}
        {files.length > 0 && (
          <ul>
            {files.map((file) => (
              <li key={file}>
                <button
                  onClick={() => setSelectedFile(file)}
                  style={{
                    border: selectedFile === file ? "2px solid #ffffffff" : "0px solid #373535ff",
                    background: selectedFile === file ? "#025bffff" : "#2e3434",
                    padding: "4px 8px",
                    cursor: "pointer",
                  }}
                >
                  {file} {selectedFile === file && " (selected)"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginBottom: "20px" }}>
        <h2>Create secure share link</h2>
        <p>Selected file: <strong>{selectedFile || "None"}</strong></p>

        <div style={{ marginBottom: "10px" }}>
          <label>
            Expires in (minutes):{" "}
            <input
              type="number"
              value={expiresInMinutes}
              onChange={(e) => setExpiresInMinutes(e.target.value)}
              style={{ width: "80px" }}
              min={1}
            />
          </label>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>
            Max downloads:{" "}
            <input
              type="number"
              value={maxDownloads}
              onChange={(e) => setMaxDownloads(e.target.value)}
              style={{ width: "80px" }}
              min={1}
            />
          </label>
        </div>

        <button onClick={handleGenerateLink} disabled={shareLoading}>
          {shareLoading ? "Generating..." : "Generate link"}
        </button>

        {shareError && <p style={{ color: "red" }}>{shareError}</p>}
      </section>

      <section>
        <h2>Generated link</h2>
        {shareUrl ? (
          <div>
            <p>You can share this URL:</p>
            <code style={{ display: "block", wordBreak: "break-all", marginBottom: "10px" }}>
              {shareUrl}
            </code>
            <button onClick={handleCopy}>Copy link</button>
          </div>
        ) : (
          <p>No link generated yet.</p>
        )}
      </section>
    </div>
  );
}

export default App;
