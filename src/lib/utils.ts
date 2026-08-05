// Utility Functions
export function formatDate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

export function getTodayString(): string {
  return formatDate(new Date());
}

export function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDate(d);
}

export function getWeekDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(formatDate(d));
  }
  return dates;
}

export function calculateStreak(checkinDates: string[], category: string): number {
  if (checkinDates.length === 0) return 0;
  
  const sortedDates = [...checkinDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  let streak = 0;
  let currentDate = getTodayString();
  
  // Check if today is completed
  const todayCompleted = sortedDates.includes(currentDate);
  if (!todayCompleted) {
    currentDate = getYesterdayString();
  }
  
  for (const date of sortedDates) {
    if (date === currentDate) {
      streak++;
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      currentDate = formatDate(d);
    } else if (date < currentDate) {
      break;
    }
  }
  
  return streak;
}

export function calculateOverallStreak(allCheckins: { date: string; category: string }[]): number {
  const datesByDay: Record<string, Set<string>> = {};
  
  for (const checkin of allCheckins) {
    if (!datesByDay[checkin.date]) {
      datesByDay[checkin.date] = new Set();
    }
    datesByDay[checkin.date].add(checkin.category);
  }
  
  const completeDays = Object.entries(datesByDay)
    .filter(([_, categories]) => categories.size >= 3) // At least 3 pillars
    .map(([date]) => date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  if (completeDays.length === 0) return 0;
  
  let streak = 0;
  let currentDate = getTodayString();
  
  if (!completeDays.includes(currentDate)) {
    currentDate = getYesterdayString();
  }
  
  for (const date of completeDays) {
    if (date === currentDate) {
      streak++;
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      currentDate = formatDate(d);
    } else if (date < currentDate) {
      break;
    }
  }
  
  return streak;
}

export function getDaysClean(startedDate: string, relapsedAt: string | null): number {
  const start = new Date(startedDate);
  const end = relapsedAt ? new Date(relapsedAt) : new Date();
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getXPForLevel(level: number): number {
  return level * 100; // Simple linear progression
}

export function getLevelFromXP(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function getProgressToNextLevel(xp: number): number {
  const currentLevel = getLevelFromXP(xp);
  const currentLevelXP = (currentLevel - 1) * 100;
  const nextLevelXP = currentLevel * 100;
  return (xp - currentLevelXP) / (nextLevelXP - currentLevelXP);
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function cn(...inputs: (string | undefined | null | boolean)[]): string {
  return inputs.filter(Boolean).join(' ');
}