import React, { useState, useEffect } from 'react';
import { motion, PanInfo, useAnimationControls } from 'framer-motion';
import { ProfileCard } from './ProfileCard';
import { Header } from './Header';
import { User } from '../types';
import { Users, Heart, UserPlus, Share2 } from 'lucide-react';

interface SwipeInterfaceProps {
  users: User[];
  onSwipe: (userId: string, swipeType: 'like' | 'friend' | 'pass') => void;
  onShowMatches: () => void;
  onShowAura: () => void;
  onResetSwipes?: () => void;
  matchCount: number;
  user?: any;
  onSignIn: () => void;
  onSignUp: () => void;
  onSignOut: () => void;
}

export function SwipeInterface({ 
  users, 
  onSwipe, 
  onShowMatches, 
  onShowAura,
  onResetSwipes,
  matchCount, 
  user, 
  onSignIn, 
  onSignUp, 
  onSignOut 
}: SwipeInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const controls = useAnimationControls();

  const currentUser = users[currentIndex];

  // CRITICAL DEBUG: Log the exact user being displayed vs array
  console.log('=== SWIPE INTERFACE DEBUG ===');
  console.log('Current index:', currentIndex);
  console.log('Total users in array:', users.length);
  console.log('Current user being displayed:', currentUser ? {
    id: currentUser.id,
    name: currentUser.full_name,
    email: currentUser.email,
    arrayIndex: currentIndex
  } : 'UNDEFINED - INDEX OUT OF BOUNDS');
  console.log('All users in order:', users.map((u, idx) => ({ 
    arrayIndex: idx, 
    id: u.id, 
    name: u.full_name, 
    email: u.email 
  })));
  console.log('================================');

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    const xThreshold = Math.abs(info.offset.x) > threshold;
    const yThreshold = Math.abs(info.offset.y) > threshold;
    
    if (yThreshold && info.offset.y < 0) {
      setDragDirection('up');
    } else if (xThreshold) {
      setDragDirection(info.offset.x > 0 ? 'right' : 'left');
    } else {
      setDragDirection(null);
    }
  };

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    const velocityX = info.velocity.x;
    const velocityY = info.velocity.y;
    
    let swipeType: 'like' | 'friend' | 'pass' | null = null;
    
    // Check for upward swipe (friend)
    if (info.offset.y < -threshold || velocityY < -500) {
      swipeType = 'friend';
      await controls.start({
        y: -1000,
        rotate: 0,
        opacity: 0,
        transition: { duration: 0.3 }
      });
    }
    // Check for horizontal swipes
    else if (Math.abs(info.offset.x) > threshold || Math.abs(velocityX) > 500) {
      const isRight = info.offset.x > 0 || velocityX > 0;
      swipeType = isRight ? 'like' : 'pass';
      
      // Animate card off screen
      await controls.start({
        x: isRight ? 1000 : -1000,
        rotate: isRight ? 30 : -30,
        opacity: 0,
        transition: { duration: 0.3 }
      });
    }

    if (swipeType) {
      // Handle the swipe
      onSwipe(currentUser.id, swipeType);
      
      // Don't increment index - the parent component removes the user from array
      // so we stay at the same index to show the next user
      
      // Reset controls for next card
      controls.set({ x: 0, y: 0, rotate: 0, opacity: 1 });
    } else {
      // Snap back to center
      controls.start({ x: 0, y: 0, rotate: 0 });
    }
    
    setDragDirection(null);
  };

  const handleButtonSwipe = async (swipeType: 'like' | 'friend' | 'pass') => {
    console.log('=== BUTTON SWIPE DEBUG ===');
    console.log('Button clicked for swipe type:', swipeType);
    console.log('Current index:', currentIndex);
    console.log('Current user from array:', currentUser ? {
      id: currentUser.id,
      name: currentUser.full_name,
      email: currentUser.email
    } : 'UNDEFINED');
    console.log('About to call onSwipe with userId:', currentUser?.id);
    console.log('==========================');

    if (swipeType === 'friend') {
      await controls.start({
        y: -1000,
        rotate: 0,
        opacity: 0,
        transition: { duration: 0.3 }
      });
    } else {
      const isRight = swipeType === 'like';
      await controls.start({
        x: isRight ? 1000 : -1000,
        rotate: isRight ? 30 : -30,
        opacity: 0,
        transition: { duration: 0.3 }
      });
    }

    onSwipe(currentUser?.id || 'MISSING_ID', swipeType);
    // Don't increment index - the parent component removes the user from array
    // so we stay at the same index to show the next user
    controls.set({ x: 0, y: 0, rotate: 0, opacity: 1 });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'YachtWeek Match',
        text: 'Join me on YachtWeek Match - connect with Stanford GSB and Harvard Business School students for yacht week!',
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link copied to clipboard! Share it with your friends.');
      });
    }
  };

  if (currentIndex >= users.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <Header 
          onSignIn={onSignIn}
          onSignUp={onSignUp}
          user={user}
          onSignOut={onSignOut}
          onShowAura={onShowAura}
        />
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">All Caught Up!</h2>
            <p className="text-gray-600 mb-6">
              You've seen all available profiles. Check back later for new members joining the yacht week!
            </p>
            <div className="space-y-3">
              <button
                onClick={handleShare}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Share2 className="w-5 h-5" />
                <span>Share with Friends</span>
              </button>
              {onResetSwipes && (
                <button
                  onClick={onResetSwipes}
                  className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200"
                >
                  Reset & See All Profiles Again
                </button>
              )}
              {user && (
                <button
                  onClick={onShowMatches}
                  className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-red-600 transition-colors duration-200"
                >
                  View My Matches ({matchCount})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
      <Header 
        onSignIn={onSignIn}
        onSignUp={onSignUp}
        user={user}
        onSignOut={onSignOut}
        onShowAura={onShowAura}
      />
      <div className="max-w-sm mx-auto">
        {/* Matches Button */}
        <div className="flex justify-end mb-6 pt-4">
          {user && (
            <button
              onClick={onShowMatches}
              className="relative bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow duration-200 flex items-center space-x-2"
            >
              <Heart className="w-6 h-6 text-pink-500" />
              <span className="text-sm font-medium text-gray-700">Matches</span>
              {matchCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {matchCount}
                </div>
              )}
            </button>
          )}
        </div>

        {/* Card Stack */}
        <div className="relative h-[600px] mb-6">
          {/* Next card (behind) */}
          {users[currentIndex + 1] && (
            <div className="absolute inset-0 transform scale-95 opacity-50">
              <ProfileCard
                user={users[currentIndex + 1]}
                onSwipe={() => {}}
                style={{ pointerEvents: 'none' }}
              />
            </div>
          )}

          {/* Current card */}
          <motion.div
            className="relative z-10"
            drag
            dragConstraints={{ left: 0, right: 0 }}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            animate={controls}
          >
            <ProfileCard
              user={currentUser}
              onSwipe={(swipeType) => handleButtonSwipe(swipeType)}
              showActions={true}
              dragDirection={dragDirection}
            />
          </motion.div>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center space-x-1 mb-4">
          <Users className="w-5 h-5 text-gray-400 mr-2" />
          <span className="text-sm text-gray-600">
            {currentIndex + 1} of {users.length}
          </span>
        </div>
      </div>
    </div>
  );
}