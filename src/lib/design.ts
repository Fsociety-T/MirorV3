// Design System Tokens - Single source of truth for colors, spacing, motion, typography

export const colors = {
  // Neutral (95% of UI)
  slate: {
    50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
    400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
    800: '#1e293b', 900: '#0f172a', 950: '#020617',
  },
  // Pillar accents (only for rings, indicators, focused icons)
  pillar: {
    prayer: '#10b981',    // emerald
    health: '#f43f5e',    // rose
    addiction: '#f97316', // orange
    projects: '#8b5cf6',  // violet
    skills: '#3b82f6',    // blue
    vision: '#eab308',    // gold
  },
  // Semantic
  success: '#10b981', warning: '#f59e0b', error: '#ef4444',
  // Backgrounds
  bg: { primary: '#0f172a', secondary: '#1e293b', tertiary: '#334155' },
  // Text
  text: { primary: '#f8fafc', secondary: '#94a3b8', muted: '#64748b', inverse: '#0f172a' },
  // Borders
  border: { light: '#334155', medium: '#475569', focus: '#10b981' },
};

export const radius = {
  card: '16px',
  pill: '9999px',
  sheet: '24px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
};

export const spacing = {
  xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', xxl: '48px',
};

export const motion = {
  spring: { damping: 0.82, response: 0.35 },
  springBouncy: { damping: 0.6, response: 0.25 },
  durations: { fast: 150, base: 250, slow: 400 },
  easings: {
    standard: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1.0, 1.0)',
  },
};

export const typography = {
  fontFamily: {
    sans: 'var(--font-sans, "SF Pro", system-ui, sans-serif)',
    rounded: 'var(--font-rounded, "SF Pro Rounded", system-ui, sans-serif)',
    mono: 'var(--font-mono, "SF Mono", monospace)',
  },
  scale: {
    largeTitle: { size: '52px', weight: '700', letterSpacing: '-0.5px', family: 'rounded' },
    title1: { size: '34px', weight: '700', letterSpacing: '0px', family: 'sans' },
    title2: { size: '22px', weight: '600', letterSpacing: '0px', family: 'sans' },
    title3: { size: '20px', weight: '600', letterSpacing: '0px', family: 'sans' },
    headline: { size: '17px', weight: '600', letterSpacing: '0px', family: 'sans' },
    body: { size: '17px', weight: '400', letterSpacing: '0px', family: 'sans' },
    callout: { size: '16px', weight: '500', letterSpacing: '0px', family: 'sans' },
    caption: { size: '13px', weight: '400', letterSpacing: '0.2px', family: 'sans' },
  },
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  glow: (color: string) => `0 0 20px ${color}40, 0 0 40px ${color}20`,
};

export const zIndex = {
  base: 0,
  card: 10,
  sticky: 20,
  modal: 100,
  toast: 200,
  tooltip: 300,
};

// Helper to get pillar color
export function getPillarColor(pillar: keyof typeof colors.pillar): string {
  return colors.pillar[pillar];
}

// CSS Variable generator for runtime theming
export function generateCSSVariables(theme: 'light' | 'dark' = 'dark'): Record<string, string> {
  const isDark = theme === 'dark';
  return {
    '--color-bg-primary': isDark ? colors.bg.primary : colors.slate[50],
    '--color-bg-secondary': isDark ? colors.bg.secondary : colors.slate[100],
    '--color-bg-tertiary': isDark ? colors.bg.tertiary : colors.slate[200],
    '--color-text-primary': isDark ? colors.text.primary : colors.slate[900],
    '--color-text-secondary': isDark ? colors.text.secondary : colors.slate[600],
    '--color-text-muted': isDark ? colors.text.muted : colors.slate[500],
    '--color-border-light': isDark ? colors.border.light : colors.slate[300],
    '--color-border-medium': isDark ? colors.border.medium : colors.slate[400],
    '--radius-card': radius.card,
    '--radius-pill': radius.pill,
    '--radius-sheet': radius.sheet,
    '--font-sans': typography.fontFamily.sans,
    '--font-rounded': typography.fontFamily.rounded,
    '--font-mono': typography.fontFamily.mono,
  };
}