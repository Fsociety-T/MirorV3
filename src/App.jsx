import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Dumbbell,
  HeartPulse,
  ListChecks,
  Moon,
  MoonStar,
  Play,
  RefreshCcw,
  Settings2,
  Sparkles,
  Sprout,
  Sun,
  Target,
  Users,
  Zap
} from 'lucide-react';

const pillars = [
  { id: 'focus', name: 'Focus', color: '#4b8bff', icon: Target, target: '90 min', hint: 'Deep work' },
  { id: 'body', name: 'Body', color: '#24a56a', icon: Dumbbell, target: '45 min', hint: 'Move well' },
  { id: 'mind', name: 'Mind', color: '#d85e54', icon: HeartPulse, target: '15 min', hint: 'Reset' },
  { id: 'people', name: 'People', color: '#d29032', icon: Users, target: '1 reach out', hint: 'Connect' },
  { id: 'recovery', name: 'Recovery', color: '#8a6bd8', icon: MoonStar, target: '8 hours', hint: 'Protect sleep' }
];

const tasks = [
  { id: 'plan', pillar: 'focus', title: 'Plan the highest-value work', detail: 'Choose one outcome that moves the week forward.', time: '08:30', weight: 24 },
  { id: 'move', pillar: 'body', title: 'Move with intent', detail: 'Strength, run, or a long walk before the afternoon.', time: '12:10', weight: 20 },
  { id: 'reset', pillar: 'mind', title: 'Ten quiet minutes', detail: 'Walk, breathe, journal, or leave the screen.', time: '15:30', weight: 16 },
  { id: 'reach', pillar: 'people', title: 'Make one meaningful reach-out', detail: 'Call, message, or make time for someone important.', time: '18:15', weight: 18 },
  { id: 'close', pillar: 'recovery', title: 'Close the day deliberately', detail: 'Set tomorrow up, then protect the evening.', time: '21:40', weight: 22 }
];

const scenarios = {
  balanced: { label: 'Balanced', score: 0, energy: 0, note: 'Steady pace with room to recover.' },
  sprint: { label: 'Sprint', score: 7, energy: -9, note: 'Fast gains, but recovery becomes the constraint.' },
  recovery: { label: 'Recovery', score: -4, energy: 11, note: 'Lower output now, stronger consistency later.' }
};

const viewItems = [
  { id: 'today', label: 'Today', icon: CalendarDays },
  { id: 'simulator', label: 'Simulator', icon: Sparkles },
  { id: 'review', label: 'Review', icon: BarChart3 }
];

function loadSaved() {
  try {
    const value = JSON.parse(localStorage.getItem('miror-simulator-state') || '{}');
    return {
      completed: Array.isArray(value.completed) ? value.completed : [],
      scenario: scenarios[value.scenario] ? value.scenario : 'balanced',
      dark: value.dark !== false,
      runs: Number.isFinite(value.runs) ? value.runs : 0
    };
  } catch {
    return { completed: [], scenario: 'balanced', dark: true, runs: 0 };
  }
}

function dayLabel(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
}

function dateLabel() {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(new Date());
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function App() {
  const saved = useMemo(loadSaved, []);
  const [completed, setCompleted] = useState(saved.completed);
  const [scenario, setScenario] = useState(saved.scenario);
  const [dark, setDark] = useState(saved.dark);
  const [runs, setRuns] = useState(saved.runs);
  const [activeView, setActiveView] = useState('today');
  const [notice, setNotice] = useState('Ready for a deliberate day.');

  const score = useMemo(() => tasks.reduce((total, task) => (
    completed.includes(task.id) ? total + task.weight : total
  ), 0), [completed]);
  const energy = clamp(58 + completed.length * 7 + scenarios[scenario].energy, 24, 96);
  const rhythm = clamp(49 + score / 2 + scenarios[scenario].score, 30, 98);

  const forecast = useMemo(() => {
    const swing = [0, 5, -3, 8, 2, -5, 4];
    return swing.map((value, index) => ({
      day: dayLabel(index),
      score: clamp(Math.round(score * 0.68 + 22 + value + scenarios[scenario].score + ((runs + index) % 3) * 2), 18, 99),
      energy: clamp(Math.round(energy + value * 0.7 - index * 1.5), 20, 98)
    }));
  }, [energy, runs, scenario, score]);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('miror-simulator-state', JSON.stringify({ completed, scenario, dark, runs }));
  }, [completed, dark, runs, scenario]);

  const toggleTask = (task) => {
    setCompleted((current) => current.includes(task.id)
      ? current.filter((id) => id !== task.id)
      : [...current, task.id]);
    setNotice(completed.includes(task.id) ? `${task.title} returned to the plan.` : `${task.title} completed.`);
  };

  const runSimulation = () => {
    setRuns((current) => current + 1);
    setNotice(`Seven-day ${scenarios[scenario].label.toLowerCase()} projection refreshed.`);
    setActiveView('simulator');
  };

  const resetDay = () => {
    setCompleted([]);
    setRuns(0);
    setNotice('Today was reset. Build it again with intention.');
  };

  return (
    <div className="app-shell">
      <aside className="side-rail">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true"><span /></div>
          <div>
            <strong>MIROR</strong>
            <small>EXECUTION SYSTEM</small>
          </div>
        </div>

        <nav className="primary-nav" aria-label="Main navigation">
          {viewItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={activeView === item.id ? 'nav-item active' : 'nav-item'}
                title={item.label}
              >
                <Icon size={19} strokeWidth={2.2} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="rail-footer">
          <button type="button" className="icon-button" onClick={() => setDark((value) => !value)} title="Switch color theme">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button type="button" className="icon-button" onClick={resetDay} title="Reset local simulation"><RefreshCcw size={18} /></button>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">LOCAL SIMULATION</p>
            <h1>{activeView === 'today' ? 'Build a day worth repeating.' : activeView === 'simulator' ? 'See the week before you live it.' : 'Read the pattern, then adjust.'}</h1>
          </div>
          <div className="topbar-actions">
            <div className="date-stamp"><CalendarDays size={16} />{dateLabel()}</div>
            <button type="button" className="button primary" onClick={runSimulation}><Play size={17} fill="currentColor" />Run projection</button>
          </div>
        </header>

        <p className="status-line"><Zap size={15} />{notice}</p>

        {activeView === 'today' && (
          <TodayView
            completed={completed}
            energy={energy}
            forecast={forecast}
            onRun={runSimulation}
            onTaskToggle={toggleTask}
            rhythm={rhythm}
            scenario={scenario}
            score={score}
            setScenario={setScenario}
          />
        )}

        {activeView === 'simulator' && (
          <SimulatorView
            energy={energy}
            forecast={forecast}
            onRun={runSimulation}
            rhythm={rhythm}
            scenario={scenario}
            score={score}
            setScenario={setScenario}
          />
        )}

        {activeView === 'review' && <ReviewView completed={completed} forecast={forecast} rhythm={rhythm} score={score} />}
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {viewItems.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} type="button" onClick={() => setActiveView(item.id)} className={activeView === item.id ? 'mobile-nav-item active' : 'mobile-nav-item'} title={item.label}>
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function TodayView({ completed, energy, forecast, onRun, onTaskToggle, rhythm, scenario, score, setScenario }) {
  return (
    <div className="page-grid today-grid">
      <section className="score-band">
        <div className="score-main">
          <p className="eyebrow">TODAY'S EXECUTION</p>
          <div className="score-line"><strong>{score}</strong><span>/ 100</span></div>
          <p className="subtle">Five small commitments, one coherent day.</p>
        </div>
        <div className="score-metrics">
          <Metric label="Rhythm" value={`${rhythm}%`} icon={BarChart3} tone="blue" />
          <Metric label="Energy" value={`${energy}%`} icon={Zap} tone="green" />
          <Metric label="Complete" value={`${completed.length}/5`} icon={Check} tone="amber" />
        </div>
      </section>

      <section className="panel day-plan">
        <div className="section-heading">
          <div><p className="eyebrow">TODAY'S SEQUENCE</p><h2>Make the next action obvious.</h2></div>
          <span className="counter">{completed.length} / {tasks.length}</span>
        </div>
        <div className="task-list">
          {tasks.map((task) => {
            const pillar = pillars.find((item) => item.id === task.pillar);
            const Icon = pillar.icon;
            const isComplete = completed.includes(task.id);
            return (
              <button key={task.id} type="button" onClick={() => onTaskToggle(task)} className={isComplete ? 'task-row done' : 'task-row'}>
                <span className="task-time">{task.time}</span>
                <span className="task-icon" style={{ '--accent': pillar.color }}><Icon size={18} /></span>
                <span className="task-copy"><strong>{task.title}</strong><small>{task.detail}</small></span>
                <span className="task-check">{isComplete ? <Check size={17} /> : <Circle size={17} />}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel focus-panel">
        <div className="focus-image"><img src="/focus-desk.png" alt="Focused workspace with a daily planning sheet" /></div>
        <div className="focus-copy">
          <p className="eyebrow">OPERATING PRINCIPLE</p>
          <h2>Design the cadence before the pressure arrives.</h2>
          <p>Use the simulator to see what a sustainable week looks like before you commit to it.</p>
          <button type="button" className="text-command" onClick={onRun}>Open seven-day projection <ArrowUpRight size={16} /></button>
        </div>
      </section>

      <SimulatorPanel forecast={forecast} onRun={onRun} scenario={scenario} setScenario={setScenario} />

      <section className="panel pillar-panel">
        <div className="section-heading"><div><p className="eyebrow">LIFE SYSTEM</p><h2>Keep every pillar in view.</h2></div></div>
        <div className="pillar-grid">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.id} className="pillar-item" style={{ '--accent': pillar.color }}>
                <Icon size={19} />
                <div><strong>{pillar.name}</strong><small>{pillar.hint}</small></div>
                <span>{pillar.target}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SimulatorView({ energy, forecast, onRun, rhythm, scenario, score, setScenario }) {
  return (
    <div className="page-grid simulator-page">
      <section className="simulation-intro">
        <div><p className="eyebrow">SEVEN-DAY MODEL</p><h2>Test the tradeoff before you pay for it.</h2></div>
        <button type="button" className="button primary" onClick={onRun}><RefreshCcw size={17} />Refresh model</button>
      </section>
      <SimulatorPanel forecast={forecast} onRun={onRun} scenario={scenario} setScenario={setScenario} expanded />
      <section className="panel scenario-reading">
        <p className="eyebrow">SCENARIO READING</p>
        <div className="reading-grid">
          <Reading label="Projected rhythm" value={`${rhythm}%`} detail="Consistency across the next seven days" />
          <Reading label="Starting energy" value={`${energy}%`} detail="Capacity available for meaningful work" />
          <Reading label="Current execution" value={`${score}/100`} detail="Today feeds tomorrow's baseline" />
        </div>
      </section>
    </div>
  );
}

function ReviewView({ completed, forecast, rhythm, score }) {
  const trend = [36, 48, 44, 60, 57, 68, score || 42];
  return (
    <div className="page-grid review-page">
      <section className="review-summary">
        <div><p className="eyebrow">WEEKLY READOUT</p><h2>Your system is getting clearer.</h2><p className="subtle">Review the shape of the week, not just the result of one day.</p></div>
        <div className="review-number"><strong>{rhythm}%</strong><span>rhythm</span></div>
      </section>
      <section className="panel trend-panel">
        <div className="section-heading"><div><p className="eyebrow">EXECUTION TREND</p><h2>Seven day cadence</h2></div><span className="counter">{completed.length} completed today</span></div>
        <div className="trend-bars">
          {trend.map((value, index) => <div key={index} className="trend-column"><div className="trend-bar"><span style={{ height: `${value}%` }} /></div><small>{dayLabel(index - 6)}</small></div>)}
        </div>
      </section>
      <section className="panel projection-summary">
        <div className="section-heading"><div><p className="eyebrow">NEXT SIGNAL</p><h2>Protect the middle of the week.</h2></div><ChevronRight size={20} /></div>
        <p>The model sees your energy dipping before output does. Keep Thursday light enough to finish Friday strong.</p>
        <div className="mini-forecast">{forecast.slice(2, 5).map((item) => <span key={item.day}><strong>{item.score}</strong>{item.day}</span>)}</div>
      </section>
    </div>
  );
}

function SimulatorPanel({ forecast, onRun, scenario, setScenario, expanded = false }) {
  const highest = Math.max(...forecast.map((item) => item.score));
  return (
    <section className={expanded ? 'panel simulator-panel expanded' : 'panel simulator-panel'}>
      <div className="section-heading">
        <div><p className="eyebrow">WEEK AHEAD</p><h2>Projection under your chosen pace.</h2></div>
        <button type="button" className="icon-button subtle-button" onClick={onRun} title="Refresh projection"><RefreshCcw size={18} /></button>
      </div>
      <div className="segmented-control" role="group" aria-label="Simulation pace">
        {Object.entries(scenarios).map(([id, item]) => <button key={id} type="button" onClick={() => setScenario(id)} className={scenario === id ? 'selected' : ''}>{item.label}</button>)}
      </div>
      <p className="scenario-note">{scenarios[scenario].note}</p>
      <div className="forecast-chart">
        {forecast.map((item, index) => (
          <div key={item.day} className="forecast-day">
            <div className="forecast-value"><strong>{item.score}</strong><span>{item.energy} e</span></div>
            <div className="forecast-track"><span className={item.score === highest ? 'peak' : ''} style={{ height: `${item.score}%` }} /></div>
            <small>{item.day}</small>
            {index === 0 && <em>now</em>}
          </div>
        ))}
      </div>
      <div className="forecast-footer"><span><Sparkles size={16} />Highest momentum: {highest}</span><button type="button" className="text-command" onClick={onRun}>Run again <ChevronRight size={16} /></button></div>
    </section>
  );
}

function Metric({ label, value, icon: Icon, tone }) {
  return <div className={`metric ${tone}`}><Icon size={17} /><div><strong>{value}</strong><span>{label}</span></div></div>;
}

function Reading({ label, value, detail }) {
  return <div className="reading"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

