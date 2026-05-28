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
    <div className="flex gap-3 justify-center">
      {!isSessionActive ? (
        <button onClick={handleStart} className="btn-primary" disabled={loading}>
          Start Session
        </button>
      ) : (
        <>
          {isPaused ? (
            <button onClick={handleResume} className="btn-primary" disabled={loading}>
              Resume
            </button>
          ) : (
            <button onClick={handlePause} className="btn-secondary" disabled={loading}>
              Pause
            </button>
          )}
          <button onClick={handleEnd} className="btn-danger" disabled={loading}>
            End Session
          </button>
        </>
      )}
    </div>
  );
};

export default SessionControls;
