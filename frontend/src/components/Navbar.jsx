import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-dark-900/80 backdrop-blur-xl border-b border-indigo-500/10 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-2xl">📚</div>
            <Link 
              to="/" 
              className="text-xl font-bold text-rose-500 bg-gradient-accent bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              StudyRoom
            </Link>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/40 hover:border-indigo-400/80 transition-all shadow-md">
                  <span className="text-indigo-400 font-bold text-base">👤</span>
                  <span className="text-indigo-300 font-bold text-sm">{user?.name}</span>
                </div>
                <Link
                  to="/dashboard"
                  className="text-gray-400 hover:text-cyan-400 transition-colors font-medium text-sm"
                >
                  Dashboard
                </Link>
                <Link
                  to="/activity"
                  className="text-gray-400 hover:text-cyan-400 transition-colors font-medium text-sm"
                >
                  Activity
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-400 hover:text-cyan-400 transition-colors font-medium text-sm"
                >
                  Profile
                </Link>
                <button
  onClick={handleLogout}
  className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
>
  Logout
</button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-400 hover:text-cyan-400 transition-colors font-medium text-sm"
                >
                  Login
                </Link>
                <Link to="/register" className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
