// Ring Component - Circular progress
import { forwardRef, HTMLAttributes } from 'react';
import { getPillarColor } from '../../lib/design';
import { cn } from '../../lib/utils';
import { getProgressToNextLevel } from '../../lib/utils';

interface RingProps extends HTMLAttributes<HTMLDivElement> {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  pillar?: 'prayer' | 'health' | 'addiction' | 'projects' | 'skills' | 'vision';
  color?: string;
  showBackground?: boolean;
  children?: React.ReactNode;
  animate?: boolean;
}

export const Ring = forwardRef<HTMLDivElement, RingProps>(
  ({ className, progress = 0, size = 64, strokeWidth = 6, pillar, color, showBackground = true, children, animate = true, ...props }, ref) => {
    const ringColor = color || (pillar ? getPillarColor(pillar) : '#10b981');
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - Math.max(0, Math.min(1, progress)));
    
    const style = {
      '--ring-color': ringColor,
      '--ring-size': `${size}px`,
      '--ring-stroke': `${strokeWidth}px`,
    } as React.CSSProperties;

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex items-center justify-center', className)}
        style={style}
        {...props}
      >
        <svg width={size} height={size} className="transform -rotate-90">
          {showBackground && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--color-border-light)"
              strokeWidth={strokeWidth}
              className="transition-opacity duration-200"
            />
          )}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--ring-color)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={animate ? offset : circumference}
            className={cn(
              'progress-ring transition-all duration-700 ease-out',
              animate && 'animate-ring'
            )}
            style={{
              transitionDelay: animate ? '100ms' : '0ms',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {children}
        </div>
      </div>
    );
  }
);

Ring.displayName = 'Ring';

// Specialized rings
export const StreakRing = ({ streak, size = 80, strokeWidth = 8, pillar = 'prayer', ...props }: Omit<RingProps, 'progress'> & { streak: number }) => {
  // Streak visual: full ring for each 7 days, partial for remainder
  const weeks = Math.floor(streak / 7);
  const days = streak % 7;
  const progress = days / 7;
  
  return (
    <div className="relative">
      <Ring
        size={size}
        strokeWidth={strokeWidth}
        progress={progress}
        pillar={pillar}
        animate={true}
        {...props}
      >
        <div className="text-center">
          <div className="text-large-title font-rounded text-[var(--color-text-primary)]">{streak}</div>
          <div className="text-caption text-[var(--color-text-muted)]">DAYS</div>
        </div>
      </Ring>
      {weeks > 0 && (
        <div className="absolute -top-2 -right-2 flex items-center gap-1">
          {Array.from({ length: Math.min(weeks, 4) }).map((_, i) => (
            <span key={i} className="text-[14px]">🏆</span>
          ))}
          {weeks > 4 && <span className="text-caption text-[var(--color-pillar)]">+{weeks - 4}</span>}
        </div>
      )}
    </div>
  );
};

export const SkillRing = ({ level, xp, size = 56, strokeWidth = 5, ...props }: Omit<RingProps, 'progress'> & { level: number; xp: number }) => {
  const progress = getProgressToNextLevel(xp);
  
  return (
    <Ring
      size={size}
      strokeWidth={strokeWidth}
      progress={progress}
      pillar="skills"
      animate={true}
      {...props}
    >
      <div className="text-center">
        <div className="text-title3 font-bold font-rounded text-[var(--color-text-primary)]">Lv.{level}</div>
        <div className="text-caption text-[var(--color-text-muted)]">{xp} XP</div>
      </div>
    </Ring>
  );
};
