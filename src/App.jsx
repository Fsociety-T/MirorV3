import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Brain,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Circle,
  Clock3,
  Dumbbell,
  Grid2X2,
  House,
  Landmark,
  ListChecks,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  X,
  Zap
} from 'lucide-react';
import {
  addDays,
  dateKey,
  daysSince,
  domains,
  prayers,
  projectProgress,
  skillIcons,
  skillStats
} from './model';
import { useMirrorStore } from './useMirrorStore';

const navigation = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'today', label: 'Today', icon: ListChecks },
  { id: 'vision', label: 'Vision', icon: Target },
  { id: 'projects', label: 'Projects', icon: BriefcaseBusiness },
  { id: 'trackers', label: 'Trackers', icon: Activity },
  { id: 'skills', label: 'Skills', icon: Brain },
  { id: 'achievements', label: 'Achievements', icon: Trophy }
];

const pageCopy = {
  home: ['Home', 'Your whole life, connected.'],
  today: ['Today', 'Do what moves the future.'],
  vision: ['Vision', 'Give every action a direction.'],
  projects: ['Projects', 'Turn the vision into outcomes.'],
  trackers: ['Trackers', 'Faith, body, and freedom.'],
  skills: ['Skills', 'Proof of who you are becoming.'],
  achievements: ['Achievements', 'Evidence that the system is working.']
};

function formatLongDate(value = new Date()) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(value);
}

function formatShortDate(value) {
  if (!value) return 'No deadline';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${value}T00:00:00`));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function App() {
  const { state, metrics, achievements, notice, actions } = useMirrorStore();
  const [activeView, setActiveView] = useState('home');
  const [trackerTab, setTrackerTab] = useState('prayer');
  const [modal, setModal] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);

  const navigate = (view) => {
    setActiveView(view);
    setMoreOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderView = () => {
    const props = { state, metrics, achievements, actions, navigate, setModal };
    if (activeView === 'today') return <TodayView {...props} />;
    if (activeView === 'vision') return <VisionView {...props} />;
    if (activeView === 'projects') return <ProjectsView {...props} />;
    if (activeView === 'trackers') return <TrackersView {...props} trackerTab={trackerTab} setTrackerTab={setTrackerTab} />;
    if (activeView === 'skills') return <SkillsView {...props} />;
    if (activeView === 'achievements') return <AchievementsView {...props} />;
    return <HomeView {...props} />;
  };

  return (
    <div className="mirror-shell">
      <aside className="sidebar">
        <Brand />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => <NavButton key={item.id} item={item} active={activeView === item.id} onClick={() => navigate(item.id)} />)}
        </nav>
        <div className="sidebar-status">
          <span className="live-dot" />
          <div><strong>Local mode</strong><small>Private on this device</small></div>
        </div>
        <button type="button" className="sidebar-command" onClick={actions.resetAll}><RotateCcw size={17} />Reset system</button>
      </aside>

      <main className="app-main">
        <header className="app-header">
          <div>
            <p className="overline">{formatLongDate()}</p>
            <h1>{pageCopy[activeView][0]}</h1>
            <p className="header-subtitle">{pageCopy[activeView][1]}</p>
          </div>
          <div className="header-actions">
            <div className="performance-chip"><span>Performance</span><strong>{metrics.performance}</strong></div>
            <button type="button" className="primary-button" onClick={() => setModal('task')}><Plus size={18} />Add task</button>
          </div>
        </header>

        <div className="system-notice"><Zap size={14} />{notice}</div>
        <div className="view-enter" key={activeView}>{renderView()}</div>
      </main>

      <nav className="mobile-tabbar" aria-label="Mobile navigation">
        {navigation.slice(0, 4).map((item) => <MobileNavButton key={item.id} item={item} active={activeView === item.id} onClick={() => navigate(item.id)} />)}
        <button type="button" className={moreOpen || ['trackers', 'skills', 'achievements'].includes(activeView) ? 'mobile-tab active' : 'mobile-tab'} onClick={() => setMoreOpen(true)}>
          <Grid2X2 size={20} /><span>More</span>
        </button>
      </nav>

      {moreOpen && <MoreSheet activeView={activeView} navigate={navigate} onClose={() => setMoreOpen(false)} actions={actions} />}
      {modal && <AddModal type={modal} state={state} actions={actions} onClose={() => setModal(null)} />}
    </div>
  );
}

function Brand() {
  return (
    <div className="brand-lockup">
      <div className="brand-symbol" aria-hidden="true"><span /><i /></div>
      <div><strong>MIRROR</strong><small>LIFE OPERATING SYSTEM</small></div>
    </div>
  );
}

function NavButton({ item, active, onClick }) {
  const Icon = item.icon;
  return <button type="button" className={active ? 'desktop-nav-item active' : 'desktop-nav-item'} onClick={onClick}><Icon size={18} /><span>{item.label}</span></button>;
}

function MobileNavButton({ item, active, onClick }) {
  const Icon = item.icon;
  return <button type="button" className={active ? 'mobile-tab active' : 'mobile-tab'} onClick={onClick}><Icon size={20} /><span>{item.label}</span></button>;
}

function HomeView({ state, metrics, achievements, actions, navigate, setModal }) {
  const completedPrayers = prayers.filter((item) => state.prayerChecks[item.id]).length;
  const completedSports = state.sportSessions.filter((item) => item.done).length;
  const unlocked = achievements.filter((item) => item.unlocked).length;
  const activeTasks = state.tasks.filter((item) => !item.done).slice(0, 4);
  const cleanDays = state.addictions.length ? Math.min(...state.addictions.map((item) => daysSince(item.startDate))) : 0;

  return (
    <div className="home-layout">
      <FutureCard state={state} metrics={metrics} navigate={navigate} />

      <section className="surface today-surface">
        <SectionHeader eyebrow="TODAY" title="Next actions" action={<button type="button" className="icon-button" onClick={() => setModal('task')} title="Add a task"><Plus size={18} /></button>} />
        <div className="compact-task-list">
          {activeTasks.length ? activeTasks.map((task) => <TaskRow key={task.id} task={task} state={state} onToggle={() => actions.toggleTask(task.id)} compact />) : <EmptyState icon={Check} title="Today is clear" copy="Add the next action when you are ready." />}
        </div>
        <button type="button" className="surface-link" onClick={() => navigate('today')}>Open full day <ChevronRight size={16} /></button>
      </section>

      <section className="surface systems-surface">
        <SectionHeader eyebrow="DAILY SYSTEMS" title="Signals that shape performance" />
        <div className="signal-list">
          <Signal icon={Landmark} label="Prayer" value={`${completedPrayers}/5`} progress={metrics.prayerRate * 100} color={domains.prayer.color} onClick={() => navigate('trackers')} />
          <Signal icon={Dumbbell} label="Sport" value={`${completedSports}/3`} progress={metrics.sportRate * 100} color={domains.health.color} onClick={() => navigate('trackers')} />
          <Signal icon={ShieldCheck} label="No addiction" value={`${cleanDays}d`} progress={metrics.disciplineRate * 100} color={domains.discipline.color} onClick={() => navigate('trackers')} />
          <Signal icon={Brain} label="Skills" value={`${state.skills.length}`} progress={metrics.skillRate * 100} color={domains.growth.color} onClick={() => navigate('skills')} />
        </div>
      </section>

      <section className="surface momentum-surface">
        <SectionHeader eyebrow="PROJECT MOMENTUM" title="Work tied to the vision" action={<button type="button" className="text-button" onClick={() => navigate('projects')}>View all</button>} />
        <div className="project-strip">
          {state.projects.slice(0, 3).map((project) => <ProjectLine key={project.id} project={project} tasks={state.tasks} />)}
        </div>
      </section>

      <section className="surface proof-surface">
        <SectionHeader eyebrow="PROOF" title="Achievements unlocked" action={<span className="section-count">{unlocked}/{achievements.length}</span>} />
        <div className="achievement-preview">
          {achievements.filter((item) => item.unlocked).slice(0, 3).map((item) => {
            const Icon = item.icon;
            return <div key={item.id} className={`mini-achievement ${item.tone}`}><Icon size={18} /><span>{item.title}</span></div>;
          })}
          {!unlocked && <p className="muted-copy">Your first completed action unlocks the first proof.</p>}
        </div>
        <button type="button" className="surface-link" onClick={() => navigate('achievements')}>See all achievements <ChevronRight size={16} /></button>
      </section>
    </div>
  );
}

function FutureCard({ state, metrics, navigate }) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference * (1 - metrics.futureScore / 100);
  const points = useMemo(() => {
    const base = metrics.performance;
    return [base - 8, base - 2, base + 5, base + 2, base + 11, metrics.futureScore].map((value, index) => `${index * 44 + 4},${76 - clamp(value, 5, 95) * 0.64}`).join(' ');
  }, [metrics.futureScore, metrics.performance]);

  return (
    <section className="future-card">
      <div className="future-copy">
        <div className="future-topline"><span><Sparkles size={15} />FUTURE CARD</span><em>90 DAY OUTLOOK</em></div>
        <h2>{state.vision.identity}</h2>
        <p>{state.vision.statement}</p>
        <div className="future-trajectory" aria-label="Future performance trajectory">
          <svg viewBox="0 0 230 84" role="img">
            <line x1="4" y1="75" x2="226" y2="75" />
            <polyline points={points} />
            <circle cx="224" cy={76 - clamp(metrics.futureScore, 5, 95) * 0.64} r="4" />
          </svg>
          <div><span>Now</span><span>30 days</span><span>90 days</span></div>
        </div>
        <button type="button" className="future-command" onClick={() => navigate('vision')}>Shape this future <ArrowUpRight size={16} /></button>
      </div>
      <div className="future-score">
        <svg viewBox="0 0 100 100" aria-label={`Future score ${metrics.futureScore}`}>
          <circle className="score-track" cx="50" cy="50" r="42" />
          <circle className="score-value" cx="50" cy="50" r="42" strokeDasharray={circumference} strokeDashoffset={offset} />
        </svg>
        <div><strong>{metrics.futureScore}</strong><span>future score</span></div>
      </div>
      <div className="future-drivers">
        <Driver label="Execution" value={metrics.taskRate} />
        <Driver label="Faith" value={metrics.prayerRate} />
        <Driver label="Health" value={metrics.sportRate} />
        <Driver label="Growth" value={metrics.skillRate} />
      </div>
    </section>
  );
}

function Driver({ label, value }) {
  return <div className="future-driver"><span>{label}</span><strong>{Math.round(value * 100)}%</strong><div><i style={{ width: `${value * 100}%` }} /></div></div>;
}

function TodayView({ state, metrics, actions, setModal }) {
  const done = state.tasks.filter((item) => item.done).length;
  const minutes = state.tasks.filter((item) => item.done).reduce((sum, item) => sum + Number(item.estimate || 0), 0);
  return (
    <div className="today-layout">
      <section className="day-score-row">
        <Stat label="Completed" value={`${done}/${state.tasks.length}`} detail="actions" icon={Check} color="green" />
        <Stat label="Focused time" value={`${minutes}m`} detail="logged" icon={Clock3} color="blue" />
        <Stat label="Performance" value={metrics.performance} detail="live score" icon={BarChart3} color="amber" />
      </section>
      <section className="surface task-surface">
        <SectionHeader eyebrow="TODAY'S PLAN" title="Actions linked to outcomes" action={<button type="button" className="secondary-button" onClick={() => setModal('task')}><Plus size={17} />New task</button>} />
        <div className="full-task-list">
          {state.tasks.map((task) => <TaskRow key={task.id} task={task} state={state} onToggle={() => actions.toggleTask(task.id)} onDelete={() => actions.deleteTask(task.id)} />)}
        </div>
      </section>
    </div>
  );
}

function TaskRow({ task, state, onToggle, onDelete, compact = false }) {
  const domain = domains[task.domain] || domains.purpose;
  const project = state.projects.find((item) => item.id === task.projectId);
  const skill = state.skills.find((item) => item.id === task.skillId);
  return (
    <div className={task.done ? 'linked-task done' : 'linked-task'}>
      <button type="button" className="task-toggle" onClick={onToggle} style={{ '--task-color': domain.color }} aria-label={task.done ? 'Reopen task' : 'Complete task'}>{task.done ? <Check size={16} /> : <Circle size={17} />}</button>
      <div className="linked-task-copy">
        <strong>{task.title}</strong>
        <div className="task-relations">
          {project && <span><BriefcaseBusiness size={12} />{project.title}</span>}
          {skill && <span><Brain size={12} />{skill.name}</span>}
          <span><Clock3 size={12} />{task.estimate} min</span>
        </div>
      </div>
      <span className={`priority ${task.priority}`}>{task.priority}</span>
      {!compact && <button type="button" className="row-icon-button danger" onClick={onDelete} title="Delete task"><Trash2 size={16} /></button>}
    </div>
  );
}

function VisionView({ state, actions }) {
  const [draft, setDraft] = useState(state.vision);
  return (
    <div className="vision-layout">
      <figure className="vision-visual"><img src="/focus-desk.png" alt="A focused planning desk" /><figcaption><Sparkles size={17} />Your direction turns effort into progress.</figcaption></figure>
      <section className="surface vision-form">
        <SectionHeader eyebrow="NORTH STAR" title="Write the life you are building" />
        <label className="field"><span>Vision statement</span><textarea rows="5" value={draft.statement} onChange={(event) => setDraft({ ...draft, statement: event.target.value })} /></label>
        <div className="form-grid">
          <label className="field"><span>Future identity</span><input value={draft.identity} onChange={(event) => setDraft({ ...draft, identity: event.target.value })} /></label>
          <label className="field"><span>Horizon date</span><input type="date" value={draft.horizon} onChange={(event) => setDraft({ ...draft, horizon: event.target.value })} /></label>
        </div>
        <label className="field"><span>Current mission</span><input value={draft.mission} onChange={(event) => setDraft({ ...draft, mission: event.target.value })} /></label>
        <button type="button" className="primary-button save-vision" onClick={() => actions.updateVision(draft)}><Check size={17} />Save vision</button>
      </section>
      <section className="surface vision-links">
        <SectionHeader eyebrow="CONNECTED PROJECTS" title="What currently serves the vision" />
        <div className="project-strip">{state.projects.map((project) => <ProjectLine key={project.id} project={project} tasks={state.tasks} />)}</div>
      </section>
    </div>
  );
}

function ProjectsView({ state, setModal }) {
  return (
    <div className="projects-layout">
      <section className="projects-toolbar"><p>{state.projects.length} active outcomes</p><button type="button" className="primary-button" onClick={() => setModal('project')}><Plus size={17} />New project</button></section>
      <div className="project-list">
        {state.projects.map((project) => {
          const progress = projectProgress(project, state.tasks);
          const projectTasks = state.tasks.filter((task) => task.projectId === project.id);
          const skill = state.skills.find((item) => item.id === project.skillId);
          return (
            <section className="surface project-card" key={project.id} style={{ '--project-color': project.color }}>
              <div className="project-card-main">
                <span className="project-color" />
                <div><p className="overline">{domains[project.domain]?.label || 'Purpose'} PROJECT</p><h2>{project.title}</h2><p>{project.outcome}</p></div>
                <div className="project-percent"><strong>{progress}%</strong><span>{formatShortDate(project.due)}</span></div>
              </div>
              <div className="progress-track large"><i style={{ width: `${progress}%` }} /></div>
              <div className="project-meta"><span><ListChecks size={14} />{projectTasks.filter((item) => item.done).length}/{projectTasks.length} tasks</span>{skill && <span><Brain size={14} />{skill.name}</span>}</div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function ProjectLine({ project, tasks }) {
  const progress = projectProgress(project, tasks);
  return <div className="project-line"><span className="project-line-color" style={{ background: project.color }} /><div><strong>{project.title}</strong><small>{project.outcome}</small></div><div className="project-line-progress"><span>{progress}%</span><div className="progress-track"><i style={{ width: `${progress}%`, background: project.color }} /></div></div></div>;
}

function TrackersView({ state, metrics, actions, trackerTab, setTrackerTab, setModal }) {
  return (
    <div className="trackers-layout">
      <div className="segmented-tabs">
        <button type="button" className={trackerTab === 'prayer' ? 'active' : ''} onClick={() => setTrackerTab('prayer')}><Landmark size={16} />Prayer</button>
        <button type="button" className={trackerTab === 'sport' ? 'active' : ''} onClick={() => setTrackerTab('sport')}><Dumbbell size={16} />Sport</button>
        <button type="button" className={trackerTab === 'addiction' ? 'active' : ''} onClick={() => setTrackerTab('addiction')}><ShieldCheck size={16} />No addiction</button>
      </div>
      {trackerTab === 'prayer' && <PrayerTracker state={state} metrics={metrics} actions={actions} />}
      {trackerTab === 'sport' && <SportTracker state={state} metrics={metrics} actions={actions} setModal={setModal} />}
      {trackerTab === 'addiction' && <AddictionTracker state={state} metrics={metrics} actions={actions} setModal={setModal} />}
    </div>
  );
}

function PrayerTracker({ state, metrics, actions }) {
  const complete = prayers.filter((item) => state.prayerChecks[item.id]).length;
  return (
    <section className="surface tracker-panel">
      <TrackerHeadline icon={Landmark} label="Daily prayer" value={`${complete}/5`} detail={`${Math.round(metrics.prayerRate * 100)}% complete`} color={domains.prayer.color} />
      <div className="prayer-grid">{prayers.map((prayer) => <button key={prayer.id} type="button" onClick={() => actions.togglePrayer(prayer.id)} className={state.prayerChecks[prayer.id] ? 'prayer-item complete' : 'prayer-item'}><span>{state.prayerChecks[prayer.id] ? <Check size={18} /> : <Circle size={18} />}</span><strong>{prayer.label}</strong><small>{prayer.time}</small></button>)}</div>
    </section>
  );
}

function SportTracker({ state, metrics, actions, setModal }) {
  const done = state.sportSessions.filter((item) => item.done).length;
  return (
    <section className="surface tracker-panel">
      <TrackerHeadline icon={Dumbbell} label="Weekly movement" value={`${done}/3`} detail={`${Math.round(metrics.sportRate * 100)}% of target`} color={domains.health.color} action={<button type="button" className="secondary-button" onClick={() => setModal('sport')}><Plus size={17} />Session</button>} />
      <div className="session-list">{state.sportSessions.map((session) => <button type="button" key={session.id} onClick={() => actions.toggleSportSession(session.id)} className={session.done ? 'session-row done' : 'session-row'}><span className="session-check">{session.done ? <Check size={17} /> : <Circle size={17} />}</span><div><strong>{session.type}</strong><small>{formatShortDate(session.date)}</small></div><span>{session.minutes} min</span></button>)}</div>
    </section>
  );
}

function AddictionTracker({ state, actions, setModal }) {
  return (
    <div className="addiction-list">
      {state.addictions.map((item) => {
        const days = daysSince(item.startDate);
        return <section className="surface clean-card" key={item.id}><div className="clean-icon"><ShieldCheck size={24} /></div><div className="clean-count"><strong>{days}</strong><span>days free from {item.name.toLowerCase()}</span></div><div className="clean-footer"><span>Started {formatShortDate(item.startDate)}</span><button type="button" className="danger-text-button" onClick={() => actions.resetAddiction(item.id)}>Reset counter</button></div></section>;
      })}
      <button type="button" className="add-tracker-button" onClick={() => setModal('addiction')}><Plus size={20} />Add freedom tracker</button>
    </div>
  );
}

function TrackerHeadline({ icon: Icon, label, value, detail, color, action }) {
  return <div className="tracker-headline" style={{ '--tracker-color': color }}><div className="tracker-icon"><Icon size={22} /></div><div><p className="overline">{label}</p><strong>{value}</strong><span>{detail}</span></div>{action && <div className="tracker-action">{action}</div>}</div>;
}

function SkillsView({ state, actions, setModal }) {
  return (
    <div className="skills-layout">
      <section className="skills-toolbar"><p>Tasks linked to a skill grant 30 XP automatically.</p><button type="button" className="primary-button" onClick={() => setModal('skill')}><Plus size={17} />New skill</button></section>
      <div className="skill-grid">
        {state.skills.map((skill) => {
          const stats = skillStats(skill, state.tasks);
          const Icon = skillIcons[skill.icon] || skillIcons.default;
          const linkedTasks = state.tasks.filter((task) => task.skillId === skill.id && task.done).length;
          return <section className="surface skill-card" key={skill.id}><div className="skill-top"><div className="skill-icon"><Icon size={21} /></div><span>LEVEL {stats.level}</span></div><h2>{skill.name}</h2><p>{skill.category} / {linkedTasks} linked completions</p><div className="skill-progress"><div><span>{stats.progress} XP</span><span>100 XP</span></div><div className="progress-track"><i style={{ width: `${stats.progress}%` }} /></div></div><button type="button" className="practice-button" onClick={() => actions.addSkillXp(skill.id, 10)}><Plus size={15} />Log practice</button></section>;
        })}
      </div>
    </div>
  );
}

function AchievementsView({ achievements }) {
  const unlocked = achievements.filter((item) => item.unlocked).length;
  return (
    <div className="achievements-layout">
      <section className="achievement-summary"><div><p className="overline">COLLECTION</p><h2>{unlocked} of {achievements.length} unlocked</h2></div><div className="achievement-summary-track"><i style={{ width: `${(unlocked / achievements.length) * 100}%` }} /></div></section>
      <div className="achievement-grid">{achievements.map((item) => { const Icon = item.icon; return <section key={item.id} className={item.unlocked ? `surface achievement-card unlocked ${item.tone}` : 'surface achievement-card locked'}><div className="achievement-icon"><Icon size={23} /></div><span>{item.unlocked ? 'UNLOCKED' : 'LOCKED'}</span><h2>{item.title}</h2><p>{item.description}</p></section>; })}</div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, action }) {
  return <div className="section-header"><div><p className="overline">{eyebrow}</p><h2>{title}</h2></div>{action && <div>{action}</div>}</div>;
}

function Stat({ label, value, detail, icon: Icon, color }) {
  return <section className={`stat-block ${color}`}><Icon size={19} /><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></section>;
}

function Signal({ icon: Icon, label, value, progress, color, onClick }) {
  return <button type="button" className="signal-row" onClick={onClick}><span className="signal-icon" style={{ color }}><Icon size={18} /></span><strong>{label}</strong><div className="signal-track"><i style={{ width: `${progress}%`, background: color }} /></div><span>{value}</span><ChevronRight size={15} /></button>;
}

function EmptyState({ icon: Icon, title, copy }) {
  return <div className="empty-state"><Icon size={27} /><strong>{title}</strong><span>{copy}</span></div>;
}

function MoreSheet({ activeView, navigate, onClose, actions }) {
  const items = navigation.slice(4);
  return <div className="sheet-backdrop" onMouseDown={onClose}><section className="more-sheet" onMouseDown={(event) => event.stopPropagation()}><div className="sheet-grabber" /><div className="sheet-heading"><h2>More</h2><button type="button" className="icon-button" onClick={onClose}><X size={18} /></button></div><div className="more-grid">{items.map((item) => { const Icon = item.icon; return <button type="button" key={item.id} className={activeView === item.id ? 'active' : ''} onClick={() => navigate(item.id)}><Icon size={22} /><span>{item.label}</span></button>; })}</div><button type="button" className="reset-button" onClick={() => { actions.resetAll(); onClose(); }}><RotateCcw size={17} />Reset local data</button></section></div>;
}

function AddModal({ type, state, actions, onClose }) {
  const [form, setForm] = useState({
    title: '', outcome: '', projectId: state.projects[0]?.id || '', skillId: state.skills[0]?.id || '', domain: 'purpose', estimate: 30, priority: 'medium',
    due: addDays(30), color: '#5f8fff', sessionType: 'Strength', minutes: 45, date: dateKey(), name: '', category: 'Creative'
  });

  const submit = (event) => {
    event.preventDefault();
    if (type === 'task' && form.title.trim()) actions.addTask({ title: form.title.trim(), projectId: form.projectId || null, skillId: form.skillId || null, domain: form.domain, estimate: Number(form.estimate), priority: form.priority });
    if (type === 'project' && form.title.trim()) actions.addProject({ title: form.title.trim(), outcome: form.outcome.trim() || 'A meaningful outcome linked to my vision.', domain: form.domain, due: form.due, skillId: form.skillId || null, color: form.color });
    if (type === 'sport') actions.addSportSession({ type: form.sessionType, minutes: Number(form.minutes), date: form.date });
    if (type === 'skill' && form.name.trim()) actions.addSkill({ name: form.name.trim(), category: form.category });
    if (type === 'addiction' && form.name.trim()) actions.addAddiction(form.name.trim());
    onClose();
  };

  const title = { task: 'Add linked task', project: 'Create project', sport: 'Plan sport session', skill: 'Add skill', addiction: 'Add freedom tracker' }[type];
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="add-modal" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
        <div className="modal-heading"><div><p className="overline">MIRROR</p><h2>{title}</h2></div><button type="button" className="icon-button" onClick={onClose}><X size={18} /></button></div>
        {type === 'task' && <TaskFields form={form} setForm={setForm} state={state} />}
        {type === 'project' && <ProjectFields form={form} setForm={setForm} state={state} />}
        {type === 'sport' && <SportFields form={form} setForm={setForm} />}
        {type === 'skill' && <><label className="field"><span>Skill name</span><input autoFocus value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Public speaking" /></label><label className="field"><span>Category</span><input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label></>}
        {type === 'addiction' && <label className="field"><span>What are you leaving behind?</span><input autoFocus value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Social media" /></label>}
        <button className="primary-button modal-submit" type="submit"><Plus size={17} />Add to Mirror</button>
      </form>
    </div>
  );
}

function TaskFields({ form, setForm, state }) {
  return <><label className="field"><span>Task</span><input autoFocus value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="What needs to move today?" /></label><div className="form-grid"><label className="field"><span>Project</span><select value={form.projectId} onChange={(event) => setForm({ ...form, projectId: event.target.value })}><option value="">Independent</option>{state.projects.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><label className="field"><span>Skill</span><select value={form.skillId} onChange={(event) => setForm({ ...form, skillId: event.target.value })}><option value="">No skill</option>{state.skills.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div><div className="form-grid"><label className="field"><span>Domain</span><select value={form.domain} onChange={(event) => setForm({ ...form, domain: event.target.value })}>{Object.entries(domains).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}</select></label><label className="field"><span>Minutes</span><input type="number" min="5" step="5" value={form.estimate} onChange={(event) => setForm({ ...form, estimate: event.target.value })} /></label></div><label className="field"><span>Priority</span><select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label></>;
}

function ProjectFields({ form, setForm, state }) {
  return <><label className="field"><span>Project title</span><input autoFocus value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="A clear outcome" /></label><label className="field"><span>Outcome</span><textarea rows="3" value={form.outcome} onChange={(event) => setForm({ ...form, outcome: event.target.value })} /></label><div className="form-grid"><label className="field"><span>Domain</span><select value={form.domain} onChange={(event) => setForm({ ...form, domain: event.target.value })}>{Object.entries(domains).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}</select></label><label className="field"><span>Deadline</span><input type="date" value={form.due} onChange={(event) => setForm({ ...form, due: event.target.value })} /></label></div><label className="field"><span>Skill grown by this project</span><select value={form.skillId} onChange={(event) => setForm({ ...form, skillId: event.target.value })}>{state.skills.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><div className="color-swatches">{['#5f8fff', '#40a983', '#e06f5f', '#d39a3f', '#9a7bd8', '#d56e98'].map((color) => <button key={color} type="button" className={form.color === color ? 'selected' : ''} style={{ background: color }} onClick={() => setForm({ ...form, color })} aria-label={`Use color ${color}`} />)}</div></>;
}

function SportFields({ form, setForm }) {
  return <><label className="field"><span>Session</span><select value={form.sessionType} onChange={(event) => setForm({ ...form, sessionType: event.target.value })}><option>Strength</option><option>Run</option><option>Walk</option><option>Mobility</option><option>Football</option><option>Swimming</option></select></label><div className="form-grid"><label className="field"><span>Date</span><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label><label className="field"><span>Minutes</span><input type="number" min="5" step="5" value={form.minutes} onChange={(event) => setForm({ ...form, minutes: event.target.value })} /></label></div></>;
}
