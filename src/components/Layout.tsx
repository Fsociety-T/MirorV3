// Layout with Bottom Navigation
import { useState } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { Home, TreePine, Target, Trophy, Settings, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { useUIStore } from '../store/useStore';
import { Sheet } from '../components/ui';

const NAV_ITEMS = [
  { path: '/daily', label: 'Today', icon: Home, pillar: 'prayer' as const },
  { path: '/tree', label: 'Week', icon: TreePine, pillar: 'health' as const },
  { path: '/vision', label: 'Vision', icon: Target, pillar: 'vision' as const },
  { path: '/projects', label: 'Projects', icon: Trophy, pillar: 'projects' as const },
  { path: '/achievements', label: 'Achievements', icon: Trophy, pillar: 'skills' as const },
  { path: '/settings', label: 'Settings', icon: Settings, pillar: 'addiction' as const },
] as const;

export function Layout() {
  const location = useLocation();
  const { theme, toggleTheme, pillarSheetOpen, closePillarSheet, activePillarSheet } = useUIStore();
  const [showMore, setShowMore] = useState(false);

  const currentItem = NAV_ITEMS.find(item => location.pathname.startsWith(item.path)) || NAV_ITEMS[0];

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)]">
      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 safe-bottom">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-bg-secondary)]/95 backdrop-blur-xl border-t border-[var(--color-border-light)]/50 safe-bottom">
        <div className="flex h-16 items-center justify-around px-2">
          {NAV_ITEMS.slice(0, 4).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200',
                isActive
                  ? 'text-[var(--color-pillar)]'
                  : 'text-[var(--color-text-muted)]'
              )}
              style={{ '--color-pillar': getComputedStyle(document.documentElement).getPropertyValue(`--pillar-${item.pillar}`) || getPillarColor(item.pillar) }}
            >
              <item.icon className="h-6 w-6" strokeWidth={isActive ? 3 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
          
          {/* More button for overflow */}
          <NavLink
            to="/achievements"
            className={({ isActive }) => cn(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200',
              isActive || location.pathname === '/achievements' || location.pathname === '/settings'
                ? 'text-[var(--color-pillar)]'
                : 'text-[var(--color-text-muted)]'
            )}
            style={{ '--color-pillar': '#eab308' }}
          >
            <ChevronDown className="h-6 w-6" strokeWidth={2} />
            <span className="text-[10px] font-medium">More</span>
          </NavLink>
        </div>
      </nav>

      {/* More Sheet */}
      <Sheet
        open={showMore}
        onClose={() => setShowMore(false)}
        title="More"
        snapPoints={[0.4]}
      >
        <div className="grid grid-cols-2 gap-3">
          <NavLink
            to="/achievements"
            onClick={() => setShowMore(false)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[var(--color-bg-tertiary)] text-center"
          >
            <Trophy className="h-8 w-8 text-[var(--pillar-skills)]" />
            <span className="text-body font-medium">Achievements</span>
          </NavLink>
          <NavLink
            to="/settings"
            onClick={() => setShowMore(false)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[var(--color-bg-tertiary)] text-center"
          >
            <Settings className="h-8 w-8 text-[var(--pillar-addiction)]" />
            <span className="text-body font-medium">Settings</span>
          </NavLink>
        </div>
      </Sheet>

      {/* Pillar Deep-dive Sheet */}
      <Sheet
        open={pillarSheetOpen}
        onClose={closePillarSheet}
        title={activePillarSheet ? PILLAR_LABELS[activePillarSheet] : ''}
        snapPoints={[0.6, 0.9]}
        defaultSnap={1}
      >
        {activePillarSheet && <PillarSheetContent pillar={activePillarSheet} />}
      </Sheet>
    </div>
  );
}

// Import at top level to avoid circular
import { PILLAR_LABELS, PILLAR_ITEMS, PILLAR_ORDER } from '../lib/supabase';
import { getPillarColor } from '../lib/design';
import { PillarSheetContent } from '../components/daily/PillarSheetContent';