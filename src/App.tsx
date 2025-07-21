import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/AuthForm';
import { SwipeInterface } from './components/SwipeInterface';
import { MatchList } from './components/MatchList';
import { GridView } from './components/GridView';
import { AuraLeaderboard } from './components/AuraLeaderboard';
import { supabase } from './lib/supabase';
import { User, Match } from './types';

function App() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentView, setCurrentView] = useState<'swipe' | 'matches' | 'aura'>('swipe');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [swipedUsers, setSwipedUsers] = useState<Set<string>>(() => {
    // Force empty set on every initialization
    const emptySet = new Set<string>();
    console.log('Initializing swipedUsers state with empty set');
    return new Set();
  });

  // Ref to track if we've already loaded users to prevent double loading
  const hasLoadedUsers = useRef(false);
  const loadingUsers = useRef(false);

  // Check if Supabase is configured
  const isSupabaseConfigured = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return url && key && url !== 'https://placeholder.supabase.co' && key !== 'placeholder-key';
  };

  // Sample data for demonstration
  const sampleUsers: User[] = [
    {
      id: '1',
      email: 'sarah.chen@stanford.edu',
      full_name: 'Sarah Chen',
      age: 27,
      school: 'Stanford GSB',
      undergrad_school: 'UC Berkeley',
      pre_mba_company: 'McKinsey & Company',
      bio: 'Former McKinsey consultant turned startup founder. Love sailing, wine tasting, and finding the next unicorn. Ready to make some waves in Croatia! 🌊',
      interests: ['Sailing', 'Startups', 'Wine', 'Travel', 'Consulting', 'Networking'],
      photo_urls: ['https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'],
      created_at: '2024-01-01'
    },
    {
      id: '2',
      email: 'james.wilson@hbs.edu',
      full_name: 'James Wilson',
      age: 29,
      school: 'Harvard Business School',
      undergrad_school: 'Harvard College',
      pre_mba_company: 'Goldman Sachs',
      bio: 'Investment banker by day, adventure seeker by weekend. Excited to trade spreadsheets for sunsets and network with amazing people. Let\'s make this yacht week unforgettable!',
      interests: ['Finance', 'Adventure Sports', 'Photography', 'Cocktails', 'Networking', 'Travel'],
      photo_urls: ['https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg'],
      created_at: '2024-01-01'
    },
    {
      id: '3',
      email: 'maria.garcia@stanford.edu',
      full_name: 'Maria Garcia',
      age: 26,
      school: 'Stanford GSB',
      undergrad_school: 'Stanford University',
      pre_mba_company: 'Google',
      bio: 'Tech PM with a passion for sustainable business and ocean conservation. Looking forward to meaningful conversations and beautiful sunsets in Croatia.',
      interests: ['Tech', 'Sustainability', 'Ocean Conservation', 'Yoga', 'Reading', 'Hiking'],
      photo_urls: ['https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'],
      created_at: '2024-01-01'
    },
    {
      id: '4',
      email: 'david.kim@hbs.edu',
      full_name: 'David Kim',
      age: 28,
      school: 'Harvard Business School',
      undergrad_school: 'MIT',
      pre_mba_company: 'Apple',
      bio: 'Former Google product manager now building the next big thing in fintech. Love good food, great conversations, and even better company for yacht adventures.',
      interests: ['Fintech', 'Product Management', 'Cooking', 'Music', 'Entrepreneurship', 'Swimming'],
      photo_urls: ['https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg'],
      created_at: '2024-01-01'
    },
    {
      id: '5',
      email: 'emma.thompson@stanford.edu',
      full_name: 'Emma Thompson',
      age: 25,
      school: 'Stanford GSB',
      undergrad_school: 'Yale University',
      pre_mba_company: 'Bain & Company',
      bio: 'Strategy consultant turned social impact entrepreneur. Passionate about making business a force for good. Ready to dive deep into conversations and Croatian waters!',
      interests: ['Social Impact', 'Strategy', 'Environmental Policy', 'Swimming', 'Art', 'Culture'],
      photo_urls: ['https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg'],
      created_at: '2024-01-01'
    }
  ];

  useEffect(() => {
    const loadUsers = async () => {      
      // Prevent double loading in StrictMode
      if (loadingUsers.current) {
        console.log('Already loading users, skipping...');
        return;
      }
      
      loadingUsers.current = true;
      console.log('Starting to load users...');
      console.log('=== USER LOADING DEBUG ===');
      
      if (isSupabaseConfigured()) {
        try {
          console.log('Fetching profiles from Supabase...');
          // Test Supabase connection first
          const { data: testData, error: testError } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);

          if (testError) {
            console.warn('Supabase connection failed, using sample data:', testError);
            throw new Error('Supabase connection failed');
          }

          // If connection works, fetch profiles
          const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, email, full_name, age, school, bio, photo_urls, created_at, undergrad_school, pre_mba_company, interests')
            .order('created_at', { ascending: false });

          if (error) {
            console.warn('Error fetching profiles, using sample data:', error);
            throw new Error('Profile fetch failed');
          }

          // Filter out already swiped users and current user
          const allProfiles = profiles || [];
          console.log('All profiles from DB:', allProfiles.length, allProfiles);
          console.log('Database profiles details:', allProfiles.map(p => ({ id: p.id, name: p.full_name, email: p.email })));
          console.log('SwipedUsers before filtering:', Array.from(swipedUsers));
          console.log('Swiped users:', Array.from(swipedUsers));
          console.log('Current user:', user?.id);
          
          const availableUsers = allProfiles.filter(u => 
            !swipedUsers.has(u.id) && (!user || u.id !== user.id)
          );
          console.log('Filtered out profiles:', allProfiles.filter(u => 
            swipedUsers.has(u.id) || (user && u.id === user.id)
          ));
          console.log('Available users after filtering:', availableUsers.length, availableUsers);
          console.log('Final available users details:', availableUsers.map(u => ({ 
            id: u.id, 
            name: u.full_name, 
            email: u.email,
            school: u.school,
            age: u.age
          })));
          setUsers(availableUsers);
        } catch (error) {
          console.warn('Supabase unavailable, using sample data:', error);
          // Fallback to sample data
          const availableUsers = sampleUsers.filter(u => 
            !swipedUsers.has(u.id) && (!user || u.email !== user.email)
          );
          console.log('Using sample data, available users:', availableUsers.length, availableUsers);
          console.log('Sample data users details:', availableUsers.map(u => ({ id: u.id, name: u.full_name, email: u.email })));
          setUsers(availableUsers);
        }
      } else {
        console.log('Supabase not configured, using sample data');
        // Use sample data when Supabase is not configured
        const availableUsers = sampleUsers.filter(u => 
          !swipedUsers.has(u.id) && (!user || u.email !== user.email)
        );
        console.log('Sample data - SwipedUsers:', Array.from(swipedUsers));
        console.log('Sample data - Filtered out:', sampleUsers.filter(u => 
          swipedUsers.has(u.id) || (user && u.email === user.email)
        ));
        console.log('Sample data mode, available users:', availableUsers.length, availableUsers);
        console.log('Sample data users details:', availableUsers.map(u => ({ id: u.id, name: u.full_name, email: u.email })));
        setUsers(availableUsers);
      }
      console.log('=== END USER LOADING DEBUG ===');
      
      loadingUsers.current = false;
    };

    // Only load if we haven't already loaded
    if (!hasLoadedUsers.current) {
      hasLoadedUsers.current = true;
      loadUsers();
    }
  }, [swipedUsers, user]);

  useEffect(() => {
    const loadMatches = async () => {
      if (!user || !isSupabaseConfigured()) return;

      try {
        const { data: matchData, error } = await supabase
          .from('matches')
          .select(`
            *,
            user1:profiles!matches_user1_id_fkey(*),
            user2:profiles!matches_user2_id_fkey(*)
          `)
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

        if (error) {
          console.error('Error fetching matches:', error);
        } else {
          setMatches(matchData || []);
        }
      } catch (error) {
        console.error('Error loading matches:', error);
      }
    };

    loadMatches();
  }, [user]);

  const handleSwipe = async (userId: string, swipeType: 'like' | 'friend' | 'pass') => {
    console.log('=== APP SWIPE HANDLER DEBUG ===');
    console.log('Received swipe for userId:', userId, 'type:', swipeType);
    console.log('Current users array length:', users.length);
    console.log('Looking for user with ID:', userId);
    const userBeingSwiped = users.find(u => u.id === userId);
    console.log('Found user:', userBeingSwiped ? {
      id: userBeingSwiped.id,
      name: userBeingSwiped.full_name,
      email: userBeingSwiped.email
    } : 'NOT FOUND IN ARRAY');
    console.log('All users for reference:', users.map(u => ({ id: u.id, name: u.full_name })));
    console.log('================================');
    
    // Prevent double swipes
    if (swipedUsers.has(userId)) {
      console.log('User already swiped, ignoring duplicate swipe');
      return;
    }

    // Add to swiped users
    setSwipedUsers(prev => {
      const newSet = new Set([...prev, userId]);
      console.log('SwipedUsers updated:', Array.from(newSet));
      return newSet;
    });
    console.log('Added to swipedUsers:', userId);

    if (isSupabaseConfigured()) {
      try {
        // 1. ALWAYS insert into profile_likes table for aura tracking (anonymous or authenticated)
        if (swipeType !== 'pass') {
          const likeType = swipeType === 'like' ? 'heart' : 'pray';
          
          // Generate or get session ID
          let sessionId = localStorage.getItem('anonymous_session_id');
          if (!sessionId) {
            sessionId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('anonymous_session_id', sessionId);
          }
          
          console.log('=== PROFILE LIKE DEBUG ===');
          console.log('About to insert profile like:', {
            profile_id: userId,
            like_type: likeType,
            liker_session_id: sessionId,
            swipeType: swipeType
          });
          
          try {
            const { error: likeError } = await supabase
              .from('profile_likes')
              .insert({
                profile_id: userId,
                like_type: likeType,
                liker_session_id: sessionId
              });
            
            if (likeError) {
              // If it's a duplicate key error, that's okay - user already liked this profile
              if (likeError.code === '23505') {
                console.log('✓ Profile already liked by this session, skipping duplicate');
              } else {
                console.error('❌ Error recording profile like:', likeError);
                console.log('Error details:', {
                  code: likeError.code,
                  message: likeError.message,
                  details: likeError.details,
                  hint: likeError.hint
                });
              }
            } else {
              console.log('✅ Profile like recorded successfully');
            }
          } catch (insertError) {
            console.error('❌ Exception during profile like insert:', insertError);
          }
          console.log('=== END PROFILE LIKE DEBUG ===');
        }

        // 2. Handle swipes and matches if user is authenticated
        if (user) {
          console.log('=== SWIPE RECORDING DEBUG ===');
          const isLike = swipeType === 'like';
          const { error: swipeError } = await supabase
            .from('swipes')
            .insert({
              swiper_id: user.id,
              swiped_id: userId,
              is_like: isLike
            });

          if (swipeError) {
            console.error('❌ Error recording swipe:', swipeError);
          } else {
            console.log('✅ Swipe recorded successfully');
          }
          console.log('=== END SWIPE RECORDING DEBUG ===');

          // 3. If it's a like, check for new matches immediately
          if (swipeType === 'like') {
            console.log('=== MATCH CHECK DEBUG ===');
            // Wait a moment for the database trigger to potentially create a match
            setTimeout(async () => {
              const { data: newMatches, error: matchError } = await supabase
                .from('matches')
                .select(`
                  *,
                  user1:profiles!matches_user1_id_fkey(*),
                  user2:profiles!matches_user2_id_fkey(*)
                `)
                .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

              if (!matchError && newMatches) {
                console.log('✅ Found matches:', newMatches.length);
                // Update matches state with all current matches
                setMatches(newMatches);
                
                // Check if we have a new match (more matches than before)
                if (newMatches.length > matches.length) {
                  console.log('🎉 NEW MATCH DETECTED!');
                  // Could show a match notification here
                }
              } else if (matchError) {
                console.error('❌ Error checking for matches:', matchError);
              }
              console.log('=== END MATCH CHECK DEBUG ===');
            }, 500); // Wait 500ms for database trigger
          }
        }
      } catch (error) {
        console.error('Error handling swipe:', error);
      }
    } else {
      // Demo mode - always allow profile likes for aura tracking
      if (swipeType !== 'pass') {
        // Store in localStorage for demo mode
        const existingLikes = JSON.parse(localStorage.getItem('demo_profile_likes') || '[]');
        const newLike = {
          profile_id: userId,
          like_type: swipeType === 'like' ? 'heart' : 'pray',
          created_at: new Date().toISOString()
        };
        existingLikes.push(newLike);
        localStorage.setItem('demo_profile_likes', JSON.stringify(existingLikes));
      }
      
      // Only handle matching logic if user is authenticated
      if (user && swipeType === 'like') {
        const swipedUser = sampleUsers.find(u => u.id === userId);
        if (swipedUser) {
          // For demo purposes, create a match 30% of the time
          if (Math.random() > 0.7) {
            const newMatch: Match = {
              id: `match-${Date.now()}`,
              user1_id: user.id,
              user2_id: userId,
              user1: sampleUsers.find(u => u.email === user.email),
              user2: swipedUser,
              created_at: new Date().toISOString()
            };
            setMatches(prev => [...prev, newMatch]);
          }
        }
      }
    }

    // Remove user from available users
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setShowAuth(true);
  };

  const handleSignUp = () => {
    setAuthMode('signup');
    setShowAuth(true);
  };

  const handleAuthSignIn = async (email: string, password: string) => {
    const result = await signIn(email, password);
    if (!result.error) {
      setShowAuth(false);
    }
    return result;
  };

  const handleAuthSignUp = async (email: string, password: string, profileData?: any) => {
    const result = await signUp(email, password, profileData);
    if (!result.error) {
      setShowAuth(false);
    }
    return result;
  };

  const handleSignOut = async () => {
    await signOut();
    setCurrentView('swipe');
  };

  const handleResetSwipes = () => {
    console.log('Resetting swiped users state');
    hasLoadedUsers.current = false;
    loadingUsers.current = false;
    setSwipedUsers(new Set());
    // Force reload of users
    setTimeout(() => {
      hasLoadedUsers.current = false;
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading YachtWeek Match...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'matches') {
    return (
      <MatchList
        matches={matches}
        onBack={() => setCurrentView('swipe')}
        currentUserId={user?.id}
      />
    );
  }

  if (currentView === 'aura') {
    return (
      <AuraLeaderboard
        onBack={() => setCurrentView('swipe')}
        users={[...users, ...sampleUsers.filter(u => !users.find(existing => existing.id === u.id))]}
      />
    );
  }

  // Default to swipe view
  return (
    <>
      <SwipeInterface
        users={users}
        onSwipe={handleSwipe}
        onShowMatches={() => setCurrentView('matches')}
        onShowAura={() => setCurrentView('aura')}
        onResetSwipes={handleResetSwipes}
        matchCount={matches.length}
        user={user}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onSignOut={handleSignOut}
      />
      
      {showAuth && (
        <AuthForm
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          mode={authMode}
          onSignIn={handleAuthSignIn}
          onSignUp={handleAuthSignUp}
        />
      )}
    </>
  );
}

export default App;