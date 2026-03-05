'use client';

import { MinusIcon, PlusIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from '@/components/shared/ui/button';

interface TimeStepperProps {
  timeOffset: number;
  onOffsetChange: (offset: number) => void;
}

export function TimeStepper({ timeOffset, onOffsetChange }: TimeStepperProps) {
  const handleDecrement = () => {
    onOffsetChange(timeOffset - 1);
  };

  const handleIncrement = () => {
    onOffsetChange(timeOffset + 1);
  };

  const handleReset = () => {
    onOffsetChange(0);
  };

  const formatOffset = (offset: number): string => {
    if (offset === 0) return 'now';
    if (offset > 0) return `+${offset}h`;
    return `${offset}h`;
  };

  return (
    <div className="flex items-center gap-2 bg-background/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-lg px-3 py-2 border border-gray-200 dark:border-zinc-800 shadow-md">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleDecrement}
        disabled={timeOffset <= -23}
        aria-label="Subtract one hour"
      >
        <MinusIcon className="h-4 w-4" />
      </Button>

      <button
        onClick={handleReset}
        className="min-w-[48px] text-sm font-medium text-center hover:text-primary-300 transition-colors"
        aria-label="Reset to current time"
      >
        {formatOffset(timeOffset)}
      </button>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleIncrement}
        disabled={timeOffset >= 23}
        aria-label="Add one hour"
      >
        <PlusIcon className="h-4 w-4" />
      </Button>

      {timeOffset !== 0 && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 ml-1"
          onClick={handleReset}
          aria-label="Reset to current time"
        >
          <RefreshCwIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
