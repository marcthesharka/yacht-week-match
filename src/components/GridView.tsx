import React, { useState, useEffect } from 'react';
import { Heart, Trophy, Crown, Medal, Award } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface GridViewProps {
  users: User[];
  onShowAura: () => void;
}

interface ProfileLikes {
  [profileId: string]: number;
}

export function GridView({ users, onShowAura }: GridViewProps) {
  const [likedProfiles, setLikedProfiles] = useState<Set<string>>(new Set());
  const [profileLikes, setProfileLikes] = useState<{[profileId: string]: {heart: number, pray: number}}>({});
  const [loading, setLoading] = useState<string | null>(null);

  // Load like counts for all profiles
  useEffect(() => {
    const loadLikeCounts = async () => {
      if (users.length === 0) return;

      try {
        const { data, error } = await supabase
          .from('profile_likes')
          .select('profile_id, like_type')
          .in('profile_id', users.map(u => u.id));

        if (error) {
          // If table doesn't exist, just continue without like counts
          if (error.code === '42P01') {
            console.warn('profile_likes table does not exist. Like functionality disabled.');
            return;
          }
          throw error;
        }

        if (data) {
          const counts: {[profileId: string]: {heart: number, pray: number}} = {};
          data.forEach(like => {
            if (!counts[like.profile_id]) {
              counts[like.profile_id] = { heart: 0, pray: 0 };
            }
            counts[like.profile_id][like.like_type as 'heart' | 'pray']++;
          });
          setProfileLikes(counts);
        }
      } catch (error) {
        console.error('Error loading like counts:', error);
      }
    };

    loadLikeCounts();
  }, [users]);

  const handleLike = async (profileId: string, likeType: 'heart' | 'pray') => {
    const likeKey = `${profileId}-${likeType}`;
    if (likedProfiles.has(likeKey) || loading === profileId) return;

    setLoading(profileId);
    
    try {
      // Generate a unique session ID for anonymous users
      let sessionId = localStorage.getItem('anonymous_session_id');
      if (!sessionId) {
        sessionId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('anonymous_session_id', sessionId);
      }

      const { error } = await supabase
        .from('profile_likes')
        .insert({
          profile_id: profileId,
          like_type: likeType,
          liker_session_id: sessionId,
          created_at: new Date().toISOString()
        });

      if (error) {
        // If table doesn't exist, show a message but don't crash
        if (error.code === '42P01') {
          alert('Like functionality is not available yet. Please contact the administrator.');
          return;
        }
        throw error;
      } else {
        setLikedProfiles(prev => new Set([...prev, likeKey]));
        setProfileLikes(prev => ({
          ...prev,
          [profileId]: {
            heart: prev[profileId]?.heart || 0,
            pray: prev[profileId]?.pray || 0,
            [likeType]: (prev[profileId]?.[likeType] || 0) + 1
          }
        }));
      }
    } catch (error) {
      console.error('Error liking profile:', error);
      alert('Unable to like profile. Please try again later.');
    } finally {
      setLoading(null);
    }
  };

  const getAuraIcon = (totalCount: number) => {
    if (totalCount >= 50) return <Crown className="w-3 h-3 text-yellow-500" />;
    if (totalCount >= 25) return <Trophy className="w-3 h-3 text-yellow-600" />;
    if (totalCount >= 10) return <Medal className="w-3 h-3 text-orange-500" />;
    if (totalCount >= 5) return <Award className="w-3 h-3 text-blue-500" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">YachtWeek Profiles</h1>
          <p className="text-gray-600 mb-4">Discover amazing people joining the yacht week</p>
          <button
            onClick={onShowAura}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            <Trophy className="w-5 h-5" />
            <span>View Aura Leaderboard</span>
          </button>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {users.map((user) => {
            const heartCount = profileLikes[user.id]?.heart || 0;
            const prayCount = profileLikes[user.id]?.pray || 0;
            const totalCount = heartCount + prayCount;
            const isHeartLiked = likedProfiles.has(`${user.id}-heart`);
            const isPrayLiked = likedProfiles.has(`${user.id}-pray`);
            const isLoading = loading === user.id;

            return (
              <div
                key={user.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 relative"
              >
                {/* Aura Badge */}
                {totalCount > 0 && (
                  <div className="absolute top-1 left-1 z-10 bg-white/90 backdrop-blur-sm rounded-full px-1.5 py-0.5 flex items-center space-x-1">
                    {getAuraIcon(totalCount)}
                    <span className="text-xs font-semibold text-gray-700">{totalCount}</span>
                  </div>
                )}

                {/* Profile Image */}
                <div className="aspect-square overflow-hidden relative group">
                  <img
                    src={user.photo_urls?.[0] || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=200&h=200&fit=crop`}
                    alt={user.full_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  
                  {/* Like Buttons - Show on hover */}
                  <div className="absolute bottom-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleLike(user.id, 'heart')}
                      disabled={isHeartLiked || isLoading}
                      className={`p-1.5 rounded-full transition-all duration-200 text-sm ${
                        isHeartLiked 
                          ? 'bg-pink-500 text-white' 
                          : 'bg-white/90 text-gray-700 hover:bg-pink-100'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title="Romantically interested"
                    >
                      ❤️
                    </button>
                    <button
                      onClick={() => handleLike(user.id, 'pray')}
                      disabled={isPrayLiked || isLoading}
                      className={`p-1.5 rounded-full transition-all duration-200 text-sm ${
                        isPrayLiked 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white/90 text-gray-700 hover:bg-blue-100'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title="Want to be friends"
                    >
                      🙏
                    </button>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="p-2">
                  <h3 className="font-semibold text-gray-800 text-xs mb-0.5 truncate">
                    {user.full_name}, {user.age}
                  </h3>
                  <p className="text-xs text-gray-600 truncate">
                    {user.school === 'Stanford GSB' ? 'Stanford' : 'Harvard'}
                  </p>
                  {(heartCount > 0 || prayCount > 0) && (
                    <div className="flex items-center space-x-2 mt-1">
                      {heartCount > 0 && (
                        <span className="text-xs text-pink-600 flex items-center">
                          ❤️ {heartCount}
                        </span>
                      )}
                      {prayCount > 0 && (
                        <span className="text-xs text-blue-600 flex items-center">
                          🙏 {prayCount}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">No Profiles Yet</h2>
              <p className="text-gray-600">
                Check back soon for new members joining the yacht week!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}