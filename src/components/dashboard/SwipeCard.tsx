import { useState } from 'react';
import TinderCard from 'react-tinder-card';
import { Heart, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SwipeCardProps {
  id: string;
  children: React.ReactNode;
  onSwipe: (direction: string) => void;
  className?: string;
}

export const SwipeCard = ({ id, children, onSwipe, className }: SwipeCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const handleSwipe = (direction: string) => {
    onSwipe(direction);
    setExpanded(false);
  };

  return (
    <TinderCard
      key={id}
      onSwipe={handleSwipe}
      preventSwipe={['up', 'down']}
      className={cn("absolute w-full h-full", className)}
    >
      <div 
        className={cn(
          "relative bg-card rounded-2xl shadow-xl overflow-hidden transition-all duration-300",
          "w-full h-full",
          expanded && "md:h-full"
        )}
      >
        <div 
          className={cn(
            "h-full overflow-y-auto",
            !expanded && "md:overflow-hidden"
          )}
          onClick={() => setExpanded(!expanded)}
        >
          {children}
        </div>

        {/* Mobile expand indicator */}
        <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
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
              handleSwipe('left');
            }}
          >
            <X className="h-6 w-6" />
          </Button>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600"
            onClick={(e) => {
              e.stopPropagation();
              handleSwipe('right');
            }}
          >
            <Heart className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </TinderCard>
  );
};
