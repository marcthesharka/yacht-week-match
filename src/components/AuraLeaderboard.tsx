import React, { useState, useEffect } from 'react';
import { ArrowLeft, Crown, Trophy, Medal, Award, Heart, GraduationCap } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuraLeaderboardProps {
  onBack: () => void;
  users: User[];
}

interface LeaderboardEntry {
  profile: User;
  heartCount: number;
  prayCount: number;
  totalCount: number;
  rank: number;
}

export function AuraLeaderboard({ onBack, users }: AuraLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Check if Supabase is configured
  const isSupabaseConfigured = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return url && key && url !== 'https://placeholder.supabase.co' && key !== 'placeholder-key';
  };
  
  console.log('AuraLeaderboard - Received users:', users.map(u => ({ id: u.id, name: u.full_name, email: u.email })));

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        console.log('=== AURA LEADERBOARD DEBUG ===');
        console.log('AuraLeaderboard - Loading leaderboard for users:', users.map(u => ({ id: u.id, name: u.full_name })));
        
        if (!isSupabaseConfigured()) {
          console.log('Supabase not configured, using demo data for leaderboard');
          // Use demo data from localStorage
          const demoLikes = JSON.parse(localStorage.getItem('demo_profile_likes') || '[]');
          console.log('Demo likes from localStorage:', demoLikes);
          
          const likeCounts: { [profileId: string]: { heart: number, pray: number } } = {};
          demoLikes.forEach((like: any) => {
            if (!likeCounts[like.profile_id]) {
              likeCounts[like.profile_id] = { heart: 0, pray: 0 };
            }
            likeCounts[like.profile_id][like.like_type as 'heart' | 'pray']++;
          });
          
          const entries: LeaderboardEntry[] = users
            .map(user => ({
              profile: user,
              heartCount: likeCounts[user.id]?.heart || 0,
              prayCount: likeCounts[user.id]?.pray || 0,
              totalCount: (likeCounts[user.id]?.heart || 0) + (likeCounts[user.id]?.pray || 0),
              rank: 0
            }))
            .filter(entry => entry.totalCount > 0)
            .sort((a, b) => b.totalCount - a.totalCount)
            .map((entry, index) => ({
              ...entry,
              rank: index + 1
            }));
          
          setLeaderboard(entries);
          setLoading(false);
          return;
        }
        
        // Supabase mode
        if (users.length === 0) {
          console.warn('No users provided to AuraLeaderboard');
          setLeaderboard([]);
          setLoading(false);
          return;
        }
        
        // Get ALL profile_likes to see what's in the database
        const { data: allLikesData, error: allLikesError } = await supabase
          .from('profile_likes')
          .select('profile_id, like_type')
          .limit(50);
          
        console.log('ALL profile_likes in database:', allLikesData);
        console.log('User IDs we are filtering for:', users.map(u => u.id));
        
        if (allLikesError) {
          console.error('Error fetching all profile_likes:', allLikesError);
          if (allLikesError.code === '42P01') {
            console.warn('profile_likes table does not exist. Leaderboard will be empty.');
            setLeaderboard([]);
            setLoading(false);
            return;
          }
          throw allLikesError;
        }
        
        // Filter for our specific users
        const { data, error } = await supabase
          .from('profile_likes')
          .select('profile_id, like_type')
          .in('profile_id', users.map(u => u.id));

        if (error) {
          console.error('Error fetching filtered profile_likes:', error);
          throw error;
        }

        if (data) {
          console.log('AuraLeaderboard - Like data from DB:', data);
          console.log('AuraLeaderboard - Data length:', data.length);
          console.log('AuraLeaderboard - Unique profile IDs in data:', [...new Set(data.map(d => d.profile_id))]);
          console.log('AuraLeaderboard - User IDs we are looking for:', users.map(u => u.id));
          
          // Count likes per profile
          const likeCounts: { [profileId: string]: { heart: number, pray: number } } = {};
          data.forEach(like => {
            if (!likeCounts[like.profile_id]) {
              likeCounts[like.profile_id] = { heart: 0, pray: 0 };
            }
            likeCounts[like.profile_id][like.like_type as 'heart' | 'pray']++;
          });
          
          console.log('AuraLeaderboard - Like counts:', likeCounts);

          // Create leaderboard entries
          const entries: LeaderboardEntry[] = users
            .map(user => ({
              profile: user,
              heartCount: likeCounts[user.id]?.heart || 0,
              prayCount: likeCounts[user.id]?.pray || 0,
              totalCount: (likeCounts[user.id]?.heart || 0) + (likeCounts[user.id]?.pray || 0),
              rank: 0
            }))
            .sort((a, b) => b.totalCount - a.totalCount)
            .map((entry, index) => ({
              ...entry,
              rank: index + 1
            }));

          console.log('AuraLeaderboard - Final entries:', entries.map(e => ({ 
            name: e.profile.full_name, 
            id: e.profile.id, 
            total: e.totalCount,
            hearts: e.heartCount,
            prays: e.prayCount
          })));
          
          const nonZeroEntries = entries.filter(entry => entry.totalCount > 0);
          console.log('AuraLeaderboard - Non-zero entries for display:', nonZeroEntries.length);
          console.log('=== END AURA LEADERBOARD DEBUG ===');
          setLeaderboard(nonZeroEntries);
        }
      } catch (error) {
        console.error('Error loading leaderboard:', error);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [users]);

  const getRankIcon = (rank: number, totalCount: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Trophy className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    if (totalCount >= 10) return <Award className="w-6 h-6 text-blue-500" />;
    return <Heart className="w-6 h-6 text-pink-500" />;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
    return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
  };

  const getAuraTitle = (rank: number, totalCount: number) => {
    if (rank === 1) return 'Yacht Week Royalty';
    if (rank === 2) return 'Aura Legend';
    if (rank === 3) return 'Charm Champion';
    if (totalCount >= 25) return 'Magnetic Personality';
    if (totalCount >= 10) return 'Rising Star';
    return 'Crowd Favorite';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Aura Leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-100">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6 pt-4">
          <button
            onClick={onBack}
            className="bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow duration-200"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-full">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Aura Leaderboard</h1>
              <p className="text-gray-600">Most liked profiles on YachtWeek</p>
            </div>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Aura Yet</h2>
            <p className="text-gray-600">
              Be the first to like profiles and start building the leaderboard!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.profile.id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200 ${
                  entry.rank <= 3 ? 'ring-2 ring-yellow-300' : ''
                }`}
              >
                <div className="flex items-center p-6">
                  {/* Rank */}
                  <div className="flex items-center space-x-3 mr-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${getRankBadge(entry.rank)}`}>
                      #{entry.rank}
                    </div>
                    {getRankIcon(entry.rank, entry.totalCount)}
                  </div>

                  {/* Profile Image */}
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                    <img
                      src={entry.profile.photo_urls?.[0] || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=200&h=200&fit=crop`}
                      alt={entry.profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {entry.profile.full_name}, {entry.profile.age}
                      </h3>
                      <div className="flex items-center space-x-1 text-blue-600 text-sm">
                        <GraduationCap className="w-4 h-4" />
                        <span>{entry.profile.school === 'Stanford GSB' ? 'Stanford' : 'Harvard'}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{getAuraTitle(entry.rank, entry.totalCount)}</p>
                    {entry.profile.bio && (
                      <p className="text-sm text-gray-700 line-clamp-2">{entry.profile.bio}</p>
                    )}
                  </div>

                  {/* Like Counts */}
                  <div className="text-center">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-center space-x-1">
                        <span className="text-lg font-bold text-gray-800">{entry.totalCount}</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm">
                        {entry.heartCount > 0 && (
                          <span className="text-pink-600 flex items-center">
                            ❤️ {entry.heartCount}
                          </span>
                        )}
                        {entry.prayCount > 0 && (
                          <span className="text-blue-600 flex items-center">
                            🙏 {entry.prayCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}