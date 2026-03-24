import { Engineer, RiskWindow, StrategyTemplate } from '@/models/engineer';

// ---------------------------------------------------------------------------
// Time zone helpers
// ---------------------------------------------------------------------------

export function getLocalHour({
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
  return {
    hour: Math.floor(normalizedMinutes / 60),
    minute: normalizedMinutes % 60,
  };
}

export function formatHour({ hour, minute = 0 }: { hour: number; minute?: number }): string {
  const h = hour % 24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

// ---------------------------------------------------------------------------
// Shift zone classification
// ---------------------------------------------------------------------------

export function isInSleepZone({ hour }: { hour: number }): boolean {
  return hour >= 23 || hour < 7;
}

export function isInBusinessHours({ hour }: { hour: number }): boolean {
  return hour >= 9 && hour < 18;
}

export function doesShiftCrossSleepZone({
  startHour,
  endHour,
}: {
  startHour: number;
  endHour: number;
}): boolean {
  const normalizedEnd = endHour < startHour ? endHour + 24 : endHour;
  for (let hour = startHour; hour < normalizedEnd; hour++) {
    if (isInSleepZone({ hour: hour % 24 })) return true;
  }
  return false;
}

export function getZoneColor({ hour }: { hour: number }): string {
  if (isInBusinessHours({ hour })) return 'bg-white';
  if (isInSleepZone({ hour })) return 'bg-zinc-900';
  return 'bg-zinc-600';
}

// ---------------------------------------------------------------------------
// Shift segment positioning (for the 24h timeline bar)
// ---------------------------------------------------------------------------

export interface ShiftSegment {
  left: string;
  width: string;
}

export function getShiftSegments({
  startHour,
  endHour,
}: {
  startHour: number;
  endHour: number;
}): ShiftSegment[] {
  if (endHour < startHour) {
    return [
      {
        left: `${(startHour / 24) * 100}%`,
        width: `${((24 - startHour) / 24) * 100}%`,
      },
      {
        left: '0%',
        width: `${(endHour / 24) * 100}%`,
      },
    ];
  }
  return [
    {
      left: `${(startHour / 24) * 100}%`,
      width: `${((endHour - startHour) / 24) * 100}%`,
    },
  ];
}

// ---------------------------------------------------------------------------
// Risk heatmap positioning
// ---------------------------------------------------------------------------

export function calculateRiskWindows({
  windows,
  totalHours = 24,
}: {
  windows: RiskWindow[];
  totalHours?: number;
}): Array<{
  left: number;
  width: number;
  opacity: number;
  label: string;
  startHour: number;
  endHour: number;
}> {
  return windows.map((window) => ({
    left: (window.startHour / totalHours) * 100,
    width: Math.max(((window.endHour - window.startHour) / totalHours) * 100, 1),
    opacity: 0.2 + window.probability * 0.6,
    label: window.label,
    startHour: window.startHour,
    endHour: window.endHour,
  }));
}

// ---------------------------------------------------------------------------
// Strategy shift generation
// ---------------------------------------------------------------------------

export interface ShiftConfig {
  engineerId: string;
  startHour: number;
  endHour: number;
}

function getTimezoneOffsetHours({ timezone }: { timezone: string }): number {
  const now = new Date();
  const fmt = (tz: string) =>
    new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: 'numeric', hour12: false })
      .formatToParts(now);

  const local = fmt(timezone);
  const utc = fmt('UTC');

  const toMinutes = (parts: Intl.DateTimeFormatPart[]) =>
    parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10) * 60 +
    parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10);

  let offset = toMinutes(local) - toMinutes(utc);
  if (offset > 12 * 60) offset -= 24 * 60;
  if (offset < -12 * 60) offset += 24 * 60;
  return offset / 60;
}

export function generateShiftsFromStrategy({
  strategy,
  engineers,
}: {
  strategy: StrategyTemplate;
  engineers: Engineer[];
}): ShiftConfig[] {
  return engineers.map((engineer, index) => {
    let startHour: number;
    let endHour: number;

    switch (strategy) {
      case StrategyTemplate.FOLLOW_SUN: {
        const offsetHours = getTimezoneOffsetHours({ timezone: engineer.shift.timezone });
        startHour = Math.round((12 + offsetHours + 24) % 24);
        endHour = (startHour + 8) % 24;
        break;
      }
      case StrategyTemplate.TWELVE_HOUR:
        startHour = index % 2 === 0 ? 8 : 20;
        endHour = index % 2 === 0 ? 20 : 8;
        break;
      case StrategyTemplate.WEEKLY:
        startHour = 9;
        endHour = 17;
        break;
      case StrategyTemplate.CUSTOM:
      default:
        startHour = 9;
        endHour = 17;
        break;
    }

    return { engineerId: engineer.id, startHour, endHour };
  });
}
