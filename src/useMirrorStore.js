import { useEffect, useMemo, useState } from 'react';
import { createInitialState, getAchievements, getMetrics, normalizeState, STORAGE_KEY } from './model';

function readState() {
  try {
    return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'));
  } catch {
    return createInitialState();
  }
}

export function useMirrorStore() {
  const [state, setState] = useState(readState);
  const [notice, setNotice] = useState('Your system is ready.');
  const metrics = useMemo(() => getMetrics(state), [state]);
  const achievements = useMemo(() => getAchievements(state, metrics), [metrics, state]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const record = (message) => ({ id: crypto.randomUUID(), message, at: new Date().toISOString() });

  const updateVision = (vision) => {
    setState((current) => ({ ...current, vision: { ...current.vision, ...vision }, activity: [record('Vision updated'), ...current.activity].slice(0, 20) }));
    setNotice('Vision saved. Your future projection has changed.');
  };

  const toggleTask = (id) => {
    setState((current) => {
      const task = current.tasks.find((item) => item.id === id);
      const nextDone = !task.done;
      return {
        ...current,
        tasks: current.tasks.map((item) => item.id === id ? { ...item, done: nextDone, completedAt: nextDone ? new Date().toISOString() : null } : item),
        activity: [record(`${nextDone ? 'Completed' : 'Reopened'}: ${task.title}`), ...current.activity].slice(0, 20)
      };
    });
    setNotice('Today, your project, skill, and future score are now synchronized.');
  };

  const addTask = (task) => {
    setState((current) => ({
      ...current,
      tasks: [...current.tasks, { ...task, id: crypto.randomUUID(), done: false, completedAt: null }],
      activity: [record(`Task added: ${task.title}`), ...current.activity].slice(0, 20)
    }));
    setNotice('Task added to Today and linked to your system.');
  };

  const deleteTask = (id) => setState((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== id) }));

  const addProject = (project) => {
    setState((current) => ({ ...current, projects: [...current.projects, { ...project, id: crypto.randomUUID(), status: 'active' }] }));
    setNotice('Project created and linked to your vision.');
  };

  const togglePrayer = (id) => {
    setState((current) => ({
      ...current,
      prayerChecks: { ...current.prayerChecks, [id]: !current.prayerChecks[id] },
      activity: [record(`${current.prayerChecks[id] ? 'Reopened' : 'Completed'} ${id}`), ...current.activity].slice(0, 20)
    }));
    setNotice('Prayer progress updated on Home.');
  };

  const addSportSession = (session) => {
    setState((current) => ({ ...current, sportSessions: [{ ...session, id: crypto.randomUUID(), done: false }, ...current.sportSessions] }));
    setNotice('Sport session added to your plan.');
  };

  const toggleSportSession = (id) => {
    setState((current) => ({
      ...current,
      sportSessions: current.sportSessions.map((session) => session.id === id ? { ...session, done: !session.done } : session)
    }));
    setNotice('Sport performance updated.');
  };

  const addAddiction = (name) => {
    setState((current) => ({ ...current, addictions: [...current.addictions, { id: crypto.randomUUID(), name, startDate: new Date().toISOString().slice(0, 10), lastReset: null }] }));
    setNotice('A new freedom tracker is active.');
  };

  const resetAddiction = (id) => {
    const today = new Date().toISOString().slice(0, 10);
    setState((current) => ({ ...current, addictions: current.addictions.map((item) => item.id === id ? { ...item, startDate: today, lastReset: today } : item) }));
    setNotice('Tracker reset without judgment. Start again from today.');
  };

  const addSkill = (skill) => {
    setState((current) => ({ ...current, skills: [...current.skills, { ...skill, id: crypto.randomUUID(), manualXp: 0, icon: 'default' }] }));
    setNotice('Skill added. Link tasks to it to gain XP.');
  };

  const addSkillXp = (id, amount = 10) => {
    setState((current) => ({ ...current, skills: current.skills.map((skill) => skill.id === id ? { ...skill, manualXp: (skill.manualXp || 0) + amount } : skill) }));
    setNotice(`Practice logged: +${amount} XP.`);
  };

  const resetAll = () => {
    setState(createInitialState());
    setNotice('Mirror was reset to its starting structure.');
  };

  return {
    state,
    metrics,
    achievements,
    notice,
    actions: {
      updateVision,
      toggleTask,
      addTask,
      deleteTask,
      addProject,
      togglePrayer,
      addSportSession,
      toggleSportSession,
      addAddiction,
      resetAddiction,
      addSkill,
      addSkillXp,
      resetAll
    }
  };
}

