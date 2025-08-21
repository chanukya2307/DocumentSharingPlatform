import axios from "axios";
import { Trash2 } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

const BASE_URL = "https://documentsharingplatform.onrender.com";

const ViewFilesPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    if (!username.trim()) {
      setError("Please enter the access code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${BASE_URL}/files/${username}`);
      setFiles(response.data.files || []);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Failed to load files.");
    }

    setLoading(false);
  };

  const handleDelete = async (filename: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this file?");
    if (!confirmed) return;

    try {
      await axios.delete(`${BASE_URL}/files/${filename}`);
      toast.success("File deleted successfully");
      setFiles((prev) => prev.filter((file) => file.filename !== filename));
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete file");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Retrieve Uploaded Files</h2>

      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border px-3 py-2 rounded w-64"
        />
        <button
          onClick={fetchFiles}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {loading && <p>Loading files...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {files.length > 0 && (
        <ul className="mt-4 space-y-4">
          {files.map((file, idx) => (
            <li
              key={idx}
              className="border p-4 rounded shadow-md flex justify-between items-center"
            >
              <div>
                <p>
                  <strong>Filename:</strong> {file.filename}
                </p>
                <p>
                  <strong>Size:</strong> {file.size} bytes
                </p>
                <p>
                  <strong>Uploaded:</strong>{" "}
                  {new Date(file.uploaded_at).toLocaleString()}
                </p>
                <a
                  href={`${BASE_URL}/uploads/${file.filename}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Download File
                </a>
              </div>

              <button
                onClick={() => handleDelete(file.filename)}
                title="Delete file"
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={20} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!loading && files.length === 0 && !error && (
        <p>No files found for this user.</p>
      )}
    </div>
  );
};

export default ViewFilesPage;
