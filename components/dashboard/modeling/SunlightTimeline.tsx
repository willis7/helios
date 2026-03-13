'use client';

import { Engineer } from '@/models/engineer';
import { cn } from '@/lib/utils';

interface SunlightTimelineProps {
  engineer: Engineer;
  shiftStartHour: number;
  shiftEndHour: number;
  scenarioName: string;
  className?: string;
}

const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => {
  const hour = i;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}${ampm}`;
});

function getTimezoneOffset({ timezone }: { timezone: string }): {
  hours: number;
  minutes: number;
} {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(
    parts.find((p) => p.type === 'minute')?.value || '0',
    10,
  );

  const utcFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
  const utcParts = utcFormatter.formatToParts(now);
  const utcHour = parseInt(
    utcParts.find((p) => p.type === 'hour')?.value || '0',
    10,
  );
  const utcMinute = parseInt(
    utcParts.find((p) => p.type === 'minute')?.value || '0',
    10,
  );

  const localTotalMinutes = hour * 60 + minute;
  const utcTotalMinutes = utcHour * 60 + utcMinute;
  let offsetMinutes = localTotalMinutes - utcTotalMinutes;

  if (offsetMinutes > 12 * 60) offsetMinutes -= 24 * 60;
  if (offsetMinutes < -12 * 60) offsetMinutes += 24 * 60;

  return {
    hours: Math.floor(offsetMinutes / 60),
    minutes: Math.abs(offsetMinutes % 60),
  };
}

function getLocalHour({
  utcHour,
  offsetHours,
  offsetMinutes,
}: {
  utcHour: number;
  offsetHours: number;
  offsetMinutes: number;
}): { hour: number; minute: number } {
  const totalMinutes = utcHour * 60 + offsetHours * 60 + offsetMinutes;
  const normalizedMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hour = Math.floor(normalizedMinutes / 60);
  const minute = normalizedMinutes % 60;
  return { hour, minute };
}

function formatHour({
  hour,
  minute = 0,
}: {
  hour: number;
  minute?: number;
}): string {
  const h = hour % 24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

function isInSleepZone({ hour }: { hour: number }): boolean {
  return hour >= 23 || hour < 7;
}

function isInBusinessHours({ hour }: { hour: number }): boolean {
  return hour >= 9 && hour < 18;
}

function doesShiftCrossSleepZone({
  startHour,
  endHour,
}: {
  startHour: number;
  endHour: number;
}): boolean {
  const normalizedEnd = endHour < startHour ? endHour + 24 : endHour;

  for (let hour = startHour; hour < normalizedEnd; hour++) {
    const normalizedHour = hour % 24;
    if (isInSleepZone({ hour: normalizedHour })) {
      return true;
    }
  }
  return false;
}

interface ShiftSegment {
  left: string;
  width: string;
}

function getShiftSegments({
  startHour,
  endHour,
}: {
  startHour: number;
  endHour: number;
}): ShiftSegment[] {
  const segments: ShiftSegment[] = [];

  if (endHour < startHour) {
    // Shift crosses midnight - split into two segments
    // First segment: startHour to midnight (24:00)
    segments.push({
      left: `${(startHour / 24) * 100}%`,
      width: `${((24 - startHour) / 24) * 100}%`,
    });
    // Second segment: midnight (0:00) to endHour
    segments.push({
      left: '0%',
      width: `${(endHour / 24) * 100}%`,
    });
  } else {
    // Normal shift within same day
    segments.push({
      left: `${(startHour / 24) * 100}%`,
      width: `${((endHour - startHour) / 24) * 100}%`,
    });
  }

  return segments;
}

function getZoneColor({ hour }: { hour: number }): string {
  if (isInBusinessHours({ hour })) {
    return 'bg-white';
  }
  if (isInSleepZone({ hour })) {
    return 'bg-zinc-900';
  }
  return 'bg-zinc-600';
}

export function SunlightTimeline({
  engineer,
  shiftStartHour,
  shiftEndHour,
  scenarioName,
  className,
}: SunlightTimelineProps) {
  const { hours: offsetHours, minutes: offsetMinutes } = getTimezoneOffset({
    timezone: engineer.shift.timezone,
  });

  // Convert UTC shift times to local time
  const { hour: localStartHour, minute: localStartMinute } = getLocalHour({
    utcHour: shiftStartHour,
    offsetHours,
    offsetMinutes,
  });
  const { hour: localEndHour, minute: localEndMinute } = getLocalHour({
    utcHour: shiftEndHour,
    offsetHours,
    offsetMinutes,
  });

  // Check if shift crosses sleep zone (using LOCAL hours)
  const crossesSleepZone = doesShiftCrossSleepZone({
    startHour: localStartHour,
    endHour: localEndHour,
  });

  // Generate 24 hours in LOCAL time (midnight to midnight)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div
      className={cn(
        'flex flex-col gap-3 p-4 bg-card rounded-lg border',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={engineer.avatarUrl}
            alt={engineer.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-primary"
          />
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{engineer.name}</span>
            <span className="text-xs text-muted-foreground">
              {engineer.location.city}, {engineer.shift.timezone}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-primary">
            {formatHour({ hour: localStartHour, minute: localStartMinute })} -{' '}
            {formatHour({ hour: localEndHour, minute: localEndMinute })}
          </span>
          <span className="text-xs text-muted-foreground">
            {scenarioName} · Local Time
          </span>
        </div>
      </div>

      <div className="relative h-12 rounded-md overflow-hidden flex">
        {hours.map((hour) => (
          <div
            key={hour}
            className={cn(
              'flex-1 border-r border-white/10',
              getZoneColor({ hour }),
            )}
          />
        ))}

        {getShiftSegments({
          startHour: localStartHour,
          endHour: localEndHour,
        }).map((segment, index) => (
          <div
            key={index}
            className={cn(
              'absolute top-1 bottom-1 rounded-md opacity-80',
              crossesSleepZone ? 'bg-red-500' : 'bg-primary-500',
            )}
            style={{
              left: segment.left,
              width: segment.width,
            }}
          />
        ))}

        {crossesSleepZone && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 bg-red-500/90 rounded-full text-xs text-white font-medium animate-pulse">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>Sleep Zone</span>
          </div>
        )}
      </div>

      <div className="relative h-4 text-[10px] text-muted-foreground/70">
        {HOUR_LABELS.filter((_, i) => i % 3 === 0).map((label, index) => {
          const hour = index * 3;
          const left = (hour / 24) * 100;
          return (
            <span
              key={index}
              className="absolute transform -translate-x-1/2"
              style={{ left: `${left}%` }}
            >
              {label}
            </span>
          );
        })}
        {/* Midnight label at the end */}
        <span
          className="absolute transform -translate-x-1/2"
          style={{ left: '100%' }}
        >
          12AM
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-white border border-zinc-300" />
          <span>Business (9-18)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-zinc-600" />
          <span>Evening (18-23)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-zinc-900" />
          <span>Sleep (23-7)</span>
        </div>
      </div>
    </div>
  );
}
