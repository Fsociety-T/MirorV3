// Vision Page
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useVision, useUpdateVision } from '../hooks/useSupabase';
import { Card, Button, Input, Textarea } from '../components/ui';
import { Target, Flag, CheckCircle, Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '../lib/utils';

export function VisionPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: vision } = useVision();
  const { mutate: updateVision } = useUpdateVision();
  
  const [statement, setStatement] = useState(vision?.statement || '');
  const [missions, setMissions] = useState<{ id: string; title: string; active: boolean }[]>(vision?.missions || []);
  const [editingMission, setEditingMission] = useState<string | null>(null);
  const [newMission, setNewMission] = useState('');

  const handleSave = () => {
    updateVision({ statement, missions }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vision', user?.id] }),
    });
  };

  const addMission = () => {
    if (!newMission.trim()) return;
    setMissions([...missions, { id: crypto.randomUUID(), title: newMission, active: missions.length === 0 }]);
    setNewMission('');
  };

  const toggleMission = (id: string) => {
    setMissions(missions.map(m => ({ ...m, active: m.id === id })));
  };

  const deleteMission = (id: string) => {
    setMissions(missions.filter(m => m.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto px-5 py-6 pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title1 font-bold text-[var(--color-text-primary)]">Vision & Missions</h1>
          <p className="text-body text-[var(--color-text-secondary)] mt-1">Your north star and the missions that guide you</p>
        </div>
        <Target className="h-10 w-10 text-[var(--color-pillar-vision)]" />
      </div>

      {/* Vision Statement */}
      <Card variant="elevated">
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[var(--color-pillar-vision)]" />
            <h2 className="text-headline font-semibold text-[var(--color-text-primary)]">Life Vision</h2>
          </div>
          <Textarea
            value={statement}
            onChange={e => setStatement(e.target.value)}
            placeholder="What does your ideal life look like? Write it as if it's already happening..."
            rows={4}
            className="font-medium text-lg"
          />
          <Button variant="primary" onClick={handleSave} className="w-full">Save Vision</Button>
        </div>
      </Card>

      {/* Missions */}
      <Card variant="glass">
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-[var(--color-pillar-vision)]" />
              <h2 className="text-headline font-semibold text-[var(--color-text-primary)]">Active Missions</h2>
            </div>
            <span className="text-caption text-[var(--color-text-muted)]">One at a time</span>
          </div>

          {missions.length === 0 ? (
            <div className="text-center py-8">
              <Flag className="h-12 w-12 mx-auto text-[var(--color-text-muted)]" />
              <p className="mt-3 text-body text-[var(--color-text-secondary)]">No missions yet</p>
              <p className="text-caption text-[var(--color-text-muted)]">Add your first mission to start</p>
            </div>
          ) : (
            <div className="space-y-2">
              {missions.map((mission, index) => (
                <div key={mission.id} className={cn(
                  'flex items-center gap-3 p-3 rounded-xl transition-all',
                  mission.active
                    ? 'bg-[var(--color-pillar-vision)]/15 border border-[var(--color-pillar-vision)]/30'
                    : 'bg-[var(--color-bg-tertiary)]/50 border border-transparent hover:border-[var(--color-border-light)]'
                )}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
                    style={{ background: mission.active ? 'var(--color-pillar-vision)' : 'var(--color-bg-primary)', color: mission.active ? 'white' : 'var(--color-text-muted)' }}>
                    {mission.active ? <CheckCircle className="h-5 w-5" /> : <span className="text-body font-bold">{index + 1}</span>}
                  </div>
                  
                  {editingMission === mission.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={mission.title}
                        onChange={e => setMissions(missions.map(m => m.id === mission.id ? { ...m, title: e.target.value } : m))}
                        onBlur={() => setEditingMission(null)}
                        onKeyDown={e => e.key === 'Enter' && setEditingMission(null)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-light)] text-[var(--color-text-primary)] text-body focus:border-[var(--color-pillar-vision)] focus:outline-none"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center gap-3" onDoubleClick={() => setEditingMission(mission.id)}>
                      <p className={cn('text-body flex-1 truncate', mission.active ? 'font-semibold text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]')}>
                        {mission.title}
                      </p>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: mission.active ? 'var(--color-pillar-vision)' : 'var(--color-bg-tertiary)', color: mission.active ? 'white' : 'var(--color-text-muted)' }}>
                        {mission.active ? 'ACTIVE' : 'PAUSED'}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    {!mission.active && (
                      <button onClick={() => toggleMission(mission.id)} className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                        <Flag className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => setEditingMission(mission.id)} className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => deleteMission(mission.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <GripVertical className="h-5 w-5 text-[var(--color-text-muted)]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Mission */}
          <div className="flex gap-2 pt-2 border-t border-[var(--color-border-light)]">
            <Input
              value={newMission}
              onChange={e => setNewMission(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addMission()}
              placeholder="New mission..."
              leftIcon={<Plus className="h-5 w-5" />}
            />
            <Button variant="primary" onClick={addMission}>Add</Button>
          </div>
        </div>
      </Card>

      {/* Guidance */}
      <Card variant="glass" className="border-[var(--color-pillar-vision)]/30 bg-[var(--color-pillar-vision)]/5">
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[var(--color-pillar-vision)]" />
            <h3 className="text-headline font-semibold text-[var(--color-pillar-vision)]">How it works</h3>
          </div>
          <ul className="space-y-2 text-body text-[var(--color-text-secondary)]">
            <li className="flex items-start gap-2"><span className="text-[var(--color-pillar-vision)]">→</span> Your <strong>Vision</strong> is your ultimate destination — write it in present tense</li>
            <li className="flex items-start gap-2"><span className="text-[var(--color-pillar-vision)]">→</span> <strong>Missions</strong> are the 1-3 major paths to get there — only ONE is active at a time</li>
            <li className="flex items-start gap-2"><span className="text-[var(--color-pillar-vision)]">→</span> Daily pillars (prayer, health, projects) should serve your active mission</li>
            <li className="flex items-start gap-2"><span className="text-[var(--color-pillar-vision)]">→</span> Review weekly in the Tree view — are your branches growing toward your roots?</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}