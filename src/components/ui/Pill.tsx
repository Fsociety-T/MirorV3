// Pill Component - Pillar indicator
import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { getPillarColor } from '../../lib/design';

type PillarKey = 'prayer' | 'health' | 'addiction' | 'projects' | 'skills' | 'vision';

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  pillar: PillarKey;
  active?: boolean;
  count?: number;
  label?: string;
}

export const Pill = forwardRef<HTMLSpanElement, PillProps>(
  ({ className, pillar, active = false, count, label, children, ...props }, ref) => {
    const color = getPillarColor(pillar);
    const style = { '--color-pillar': color } as React.CSSProperties;

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1 text-sm font-medium transition-all duration-200',
          active
            ? 'bg-[var(--color-pillar)]/15 text-[var(--color-pillar)] border border-[var(--color-pillar)]/30'
            : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]',
          className
        )}
        style={style}
        {...props}
      >
        {children || label}
        {count !== undefined && (
          <span className={cn('flex items-center justify-center min-w-[20px] h-5 rounded-full text-xs', active ? 'bg-[var(--color-pillar)] text-white' : 'bg-[var(--color-bg-primary)] text-[var(--color-text-muted)]')}>
            {count}
          </span>
        )}
      </span>
    );
  }
);

Pill.displayName = 'Pill';