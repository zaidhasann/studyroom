import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { authAPI } from '../services/api';
import Toast from '../components/Toast';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateProfile(name);
      addToast('Profile updated successfully', 'success');
      setEditing(false);
    } catch (error) {
      addToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-premium py-12 px-4">
      <Toast toasts={toasts} removeToast={removeToast} />
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-accent bg-clip-text text-transparent">Profile Settings</h1>

          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                />
              ) : (
                <p className="text-indigo-400">{user?.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <p className="text-gray-300">{user?.email}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-dark-600">
              {editing ? (
                <>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setName(user?.name || '');
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="btn-primary">
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
