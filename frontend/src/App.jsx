import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { 
  File, 
  Link as LinkIcon, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Copy,
  CheckCircle,
  HardDrive
} from "lucide-react";

import { getFiles } from "./api/files";
import { createShareLink } from "./api/share";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE;

function App() {
  const [files, setFiles] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Selection & Sharing
  const [selectedFile, setSelectedFile] = useState(null);
  const [expiresIn, setExpiresIn] = useState(60);
  const [maxDownloads, setMaxDownloads] = useState(5);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const linkInputRef = useRef(null);

  // 1. Initial Load & Real-time Sync
  useEffect(() => {
    fetchFiles();

    const socket = io(API_BASE);

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    
    // Auto-refresh when files change on disk
    socket.on("file_update", (data) => {
      console.log(`Live Update: ${data.type} -> ${data.path}`);
      fetchFiles(); 
    });

    return () => socket.disconnect();
  }, []);

  const fetchFiles = async () => {
  try {
    setLoading(true);
    setError("");
    const data = await getFiles();
    setFiles(data);
  } catch (err) {
    console.error(err);
    setError("Could not load files. Is the Silo Backend running?");
  } finally {
    setLoading(false);
  }
};

const generateLink = async () => {
  if (!selectedFile) return;
  try {
    const result = await createShareLink({
      filename: selectedFile,
      expiresInMinutes: Number(expiresIn),
      maxDownloads: Number(maxDownloads),
    });
    setShareLink(result.url);
    setCopied(false);
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || "Failed to create link");
  }
};

  const copyToClipboard = async () => {
  if (!shareLink) return;

  try {
    // Preferred: secure context clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(shareLink);
    } else if (linkInputRef.current) {
      // Fallback: select text + execCommand
      const input = linkInputRef.current;
      input.focus();
      input.select();
      const successful = document.execCommand("copy");
      if (!successful) {
        throw new Error("execCommand copy failed");
      }
      // Clear selection
      window.getSelection()?.removeAllRanges();
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    // Last fallback: user can at least manually select
    alert("Copy not allowed by browser. Long-press the link and copy manually.");
  }
};

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="app-header">
        <div className="brand">
          <HardDrive size={24} className="brand-icon" />
          <h1>Silo <span className="version">v1.1</span></h1>
        </div>
        <div className={`status-badge ${isConnected ? "online" : "offline"}`}>
          {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span>{isConnected ? "System Online" : "Disconnected"}</span>
        </div>
      </header>

      <main className="main-content">
        {/* LEFT: FILE BROWSER */}
        <section className="file-browser card">
          <div className="card-header">
            <h2>Storage</h2>
            <button onClick={fetchFiles} className="icon-btn" disabled={loading}>
              <RefreshCw size={18} className={loading ? "spin" : ""} />
            </button>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <div className="file-list">
            {files.length === 0 && !loading && (
              <div className="empty-state">No files found in shared folder.</div>
            )}
            
            {files.map((file) => (
              <div 
                key={file}
                className={`file-item ${selectedFile === file ? "active" : ""}`}
                onClick={() => {
                  setSelectedFile(file);
                  setShareLink(""); // Reset link when changing selection
                }}
              >
                <File size={20} className="file-icon" />
                <span className="file-name">{file}</span>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT: ACTION PANEL */}
        <section className="action-panel">
          <div className="card controls-card">
            <div className="card-header">
              <h2>Share Configuration</h2>
            </div>
            
            {selectedFile ? (
              <div className="control-form">
                <div className="selected-preview">
                  <File size={32} />
                  <div className="file-info">
                    <span className="label">Selected File</span>
                    <span className="name">{selectedFile}</span>
                  </div>
                </div>

                <div className="input-group">
                  <label>Expires In (Minutes)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={expiresIn}
                    onChange={(e) => setExpiresIn(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>Max Downloads</label>
                  <input 
                    type="number" 
                    min="1"
                    value={maxDownloads}
                    onChange={(e) => setMaxDownloads(e.target.value)}
                  />
                </div>

                <button className="primary-btn" onClick={generateLink}>
                  <LinkIcon size={18} />
                  Generate Secure Link
                </button>
              </div>
            ) : (
              <div className="empty-selection">
                <p>Select a file to generate a share link.</p>
              </div>
            )}
          </div>

          {/* RESULT CARD */}
          {shareLink && (
            <div className="card result-card fade-in">
              <div className="card-header">
                <h2>Ready to Share</h2>
              </div>
              <div className="link-box">
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  ref={linkInputRef}
                />
                
                <button 
                  className={`copy-btn ${copied ? "success" : ""}`} 
                  onClick={copyToClipboard}
                >
                  {copied ? <CheckCircle size={24} /> : <Copy size={24} />}
                </button>
              </div>
              <div className="link-meta">
                <small>Expires in {expiresIn} mins • {maxDownloads} downloads max</small>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;