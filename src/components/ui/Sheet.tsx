// Sheet Component - iOS-style bottom sheet
import { forwardRef, useEffect, useRef, useState, HTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';
import { hapticMedium, hapticLight } from '../../lib/haptics';

interface SheetProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  snapPoints?: number[]; // 0-1 fractions
  defaultSnap?: number;
  showHandle?: boolean;
  children: React.ReactNode;
}

export const Sheet = forwardRef<HTMLDivElement, SheetProps>(
  ({ className, open, onClose, title, description, snapPoints = [0.5, 1], defaultSnap = 0, showHandle = true, children, ...props }, ref) => {
    const sheetRef = useRef<HTMLDivElement>(null);
    const [currentSnap, setCurrentSnap] = useState(defaultSnap);
    const [isDragging, setIsDragging] = useState(false);
    const startY = useRef(0);
    const startSnap = useRef(currentSnap);

    useEffect(() => {
      if (!open) {
        setCurrentSnap(defaultSnap);
      }
    }, [open, defaultSnap]);

    const handleTouchStart = (e: React.TouchEvent) => {
      if (!isDragging) {
        setIsDragging(true);
        startY.current = e.touches[0].clientY;
        startSnap.current = currentSnap;
        hapticLight();
      }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!isDragging) return;
      const deltaY = e.touches[0].clientY - startY.current;
      const maxHeight = window.innerHeight * snapPoints[snapPoints.length - 1];
      const snapHeight = window.innerHeight * snapPoints[currentSnap];
      const newSnap = Math.max(0, Math.min(snapPoints.length - 1, 
        snapPoints.findIndex((_, i) => window.innerHeight * snapPoints[i] > snapHeight - deltaY) || currentSnap
      ));
      setCurrentSnap(newSnap);
    };

    const handleTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        hapticMedium();
        // Snap to nearest point
        const targetHeight = window.innerHeight * snapPoints[currentSnap];
        const dragEndY = window.innerHeight * snapPoints[currentSnap]; // simplified
      }
    };

    if (!open) return null;

    const sheetContent = (
      <div
        ref={ref}
        className={cn(
          'sheet fixed inset-x-0 bottom-0 z-[100] rounded-t-[var(--radius-sheet)] bg-[var(--color-bg-primary)] border-t border-[var(--color-border-light)] shadow-[0_-10px_40px_rgb(0_0_0_/0.3)]',
          'sheet-open animate-slide-up',
          className
        )}
        style={{
          transform: `translateY(calc((1 - ${snapPoints[currentSnap]}) * 100vh))`,
          maxHeight: `${snapPoints[currentSnap] * 100}vh`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        {...props}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
        
        {/* Handle */}
        {showHandle && (
          <div className="sheet-handle" />
        )}

        {/* Header */}
        {(title || description) && (
          <div className="px-5 pt-2 pb-4 border-b border-[var(--color-border-light)]">
            {title && <h2 className="text-title2 font-semibold text-[var(--color-text-primary)]">{title}</h2>}
            {description && <p className="mt-1 text-body text-[var(--color-text-secondary)]">{description}</p>}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 pb-20">
          {children}
        </div>
      </div>
    );

    return createPortal(sheetContent, document.body);
  }
);

Sheet.displayName = 'Sheet';

// Full-screen modal sheet
export const ModalSheet = ({ open, onClose, title, children, className }: Omit<SheetProps, 'snapPoints' | 'defaultSnap' | 'showHandle'>) => (
  <Sheet
    open={open}
    onClose={onClose}
    title={title}
    snapPoints={[1]}
    defaultSnap={1}
    showHandle={false}
    className={cn('max-h-full', className)}
  >
    {children}
  </Sheet>
);