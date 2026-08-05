// Achievements Page
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAchievements } from '../hooks/useSupabase';
import { Card } from '../components/ui';
import { Award, Sparkles, Star, Crown, Filter, X } from 'lucide-react';
import { cn } from '../lib/utils';

const RARITY_ORDER = { legendary: 0, epic: 1, rare: 2, common: 3 };
const RARITY_COLORS = {
  common: 'bg-slate-700/50 border-slate-500/30 text-slate-300',
  rare: 'bg-blue-900/30 border-blue-500/30 text-blue-300',
  epic: 'bg-purple-900/30 border-purple-500/30 text-purple-300',
  legendary: 'bg-yellow-900/30 border-yellow-500/30 text-yellow-300',
};
const RARITY_ICONS = {
  common: Award,
  rare: Star,
  epic: Sparkles,
  legendary: Crown,
};

export function AchievementsPage() {
  const { user } = useAuth();
  const { data: achievements } = useAchievements();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [rarityFilter, setRarityFilter] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all');

  const filtered = achievements?.filter(a => {
    if (filter === 'unlocked' && !a.unlocked) return false;
    if (filter === 'locked' && a.unlocked) return false;
    if (rarityFilter !== 'all' && a.rarity !== rarityFilter) return false;
    return true;
  }) || [];

  const unlockedCount = achievements?.filter(a => a.unlocked).length || 0;
  const totalCount = achievements?.length || 0;

  return (
    <div className="max-w-4xl mx-auto px-5 py-6 pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title1 font-bold text-[var(--color-text-primary)]">Achievements</h1>
          <p className="text-body text-[var(--color-text-secondary)] mt-1">Your journey's milestones</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-bg-tertiary)]">
            <Award className="h-5 w-5 text-[var(--color-pillar-skills)]" />
            <span className="text-headline font-semibold font-rounded text-[var(--color-text-primary)]">{unlockedCount}</span>
            <span className="text-caption text-[var(--color-text-muted)]">/ {totalCount}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-2">
          {['all', 'unlocked', 'locked'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-xl text-caption font-medium transition-all',
                filter === f
                  ? 'bg-[var(--color-pillar-skills)] text-white'
                  : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex-1 flex justify-end gap-2">
          {['all', 'common', 'rare', 'epic', 'legendary'].map(r => (
            <button
              key={r}
              onClick={() => setRarityFilter(r)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-caption font-medium transition-all flex items-center gap-1',
                rarityFilter === r
                  ? 'bg-[var(--color-pillar-skills)] text-white'
                  : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              )}
            >
              {r !== 'all' && (() => { const Icon = RARITY_ICONS[r as keyof typeof RARITY_ICONS]; return <Icon className="h-3 w-3" />; })()}
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {['common', 'rare', 'epic', 'legendary'].map(rarity => {
          const total = achievements?.filter(a => a.rarity === rarity).length || 0;
          const unlocked = achievements?.filter(a => a.rarity === rarity && a.unlocked).length || 0;
          return (
            <Card key={rarity} variant="glass" className={cn('p-4 text-center', RARITY_COLORS[rarity as keyof typeof RARITY_COLORS])}>
              {(() => { const Icon = RARITY_ICONS[rarity as keyof typeof RARITY_ICONS]; return <Icon className="h-6 w-6 mx-auto mb-2" />; })()}
              <div className="text-title2 font-bold font-rounded">{unlocked}/{total}</div>
              <div className="text-caption">{rarity}</div>
            </Card>
          );
        })}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {filtered.map(achievement => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
        
        {filtered.length === 0 && (
          <Card variant="glass" className="col-span-full text-center py-12">
            <Filter className="h-12 w-12 mx-auto text-[var(--color-text-muted)]" />
            <p className="mt-3 text-body text-[var(--color-text-secondary)]">No achievements match your filters</p>
          </Card>
        )}
      </div>

      {/* Legend */}
      <Card variant="glass">
        <div className="p-5">
          <h3 className="text-headline font-semibold mb-4 text-[var(--color-text-primary)]">Rarity Guide</h3>
          <div className="flex flex-wrap gap-4">
            {['common', 'rare', 'epic', 'legendary'].map(rarity => (
              <div key={rarity} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-caption" style={{ background: `var(--color-${rarity})/10`, border: `1px solid var(--color-${rarity})/30`, color: `var(--color-${rarity})` }}>
                <RARITY_ICONS[rarity as keyof typeof RARITY_ICONS] className="h-4 w-4" />
                <span className="capitalize">{rarity}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: any }) {
  const Icon = RARITY_ICONS[achievement.rarity as keyof typeof RARITY_ICONS];
  const cardStyle = RARITY_COLORS[achievement.rarity as keyof typeof RARITY_COLORS];

  return (
    <Card variant="glass" className={cn('p-4 text-center relative overflow-hidden group', cardStyle)}>
      {!achievement.unlocked && (
        <div className="absolute inset-0 bg-[var(--color-bg-primary)]/60 flex items-center justify-center">
          <div className="text-center opacity-50">
            <Icon className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-capitalize text-capacity">Locked</p>
          </div>
        </div>
      )}

      {achievement.newlyUnlocked && (
        <div className="absolute top-2 right-2 animate-bounce-in">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[var(--color-pillar-skills)] text-white">NEW</span>
        </div>
      )}

      <div className="relative z-10">
        <div className="text-4xl mb-3">{achievement.icon}</div>
        <h4 className="text-body font-semibold mb-1">{achievement.title}</h4>
        <p className="text-caption opacity-80 mb-2">{achievement.description}</p>
        
        <div className="flex items-center justify-center gap-1">
          <Icon className="h-3 w-3" />
          <span className="text-[10px] font-medium capitalize">{achievement.rarity}</span>
          {achievement.threshold && (
            <>
              <span className="text-[var(--color-text-muted)]">•</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">Threshold: {achievement.threshold}</span>
            </>
          )}
        </div>

        {achievement.unlockedAt && (
          <p className="mt-2 text-[11px] text-[var(--color-text-muted)]">
            Unlocked {formatDate(achievement.unlockedAt)}
          </p>
        )}
      </div>
    </Card>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}