'use client';

import { useMemo } from 'react';
import { Slider } from '@/components/shared/ui/slider';
import { engineers } from '@/data/dashboard/engineers';
import { cn } from '@/lib/utils';

interface TimeSliderProps {
  value: number;
  onChange: ({ utcHour }: { utcHour: number }) => void;
  className?: string;
}

interface EngineerTimeDisplay {
  name: string;
  city: string;
  timezone: string;
  localTime: string;
  localHour: number;
  localMinute: number;
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

function getLocalHour({
  utcHour,
  utcMinute = 0,
  offsetHours,
  offsetMinutes,
}: {
  utcHour: number;
  utcMinute?: number;
  offsetHours: number;
  offsetMinutes: number;
}): { hour: number; minute: number } {
  const totalMinutes =
    utcHour * 60 + utcMinute + offsetHours * 60 + offsetMinutes;
  const normalizedMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hour = Math.floor(normalizedMinutes / 60);
  const minute = normalizedMinutes % 60;
  return { hour, minute };
}

function getTimezoneOffset({ timezone }: { timezone: string }): {
  hours: number;
  minutes: number;
} {
  // Use Intl to get the timezone offset properly
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

  // Get UTC time for comparison
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

  // Calculate offset in minutes from UTC
  const localTotalMinutes = hour * 60 + minute;
  const utcTotalMinutes = utcHour * 60 + utcMinute;
  let offsetMinutes = localTotalMinutes - utcTotalMinutes;

  // Handle day wraparound
  if (offsetMinutes > 12 * 60) offsetMinutes -= 24 * 60;
  if (offsetMinutes < -12 * 60) offsetMinutes += 24 * 60;

  return {
    hours: Math.floor(offsetMinutes / 60),
    minutes: Math.abs(offsetMinutes % 60),
  };
}

function calculateEngineerTimes({
  utcHour,
}: {
  utcHour: number;
}): EngineerTimeDisplay[] {
  return engineers.map((engineer) => {
    const { hours: offsetHours, minutes: offsetMinutes } = getTimezoneOffset({
      timezone: engineer.shift.timezone,
    });
    const { hour: localHour, minute: localMinute } = getLocalHour({
      utcHour,
      offsetHours,
      offsetMinutes,
    });

    return {
      name: engineer.name,
      city: engineer.location.city,
      timezone: engineer.shift.timezone,
      localTime: formatHour({ hour: localHour, minute: localMinute }),
      localHour,
      localMinute,
    };
  });
}

export function TimeSlider({ value, onChange, className }: TimeSliderProps) {
  const engineerTimes = useMemo(
    () => calculateEngineerTimes({ utcHour: value }),
    [value],
  );

  const handleValueChange = (values: number[]) => {
    onChange({ utcHour: values[0] });
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-6 p-4 bg-card rounded-lg border',
        className,
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Handover Time (UTC)
          </label>
          <span className="text-lg font-semibold text-primary">
            {formatHour({ hour: value })} UTC
          </span>
        </div>

        <Slider
          value={[value]}
          onValueChange={handleValueChange}
          min={0}
          max={23}
          step={1}
          className="w-full"
        />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>12:00 AM</span>
          <span>12:00 PM</span>
          <span>11:00 PM</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-medium text-foreground">Local Times</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {engineerTimes.map((engineer) => (
            <div
              key={engineer.name}
              className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm"
            >
              <div className="flex flex-col">
                <span className="font-medium text-foreground">
                  {engineer.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {engineer.city}
                </span>
              </div>
              <span className="font-mono text-primary font-medium">
                {engineer.localTime}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
