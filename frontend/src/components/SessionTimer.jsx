import React, { useState, useEffect } from 'react';
import { formatTime } from '../utils/formatters';

const SessionTimer = ({ isRunning, onTimerUpdate, onEnd }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval;

    if (isRunning) {
      interval = setInterval(() => {
        setElapsed((prev) => {
          const newElapsed = prev + 1;
          onTimerUpdate(newElapsed);
          return newElapsed;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, onTimerUpdate]);

  return (
    <div className="text-center">
      <div className="text-5xl font-bold text-blue-600 font-mono mb-4">
        {formatTime(elapsed)}
      </div>
      <div className="text-sm text-gray-600">
        {isRunning ? 'Session in progress...' : 'Ready to study'}
      </div>
    </div>
  );
};

export default SessionTimer;
