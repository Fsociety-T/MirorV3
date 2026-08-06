// Daily Page - Command Deck
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useVision } from '../hooks/useSupabase';
import { useStreaks, useCheckins, useCheckinMutations } from '../hooks/useSupabase';
import { usePillarCarousel, usePullDown } from '../hooks/useGestures';
import { PILLAR_ORDER, PILLAR_LABELS, PILLAR_ITEMS } from '../lib/supabase';
import { getPillarColor } from '../lib/design';
import { cn, formatDate, getTodayString } from '../lib/utils';
import { Card, Pill, Ring, StreakRing } from '../components/ui';
import { hapticCheckin, hapticSwipe, hapticSwipeEnd } from '../lib/haptics';
import { Flame, ChevronLeft, ChevronRight, Target, Dumbbell, Shield, Sparkles, MoreHorizontal } from 'lucide-react';
import { useUIStore } from '../store/useStore';
import { PillarSheetContent } from '../components/daily/PillarSheetContent';
import { Sheet } from '../components/ui';

const PILLAR_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  prayer: Target,
  health: Dumbbell,
  addiction: Shield,
  habit: Sparkles,
};

export function DailyPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: vision } = useVision();
  const { data: streaks } = useStreaks();
  const today = getTodayString();
  const { data: checkins } = useCheckins(today);
  const { toggle: toggleCheckin } = useCheckinMutations();
  const { activePillarIndex, setActivePillarIndex, openPillarSheet } = useUIStore();
  
  const pillarCount = PILLAR_ORDER.length;
  const { index: carouselIndex, ref: carouselRef, dragProps } = usePillarCarousel(pillarCount);
  
  // Sync carousel with store
  useEffect(() => { setActivePillarIndex(carouselIndex); }, [carouselIndex, setActivePillarIndex]);
  useEffect(() => { /* could sync reverse */ }, [activePillarIndex]);

  // Pull down for tree view
  const { pullDistance, pulling } = usePullDown(() => {
    // Navigate to tree view
    window.location.href = '/tree';
  }, 80);

  const activePillar = PILLAR_ORDER[activePillarIndex];
  const activeItems = PILLAR_ITEMS[activePillar] || [];
  const completedItems = checkins?.filter(c => c.category === activePillar && c.completed).map(c => c.item_id) || [];
  const progress = activeItems.length > 0 ? completedItems.length / activeItems.length : 0;
  const color = getPillarColor(activePillar);
  const style = { '--color-pillar': color } as React.CSSProperties;

  const handleCheckin = (itemId: string, completed: boolean) => {
    toggleCheckin({ date: today, category: activePillar, itemId, completed: !completed, value: 1 });
    hapticCheckin();
  };

  const handleOpenSheet = () => {
    openPillarSheet(activePillar);
    hapticSwipe();
  };

  // Vision statement for footer
  const visionText = vision?.statement || 'Tap to set your vision — your north star';

  return (
    <div className="flex flex-col min-h-screen pb-24" style={style}>
      {/* Pull indicator */}
      {pulling && pullDistance > 20 && (
        <div className="fixed top-0 left-0 right-0 h-4 z-50 flex items-end justify-center pointer-events-none">
          <div className="mb-2 w-6 h-6 rounded-full border-2 border-[var(--color-pillar)] border-t-transparent animate-spin" style={{ transform: `scale(${Math.min(pullDistance / 80, 1)})` }} />
        </div>
      )}

      {/* Carousel Container */}
      <div
        ref={carouselRef}
        className="flex-1 overflow-hidden"
        {...dragProps}
      >
        <div
          className="flex h-full transition-transform duration-350 ease-out"
          style={{ transform: `translateX(-${activePillarIndex * 100}%)` }}
        >
          {PILLAR_ORDER.map((pillar, i) => (
            <div key={pillar} className="w-screen flex flex-col">
              <PillarCard
                pillar={pillar}
                progress={progress}
                completedItems={completedItems}
                items={activeItems}
                onCheckin={handleCheckin}
                onOpenSheet={handleOpenSheet}
                isActive={i === activePillarIndex}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pillar Indicator Dots */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 z-30">
        {PILLAR_ORDER.map((pillar, i) => (
          <button
            key={pillar}
            onClick={() => { setActivePillarIndex(i); hapticSwipe(); }}
            className={cn(
              'h-2 w-2 rounded-full transition-all duration-300',
              i === activePillarIndex
                ? 'w-8 bg-[var(--color-pillar)]'
                : 'bg-[var(--color-border-medium)]'
            )}
            style={{ '--color-pillar': getPillarColor(pillar) }}
            aria-label={PILLAR_LABELS[pillar]}
          />
        ))}
      </div>

      {/* Vision Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent py-4 px-5 safe-bottom">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-caption text-[var(--color-text-muted)] uppercase tracking-wider mb-1">YOUR VISION</p>
          <p className="text-body text-[var(--color-text-primary)] line-clamp-2">{visionText}</p>
        </div>
      </div>

      {/* Pillar Deep-dive Sheet */}
      <Sheet
        open={false} // Controlled by store
        onClose={() => {}}
        title={PILLAR_LABELS[activePillar]}
        snapPoints={[0.6, 0.9]}
        defaultSnap={1}
      >
        <PillarSheetContent pillar={activePillar} />
      </Sheet>
    </div>
  );
}

// Pillar Card Component
function PillarCard({ pillar, progress, completedItems, items, onCheckin, onOpenSheet, isActive }: {
  pillar: string;
  progress: number;
  completedItems: string[];
  items: { id: string; label: string; icon: string }[];
  onCheckin: (itemId: string, completed: boolean) => void;
  onOpenSheet: () => void;
  isActive: boolean;
}) {
  const color = getPillarColor(pillar);
  const Icon = PILLAR_ICONS[pillar];
  const style = { '--color-pillar': color } as React.CSSProperties;

  return (
    <div className="flex flex-col h-full p-5" style={style}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon className="h-8 w-8 text-[var(--color-pillar)]" strokeWidth={2.5} />
          <div>
            <p className="text-caption text-[var(--color-text-muted)] uppercase tracking-wider">{PILLAR_LABELS[pillar as keyof typeof PILLAR_LABELS]}</p>
            <p className="text-title3 font-semibold text-[var(--color-text-primary)]">{completedItems.length}/{items.length}</p>
          </div>
        </div>
        <button onClick={onOpenSheet} className="p-2 rounded-xl bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border-light)] transition-colors">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Progress Ring */}
      <div className="flex-1 flex items-center justify-center px-4">
        <Ring
          progress={progress}
          size={120}
          strokeWidth={10}
          pillar={pillar as any}
          animate={isActive}
        >
          <div className="text-center">
            <div className="text-[48px] font-bold font-rounded text-[var(--color-text-primary)]">{Math.round(progress * 100)}%</div>
            <div className="text-caption text-[var(--color-text-muted)]">Complete</div>
          </div>
        </Ring>
      </div>

      {/* Items */}
      <div className="space-y-2 pb-4">
        {items.map(item => {
          const done = completedItems.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onCheckin(item.id, done)}
              className={cn(
                'flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200',
                done
                  ? 'bg-[var(--color-pillar)]/15 border border-[var(--color-pillar)]/30'
                  : 'bg-[var(--color-bg-tertiary)] border border-transparent hover:border-[var(--color-border-light)]'
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1 text-left">
                <p className="text-body font-medium text-[var(--color-text-primary)]">{item.label}</p>
              </div>
              <div className={cn(
                'flex h-7 w-7 items-center justify-center rounded-lg transition-all',
                done ? 'bg-[var(--color-pillar)] text-white' : 'bg-[var(--color-bg-primary)] text-[var(--color-text-muted)]'
              )}>
                {done ? <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth={2} /></svg>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
