// Supabase Query Hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { Vision, Project, Task, Checkin, Addiction, Skill, AchievementDef, UserAchievement, PILLAR_ITEMS, PILLAR_ORDER } from '../lib/supabase';
import { getTodayString, getWeekDates, calculateStreak, calculateOverallStreak, getDaysClean } from '../lib/utils';
import { hapticCheckin, hapticAchievement } from '../lib/haptics';
import { useUIStore } from '../store/useStore';

// Vision
export function useVision() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['vision', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visions')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as Vision | null;
    },
    enabled: !!user,
  });
}

export function useUpdateVision() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (updates: Partial<Vision>) => {
      const { data, error } = await supabase
        .from('visions')
        .upsert({ user_id: user!.id, ...updates }, { onConflict: 'user_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vision', user?.id] }),
  });
}

// Projects
export function useProjects() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user!.id)
        .order('order_index');
      if (error) throw error;
      return data as Project[];
    },
    enabled: !!user,
  });
}

export function useProjectMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const create = useMutation({
    mutationFn: async (project: Omit<Project, 'id' | 'user_id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('projects')
        .insert({ ...project, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', user?.id] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Project> & { id: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', user?.id] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', user?.id] }),
  });

  return { create, update, remove };
}

// Tasks
export function useTasks(projectId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['tasks', user?.id, projectId],
    queryFn: async () => {
      let query = supabase.from('tasks').select('*').eq('user_id', user!.id);
      if (projectId) query = query.eq('project_id', projectId);
      else query = query.is('project_id', null);
      const { data, error } = await query.order('order_index');
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });
}

export function useTaskMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const toggle = useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ done })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] }),
  });

  const create = useMutation({
    mutationFn: async (task: Omit<Task, 'id' | 'user_id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...task, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] }),
  });

  return { toggle, create };
}

// Checkins - The core habit engine
export function useCheckins(date?: string) {
  const { user } = useAuth();
  const targetDate = date || getTodayString();
  
  return useQuery({
    queryKey: ['checkins', user?.id, targetDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', user!.id)
        .eq('date', targetDate);
      if (error) throw error;
      return data as Checkin[];
    },
    enabled: !!user,
  });
}

export function useWeekCheckins() {
  const { user } = useAuth();
  const weekDates = getWeekDates();
  
  return useQuery({
    queryKey: ['week-checkins', user?.id, weekDates[0]],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', user!.id)
        .in('date', weekDates);
      if (error) throw error;
      return data as Checkin[];
    },
    enabled: !!user,
  });
}

export function useCheckinMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const showAchievement = useUIStore((s) => s.showAchievementToast);

  const toggle = useMutation({
    mutationFn: async ({ 
      date, category, itemId, completed, value = 1 
    }: { date: string; category: string; itemId: string; completed: boolean; value?: number }) => {
      if (completed) {
        const { error } = await supabase
          .from('checkins')
          .delete()
          .eq('user_id', user!.id)
          .eq('date', date)
          .eq('category', category)
          .eq('item_id', itemId);
        if (error) throw error;
        return { deleted: true };
      } else {
        const { data, error } = await supabase
          .from('checkins')
          .upsert({
            user_id: user!.id,
            date,
            category,
            item_id: itemId,
            completed: true,
            value,
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onMutate: async () => {
      await hapticCheckin();
    },
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checkins', user?.id, variables.date] });
      queryClient.invalidateQueries({ queryKey: ['week-checkins', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['streaks', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['achievements', user?.id] });
      
      // Check for new achievements
      setTimeout(() => checkNewAchievements(user!.id), 500);
    },
  });

  return { toggle };
}

async function checkNewAchievements(userId: string) {
  // This would check streaks and unlock achievements
  // Implemented in useAchievements hook
}

// Streaks
export function useStreaks() {
  const { user } = useAuth();
  const { data: weekCheckins } = useWeekCheckins();
  
  return useQuery({
    queryKey: ['streaks', user?.id],
    queryFn: async () => {
      if (!weekCheckins) return {};
      
      const streaks: Record<string, number> = {};
      for (const category of PILLAR_ORDER) {
        const dates = weekCheckins
          .filter(c => c.category === category && c.completed)
          .map(c => c.date);
        streaks[category] = calculateStreak(dates, category);
      }
      
      // Overall streak (days with at least 3 pillars completed)
      const overallDates = Object.entries(
        weekCheckins.reduce((acc, c) => {
          if (c.completed) {
            if (!acc[c.date]) acc[c.date] = new Set();
            acc[c.date].add(c.category);
          }
          return acc;
        }, {} as Record<string, Set<string>>)
      )
        .filter(([_, cats]) => cats.size >= 3)
        .map(([date]) => date);
      
      streaks.overall = calculateOverallStreak(
        overallDates.map(date => ({ date, category: 'overall' }))
      );
      
      return streaks;
    },
    enabled: !!user,
  });
}

// Addictions
export function useAddictions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['addictions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('addictions')
        .select('*')
        .eq('user_id', user!.id);
      if (error) throw error;
      return data as Addiction[];
    },
    enabled: !!user,
  });
}

export function useAddictionMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const create = useMutation({
    mutationFn: async (addiction: Omit<Addiction, 'id' | 'user_id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('addictions')
        .insert({ ...addiction, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addictions', user?.id] }),
  });

  const relapse = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('addictions')
        .update({ relapsed_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addictions', user?.id] }),
  });

  return { create, relapse };
}

// Skills
export function useSkills() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['skills', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', user!.id);
      if (error) throw error;
      return data as Skill[];
    },
    enabled: !!user,
  });
}

export function useSkillMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const addXP = useMutation({
    mutationFn: async ({ id, xp }: { id: string; xp: number }) => {
      const { data: current } = await supabase
        .from('skills')
        .select('xp')
        .eq('id', id)
        .single();
      const newXP = (current?.xp || 0) + xp;
      const { data, error } = await supabase
        .from('skills')
        .update({ xp: newXP })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills', user?.id] }),
  });

  return { addXP };
}

// Achievements
export function useAchievements() {
  const { user } = useAuth();
  const { data: weekCheckins } = useWeekCheckins();
  const { data: addictions } = useAddictions();
  const { data: skills } = useSkills();
  const { data: projects } = useProjects();
  const showToast = useUIStore((s) => s.showAchievementToast);

  return useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: async () => {
      // Get unlocked achievements
      const { data: unlocked, error: uError } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', user!.id);
      if (uError) throw uError;

      // Get all definitions
      const { data: defs, error: dError } = await supabase
        .from('achievement_defs')
        .select('*');
      if (dError) throw dError;

      // Compute which should be unlocked
      const newlyUnlocked: string[] = [];
      const now = new Date().toISOString();

      for (const def of defs) {
        const alreadyUnlocked = unlocked?.some(u => u.achievement_id === def.id);
        if (alreadyUnlocked) continue;

        let achieved = false;
        
        switch (def.category) {
          case 'prayer': {
            const prayerDates = weekCheckins?.filter(c => c.category === 'prayer' && c.completed).map(c => c.date) || [];
            const streak = calculateStreak(prayerDates, 'prayer');
            achieved = streak >= def.threshold;
            break;
          }
          case 'health': {
            const healthDates = weekCheckins?.filter(c => c.category === 'health' && c.completed).map(c => c.date) || [];
            const streak = calculateStreak(healthDates, 'health');
            achieved = streak >= def.threshold;
            break;
          }
          case 'addiction': {
            const addiction = addictions?.[0];
            if (addiction) {
              const days = getDaysClean(addiction.started_date, addiction.relapsed_at);
              achieved = days >= def.threshold;
            }
            break;
          }
          case 'skill': {
            const maxLevel = Math.max(...(skills?.map(s => s.level) || [1]));
            achieved = maxLevel >= def.threshold;
            break;
          }
          case 'project': {
            const completed = projects?.filter(p => p.status === 'done').length || 0;
            achieved = completed >= def.threshold;
            break;
          }
          case 'general': {
            if (def.id === 'streak_100') {
              // Would need overall streak calculation
            }
            break;
          }
        }

        if (achieved) {
          newlyUnlocked.push(def.id);
        }
      }

      // Unlock new achievements
      for (const id of newlyUnlocked) {
        const def = defs.find(d => d.id === id);
        if (def) {
          await supabase.from('user_achievements').insert({ user_id: user!.id, achievement_id: id });
          showToast({ id: def.id, title: def.title, icon: def.icon, rarity: def.rarity });
          await hapticAchievement();
        }
      }

      // Return all with unlock status
      return defs.map(def => ({
        ...def,
        unlocked: unlocked?.some(u => u.achievement_id === def.id) || newlyUnlocked.includes(def.id),
        unlockedAt: unlocked?.find(u => u.achievement_id === def.id)?.unlocked_at,
        newlyUnlocked: newlyUnlocked.includes(def.id),
      }));
    },
    enabled: !!user,
    refetchInterval: 30000, // Check every 30s
  });
}