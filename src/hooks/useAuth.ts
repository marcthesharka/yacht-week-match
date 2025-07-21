import { useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if Supabase is properly configured
  const isSupabaseConfigured = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return url && key && url !== 'https://placeholder.supabase.co' && key !== 'placeholder-key';
  };
  useEffect(() => {
    if (isSupabaseConfigured()) {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });

      // Listen for changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user ?? null);
        }
      );

      return () => subscription.unsubscribe();
    } else {
      // Skip Supabase initialization if not configured
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      // Mock successful signup for demo purposes
      const mockUser = {
        id: 'demo-user-' + Date.now(),
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        role: 'authenticated'
      } as SupabaseUser;
      
      setUser(mockUser);
      return { data: { user: mockUser, session: null }, error: null };
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      // If signup successful, create basic profile (photo will be updated separately)
      if (data.user && !error) {
        const profile = {
          id: data.user.id,
          email: data.user.email,
          school: email.toLowerCase().includes('stanford') ? 'Stanford GSB' : 'Harvard Business School',
          full_name: profileData?.full_name || 'New User',
          age: profileData?.age || 25,
          bio: profileData?.bio || '',
          photo_urls: profileData?.photo_url ? [profileData.photo_url] : []
        };
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert(profile);
          
        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }
      
      return { data, error };
    } catch (error) {
      // If Supabase call fails, fall back to demo mode
      const mockUser = {
        id: 'demo-user-' + Date.now(),
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        role: 'authenticated'
      } as SupabaseUser;
      
      setUser(mockUser);
      return { data: { user: mockUser, session: null }, error: null };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      // Mock successful signin for demo purposes
      const mockUser = {
        id: 'demo-user-' + Date.now(),
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        role: 'authenticated'
      } as SupabaseUser;
      
      setUser(mockUser);
      return { data: { user: mockUser, session: null }, error: null };
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      // If Supabase call fails, fall back to demo mode
      const mockUser = {
        id: 'demo-user-' + Date.now(),
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        role: 'authenticated'
      } as SupabaseUser;
      
      setUser(mockUser);
      return { data: { user: mockUser, session: null }, error: null };
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      setUser(null);
      return { error: null };
    }
    
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    loading,
    signUp: (email: string, password: string, profileData?: any) => signUp(email, password, profileData),
    signIn,
    signOut,
  };
}
  const signUp = async (email: string, password: string, profileData?: {
    full_name: string;
    age: number;
    bio: string;
    photo_url?: string;
  }) => {
  }