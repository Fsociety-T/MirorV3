# Miror V3 - Your Life Manager

A beautiful, iPhone-inspired life management app that combines vision, tasks, prayer tracking, health habits, addiction recovery, skills, and achievements in one clean dashboard.

## Features

- **Daily Command Deck** - Swipeable pillars (Prayer, Health, No-Addiction, Habits) with streak rings
- **Weekly Tree View** - Organic visualization of your growth (roots=vision, trunk=streaks, branches=projects, leaves=skills, fruits=achievements)
- **Vision & Missions** - Your north star with one active mission at a time
- **Projects & Tasks** - Progress tracking with visual progress bars
- **Prayer Tracking** - 5 daily prayers with streak counter
- **Health Habits** - Water, movement, sleep, nutrition + custom habits
- **Addiction Recovery** - Days clean counter with honest relapse tracking
- **Skills & XP** - Level up skills tied to projects
- **Achievements** - Auto-unlocking badges with rarity tiers
- **iPhone-Premium Design** - SF Pro Rounded, glassmorphism, haptic feedback, spring animations

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (custom design system)
- **State**: TanStack Query + Zustand
- **Backend**: Supabase (Auth + Postgres + RLS)
- **Mobile**: Capacitor (Android APK)
- **CI/CD**: GitHub Actions (auto-build APK on tag push)

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/Fsociety-T/MirorV3.git
cd MirorV3
npm ci
```

### 2. Supabase Setup
1. Create project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_initial_schema.sql` in SQL Editor
3. Enable Auth providers: Email + Google
4. Copy Project URL & Anon Key

### 3. Environment Variables
Create `.env.local`:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Development
```bash
npm run dev
# Opens at http://localhost:5173
```

## Build APK (Automatic via GitHub)

Push a version tag to trigger automatic APK build:

```bash
git tag v1.0.0
git push origin v1.0.0
```

The GitHub Action will:
1. Build the web app
2. Sync with Capacitor Android
3. Compile release APK
4. Upload to GitHub Releases

Download the APK from the **Releases** page on GitHub.

## Local Android Build (Optional)

```bash
# Add Android platform (first time)
npm run cap:add

# Sync web assets to Android
npm run cap:sync

# Open in Android Studio
npm run cap:open
```

## Project Structure

```
src/
├── components/
│   ├── ui/           # Base components (Card, Pill, Ring, Sheet, Button, Input)
│   ├── daily/        # Daily screen components
│   ├── tree/         # Weekly tree visualization
│   ├── pillars/      # Deep-dive sheets for each pillar
│   └── ...
├── hooks/
│   ├── useAuth.ts          # Supabase auth
│   ├── useSupabase.ts      # All data queries/mutations
│   └── useGestures.ts      # Swipe, pull-down gestures
├── lib/
│   ├── design.ts       # Design tokens (colors, spacing, motion, typography)
│   ├── supabase.ts     # Client + types
│   ├── utils.ts        # Date, streak calculations
│   └── haptics.ts      # Capacitor haptics wrapper
├── pages/              # Route pages
├── store/              # Zustand UI state
└── styles/             # Global CSS + Tailwind
```

## Design System

- **Colors**: Slate neutral base + 6 pillar accents (only on active elements)
- **Typography**: SF Pro / SF Pro Rounded (system fonts)
- **Motion**: iOS-standard springs (damping 0.82, response 0.35)
- **Radius**: 16px cards, 24px sheets, full pills
- **Haptics**: Per-pillar patterns (prayer=5 taps, health=heartbeat, addiction=thock)

## License

MIT - Build your mirror.