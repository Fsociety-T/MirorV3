// Pillar Sheet Content - Deep dive for each pillar
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useCheckins, useCheckinMutations, useTasks, useTaskMutations, useProjects, useAddictions, useSkills } from '../../hooks/useSupabase';
import { PILLAR_ITEMS, PILLAR_LABELS } from '../../lib/supabase';
import { getPillarColor } from '../../lib/design';
import { cn, classNames } from '../../lib/utils';
import { formatDate } from '../../lib/utils';
import { Card, Pill, Ring, Button, Input } from '../../components/ui';
import { Check, Plus, Circle, X, ChevronDown, Target, Flame, Zap, Brain, Dumbbell, Shield, Sparkles, Trophy } from 'lucide-react';
import { useState } from 'react';
import { hapticCheckin, hapticPrayer, hapticHealth, hapticAddictionMilestone } from '../../lib/haptics';

const PILLAR_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  prayer: Target,
  health: Dumbbell,
  addiction: Shield,
  habit: Sparkles,
  projects: Trophy,
  skills: Brain,
};

export function PillarSheetContent({ pillar }: { pillar: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = formatDate();
  const { data: checkins } = useCheckins(today);
  const { toggle: toggleCheckin } = useCheckinMutations();
  const { data: projects } = useProjects();
  const { data: tasks } = useTasks();
  const { toggle: toggleTask } = useTaskMutations();
  const { data: addictions } = useAddictions();
  const { data: skills } = useSkills();
  const [newItem, setNewItem] = useState('');

  const items = PILLAR_ITEMS[pillar as keyof typeof PILLAR_ITEMS] || [];
  const color = getPillarColor(pillar as keyof typeof getPillarColor);
  const style = { '--color-pillar': color } as React.CSSProperties;

  const completedItems = checkins?.filter(c => c.category === pillar && c.completed).map(c => c.item_id) || [];
  const progress = items.length > 0 ? completedItems.length / items.length : 0;

  const handleCheckin = (itemId: string, completed: boolean) => {
    toggleCheckin({ date: today, category: pillar, itemId, completed: !completed, value: 1 });
  };

  const handleAddCustom = async () => {
    if (!newItem.trim()) return;
    const itemId = `custom:${newItem.toLowerCase().replace(/\s+/g, '-')}`;
    await supabase.from('checkins').upsert({
      user_id: user!.id,
      date: today,
      category: pillar,
      item_id: itemId,
      completed: true,
      value: 1,
    });
    setNewItem('');
    queryClient.invalidateQueries({ queryKey: ['checkins', user?.id, today] });
  };

  // Render based on pillar
  switch (pillar) {
    case 'prayer':
      return (
        <div className="space-y-4" style={style}>
          <div className="flex items-center justify-between">
            <Ring progress={progress} size={56} strokeWidth={6} pillar="prayer" />
            <div className="text-right">
              <div className="text-title2 font-bold font-rounded text-[var(--color-text-primary)]">{completedItems.length}/5</div>
              <div className="text-caption text-[var(--color-text-muted)]">Prayers Today</div>
            </div>
          </div>
          
          <div className="space-y-2">
            {items.map(item => {
              const done = completedItems.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => { handleCheckin(item.id, done); hapticPrayer(); }}
                  className={cn(
                    'flex items-center gap-4 w-full p-4 rounded-xl transition-all duration-200',
                    done
                      ? 'bg-[var(--color-pillar)]/15 border border-[var(--color-pillar)]/30'
                      : 'bg-[var(--color-bg-tertiary)] border border-transparent hover:border-[var(--color-border-light)]'
                  )}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="text-headline font-medium text-[var(--color-text-primary)]">{item.label}</div>
                    <div className="text-caption text-[var(--color-text-muted)]">Tap to mark complete</div>
                  </div>
                  <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-xl transition-all',
                    done ? 'bg-[var(--color-pillar)] text-white' : 'bg-[var(--color-bg-primary)] text-[var(--color-text-muted)]'
                  )}>
                    {done ? <Check className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[var(--color-border-light)]">
            <p className="text-caption text-[var(--color-text-muted)] text-center">
              Long press streak for celebration • Swipe to navigate pillars
            </p>
          </div>
        </div>
      );

    case 'health':
      return (
        <div className="space-y-4" style={style}>
          <div className="flex items-center justify-between">
            <Ring progress={progress} size={56} strokeWidth={6} pillar="health" />
            <div className="text-right">
              <div className="text-title2 font-bold font-rounded text-[var(--color-text-primary)]">{completedItems.length}/4</div>
              <div className="text-caption text-[var(--color-text-muted)]">Habits Today</div>
            </div>
          </div>
          
          <div className="space-y-2">
            {items.map(item => {
              const done = completedItems.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => { handleCheckin(item.id, done); hapticHealth(); }}
                  className={cn(
                    'flex items-center gap-4 w-full p-4 rounded-xl transition-all duration-200',
                    done
                      ? 'bg-[var(--color-pillar)]/15 border border-[var(--color-pillar)]/30'
                      : 'bg-[var(--color-bg-tertiary)] border border-transparent hover:border-[var(--color-border-light)]'
                  )}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="text-headline font-medium text-[var(--color-text-primary)]">{item.label}</div>
                    <div className="text-caption text-[var(--color-text-muted)]">Tap to mark complete</div>
                  </div>
                  <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-xl transition-all',
                    done ? 'bg-[var(--color-pillar)] text-white' : 'bg-[var(--color-bg-primary)] text-[var(--color-text-muted)]'
                  )}>
                    {done ? <Check className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Add custom habit */}
          <div className="flex gap-2">
            <Input
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
              placeholder="Add custom habit..."
              leftIcon={<Plus className="h-5 w-5" />}
            />
            <Button onClick={handleAddCustom} variant="primary" size="sm">Add</Button>
          </div>
        </div>
      );

    case 'addiction':
      const addiction = addictions?.[0];
      const daysClean = addiction ? Math.floor((Date.now() - new Date(addiction.started_date).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      const relapsed = addiction?.relapsed_at;
      
      return (
        <div className="space-y-4" style={style}>
          <div className="text-center">
            <Ring progress={Math.min(daysClean / 100, 1)} size={80} strokeWidth={8} pillar="addiction">
              <div className="text-center">
                <div className="text-large-title font-bold font-rounded text-[var(--color-text-primary)]">{daysClean}</div>
                <div className="text-caption text-[var(--color-text-muted)]">{relapsed ? 'RELAPSED' : 'DAYS CLEAN'}</div>
              </div>
            </Ring>
          </div>

          {addiction && (
            <Card variant="glass" className="text-center">
              <p className="text-body text-[var(--color-text-secondary)]">
                Quit <span className="font-medium text-[var(--color-pillar)]">{addiction.name}</span> on{' '}
                <span className="font-medium">{new Date(addiction.started_date).toLocaleDateString()}</span>
              </p>
              {!relapsed && (
                <Button onClick={async () => { await supabase.from('addictions').update({ relapsed_at: new Date().toISOString() }).eq('id', addiction.id); queryClient.invalidateQueries({ queryKey: ['addictions', user?.id] }); hapticAddictionMilestone(); }} variant="destructive" className="mt-4">
                  <X className="h-4 w-4 mr-2" /> Relapsed - Reset Counter
                </Button>
              )}
              {relapsed && (
                <p className="mt-4 text-body text-[var(--color-text-muted)]">
                  Relapsed on {new Date(relapsed).toLocaleDateString()}. Start fresh anytime.
                </p>
              )}
            </Card>
          )}

          {!addiction && (
            <Card variant="glass">
              <p className="text-body text-[var(--color-text-secondary)] mb-4">Nothing to quit yet. Add your first addiction to track.</p>
              <div className="flex gap-2">
                <Input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="What are you quitting?" />
                <Button onClick={async () => { await supabase.from('addictions').insert({ user_id: user!.id, name: newItem, item_id: `nosmoke`, started_date: today }); setNewItem(''); queryClient.invalidateQueries({ queryKey: ['addictions', user?.id] }); }} variant="primary">Start Tracking</Button>
              </div>
            </Card>
          )}
        </div>
      );

    case 'projects':
      return (
        <div className="space-y-4">
          {projects?.length === 0 ? (
            <Card variant="glass" className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto text-[var(--color-text-muted)]" />
              <h3 className="mt-3 text-headline font-semibold">No projects yet</h3>
              <p className="mt-1 text-body text-[var(--color-text-muted)]">Create your first project to start tracking</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {projects?.map(project => (
                <Card key={project.id} variant="glass" className="overflow-hidden">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-headline font-semibold truncate">{project.title}</h3>
                        <Pill pillar="projects" count={project.progress} label={`${project.progress}%`} />
                      </div>
                      {project.goal && <p className="mt-1 text-body text-[var(--color-text-muted)] truncate">{project.goal}</p>}
                      <div className="mt-3 h-2 bg-[var(--color-bg-primary)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--color-pillar)] transition-all duration-500" style={{ width: `${project.progress}%`, '--color-pillar': project.color }} />
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                  
                  {/* Tasks for this project */}
                  {tasks?.filter(t => t.project_id === project.id).length && (
                    <div className="mt-3 border-t border-[var(--color-border-light)] pt-3 space-y-2">
                      {tasks?.filter(t => t.project_id === project.id).map(task => (
                        <button
                          key={task.id}
                          onClick={() => toggleTask({ id: task.id, done: !task.done })}
                          className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)]"
                        >
                          <div className={cn(
                            'flex h-6 w-6 items-center justify-center rounded border-2 transition-all',
                            task.done ? 'bg-[var(--color-pillar)] border-[var(--color-pillar)] text-white' : 'border-[var(--color-border-medium)] text-[var(--color-text-muted)]'
                          )}>
                            {task.done && <Check className="h-4 w-4" />}
                          </div>
                          <span className={cn('text-body flex-1 truncate', task.done ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text-primary)]')}>
                            {task.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      );

    case 'skills':
      return (
        <div className="space-y-4">
          {skills?.length === 0 ? (
            <Card variant="glass" className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto text-[var(--color-text-muted)]" />
              <h3 className="mt-3 text-headline font-semibold">No skills yet</h3>
              <p className="mt-1 text-body text-[var(--color-text-muted)]">Add skills to track your growth</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {skills?.map(skill => (
                <Card key={skill.id} variant="glass">
                  <div className="flex items-center gap-4">
                    <SkillRing level={skill.level} xp={skill.xp} size={56} />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-headline font-semibold truncate">{skill.name}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-caption text-[var(--color-text-muted)]">Level {skill.level}</span>
                        <div className="flex-1 h-1.5 bg-[var(--color-bg-primary)] rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--color-pillar)] transition-all duration-500" style={{ width: `${getProgressToNextLevel(skill.xp) * 100}%` }} />
                        </div>
                        <span className="text-caption font-mono text-[var(--color-text-muted)]">{skill.xp} XP</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { /* add XP */ }}>+XP</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
            <Input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="New skill..." />
            <Button variant="primary" size="sm" onClick={async () => { await supabase.from('skills').insert({ user_id: user!.id, name: newItem, level: 1, xp: 0 }); setNewItem(''); queryClient.invalidateQueries({ queryKey: ['skills', user?.id] }); }}>Add</Button>
          </div>
        </div>
      );

    default:
      return (
        <div className="space-y-4" style={style}>
          <div className="text-center py-8">
            <div className="h-12 w-12 mx-auto rounded-xl bg-[var(--color-pillar)]/20 flex items-center justify-center">
              <PILLAR_ICONS[pillar]?.({ className: "h-6 w-6 text-[var(--color-pillar)]" }) ?? <Sparkles className="h-6 w-6 text-[var(--color-pillar)]" />}
            </div>
            <h3 className="mt-3 text-headline font-semibold">{PILLAR_LABELS[pillar as keyof typeof PILLAR_LABELS] || pillar}</h3>
            <p className="mt-1 text-body text-[var(--color-text-muted)]">Deep dive content coming soon</p>
          </div>
        </div>
      );
  }
}

// Helper
function getProgressToNextLevel(xp: number) {
  return (xp % 100) / 100;
}