import React, { useState, useEffect } from 'react';
import { roomAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import { formatDatetime } from '../utils/formatters';

const SharedFiles = ({ roomId }) => {
  const { addToast } = useToast();
  const [files, setFiles] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    file: null,
    fileType: 'document',
    description: '',
  });

  const fileTypes = ['note', 'document', 'image', 'video', 'other'];

  useEffect(() => {
    loadFiles();
  }, [roomId]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await roomAPI.getFiles(roomId);
      setFiles(response.data.files);
    } catch (error) {
      console.error('Failed to load files:', error);
      addToast('Failed to load files', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        addToast('File size exceeds 50MB limit', 'error');
        return;
      }
      setFormData((prev) => ({ ...prev, file }));
    }
  };

  const handleUpload = async () => {
    if (!formData.file) {
      addToast('Please select a file', 'error');
      return;
    }

    setUploading(true);
    try {
      await roomAPI.uploadFile(
        roomId,
        formData.file,
        formData.fileType,
        formData.description
      );
      addToast('File uploaded successfully', 'success');
      setFormData({ file: null, fileType: 'document', description: '' });
      loadFiles();
      setIsOpen(false);
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to upload file', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Delete this file?')) {
      try {
        await roomAPI.deleteFile(fileId);
        addToast('File deleted', 'success');
        loadFiles();
      } catch (error) {
        addToast('Failed to delete file', 'error');
      }
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('video')) return '🎥';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    return '📎';
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary"
      >
        📁 Shared Files
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col border border-dark-600">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-dark-600">
              <h2 className="text-xl font-bold text-white">Shared Files</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
                </div>
              ) : files.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No files shared yet</p>
              ) : (
                <div className="space-y-3">
                  {files.map((file) => (
                    <div
                      key={file._id}
                      className="flex items-center justify-between p-4 border border-dark-600 rounded-lg hover:bg-dark-700/50"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl">{getFileIcon(file.mimeType)}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-200 truncate">{file.fileName}</p>
                          <div className="flex gap-2 text-xs text-gray-400">
                            <span>{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                            <span>•</span>
                            <span>{file.uploadedBy?.name}</span>
                            <span>•</span>
                            <span>{formatDatetime(file.createdAt)}</span>
                          </div>
                          {file.description && (
                            <p className="text-xs text-gray-500 mt-1">{file.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <a
                          href={file.fileUrl}
                          download
                          className="text-xs px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30"
                        >
                          Download
                        </a>
                        <button
                          onClick={() => handleDelete(file._id)}
                          className="text-xs px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upload Section */}
            <div className="border-t border-dark-600 p-6 bg-dark-900">
              <h3 className="font-semibold text-white mb-3">Upload File</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Select File
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-400 file:text-white
                      hover:file:bg-indigo-500"
                  />
                  {formData.file && (
                    <p className="text-xs text-gray-400 mt-1">
                      {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      File Type
                    </label>
                    <select
                      value={formData.fileType}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, fileType: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-dark-600 bg-dark-700 text-white text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      {fileTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Description (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Brief description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-dark-600 bg-dark-700 text-white text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={!formData.file || uploading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SharedFiles;
