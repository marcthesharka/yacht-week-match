export interface User {
  id: string;
  email: string;
  full_name: string;
  age: number;
  school: 'Stanford GSB' | 'Harvard Business School';
  bio: string;
  undergrad_school?: string;
  pre_mba_company?: string;
  interests?: string[];
  photo_urls?: string[];
  photo_url?: string;
  created_at: string;
}

export interface Swipe {
  id: string;
  swiper_id: string;
  swiped_id: string;
  is_like: boolean;
  created_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  user1?: User;
  user2?: User;
}

export interface SwipeAction {
  userId: string;
  isLike: boolean;
}

export interface ProfileLike {
  id: string;
  profile_id: string;
  liker_session_id: string;
  created_at: string;
}