import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-gradient-premium min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-600/20 rounded-full mix-blend-screen blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-purple-700/20 rounded-full mix-blend-screen blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center w-full relative z-10">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-accent bg-clip-text text-transparent mb-6 drop-shadow-lg">
            Study Better, Together
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Create focused virtual study rooms, collaborate in real-time, track your progress, and achieve your goals with friends.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {!isAuthenticated ? (
              <>
                <Link to="/register" className="btn-primary px-6 py-3 text-lg">
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="btn-secondary px-6 py-3 text-lg"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <Link to="/dashboard" className="btn-primary px-6 py-3 text-lg">
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-accent bg-clip-text text-transparent">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center group hover:border-indigo-400 hover:shadow-glow">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2 text-indigo-400 group-hover:text-indigo-300 transition-colors">Create Rooms</h3>
              <p className="text-gray-400">
                Start a study session and invite friends with a room code.
              </p>
            </div>
            <div className="card text-center group hover:border-indigo-400 hover:shadow-glow">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2 text-indigo-400 group-hover:text-indigo-300 transition-colors">Real-time Chat</h3>
              <p className="text-gray-400">
                Communicate with study partners instantly without delays.
              </p>
            </div>
            <div className="card text-center group hover:border-indigo-400 hover:shadow-glow">
              <div className="text-4xl mb-4">⏱️</div>
              <h3 className="text-xl font-bold mb-2 text-indigo-400 group-hover:text-indigo-300 transition-colors">Session Timer</h3>
              <p className="text-gray-400">
                Track study sessions and monitor your productivity.
              </p>
            </div>
            <div className="card text-center group hover:border-indigo-400 hover:shadow-glow">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2 text-indigo-400 group-hover:text-indigo-300 transition-colors">Dashboard</h3>
              <p className="text-gray-400">
                View your study statistics and progress over time.
              </p>
            </div>
            <div className="card text-center group hover:border-indigo-400 hover:shadow-glow">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-bold mb-2 text-indigo-400 group-hover:text-indigo-300 transition-colors">Collaboration</h3>
              <p className="text-gray-400">
                Join multiple rooms and study with different groups.
              </p>
            </div>
            <div className="card text-center group hover:border-indigo-400 hover:shadow-glow">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2 text-indigo-400 group-hover:text-indigo-300 transition-colors">Secure</h3>
              <p className="text-gray-400">
                Your data is protected with modern security practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-y border-dark-600 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-accent bg-clip-text text-transparent">Ready to study smarter?</h2>
          <p className="text-lg mb-8 text-gray-300">
            Join thousands of students already using StudyRoom.
          </p>
          {!isAuthenticated && (
            <Link to="/register" className="btn-primary">
              Create Free Account
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
