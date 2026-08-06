import {
  Award,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  Dumbbell,
  Flame,
  HeartHandshake,
  Landmark,
  MoonStar,
  ShieldCheck,
  Sparkles,
  Target
} from 'lucide-react';

export const STORAGE_KEY = 'mirror-life-os-v1';

export const domains = {
  purpose: { label: 'Purpose', color: '#5f8fff', icon: Target },
  prayer: { label: 'Prayer', color: '#40a983', icon: Landmark },
  health: { label: 'Health', color: '#e06f5f', icon: Dumbbell },
  discipline: { label: 'Discipline', color: '#d39a3f', icon: ShieldCheck },
  growth: { label: 'Growth', color: '#9a7bd8', icon: Brain },
  people: { label: 'People', color: '#d56e98', icon: HeartHandshake }
};

export const prayers = [
  { id: 'fajr', label: 'Fajr', time: '05:18' },
  { id: 'dhuhr', label: 'Dhuhr', time: '13:42' },
  { id: 'asr', label: 'Asr', time: '17:31' },
  { id: 'maghrib', label: 'Maghrib', time: '20:58' },
  { id: 'isha', label: 'Isha', time: '22:26' }
];

export const achievementCatalog = [
  { id: 'vision', title: 'North Star', description: 'Write a clear personal vision.', icon: Sparkles, tone: 'blue' },
  { id: 'first-task', title: 'First Move', description: 'Complete the first task of the day.', icon: Target, tone: 'green' },
  { id: 'prayer-day', title: 'Prayer Flow', description: 'Complete all five daily prayers.', icon: Landmark, tone: 'green' },
  { id: 'sport-3', title: 'Built to Move', description: 'Log three completed sport sessions.', icon: Dumbbell, tone: 'coral' },
  { id: 'clean-7', title: 'Seven Clear Days', description: 'Reach seven days free from an addiction.', icon: ShieldCheck, tone: 'amber' },
  { id: 'skill-2', title: 'Apprentice', description: 'Grow any skill to level two.', icon: BookOpen, tone: 'purple' },
  { id: 'project-100', title: 'Finisher', description: 'Complete every task in a project.', icon: BriefcaseBusiness, tone: 'blue' },
  { id: 'balance-80', title: 'In Alignment', description: 'Reach an overall performance of 80.', icon: Award, tone: 'amber' }
];

export function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(days) {
  const value = new Date();
  value.setDate(value.getDate() + days);
  return dateKey(value);
}

export function daysSince(value) {
  const start = new Date(`${value}T00:00:00`);
  const now = new Date(`${dateKey()}T00:00:00`);
  return Math.max(0, Math.floor((now - start) / 86400000));
}

export function createInitialState() {
  return {
    vision: {
      statement: 'I am building a disciplined life where faith, health, meaningful work, and freedom reinforce each other.',
      identity: 'Calm, capable, consistent.',
      horizon: addDays(365),
      mission: 'Turn intention into visible proof every day.'
    },
    projects: [
      { id: 'mirror', title: 'Build Mirror', outcome: 'A personal operating system I trust every day.', domain: 'purpose', due: addDays(45), skillId: 'product', color: '#5f8fff', status: 'active' },
      { id: 'fitness', title: 'Athletic Base', outcome: 'Train consistently and recover without burnout.', domain: 'health', due: addDays(90), skillId: 'strength', color: '#e06f5f', status: 'active' }
    ],
    tasks: [
      { id: 't1', title: 'Design the linked Home dashboard', projectId: 'mirror', skillId: 'product', domain: 'purpose', estimate: 90, priority: 'high', done: false, completedAt: null },
      { id: 't2', title: 'Strength session', projectId: 'fitness', skillId: 'strength', domain: 'health', estimate: 45, priority: 'medium', done: false, completedAt: null },
      { id: 't3', title: 'Read and take five notes', projectId: null, skillId: 'learning', domain: 'growth', estimate: 30, priority: 'medium', done: false, completedAt: null },
      { id: 't4', title: 'Prepare tomorrow before closing the day', projectId: 'mirror', skillId: 'product', domain: 'discipline', estimate: 15, priority: 'low', done: false, completedAt: null }
    ],
    prayerChecks: Object.fromEntries(prayers.map((item) => [item.id, false])),
    sportSessions: [
      { id: 's1', date: dateKey(), type: 'Strength', minutes: 45, done: false },
      { id: 's2', date: addDays(2), type: 'Run', minutes: 30, done: false },
      { id: 's3', date: addDays(4), type: 'Mobility', minutes: 25, done: false }
    ],
    addictions: [
      { id: 'a1', name: 'Smoking', startDate: addDays(-12), lastReset: null }
    ],
    skills: [
      { id: 'product', name: 'Product Design', category: 'Creative', manualXp: 35, icon: 'layers' },
      { id: 'strength', name: 'Strength', category: 'Physical', manualXp: 20, icon: 'strength' },
      { id: 'learning', name: 'Deep Learning', category: 'Knowledge', manualXp: 60, icon: 'book' }
    ],
    activity: [],
    preferences: { compact: false }
  };
}

export function normalizeState(value) {
  const base = createInitialState();
  if (!value || typeof value !== 'object') return base;
  return {
    ...base,
    ...value,
    vision: { ...base.vision, ...(value.vision || {}) },
    prayerChecks: { ...base.prayerChecks, ...(value.prayerChecks || {}) },
    preferences: { ...base.preferences, ...(value.preferences || {}) },
    projects: Array.isArray(value.projects) ? value.projects : base.projects,
    tasks: Array.isArray(value.tasks) ? value.tasks : base.tasks,
    sportSessions: Array.isArray(value.sportSessions) ? value.sportSessions : base.sportSessions,
    addictions: Array.isArray(value.addictions) ? value.addictions : base.addictions,
    skills: Array.isArray(value.skills) ? value.skills : base.skills,
    activity: Array.isArray(value.activity) ? value.activity : []
  };
}

export function skillStats(skill, tasks) {
  const linkedXp = tasks.filter((task) => task.skillId === skill.id && task.done).length * 30;
  const xp = (skill.manualXp || 0) + linkedXp;
  return { xp, level: Math.floor(xp / 100) + 1, progress: xp % 100 };
}

export function projectProgress(project, tasks) {
  const linked = tasks.filter((task) => task.projectId === project.id);
  if (!linked.length) return 0;
  return Math.round((linked.filter((task) => task.done).length / linked.length) * 100);
}

export function getMetrics(state) {
  const taskRate = state.tasks.length ? state.tasks.filter((task) => task.done).length / state.tasks.length : 0;
  const prayerRate = prayers.filter((item) => state.prayerChecks[item.id]).length / prayers.length;
  const sportRate = Math.min(1, state.sportSessions.filter((session) => session.done).length / 3);
  const projectRate = state.projects.length
    ? state.projects.reduce((sum, project) => sum + projectProgress(project, state.tasks), 0) / state.projects.length / 100
    : 0;
  const skillRate = state.skills.length
    ? state.skills.reduce((sum, skill) => sum + Math.min(1, skillStats(skill, state.tasks).xp / 200), 0) / state.skills.length
    : 0;
  const cleanDays = state.addictions.length ? Math.min(...state.addictions.map((item) => daysSince(item.startDate))) : 0;
  const disciplineRate = Math.min(1, cleanDays / 30);
  const performance = Math.round((taskRate * 0.3 + prayerRate * 0.2 + sportRate * 0.15 + projectRate * 0.15 + skillRate * 0.1 + disciplineRate * 0.1) * 100);
  const visionStrength = state.vision.statement.trim().length >= 40 ? 1 : state.vision.statement.trim().length / 40;
  const futureScore = Math.min(99, Math.round(performance * 0.78 + projectRate * 12 + visionStrength * 10));
  return {
    performance,
    futureScore,
    taskRate,
    prayerRate,
    sportRate,
    projectRate,
    skillRate,
    disciplineRate,
    cleanDays
  };
}

export function getAchievements(state, metrics) {
  const checks = {
    vision: state.vision.statement.trim().length >= 40,
    'first-task': state.tasks.some((task) => task.done),
    'prayer-day': prayers.every((item) => state.prayerChecks[item.id]),
    'sport-3': state.sportSessions.filter((session) => session.done).length >= 3,
    'clean-7': metrics.cleanDays >= 7,
    'skill-2': state.skills.some((skill) => skillStats(skill, state.tasks).level >= 2),
    'project-100': state.projects.some((project) => projectProgress(project, state.tasks) === 100),
    'balance-80': metrics.performance >= 80
  };
  return achievementCatalog.map((item) => ({ ...item, unlocked: Boolean(checks[item.id]) }));
}

export const skillIcons = {
  layers: BriefcaseBusiness,
  strength: Dumbbell,
  book: BookOpen,
  default: Flame
};

