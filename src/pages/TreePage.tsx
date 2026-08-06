// Tree Page - Weekly View
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useWeekCheckins, useAddictions, useSkills, useProjects, useAchievements } from '../hooks/useSupabase';
import { getWeekDates, calculateStreak, getDaysClean } from '../lib/utils';
import { getPillarColor } from '../lib/design';
import { PILLAR_ORDER, PILLAR_ITEMS, PILLAR_LABELS } from '../lib/supabase';
import { Card } from '../components/ui';
import { Flame, Trophy, Target, Dumbbell, Shield, Sparkles, Award, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

const PILLAR_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  prayer: Target,
  health: Dumbbell,
  addiction: Shield,
  habit: Sparkles,
};

export function TreePage() {
  const { user } = useAuth();
  const { data: weekCheckins } = useWeekCheckins();
  const { data: addictions } = useAddictions();
  const { data: skills } = useSkills();
  const { data: projects } = useProjects();
  const { data: achievements } = useAchievements();
  
  const weekDates = getWeekDates();
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

  // Calculate streaks for each pillar
  const streaks: Record<string, number> = {};
  PILLAR_ORDER.forEach(category => {
    const dates = weekCheckins?.filter(c => c.category === category && c.completed).map(c => c.date) || [];
    streaks[category] = calculateStreak(dates, category);
  });

  const overallStreak = streaks.overall || 0;
  const addiction = addictions?.[0];
  const daysClean = addiction ? getDaysClean(addiction.started_date, addiction.relapsed_at) : 0;

  // Unlocked achievements this week
  const newAchievements = achievements?.filter(a => a.newlyUnlocked) || [];
  const allUnlocked = achievements?.filter(a => a.unlocked) || [];

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-[var(--color-bg-primary)] via-[var(--color-bg-secondary)]/50 to-[var(--color-bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[var(--color-bg-primary)]/95 backdrop-blur-xl border-b border-[var(--color-border-light)]/50">
        <div className="max-w-4xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-title1 font-bold text-[var(--color-text-primary)]">Weekly Reflection</h1>
              <p className="text-caption text-[var(--color-text-muted)]">{weekDates[0]} – {weekDates[6]}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Overall Streak */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-bg-tertiary)]">
                <Flame className="h-6 w-6 text-amber-400" />
                <div className="text-right">
                  <div className="text-title3 font-bold font-rounded text-[var(--color-text-primary)]">{overallStreak}</div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">DAY STREAK</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-6 space-y-6">
        {/* Tree Visualization */}
        <TreeVisualization
          streaks={streaks}
          overallStreak={overallStreak}
          daysClean={daysClean}
          skills={skills || []}
          projects={projects || []}
          newAchievements={newAchievements}
        />

        {/* Pillars Breakdown */}
        <section>
          <h2 className="text-title3 font-semibold mb-4 text-[var(--color-text-primary)]">Pillars This Week</h2>
          <div className="space-y-3">
            {PILLAR_ORDER.map(pillar => (
              <PillarWeekCard
                key={pillar}
                pillar={pillar}
                streak={streaks[pillar] || 0}
                weekDates={weekDates}
                checkins={weekCheckins || []}
                onToggle={() => setExpandedPillar(expandedPillar === pillar ? null : pillar)}
                expanded={expandedPillar === pillar}
              />
            ))}
          </div>
        </section>

        {/* Achievements */}
        {(newAchievements.length > 0 || allUnlocked.length > 0) && (
          <section>
            <h2 className="text-title3 font-semibold mb-4 text-[var(--color-text-primary)]">Achievements</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {allUnlocked.slice(0, 6).map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} new={newAchievements.some(a => a.id === achievement.id)} />
              ))}
              {allUnlocked.length > 6 && (
                <Card variant="glass" className="flex items-center justify-center p-6 col-span-2 sm:col-span-3">
                  <button className="text-body text-[var(--color-pillar-skills)] font-medium">
                    View all {allUnlocked.length} achievements →
                  </button>
                </Card>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function TreeVisualization({ streaks, overallStreak, daysClean, skills, projects, newAchievements }: {
  streaks: Record<string, number>;
  overallStreak: number;
  daysClean: number;
  skills: any[];
  projects: any[];
  newAchievements: any[];
}) {
  const totalLeaves = skills.length;
  const totalFruits = newAchievements.length;

  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="p-6 space-y-6">
        {/* Roots - Vision */}
        <div className="pt-8 pb-4 border-t border-[var(--color-border-light)] text-center">
          <div className="text-caption text-[var(--color-text-muted)] uppercase tracking-wider mb-2">ROOTS</div>
          <div className="text-body text-[var(--color-text-secondary)] max-w-lg mx-auto">
            "Your vision feeds everything. Stay rooted."
          </div>
        </div>

        {/* Trunk - Overall Streak */}
        <div className="relative">
          <div className="flex items-center justify-center gap-4">
            {/* Left branches - Projects */}
            <div className="flex-1 flex justify-end items-center pr-4">
              {projects.slice(0, 3).map((p, i) => (
                <div key={p.id} className="mb-2 w-24">
                  <div className="h-1.5 bg-[var(--color-border-light)] rounded relative">
                    <div className="h-full bg-[var(--color-pillar)] rounded" style={{ width: `${p.progress}%` }} />
                  </div>
                  <p className="text-[11px] text-[var(--color-text-muted)] truncate mt-1">{p.title}</p>
                </div>
              ))}
            </div>

            {/* Center - Main Streak Ring */}
            <div className="relative flex-shrink-0">
              <svg width={100} height={100}>
                <circle cx={50} cy={50} r={42} fill="none" stroke="var(--color-border-light)" strokeWidth={6} />
                <circle
                  cx={50} cy={50} r={42}
                  fill="none"
                  stroke="var(--color-pillar-vision)"
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeDasharray={264}
                  strokeDashoffset={264 * (1 - Math.min(overallStreak / 100, 1))}
                  className="progress-ring"
                  style={{ '--color-pillar-vision': getPillarColor('vision') }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-[28px] font-bold font-rounded text-[var(--color-text-primary)]">{overallStreak}</div>
                  <div className="text-[10px] text-[var(--color-text-muted)] uppercase">DAYS</div>
                </div>
              </div>
            </div>

            {/* Right branches - Skills */}
            <div className="flex-1 flex items-center pl-4">
              {skills.slice(0, 3).map((s, i) => (
                <div key={s.id} className="mb-2 w-24">
                  <div className="h-1.5 bg-[var(--color-border-light)] rounded relative">
                    <div className="h-full bg-[var(--color-pillar-skills)] rounded" style={{ width: `${(s.xp % 100)}%` }} />
                  </div>
                  <p className="text-[11px] text-[var(--color-text-muted)] truncate mt-1">Lv.{s.level} {s.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leaves - Skills */}
        {skills.length > 0 && (
          <div className="border-t border-[var(--color-border-light)] pt-4">
            <div className="text-caption text-[var(--color-text-muted)] uppercase tracking-wider mb-3 text-center">LEAVES — SKILLS</div>
            <div className="flex flex-wrap justify-center gap-2">
              {skills.slice(0, 8).map(skill => (
                <span
                  key={skill.id}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border border-[var(--color-border-light)]'
                  )}
                  style={{ fontSize: `${11 + Math.min(skill.level, 5)}px` }}
                >
                  Lv.{skill.level} {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Fruits - Achievements */}
        {newAchievements.length > 0 && (
          <div className="border-t border-[var(--color-border-light)] pt-4">
            <div className="text-caption text-[var(--color-text-muted)] uppercase tracking-wider mb-3 text-center">FRUITS — NEW THIS WEEK</div>
            <div className="flex flex-wrap justify-center gap-2">
              {newAchievements.map(a => (
                <span key={a.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--color-pillar)]/20 text-[var(--color-pillar)] border border-[var(--color-pillar)]/30 animate-bounce-in">
                  <span>{a.icon}</span>
                  {a.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Addiction - Clean Days */}
        {daysClean > 0 && (
          <div className="border-t border-[var(--color-border-light)] pt-4 text-center">
            <div className="text-caption text-[var(--color-text-muted)] uppercase tracking-wider mb-2">SHIELD — ADDICTION FREE</div>
            <div className="flex items-center justify-center gap-2">
              <Shield className="h-6 w-6 text-[var(--color-pillar-addiction)]" />
              <div className="text-right">
                <div className="text-title2 font-bold font-rounded text-[var(--color-text-primary)]">{daysClean}</div>
                <div className="text-caption text-[var(--color-text-muted)]">DAYS CLEAN</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function PillarWeekCard({ pillar, streak, weekDates, checkins, onToggle, expanded }: {
  pillar: string;
  streak: number;
  weekDates: string[];
  checkins: any[];
  onToggle: () => void;
  expanded: boolean;
}) {
  const color = getPillarColor(pillar);
  const Icon = PILLAR_ICONS[pillar];
  const style = { '--color-pillar': color } as React.CSSProperties;
  const items = PILLAR_ITEMS[pillar as keyof typeof PILLAR_ITEMS] || [];

  return (
    <Card variant="glass" style={style} className="overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-4 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-pillar)]/15">
          <Icon className="h-6 w-6 text-[var(--color-pillar)]" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-headline font-semibold text-[var(--color-text-primary)]">{PILLAR_LABELS[pillar as keyof typeof PILLAR_LABELS]}</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--color-pillar)]/20 text-[var(--color-pillar)]">
              {streak} day streak
            </span>
          </div>
          {/* Mini week view */}
          <div className="mt-2 flex gap-1 overflow-x-auto pb-1">
            {weekDates.map(date => {
              const done = checkins.some(c => c.date === date && c.category === pillar && c.completed);
              return (
                <div key={date} className={cn(
                  'flex-shrink-0 h-6 w-6 rounded-lg items-center justify-center text-[10px] font-medium transition-all',
                  done
                    ? 'bg-[var(--color-pillar)] text-white'
                    : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]'
                )}>
                  {new Date(date).getDate()}
                </div>
              );
            })}
          </div>
        </div>
        <ChevronDown className={cn('h-5 w-5 text-[var(--color-text-muted)] transition-transform', expanded && 'rotate-180')} />
      </button>

      {expanded && (
        <div className="border-t border-[var(--color-border-light)] p-4 space-y-3">
          {items.map(item => {
            const doneCount = weekDates.filter(date => 
              checkins.some(c => c.date === date && c.category === pillar && c.item_id === item.id && c.completed)
            ).length;
            return (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-tertiary)]/50">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-body font-medium text-[var(--color-text-primary)]">{item.label}</p>
                    <p className="text-caption text-[var(--color-text-muted)]">{doneCount}/7 days this week</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 bg-[var(--color-bg-primary)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--color-pillar)] rounded-full transition-all" style={{ width: `${(doneCount / 7) * 100}%` }} />
                  </div>
                  <span className="text-caption font-mono text-[var(--color-text-muted)] w-10 text-right">{doneCount}/7</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function AchievementCard({ achievement, new: isNew }: { achievement: any; new: boolean }) {
  const rarityColors = {
    common: 'bg-slate-700/50 border-slate-500/30',
    rare: 'bg-blue-900/30 border-blue-500/30',
    epic: 'bg-purple-900/30 border-purple-500/30',
    legendary: 'bg-yellow-900/30 border-yellow-500/30',
  };

  return (
    <Card variant="glass" className={cn('p-4 text-center relative overflow-hidden', rarityColors[achievement.rarity as keyof typeof rarityColors])}>
      {isNew && (
        <div className="absolute top-2 right-2 animate-bounce-in">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--color-pillar)] text-white">NEW</span>
        </div>
      )}
      <div className="text-3xl mb-2">{achievement.icon}</div>
      <h4 className="text-body font-semibold text-[var(--color-text-primary)]">{achievement.title}</h4>
      <p className="text-caption text-[var(--color-text-muted)] mt-1">{achievement.description}</p>
    </Card>
  );
}
