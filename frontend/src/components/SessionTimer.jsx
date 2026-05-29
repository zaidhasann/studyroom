import React, { useState, useEffect } from 'react';
import { formatTime } from '../utils/formatters';

const SessionTimer = ({ isRunning, onTimerUpdate, onEnd }) => {
  const [elapsed, setElapsed] = useState(0);
  const [milestone, setMilestone] = useState(null);
  const [showMilestone, setShowMilestone] = useState(false);

  const MILESTONES = [
    { time: 900, label: '15 MIN', emoji: '🔥', color: 'from-orange-400 to-red-500' },
    { time: 1800, label: '30 MIN', emoji: '💪', color: 'from-purple-400 to-pink-500' },
    { time: 2700, label: '45 MIN', emoji: '⭐', color: 'from-indigo-400 to-purple-500' },
    { time: 3600, label: '1 HOUR', emoji: '🏆', color: 'from-yellow-400 to-orange-500' },
  ];

  const getMotivationalMessage = () => {
    const minutes = Math.floor(elapsed / 60);
    if (minutes === 0) return 'Get focused! 🎯';
    if (minutes < 5) return 'Great start! 💨';
    if (minutes < 15) return 'You got this! 💪';
    if (minutes < 30) return 'Amazing progress! 🌟';
    if (minutes < 45) return 'Keep going! 🚀';
    if (minutes < 60) return 'Unstoppable! 🔥';
    return 'Legend status! 👑';
  };

  const getCurrentMilestone = () => {
    return MILESTONES.find(m => Math.floor(elapsed / m.time) > 0);
  };

  useEffect(() => {
    let interval;

    if (isRunning) {
      interval = setInterval(() => {
        setElapsed((prev) => {
          const newElapsed = prev + 1;
          onTimerUpdate(newElapsed);

          // Check milestones
          const currentMilestone = MILESTONES.find(
            m => newElapsed === m.time && prev < m.time
          );
          if (currentMilestone) {
            setMilestone(currentMilestone);
            setShowMilestone(true);
            setTimeout(() => setShowMilestone(false), 3000);
          }

          return newElapsed;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, onTimerUpdate]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const progressPercentage = Math.min((elapsed / 3600) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* Milestone Celebration */}
      {showMilestone && (
        <div className={`animate-bounce text-center p-3 rounded-lg bg-gradient-to-r ${milestone?.color}`}>
          <div className="text-3xl">{milestone?.emoji}</div>
          <div className="text-white font-bold text-lg">{milestone?.label}</div>
          <div className="text-white text-sm">Incredible effort!</div>
        </div>
      )}

      {/* Main Timer Display */}
      <div className="flex flex-col items-center gap-6">
        {/* Circular Progress */}
        <div className="relative w-48 h-48">
          <svg className="transform -rotate-90" width="200" height="200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="45"
              fill="none"
              stroke="rgba(99, 102, 241, 0.1)"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="45"
              fill="none"
              stroke="url(#gradientCircle)"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient
                id="gradientCircle"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="rgb(99, 102, 241)" />
                <stop offset="100%" stopColor="rgb(168, 85, 247)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Time Display in Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold font-mono bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-400 mt-1">HH:MM</div>
          </div>

          {/* Progress Percentage */}
          <div className="absolute top-2 right-2 text-sm font-bold text-indigo-400">
            {Math.min(Math.floor(progressPercentage), 100)}%
          </div>
        </div>

        {/* Motivational Message */}
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-300 mb-1">
            {getMotivationalMessage()}
          </div>
          <div className="text-sm text-gray-400">
            {isRunning ? (
              <>
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Session in progress...
              </>
            ) : (
              'Ready to study'
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {/* Current Time */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg p-3 border border-indigo-500/30 text-center">
            <div className="text-xs text-gray-400 uppercase font-semibold">This Session</div>
            <div className="text-lg font-bold text-indigo-300 mt-1">{formatTime(elapsed)}</div>
          </div>

          {/* Milestone Status */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-3 border border-purple-500/30 text-center">
            <div className="text-xs text-gray-400 uppercase font-semibold">Next Goal</div>
            <div className="text-lg font-bold text-purple-300 mt-1">
              {minutes < 15 ? '15m' : minutes < 30 ? '30m' : minutes < 45 ? '45m' : '1h+'}
            </div>
          </div>

          {/* Streak */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg p-3 border border-cyan-500/30 text-center">
            <div className="text-xs text-gray-400 uppercase font-semibold">Focus</div>
            <div className="text-lg font-bold text-cyan-300 mt-1">
              {isRunning ? '🎯 Active' : '⏸️ Paused'}
            </div>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="flex gap-2 justify-center flex-wrap">
          {MILESTONES.map((m) => (
            <div
              key={m.time}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                elapsed >= m.time
                  ? `bg-gradient-to-r ${m.color} text-white scale-105`
                  : 'bg-gray-700/30 text-gray-400'
              }`}
            >
              {m.emoji} {m.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SessionTimer;
