// Projects Page
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useProjects, useProjectMutations, useTasks, useTaskMutations } from '../hooks/useSupabase';
import { Card, Button, Input, Textarea } from '../components/ui';
import { Plus, Trash2, Check, ChevronDown, MoreHorizontal, Flag, Calendar, Target } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { getPillarColor } from '../lib/design';
import { Sheet } from '../components/ui';
import { format } from 'date-fns';

export function ProjectsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: projects } = useProjects();
  const { create: createProject, update: updateProject, remove: deleteProject } = useProjectMutations();
  const { data: tasks } = useTasks();
  const { toggle: toggleTask, create: createTask } = useTaskMutations();
  
  const [showCreate, setShowCreate] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({ title: '', goal: '', deadline: '', color: '#8b5cf6' });
  const [newTask, setNewTask] = useState({ projectId: '', title: '' });
  const projectList = projects || [];

  const handleCreateProject = async () => {
    if (!newProject.title.trim()) return;
    await createProject({
      ...newProject,
      status: 'active',
      progress: 0,
      order_index: (projects?.length || 0),
    });
    setNewProject({ title: '', goal: '', deadline: '', color: '#8b5cf6' });
    setShowCreate(false);
  };

  const handleUpdateProject = (project: any) => {
    updateProject({ id: project.id, ...project });
    setEditingProject(null);
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('Delete this project?')) {
      await deleteProject(id);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim() || !newTask.projectId) return;
    await createTask({ ...newTask, done: false, priority: 0, order_index: 0 });
    setNewTask({ projectId: '', title: '' });
  };

  const calculateProgress = (projectId: string) => {
    const projectTasks = tasks?.filter(t => t.project_id === projectId) || [];
    if (projectTasks.length === 0) return 0;
    const done = projectTasks.filter(t => t.done).length;
    return Math.round((done / projectTasks.length) * 100);
  };

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f97316', '#f43f5e', '#eab308', '#ec4899', '#06b6d4'];

  return (
    <div className="max-w-3xl mx-auto px-5 py-6 pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title1 font-bold text-[var(--color-text-primary)]">Projects</h1>
          <p className="text-body text-[var(--color-text-secondary)] mt-1">Track your missions in action</p>
        </div>
        <Button onClick={() => setShowCreate(true)} leftIcon={<Plus className="h-5 w-5" />}>New Project</Button>
      </div>

      {/* Projects List */}
      {projectList.length === 0 ? (
        <Card variant="elevated" className="text-center py-12">
          <Target className="h-16 w-16 mx-auto text-[var(--color-text-muted)]" />
          <h2 className="mt-4 text-title2 font-semibold text-[var(--color-text-primary)]">No projects yet</h2>
          <p className="mt-2 text-body text-[var(--color-text-secondary)]">Create your first project to start tracking progress</p>
          <Button onClick={() => setShowCreate(true)} className="mt-4" leftIcon={<Plus className="h-4 w-4" />}>
            Create Project
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {projectList.map(project => {
            const projectTasks = tasks?.filter(t => t.project_id === project.id) || [];
            const progress = calculateProgress(project.id);
            const style = { '--color-pillar': project.color } as React.CSSProperties;

            return (
              <Card key={project.id} variant="glass" style={style}>
                {editingProject === project.id ? (
                  <ProjectEditForm project={project} onSave={handleUpdateProject} onCancel={() => setEditingProject(null)} colors={COLORS} />
                ) : (
                  <div className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Flag className="h-5 w-5 text-[var(--color-pillar)]" />
                          <h3 className="text-title3 font-semibold text-[var(--color-text-primary)] truncate">{project.title}</h3>
                        </div>
                        {project.goal && <p className="mt-1 text-body text-[var(--color-text-secondary)] truncate">{project.goal}</p>}
                        {project.deadline && (
                          <div className="mt-1 flex items-center gap-1 text-caption text-[var(--color-text-muted)]">
                            <Calendar className="h-3 w-3" />
                            Due: {format(new Date(project.deadline), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="px-3 py-1 rounded-full text-caption font-medium bg-[var(--color-pillar)]/20 text-[var(--color-pillar)]">
                          {progress}%
                        </span>
                        <button onClick={() => setEditingProject(project.id)} className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-[var(--color-bg-primary)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--color-pillar)] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>

                    {/* Tasks */}
                    <div className="border-t border-[var(--color-border-light)] pt-4 space-y-2">
                      {projectTasks.length === 0 ? (
                        <p className="text-center text-body text-[var(--color-text-muted)] py-4">No tasks yet. Add your first task below.</p>
                      ) : (
                        projectTasks.map(task => (
                          <button
                            key={task.id}
                            onClick={() => toggleTask({ id: task.id, done: !task.done })}
                            className={cn(
                              'flex items-center gap-3 w-full p-3 rounded-xl transition-all',
                              task.done
                                ? 'bg-[var(--color-pillar)]/10 border border-[var(--color-pillar)]/20'
                                : 'bg-[var(--color-bg-tertiary)]/50 border border-transparent hover:border-[var(--color-border-light)]'
                            )}
                          >
                            <div className={cn(
                              'flex h-7 w-7 items-center justify-center rounded-lg border-2 transition-all flex-shrink-0',
                              task.done ? 'bg-[var(--color-pillar)] border-[var(--color-pillar)] text-white' : 'border-[var(--color-border-medium)] text-[var(--color-text-muted)]'
                            )}>
                              {task.done && <Check className="h-4 w-4" />}
                            </div>
                            <span className={cn('text-body flex-1 truncate', task.done ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text-primary)]')}>
                              {task.title}
                            </span>
                          </button>
                        ))
                      )}

                      {/* Add Task */}
                      <div className="flex gap-2 pt-2">
                        <Input
                          value={newTask.title}
                          onChange={e => setNewTask({ ...newTask, title: e.target.value, projectId: project.id })}
                          onKeyDown={e => e.key === 'Enter' && handleCreateTask()}
                          placeholder="Add task..."
                          leftIcon={<Plus className="h-5 w-5" />}
                        />
                        <Button variant="primary" size="sm" onClick={handleCreateTask}>Add</Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProjectEditForm({ project, onSave, onCancel, colors }: { project: any; onSave: (p: any) => void; onCancel: () => void; colors: string[] }) {
  const [form, setForm] = useState({
    title: project.title,
    goal: project.goal || '',
    deadline: project.deadline || '',
    color: project.color,
  });

  return (
    <div className="p-5 space-y-4">
      <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Project title" />
      <Textarea label="Goal" value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })} placeholder="What's the outcome?" rows={2} />
      
      <div>
        <label className="block text-caption text-[var(--color-text-muted)] mb-2">Color</label>
        <div className="flex gap-2 flex-wrap">
          {colors.map(c => (
            <button
              key={c}
              onClick={() => setForm({ ...form, color: c })}
              className={cn('h-8 w-8 rounded-xl border-2 transition-all', form.color === c ? 'border-white scale-110' : 'border-transparent hover:border-[var(--color-border-medium)]')}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <Input label="Deadline (optional)" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />

      <div className="flex gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button variant="primary" onClick={() => onSave({ ...project, ...form })} className="flex-1">Save</Button>
      </div>
    </div>
  );
}
