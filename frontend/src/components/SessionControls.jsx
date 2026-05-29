import React, { useState } from 'react';
import { sessionAPI } from '../services/api';

const SessionControls = ({ roomId, sessionId, isSessionActive, onSessionChange }) => {
  const [loading, setLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleStart = async () => {
    try {
      setLoading(true);
      const response = await sessionAPI.startSession(roomId);
      onSessionChange('started', response.data.session);
    } catch (error) {
      console.error('Failed to start session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      setLoading(true);
      await sessionAPI.pauseSession(sessionId);
      setIsPaused(true);
      onSessionChange('paused');
    } catch (error) {
      console.error('Failed to pause session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    try {
      setLoading(true);
      await sessionAPI.resumeSession(sessionId);
      setIsPaused(false);
      onSessionChange('resumed');
    } catch (error) {
      console.error('Failed to resume session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = async () => {
    try {
      setLoading(true);
      await sessionAPI.endSession(sessionId);
      onSessionChange('ended');
      setIsPaused(false);
    } catch (error) {
      console.error('Failed to end session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3 justify-center flex-wrap pt-4">
      {!isSessionActive ? (
        <button
          onClick={handleStart}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/50 disabled:opacity-50"
        >
          <span className="text-lg">▶️</span>
          Start Session
        </button>
      ) : (
        <>
          {isPaused ? (
            <button
              onClick={handleResume}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/50 disabled:opacity-50"
            >
              <span className="text-lg">▶️</span>
              Resume
            </button>
          ) : (
            <button
              onClick={handlePause}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/50 disabled:opacity-50"
            >
              <span className="text-lg">⏸️</span>
              Pause
            </button>
          )}
          <button
            onClick={handleEnd}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-500/50 disabled:opacity-50"
          >
            <span className="text-lg">⏹️</span>
            End Session
          </button>
        </>
      )}
    </div>
  );
};

export default SessionControls;
