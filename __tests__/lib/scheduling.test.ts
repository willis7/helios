import { describe, it, expect } from 'vitest';
import {
  isInSleepZone,
  isInBusinessHours,
  doesShiftCrossSleepZone,
  getShiftSegments,
  getLocalHour,
  formatHour,
  calculateRiskWindows,
  generateShiftsFromStrategy,
} from '@/lib/scheduling';
import { StrategyTemplate, Engineer, EngineerRole, EngineerStatus, Team } from '@/models/engineer';

// ---------------------------------------------------------------------------
// isInSleepZone
// ---------------------------------------------------------------------------
describe('isInSleepZone', () => {
  it('returns true for hours in the late-night sleep window (23–6)', () => {
    expect(isInSleepZone({ hour: 23 })).toBe(true);
    expect(isInSleepZone({ hour: 0 })).toBe(true);
    expect(isInSleepZone({ hour: 3 })).toBe(true);
    expect(isInSleepZone({ hour: 6 })).toBe(true);
  });

  it('returns false for hours outside the sleep window', () => {
    expect(isInSleepZone({ hour: 7 })).toBe(false);
    expect(isInSleepZone({ hour: 9 })).toBe(false);
    expect(isInSleepZone({ hour: 22 })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isInBusinessHours
// ---------------------------------------------------------------------------
describe('isInBusinessHours', () => {
  it('returns true for business hours (9–17 inclusive start, exclusive end)', () => {
    expect(isInBusinessHours({ hour: 9 })).toBe(true);
    expect(isInBusinessHours({ hour: 12 })).toBe(true);
    expect(isInBusinessHours({ hour: 17 })).toBe(true);
  });

  it('returns false outside business hours', () => {
    expect(isInBusinessHours({ hour: 8 })).toBe(false);
    expect(isInBusinessHours({ hour: 18 })).toBe(false);
    expect(isInBusinessHours({ hour: 22 })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// doesShiftCrossSleepZone — the burnout detection algorithm
// ---------------------------------------------------------------------------
describe('doesShiftCrossSleepZone', () => {
  it('returns false for a shift entirely in business hours', () => {
    expect(doesShiftCrossSleepZone({ startHour: 9, endHour: 17 })).toBe(false);
  });

  it('returns false for a shift in the evening zone (not sleep)', () => {
    expect(doesShiftCrossSleepZone({ startHour: 18, endHour: 22 })).toBe(false);
  });

  it('returns true when a shift starts at the sleep boundary (23)', () => {
    expect(doesShiftCrossSleepZone({ startHour: 20, endHour: 1 })).toBe(true);
  });

  it('returns true for a midnight shift crossing into sleep hours', () => {
    expect(doesShiftCrossSleepZone({ startHour: 22, endHour: 6 })).toBe(true);
  });

  it('returns true when shift is entirely within sleep hours', () => {
    expect(doesShiftCrossSleepZone({ startHour: 1, endHour: 5 })).toBe(true);
  });

  it('returns true for a night shift that wraps around midnight', () => {
    // 20:00 → 04:00 crosses the sleep zone
    expect(doesShiftCrossSleepZone({ startHour: 20, endHour: 4 })).toBe(true);
  });

  it('returns false for a Follow-the-Sun daytime shift (8 → 20)', () => {
    expect(doesShiftCrossSleepZone({ startHour: 8, endHour: 20 })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getShiftSegments — visual positioning on the 24h timeline bar
// ---------------------------------------------------------------------------
describe('getShiftSegments', () => {
  it('returns a single segment for a shift within the same day', () => {
    const segments = getShiftSegments({ startHour: 8, endHour: 20 });
    expect(segments).toHaveLength(1);
    expect(segments[0].left).toBe('33.33333333333333%');
    expect(segments[0].width).toBe('50%');
  });

  it('returns two segments when the shift crosses midnight', () => {
    const segments = getShiftSegments({ startHour: 20, endHour: 8 });
    expect(segments).toHaveLength(2);
    // First segment: 20→24 = 4 hours, starting at 83.33%
    expect(segments[0].left).toBe('83.33333333333334%');
    expect(segments[0].width).toBe('16.666666666666664%');
    // Second segment: 0→8 = 8 hours, starting at 0%
    expect(segments[1].left).toBe('0%');
    expect(segments[1].width).toBe('33.33333333333333%');
  });

  it('returns a single segment at 0% for a shift starting at midnight', () => {
    const segments = getShiftSegments({ startHour: 0, endHour: 12 });
    expect(segments).toHaveLength(1);
    expect(segments[0].left).toBe('0%');
    expect(segments[0].width).toBe('50%');
  });
});

// ---------------------------------------------------------------------------
// getLocalHour — UTC-to-local conversion
// ---------------------------------------------------------------------------
describe('getLocalHour', () => {
  it('converts UTC hour to local with a positive offset (London BST +1)', () => {
    const result = getLocalHour({ utcHour: 11, offsetHours: 1, offsetMinutes: 0 });
    expect(result).toEqual({ hour: 12, minute: 0 });
  });

  it('converts UTC hour to local with a negative offset (New York EST -5)', () => {
    const result = getLocalHour({ utcHour: 15, offsetHours: -5, offsetMinutes: 0 });
    expect(result).toEqual({ hour: 10, minute: 0 });
  });

  it('wraps past midnight when local time would exceed 24h', () => {
    const result = getLocalHour({ utcHour: 23, offsetHours: 5, offsetMinutes: 30 });
    // 23:00 UTC + 5h30 = 28:30 → wraps to 04:30 local
    expect(result).toEqual({ hour: 4, minute: 30 });
  });

  it('wraps correctly for negative offsets that go before midnight', () => {
    // 01:00 UTC - 8h = -7:00 → wraps to 17:00
    const result = getLocalHour({ utcHour: 1, offsetHours: -8, offsetMinutes: 0 });
    expect(result).toEqual({ hour: 17, minute: 0 });
  });

  it('handles a half-hour offset (IST +5:30)', () => {
    const result = getLocalHour({ utcHour: 10, offsetHours: 5, offsetMinutes: 30 });
    expect(result).toEqual({ hour: 15, minute: 30 });
  });
});

// ---------------------------------------------------------------------------
// formatHour
// ---------------------------------------------------------------------------
describe('formatHour', () => {
  it('formats midnight as 12:00 AM', () => {
    expect(formatHour({ hour: 0 })).toBe('12:00 AM');
  });

  it('formats noon as 12:00 PM', () => {
    expect(formatHour({ hour: 12 })).toBe('12:00 PM');
  });

  it('formats 9 AM correctly', () => {
    expect(formatHour({ hour: 9 })).toBe('9:00 AM');
  });

  it('formats 5:30 PM correctly', () => {
    expect(formatHour({ hour: 17, minute: 30 })).toBe('5:30 PM');
  });

  it('pads minutes with leading zero', () => {
    expect(formatHour({ hour: 8, minute: 5 })).toBe('8:05 AM');
  });
});

// ---------------------------------------------------------------------------
// calculateRiskWindows — heatmap visual positioning
// ---------------------------------------------------------------------------
describe('calculateRiskWindows', () => {
  it('maps a risk window to correct left/width percentages', () => {
    const results = calculateRiskWindows({
      windows: [{ startHour: 6, endHour: 12, probability: 0.5, label: 'Morning Risk' }],
    });
    expect(results).toHaveLength(1);
    expect(results[0].left).toBe(25); // 6/24 * 100
    expect(results[0].width).toBe(25); // 6/24 * 100
  });

  it('maps probability to opacity in range 0.2–0.8', () => {
    const lowRisk = calculateRiskWindows({
      windows: [{ startHour: 0, endHour: 1, probability: 0, label: 'Low' }],
    });
    const highRisk = calculateRiskWindows({
      windows: [{ startHour: 0, endHour: 1, probability: 1, label: 'High' }],
    });
    expect(lowRisk[0].opacity).toBeCloseTo(0.2);
    expect(highRisk[0].opacity).toBeCloseTo(0.8);
  });

  it('enforces a minimum width of 1% for very narrow windows', () => {
    const results = calculateRiskWindows({
      windows: [{ startHour: 0, endHour: 0, probability: 0.5, label: 'Point' }],
    });
    expect(results[0].width).toBe(1);
  });

  it('returns an empty array for no windows', () => {
    expect(calculateRiskWindows({ windows: [] })).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// generateShiftsFromStrategy
// ---------------------------------------------------------------------------

const makeEngineer = (id: string, timezone: string): Engineer => ({
  id,
  name: `Engineer ${id}`,
  avatarUrl: '',
  role: EngineerRole.PRIMARY,
  team: Team.SRE,
  status: EngineerStatus.AWAKE,
  location: { city: 'London', country: 'UK', coordinates: [0, 51] },
  shift: { start: '09:00', end: '17:00', timezone },
  contact: { slack: '', phone: '', email: '' },
});

describe('generateShiftsFromStrategy', () => {
  it('TWELVE_HOUR: alternates day (8→20) and night (20→8) shifts by index', () => {
    const engineers = [makeEngineer('e1', 'UTC'), makeEngineer('e2', 'UTC')];
    const shifts = generateShiftsFromStrategy({ strategy: StrategyTemplate.TWELVE_HOUR, engineers });
    expect(shifts[0]).toMatchObject({ engineerId: 'e1', startHour: 8, endHour: 20 });
    expect(shifts[1]).toMatchObject({ engineerId: 'e2', startHour: 20, endHour: 8 });
  });

  it('WEEKLY: assigns 9→17 shift to every engineer', () => {
    const engineers = [makeEngineer('e1', 'UTC'), makeEngineer('e2', 'America/New_York')];
    const shifts = generateShiftsFromStrategy({ strategy: StrategyTemplate.WEEKLY, engineers });
    expect(shifts.every((s) => s.startHour === 9 && s.endHour === 17)).toBe(true);
  });

  it('CUSTOM: defaults to 9→17 shift for every engineer', () => {
    const engineers = [makeEngineer('e1', 'UTC')];
    const shifts = generateShiftsFromStrategy({ strategy: StrategyTemplate.CUSTOM, engineers });
    expect(shifts[0]).toMatchObject({ startHour: 9, endHour: 17 });
  });

  it('returns one shift config per engineer', () => {
    const engineers = [makeEngineer('e1', 'UTC'), makeEngineer('e2', 'UTC'), makeEngineer('e3', 'UTC')];
    const shifts = generateShiftsFromStrategy({ strategy: StrategyTemplate.WEEKLY, engineers });
    expect(shifts).toHaveLength(3);
    expect(shifts.map((s) => s.engineerId)).toEqual(['e1', 'e2', 'e3']);
  });
});
