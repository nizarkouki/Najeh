# Najeh - Your Academic Success Companion

![Najeh](public/logo.png)

Najeh is an intelligent study planning and productivity application designed to help students build sustainable study routines and track their academic progress. Using AI-powered study plan generation and the Pomodoro technique, Najeh transforms how students approach their studies.

## 🌟 Features

- **AI-Powered Study Plans**: Generate personalized study plans using Google Gemini based on your subjects and learning pace
- **Weekly Session Management**: Organize your study sessions with flexible weekly scheduling
- **Study Streaks**: Track your consistency with visual streak badges and maintain motivation
- **Gamification**: Earn badges and achievements to celebrate your academic milestones
- **Progress Analytics**: Monitor your study patterns and completion rates with detailed analytics

## 🚀 Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org) with React 19 and App Router
- **Styling**: [Tailwind CSS](https://tailwindcss.com) with [Shadcn/ui](https://ui.shadcn.com) components
- **Backend**: Next.js API routes with [Supabase](https://supabase.com) (PostgreSQL + Auth)
- **AI**: [Google Gemini API](https://ai.google.dev) for intelligent plan generation
- **UI Components**: Radix UI, Lucide React icons, Next Themes for dark mode

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- npm or yarn package manager
- A Supabase project 
- Google Gemini API key (get it at [ai.google.dev](https://ai.google.dev))

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd najeh
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Google Gemini API
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key
   ```


## 🎯 Getting Started

**Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

The app features auto-reload during development—modify files and see changes instantly.


## 🔧 Available Scripts

```bash
# Development server
npm run dev

# Production build
npm build

# Start production server
npm start
```

## 📚 Core Features Usage

### Generate a Study Plan
1. Navigate to the "Generate Plan" section
2. Enter your subjects and coefficients (importance/weight)
3. Let Gemini AI create your personalized study plan
4. Start your first session immediately

### Track Study Sessions
- Access the dashboard to view all active plans
- Monitor weekly session goals and progress
- View real-time completion statistics

### Build Your Streak
- Study consistently to build and maintain your streak
- Earn badges for milestones
- Share achievements with others

## 🔐 Authentication

Najeh uses Supabase Authentication with:
- Email/password signup and login
- OAuth integration support

## 📊 Database Schema

The application uses Supabase PostgreSQL with tables for:
- `users` - User profiles and authentication
- `plans` - Study plans
- `subjects` - Academic subjects
- `weekly_sessions` - Weekly study goals
- `study_sessions` - Individual study sessions
- `user_streaks` - Streak tracking
- `badges` - User achievements

All tables are protected with RLS policies for user privacy and data security.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🎓 About Najeh

Najeh is built with students in mind. Our mission is to help students develop sustainable study habits through intelligent planning, consistent tracking, and meaningful progress visualization. Whether you're preparing for exams, managing multiple subjects, or simply trying to build a better study routine, Najeh is here to support your academic success.
