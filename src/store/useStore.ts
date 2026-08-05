// Zustand Store - UI State
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Active pillar in daily view (0-3)
  activePillarIndex: number;
  setActivePillarIndex: (index: number) => void;
  
  // Sheet states
  pillarSheetOpen: boolean;
  activePillarSheet: 'prayer' | 'health' | 'addiction' | 'habit' | 'projects' | 'skills' | null;
  openPillarSheet: (pillar: 'prayer' | 'health' | 'addiction' | 'habit' | 'projects' | 'skills') => void;
  closePillarSheet: () => void;
  
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Onboarding
  onboardingComplete: boolean;
  completeOnboarding: () => void;
  
  // Achievement toast
  achievementToast: { id: string; title: string; icon: string; rarity: string } | null;
  showAchievementToast: (achievement: { id: string; title: string; icon: string; rarity: string }) => void;
  hideAchievementToast: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activePillarIndex: 0,
      setActivePillarIndex: (index) => set({ activePillarIndex: index }),
      
      pillarSheetOpen: false,
      activePillarSheet: null,
      openPillarSheet: (pillar) => set({ pillarSheetOpen: true, activePillarSheet: pillar }),
      closePillarSheet: () => set({ pillarSheetOpen: false, activePillarSheet: null }),
      
      theme: 'dark',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme }),
      
      onboardingComplete: false,
      completeOnboarding: () => set({ onboardingComplete: true }),
      
      achievementToast: null,
      showAchievementToast: (achievement) => set({ achievementToast: achievement }),
      hideAchievementToast: () => set({ achievementToast: null }),
    }),
    {
      name: 'miror-ui-state',
      partialize: (state) => ({
        theme: state.theme,
        onboardingComplete: state.onboardingComplete,
      }),
    }
  )
);