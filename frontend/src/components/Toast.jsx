import React from 'react';

const Toast = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg text-white font-medium shadow-lg fade-in border backdrop-blur-sm ${
            toast.type === 'success' && 'bg-green-600/80 border-green-500/30'
          } ${toast.type === 'error' && 'bg-red-600/80 border-red-500/30'} ${
            toast.type === 'info' && 'bg-cyan-600/80 border-cyan-500/30'
          }`}
        >
          <div className="flex justify-between items-center gap-4">
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Toast;
