import { Upload, X } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'];

function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [username, setUsername] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedLinks, setUploadedLinks] = useState<string[]>([]);

  const validateFiles = (incomingFiles: File[]) => {
    const validFiles: File[] = [];
    const rejectedFiles: string[] = [];

    incomingFiles.forEach((file) => {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (allowedExtensions.includes(ext)) {
        validFiles.push(file);
      } else {
        rejectedFiles.push(file.name);
      }
    });

    if (rejectedFiles.length) {
      toast.error(`Unsupported file(s): ${rejectedFiles.join(', ')}`);
    }

    return validFiles;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(droppedFiles);
    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = validateFiles(selectedFiles);
      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!username.trim()) {
      toast.error('Please enter your username.');
      return;
    }

    if (files.length === 0) {
      toast.error('Please select files to upload.');
      return;
    }

    setIsUploading(true);
    const links: string[] = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('file', file);

        const res = await fetch('http://localhost:5000/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || `Upload failed for ${file.name}`);

        toast.success(`${file.name} uploaded`);
        //links.push(`http://localhost:5000${data.fileUrl}`);
      }

      setUploadedLinks(links);
      setFiles([]);
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Upload Your Files</h2>

      <input
        type="text"
        className="w-full border p-2 mb-4 rounded"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <div
        className={`border-2 border-dashed p-6 rounded-lg text-center transition ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto mb-2" />
        <p>Drag and drop files here or</p>
        <label className="cursor-pointer text-blue-600 underline">
          select files
          <input type="file" multiple className="hidden" onChange={handleFileSelect} />
        </label>
        <p className="text-sm text-gray-500 mt-1">Allowed: PDF, Word, Excel, TXT</p>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium">Files to upload:</h4>
          <ul className="space-y-2 mt-2">
            {files.map((file, index) => (
              <li key={index} className="flex justify-between items-center border p-2 rounded">
                <span>{file.name}</span>
                <button onClick={() => removeFile(index)}>
                  <X className="text-red-500" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={handleUpload}
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>

      {uploadedLinks.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-2">Uploaded Files:</h4>
          <ul className="list-disc ml-5 text-blue-600">
            {uploadedLinks.map((url, idx) => (
              <li key={idx}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
                  {url.split('/').pop()}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default UploadPage;
