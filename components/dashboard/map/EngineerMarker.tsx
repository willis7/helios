'use client';

import { Engineer, EngineerStatus } from '@/models/engineer';
import { Marker } from 'react-simple-maps';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface EngineerMarkerProps {
  engineer: Engineer;
  isActive: boolean;
  onMouseEnter: (e: React.MouseEvent, engineer: Engineer) => void;
  onMouseLeave: () => void;
  onClick: (engineer: Engineer) => void;
}

export function EngineerMarker({
  engineer,
  isActive,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: EngineerMarkerProps) {
  // Format local time
  const [localTime, setLocalTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const time = new Date().toLocaleTimeString('en-US', {
          timeZone: engineer.shift.timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        setLocalTime(time);
      } catch (e) {
        setLocalTime('--:--');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [engineer.shift.timezone]);

  const isAwake = engineer.status === EngineerStatus.AWAKE;

  return (
    <Marker
      coordinates={engineer.location.coordinates}
      onMouseEnter={(e) =>
        onMouseEnter(e as unknown as React.MouseEvent, engineer)
      }
      onMouseLeave={onMouseLeave}
      onClick={() => onClick(engineer)}
      className="cursor-pointer outline-none"
    >
      <g transform="translate(0, -10)">
        {/* Glow effect for active marker */}
        {isActive && (
          <circle
            r={18}
            fill="currentColor"
            className="text-primary-500/20 animate-pulse"
          />
        )}

        {/* Avatar Outline/Border */}
        <circle
          r={12}
          fill="var(--background)"
          stroke={isActive ? 'currentColor' : 'var(--border)'}
          className={cn(
            'transition-colors duration-300',
            isActive ? 'text-primary-500' : 'text-gray-300 dark:text-zinc-700',
          )}
          strokeWidth={2}
        />

        {/* Avatar Image (using clip path for SVG) */}
        <clipPath id={`clip-${engineer.id}`}>
          <circle r={10.5} />
        </clipPath>

        <image
          href={engineer.avatarUrl}
          x="-11"
          y="-11"
          height="22"
          width="22"
          clipPath={`url(#clip-${engineer.id})`}
          style={{ opacity: isAwake ? 1 : 0.6 }}
        />

        {/* Status indicator dot */}
        <circle
          cx={8}
          cy={8}
          r={3.5}
          fill={
            isAwake
              ? '#22c55e'
              : engineer.status === EngineerStatus.SLEEPING
                ? '#64748b'
                : '#ef4444'
          }
          stroke="var(--background)"
          strokeWidth={1.5}
        />

        {/* Local time badge */}
        <g transform="translate(0, 18)">
          <rect
            x={-24}
            y={0}
            width={48}
            height={16}
            rx={8}
            fill="var(--background)"
            stroke="var(--border)"
            className="dark:fill-zinc-800 fill-white dark:stroke-zinc-700 stroke-gray-200"
            strokeWidth={1}
          />
          <text
            x={0}
            y={11}
            textAnchor="middle"
            className={cn(
              'text-[9px] font-semibold font-sans',
              isActive
                ? 'fill-primary-600 dark:fill-primary-400'
                : 'fill-gray-600 dark:fill-zinc-300',
            )}
          >
            {localTime}
          </text>
        </g>
      </g>
    </Marker>
  );
}
