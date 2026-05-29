import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const FloatingWatch = () => {
  const { isAuthenticated, loginTime } = useAuth();
  const [elapsed, setElapsed] = useState('00:00:00');
  const [showDetails, setShowDetails] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [stoppedTime, setStoppedTime] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stopped = localStorage.getItem('timerStopped') === 'true';
      const stopped_time = localStorage.getItem('stoppedTime');
      setIsStopped(stopped);
      if (stopped_time) setStoppedTime(parseInt(stopped_time));
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !loginTime) return;

    const updateTimer = () => {
      let diff;
      if (isStopped) {
        diff = stoppedTime;
      } else {
        const now = Date.now();
        diff = now - loginTime;
      }
      
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setElapsed(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, loginTime, isStopped, stoppedTime]);

  const handleToggleTimer = () => {
    if (isStopped) {
      // Resume timer
      localStorage.removeItem('timerStopped');
      localStorage.removeItem('stoppedTime');
      setIsStopped(false);
      setStoppedTime(0);
    } else {
      // Stop timer
      const now = Date.now();
      const elapsedMs = now - loginTime;
      localStorage.setItem('timerStopped', 'true');
      localStorage.setItem('stoppedTime', elapsedMs.toString());
      setIsStopped(true);
      setStoppedTime(elapsedMs);
    }
  };

  if (!isAuthenticated || !loginTime) return null;

  return (
    <div className="fixed bottom-8 right-8 z-40">
      {/* Floating Watch Button - Enlarged */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className={`group relative w-24 h-24 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex flex-col items-center justify-center border-2 ${
            isStopped 
              ? 'bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 border-gray-500/50 hover:shadow-gray-500/50' 
              : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 hover:from-indigo-600 hover:via-purple-600 hover:to-purple-700 border-indigo-400/50 hover:shadow-lg hover:shadow-indigo-500/50'
          }`}
        >
          <span className="text-4xl mb-1">{isStopped ? '⏸️' : '⏱️'}</span>
          <span className="text-xs font-bold text-white/90 tracking-widest">{elapsed.split(':')[0]}h</span>
        </button>

        {/* Timer Status Indicator */}
        <div className={`text-center text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-md border ${
          isStopped
            ? 'bg-gray-500/20 border-gray-500/30 text-gray-300'
            : 'bg-indigo-500/20 border-indigo-400/30 text-indigo-300'
        }`}>
          {isStopped ? '⏸️ Paused' : '▶️ Running'}
        </div>
      </div>

      {/* Details Popup */}
      {showDetails && (
        <div className="absolute bottom-28 right-0 bg-gradient-to-br from-dark-800 to-dark-900 border-2 border-indigo-500/40 rounded-2xl shadow-2xl p-6 mb-2 w-80 backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">{isStopped ? '⏸️' : '⏱️'}</div>
            <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest">Session Timer</p>
          </div>

          {/* Main Timer Display */}
          <div className="bg-dark-900/50 border border-indigo-500/20 rounded-xl p-6 mb-6 backdrop-blur-md">
            <p className={`font-mono text-5xl font-bold text-center tracking-wide ${isStopped ? 'text-gray-400' : 'text-indigo-400'}`}>
              {elapsed}
            </p>
            <p className="text-center text-gray-400 text-sm mt-3">
              {isStopped ? '⏸️ Timer Paused' : '▶️ Timer Running'}
            </p>
          </div>

          {/* Login Time */}
          <div className="bg-dark-900/30 rounded-lg p-3 mb-6 border border-purple-500/20">
            <p className="text-xs text-gray-500 mb-1">Logged in at</p>
            <p className="text-sm text-purple-300 font-semibold">
              {new Date(loginTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>

          {/* Control Button */}
          <button
            onClick={handleToggleTimer}
            className={`w-full px-4 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 border-2 ${
              isStopped
                ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 text-indigo-300 hover:from-indigo-600/50 hover:to-purple-600/50 border-indigo-500/50 hover:border-indigo-400/70'
                : 'bg-gradient-to-r from-red-600/30 to-orange-600/30 text-red-300 hover:from-red-600/50 hover:to-orange-600/50 border-red-500/50 hover:border-red-400/70'
            }`}
          >
            {isStopped ? (
              <>
                <span>▶️</span>
                <span>Resume Timer</span>
              </>
            ) : (
              <>
                <span>⏹️</span>
                <span>Stop Timer</span>
              </>
            )}
          </button>

          {/* Footer Info */}
          <div className="mt-4 pt-4 border-t border-indigo-500/20 text-center">
            <p className="text-gray-500 text-xs">
              {isStopped ? 'Click resume to continue studying' : 'Keep up the great work! 🎯'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingWatch;
