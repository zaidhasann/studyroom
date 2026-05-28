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
    <nav className="bg-dark-800/50 backdrop-blur-md border-b border-dark-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold bg-gradient-accent bg-clip-text text-transparent">
              📚 StudyRoom
            </Link>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-maroon-400 font-semibold">{user?.name}</span>
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-maroon-400 transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-300 hover:text-maroon-400 transition-colors font-medium"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-primary"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
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
