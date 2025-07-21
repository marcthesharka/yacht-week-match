# The FaceBoat - YachtWeek Match

A Tinder-style dating app for Stanford GSB and Harvard Business School students for yacht week connections.

## 🚀 Features

- **Swipe Interface** - Like, friend, or pass on profiles
- **Aura Leaderboard** - See most liked profiles
- **Real-time Matches** - Connect with mutual likes
- **Profile Management** - Upload photos and create detailed profiles
- **School Integration** - Stanford GSB and Harvard Business School email verification

## 🛠 Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage (for profile photos)
- **Deployment:** Vercel

## 📦 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd yacht-week-match
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Add your Supabase credentials to `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

## 🚀 Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Option 2: Deploy via GitHub Integration

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel project settings
4. Deploy automatically on every push

## 🗄️ Database Schema

The app uses the following Supabase tables:

- **`profiles`** - User profiles with photos, bio, school info
- **`swipes`** - User swipe actions (like/friend/pass)
- **`matches`** - Mutual likes between users
- **`profile_likes`** - Anonymous likes for aura leaderboard

## 🔧 Configuration

### Vercel Configuration

The project includes a `vercel.json` file with:
- SPA routing configuration
- Asset caching headers
- Environment variable mapping
- Build optimization settings

### Vite Configuration

Optimized for Vercel deployment with:
- Proper build output directory
- Asset optimization
- Server configuration for preview

## 🎨 Features Overview

### Authentication
- Email/password signup with school verification
- Profile creation with photo upload
- Secure session management

### Swiping
- Tinder-style card interface
- Drag gestures and button controls
- Real-time match detection

### Aura System
- Anonymous profile liking
- Leaderboard with rankings
- Heart (romantic) and pray (friendship) reactions

### Matches
- Mutual like detection
- Match list with user details
- Future: In-app messaging

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- User can only modify their own data
- Anonymous likes allowed for aura system
- Secure file uploads to Supabase Storage

## 📱 Responsive Design

- Mobile-first design approach
- Optimized for all screen sizes
- Touch-friendly swipe gestures
- Progressive Web App ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary.