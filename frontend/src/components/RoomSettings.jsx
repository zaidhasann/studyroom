import React, { useState } from 'react';
import { roomAPI } from '../services/api';
import { useToast } from '../hooks/useToast';

const RoomSettings = ({ room, onSettingsUpdate, isCreator }) => {
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' or 'members'
  const [formData, setFormData] = useState({
    roomName: room?.roomName || '',
    description: room?.description || '',
    category: room?.category || 'General',
    maxMembers: room?.maxMembers || 20,
    password: '',
    passwordConfirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const categories = ['Math', 'Science', 'Literature', 'History', 'Languages', 'Programming', 'Arts', 'General'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'maxMembers' ? parseInt(value) : value,
    }));
  };

  const handleSave = async () => {
    if (!formData.roomName.trim()) {
      addToast('Room name is required', 'error');
      return;
    }

    if (formData.password && formData.password !== formData.passwordConfirm) {
      addToast('Passwords do not match', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await roomAPI.updateRoom(
        room._id,
        formData.roomName,
        formData.description,
        formData.category,
        formData.maxMembers,
        formData.password || undefined
      );
      addToast('Settings updated successfully', 'success');
      setIsOpen(false);
      onSettingsUpdate();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to update settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the room?')) {
      return;
    }

    setIsRemoving(true);
    try {
      await roomAPI.removeMember(room._id, memberId);
      addToast('Member removed successfully', 'success');
      onSettingsUpdate();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to remove member', 'error');
    } finally {
      setIsRemoving(false);
    }
  };

  if (!isCreator) {
    return (
      <div className="card">
        <h3 className="font-bold mb-2 text-indigo-400">Room Settings</h3>
        <p className="text-sm text-gray-400">Only room creator can modify settings</p>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary"
      >
        ⚙️ Room Settings
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-hidden border border-dark-600 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-dark-600">
              <h2 className="text-xl font-bold text-white">Room Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-dark-600 bg-dark-900">
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'text-indigo-400 border-b-2 border-indigo-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Settings
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'members'
                    ? 'text-indigo-400 border-b-2 border-indigo-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Members ({room?.participants?.length || 0})
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'settings' ? (
                <div className="p-6 space-y-4">
                  {/* Room Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Room Name</label>
                    <input
                      type="text"
                      name="roomName"
                      value={formData.roomName}
                      onChange={handleChange}
                      className="mt-1 w-full px-3 py-2 border border-dark-600 bg-dark-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="mt-1 w-full px-3 py-2 border border-dark-600 bg-dark-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                      placeholder="Room description"
                      rows="2"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="mt-1 w-full px-3 py-2 border border-dark-600 bg-dark-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Max Members */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300">
                      Max Members ({room?.participants?.length || 0}/{formData.maxMembers})
                    </label>
                    <input
                      type="number"
                      name="maxMembers"
                      value={formData.maxMembers}
                      onChange={handleChange}
                      min="2"
                      max="100"
                      className="mt-1 w-full px-3 py-2 border border-dark-600 bg-dark-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300">
                      New Password (leave empty to remove)
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-dark-600 bg-dark-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2 text-gray-400 text-sm"
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  {formData.password && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300">
                        Confirm Password
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="passwordConfirm"
                        value={formData.passwordConfirm}
                        onChange={handleChange}
                        className="mt-1 w-full px-3 py-2 border border-dark-600 bg-dark-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="Confirm password"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 space-y-3">
                  {room?.participants && room.participants.length > 0 ? (
                    room.participants.map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center justify-between p-3 bg-dark-700 rounded-md border border-dark-600"
                      >
                        <div>
                          <p className="font-medium text-white">{member.name}</p>
                          <p className="text-xs text-gray-400">{member.email}</p>
                          {room.createdBy._id === member._id && (
                            <p className="text-xs text-indigo-400 mt-1">👑 Room Creator</p>
                          )}
                        </div>
                        {room.createdBy._id !== member._id && (
                          <button
                            onClick={() => handleRemoveMember(member._id)}
                            disabled={isRemoving}
                            className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">No members in this room</p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {activeTab === 'settings' && (
              <div className="p-6 border-t border-dark-600 flex gap-3 justify-end bg-dark-900">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-300 border border-dark-600 rounded-md hover:bg-dark-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default RoomSettings;
