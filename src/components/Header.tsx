import React from 'react';
import { Anchor, User, LogIn, Trophy } from 'lucide-react';

interface HeaderProps {
  onSignIn: () => void;
  onSignUp: () => void;
  user?: any;
  onSignOut?: () => void;
  onShowAura?: () => void;
}

export function Header({ onSignIn, onSignUp, user, onSignOut, onShowAura }: HeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Anchor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">The FaceBoat</h1>
              <p className="text-xs text-gray-500">July 2025: GSB x HBS</p>
            </div>
          </div>
          
          {onShowAura && (
            <button
              onClick={onShowAura}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-yellow-600 font-medium transition-colors duration-200"
            >
              <Trophy className="w-4 h-4" />
              <span>Aura Board</span>
            </button>
          )}
          
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={onSignOut}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={onSignIn}
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={onSignUp}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                  >
                    Sign Up
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Match with people when you signup</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}