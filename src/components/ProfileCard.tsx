import React from 'react';
import { User } from '../types';
import { Heart, UserPlus, X } from 'lucide-react';

interface ProfileCardProps {
  user: User;
  onSwipe: (swipeType: 'like' | 'friend' | 'pass') => void;
  showActions?: boolean;
  dragDirection?: 'left' | 'right' | 'up' | null;
  style?: React.CSSProperties;
}

export function ProfileCard({ 
  user, 
  onSwipe, 
  showActions = true, 
  dragDirection,
  style 
}: ProfileCardProps) {
  const handleButtonClick = (swipeType: 'like' | 'friend' | 'pass', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('ProfileCard - Button click for user:', user.id, user.full_name, 'swipe type:', swipeType);
    onSwipe(swipeType);
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-xl overflow-hidden h-full relative"
      style={style}
    >
      {/* Drag Direction Indicators */}
      {dragDirection && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black bg-opacity-20 rounded-2xl">
          <div className="text-6xl">
            {dragDirection === 'right' && '💖'}
            {dragDirection === 'left' && '❌'}
            {dragDirection === 'up' && '👥'}
          </div>
        </div>
      )}

      {/* Profile Image */}
      <div className="relative h-96">
        <img
          src={user.photo_urls?.[0] || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=400&h=600&fit=crop`}
          alt={user.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          <h2 className="text-white text-2xl font-bold mb-1">{user.full_name}</h2>
          <p className="text-white/90 text-lg">{user.age} • {user.school === 'Stanford GSB' ? 'Stanford GSB' : 'Harvard Business School'}</p>
        </div>
      </div>

      {/* Profile Details */}
      <div className="p-6">
        <div className="mb-4">
          {(user.pre_mba_company || user.undergrad_school) && (
            <p className="text-gray-600 mb-2">
              {user.pre_mba_company && user.undergrad_school 
                ? `${user.pre_mba_company} • ${user.undergrad_school}`
                : user.pre_mba_company || user.undergrad_school
              }
            </p>
          )}
          <p className="text-gray-800 leading-relaxed">{user.bio}</p>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex space-x-2 mt-6">
            <button
              onClick={(e) => handleButtonClick('pass', e)}
              className="flex-1 bg-gray-100 hover:bg-red-100 text-red-500 py-3 px-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-1 cursor-pointer active:scale-95"
            >
              <X className="w-4 h-4" />
              <span className="text-sm">Pass</span>
            </button>
            <button
              onClick={(e) => handleButtonClick('friend', e)}
              className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-600 py-3 px-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-1 cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span className="text-sm">Friend</span>
            </button>
            <button
              onClick={(e) => handleButtonClick('like', e)}
              className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white py-3 px-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-1 cursor-pointer active:scale-95"
            >
              <Heart className="w-4 h-4" />
              <span className="text-sm">Like</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}