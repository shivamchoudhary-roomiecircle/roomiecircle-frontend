import { useState, useMemo } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Heart, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SwipeCardProps {
  id: string;
  children: React.ReactNode;
  onSwipe: (direction: 'left' | 'right') => void;
  className?: string;
  style?: React.CSSProperties;
}

export const SwipeCard = ({ id, children, onSwipe, className, style }: SwipeCardProps) => {
  const [translateX, setTranslateX] = useState(0);
  const [rot, setRot] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const threshold = 100; // px to accept swipe

  const swipe = (direction: 'left' | 'right') => {
    setIsLeaving(true);
    const toX = direction === 'right' ? window.innerWidth * 1.2 : -window.innerWidth * 1.2;
    setTranslateX(toX);
    setRot(direction === 'right' ? 20 : -20);
    // Allow animation to play before unmount
    window.setTimeout(() => onSwipe(direction), 220);
  };

  const handlers = useSwipeable({
    onSwiping: (e) => {
      setIsDragging(true);
      setTranslateX(e.deltaX);
      setRot(e.deltaX / 20);
    },
    onSwiped: (e) => {
      setIsDragging(false);
      if (Math.abs(e.deltaX) > threshold) {
        swipe(e.deltaX > 0 ? 'right' : 'left');
      } else {
        setTranslateX(0);
        setRot(0);
      }
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  const transform = useMemo(() => `translate3d(${translateX}px, 0, 0) rotate(${rot}deg)`, [translateX, rot]);

  return (
    <div
      key={id}
      className={cn('absolute w-full h-full', className)}
      style={{ ...style, transform, transition: isDragging || isLeaving ? 'transform 0.2s ease' : 'transform 0.25s ease' }}
      {...handlers}
      onClick={() => {
        // Allow parent to handle expand if needed; no-op here
      }}
    >
      <div className={cn('relative bg-card rounded-2xl shadow-xl overflow-hidden w-full h-full')}>
        <div className="h-full overflow-y-auto md:overflow-hidden">
          {children}
        </div>

        {/* Mobile expand indicator */}
        <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce pointer-events-none">
          <ChevronDown className="h-6 w-6 text-white drop-shadow-lg" />
        </div>

        {/* Action buttons - desktop only */}
        <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 gap-4">
          <Button
            size="lg"
            variant="outline"
            className="h-14 w-14 rounded-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              swipe('left');
            }}
          >
            <X className="h-6 w-6" />
          </Button>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600"
            onClick={(e) => {
              e.stopPropagation();
              swipe('right');
            }}
          >
            <Heart className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};
