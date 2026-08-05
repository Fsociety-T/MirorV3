// Supabase Client + Types
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars not set. Using demo mode.');
}

export const supabase = createClient(supabaseUrl || 'https://demo.supabase.co', supabaseAnonKey || 'demo-key');

// Database Types
export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  theme: 'light' | 'dark';
  created_at: string;
}

export interface Vision {
  id: string;
  user_id: string;
  statement: string;
  missions: Mission[];
  active_mission_id: string | null;
  created_at: string;
}

export interface Mission {
  id: string;
  title: string;
  active: boolean;
  order: number;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  goal: string | null;
  status: 'active' | 'done' | 'paused';
  deadline: string | null;
  progress: number;
  color: string;
  order_index: number;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  done: boolean;
  due_date: string | null;
  priority: 0 | 1 | 2;
  order_index: number;
  created_at: string;
}

export type CheckinCategory = 'prayer' | 'health' | 'addiction' | 'habit';

export interface Checkin {
  id: string;
  user_id: string;
  date: string;
  category: CheckinCategory;
  item_id: string;
  completed: boolean;
  value: number;
  created_at: string;
}

export interface Addiction {
  id: string;
  user_id: string;
  name: string;
  item_id: string;
  started_date: string;
  relapsed_at: string | null;
  created_at: string;
}

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  level: number;
  xp: number;
  project_id: string | null;
  created_at: string;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  category: string;
  threshold: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

// Pillar item definitions
export const PILLAR_ITEMS: Record<CheckinCategory, { id: string; label: string; icon: string; order: number }[]> = {
  prayer: [
    { id: 'fajr', label: 'Fajr', icon: '🌅', order: 0 },
    { id: 'dhuhr', label: 'Dhuhr', icon: '☀️', order: 1 },
    { id: 'asr', label: 'Asr', icon: '🌤️', order: 2 },
    { id: 'maghrib', label: 'Maghrib', icon: '🌅', order: 3 },
    { id: 'isha', label: 'Isha', icon: '🌙', order: 4 },
  ],
  health: [
    { id: 'water', label: 'Water (8 glasses)', icon: '💧', order: 0 },
    { id: 'movement', label: 'Move 30min', icon: '🏃', order: 1 },
    { id: 'sleep', label: 'Sleep 7-8h', icon: '😴', order: 2 },
    { id: 'nutrition', label: 'Healthy meals', icon: '🥗', order: 3 },
  ],
  addiction: [
    { id: 'nosmoke', label: 'No smoking', icon: '🚫🚬', order: 0 },
    { id: 'nosocial', label: 'No social media', icon: '🚫📱', order: 1 },
    { id: 'nojunk', label: 'No junk food', icon: '🚫🍔', order: 2 },
  ],
  habit: [], // Custom habits added by user
};

export const PILLAR_ORDER: CheckinCategory[] = ['prayer', 'health', 'addiction', 'habit'];
export const PILLAR_LABELS: Record<CheckinCategory, string> = {
  prayer: 'PRAYER',
  health: 'HEALTH',
  addiction: 'NO-ADDICTION',
  habit: 'HABITS',
};

export const PILLAR_ICONS: Record<CheckinCategory, string> = {
  prayer: '🕌',
  health: '💪',
  addiction: '🛡️',
  habit: '✨',
};