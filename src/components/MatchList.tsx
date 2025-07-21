import React from 'react';
import { ArrowLeft, MessageCircle, GraduationCap } from 'lucide-react';
import { Match } from '../types';

interface MatchListProps {
  matches: Match[];
  onBack: () => void;
  currentUserId: string;
}

export function MatchList({ matches, onBack, currentUserId }: MatchListProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6 pt-4">
          <button
            onClick={onBack}
            className="bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow duration-200"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Your Matches</h1>
          <div className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {matches.length}
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Matches Yet</h2>
            <p className="text-gray-600">
              Keep swiping to find your yacht week connections!
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {matches.map((match) => {
              const otherUser = match.user1_id === currentUserId ? match.user2 : match.user1;
              if (!otherUser) return null;

              return (
                <div key={match.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
                  <div className="flex">
                    <div className="w-24 h-24 overflow-hidden">
                      <img
                        src={otherUser.photo_urls?.[0] || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=200&h=200&fit=crop`}
                        alt={otherUser.full_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {otherUser.full_name}, {otherUser.age}
                        </h3>
                        <div className="flex items-center space-x-1 text-blue-600 text-sm">
                          <GraduationCap className="w-4 h-4" />
                          <span>{otherUser.school === 'Stanford GSB' ? 'Stanford' : 'Harvard'}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {otherUser.bio}
                      </p>
                      <div className="flex items-center space-x-2">
                        {otherUser.interests?.slice(0, 2).map((interest, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                          >
                            {interest}
                          </span>
                        )) || null}
                      </div>
                    </div>
                    <div className="p-4 flex items-center">
                      <button className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-3 rounded-full hover:from-pink-600 hover:to-red-600 transition-colors duration-200">
                        <MessageCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}