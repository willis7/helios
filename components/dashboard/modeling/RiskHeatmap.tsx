'use client';

import { useState, useMemo } from 'react';
import { RiskWindow } from '@/models/engineer';
import { cn } from '@/lib/utils';
import { formatHour, calculateRiskWindows } from '@/lib/scheduling';

interface RiskHeatmapProps {
  riskWindows: RiskWindow[];
  className?: string;
}

interface TooltipData {
  label: string;
  probability: number;
  startHour: number;
  endHour: number;
  x: number;
  width: number;
}

export function RiskHeatmap({ riskWindows, className }: RiskHeatmapProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const computedWindows = useMemo(
    () => calculateRiskWindows({ windows: riskWindows }),
    [riskWindows],
  );

  const handleMouseEnter = ({
    window,
    event,
  }: {
    window: (typeof computedWindows)[number];
    event: React.MouseEvent;
  }) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const containerRect = (
      event.target as HTMLElement
    ).parentElement?.getBoundingClientRect();

    if (containerRect) {
      setTooltip({
        label: window.label,
        probability: window.opacity,
        startHour: window.startHour,
        endHour: window.endHour,
        x: rect.left - containerRect.left,
        width: rect.width,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  if (riskWindows.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'relative w-full h-8 rounded-md overflow-hidden bg-muted/30',
        className,
      )}
      role="region"
      aria-label="Risk heatmap timeline"
    >
      <div className="absolute inset-0 flex items-center justify-between px-2">
        <span className="text-xs text-muted-foreground">12 AM</span>
        <span className="text-xs text-muted-foreground">12 PM</span>
        <span className="text-xs text-muted-foreground">11 PM</span>
      </div>

      {computedWindows.map((window, index) => (
        <div
          key={`${window.label}-${index}`}
          className="absolute top-0 h-full cursor-pointer transition-opacity hover:opacity-100"
          style={{
            left: `${window.left}%`,
            width: `${window.width}%`,
            backgroundColor: `rgba(239, 68, 68, ${window.opacity})`,
            opacity: window.opacity * 0.8,
          }}
          onMouseEnter={(e) => handleMouseEnter({ window, event: e })}
          onMouseLeave={handleMouseLeave}
          role="img"
          aria-label={`${window.label}: ${Math.round(window.opacity * 100)}% risk`}
        />
      ))}

      {tooltip && (
        <div
          className="absolute z-50 px-3 py-2 text-sm bg-popover border rounded-md shadow-lg pointer-events-none"
          style={{
            left: tooltip.x,
            top: '100%',
            marginTop: '4px',
            minWidth: '160px',
          }}
        >
          <div className="font-medium text-foreground">{tooltip.label}</div>
          <div className="mt-1 space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Risk Level:</span>
              <span
                className={cn(
                  'font-medium',
                  tooltip.probability > 0.6
                    ? 'text-red-500'
                    : tooltip.probability > 0.3
                      ? 'text-orange-500'
                      : 'text-yellow-500',
                )}
              >
                {tooltip.probability > 0.6
                  ? 'High'
                  : tooltip.probability > 0.3
                    ? 'Medium'
                    : 'Low'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Probability:</span>
              <span className="font-medium text-foreground">
                {Math.round(tooltip.probability * 100)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span className="font-medium text-foreground">
                {formatHour({ hour: tooltip.startHour })} -{' '}
                {formatHour({ hour: tooltip.endHour })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
