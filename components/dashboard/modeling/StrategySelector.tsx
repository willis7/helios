'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/ui/select';
import { StrategyTemplate } from '@/models/engineer';
import { cn } from '@/lib/utils';

interface StrategyOption {
  value: StrategyTemplate;
  label: string;
  description: string;
}

const STRATEGY_OPTIONS: StrategyOption[] = [
  {
    value: StrategyTemplate.FOLLOW_SUN,
    label: 'Follow the Sun',
    description:
      '12-hour rotating shifts following daylight hours across global time zones. Optimizes coverage while minimizing night shifts.',
  },
  {
    value: StrategyTemplate.TWELVE_HOUR,
    label: '12-hour Split',
    description:
      'Fixed 12-hour shift pattern with day and night rotations. Provides consistent schedule with predictable handoffs.',
  },
  {
    value: StrategyTemplate.WEEKLY,
    label: 'Weekly Rotation',
    description:
      '7-day rotation blocks with extended on-call periods. Best for teams with fewer members or less frequent incidents.',
  },
  {
    value: StrategyTemplate.CUSTOM,
    label: 'Custom',
    description:
      'Manual configuration of shift patterns, handoff times, and coverage rules. Full flexibility for unique team needs.',
  },
];

interface StrategySelectorProps {
  value: StrategyTemplate;
  onStrategyChange: ({ strategy }: { strategy: StrategyTemplate }) => void;
  className?: string;
}

export function StrategySelector({
  value,
  onStrategyChange,
  className,
}: StrategySelectorProps) {
  const selectedOption = STRATEGY_OPTIONS.find(
    (option) => option.value === value,
  );

  const handleValueChange = (newValue: string) => {
    onStrategyChange({ strategy: newValue as StrategyTemplate });
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="strategy-select"
          className="text-sm font-medium text-foreground"
        >
          Rotation Strategy
        </label>
        <Select value={value} onValueChange={handleValueChange}>
          <SelectTrigger id="strategy-select" className="w-full">
            <SelectValue placeholder="Select a strategy" />
          </SelectTrigger>
          <SelectContent>
            {STRATEGY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedOption && (
        <div className="p-4 rounded-lg bg-muted/50 border">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-foreground">
              {selectedOption.label}
            </span>
            <span className="text-sm text-muted-foreground">
              {selectedOption.description}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
