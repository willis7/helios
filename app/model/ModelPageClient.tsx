'use client';

import { useState, useCallback, useMemo } from 'react';
import { ModelingSidebar } from '@/components/dashboard/modeling/ModelingSidebar';
import { ScenarioComparison } from '@/components/dashboard/modeling/ScenarioComparison';
import { StrategyTemplate, RiskWindow, Engineer } from '@/models/engineer';
import { engineers as allEngineers } from '@/data/dashboard/engineers';
import { ThemeSwitch } from '@/components/shared/ThemeSwitch';
import { MenuIcon } from 'lucide-react';

interface ShiftConfig {
  engineerId: string;
  startHour: number;
  endHour: number;
}

interface ScenarioConfig {
  name: string;
  strategy: StrategyTemplate;
  shifts: ShiftConfig[];
  riskWindows: RiskWindow[];
}

const DEFAULT_RISK_WINDOWS: RiskWindow[] = [
  { startHour: 22, endHour: 6, probability: 0.7, label: 'Night Risk' },
  { startHour: 12, endHour: 14, probability: 0.4, label: 'Lunch Gap' },
];

function getTimezoneOffsetHours({ timezone }: { timezone: string }): number {
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
  let offsetMinutes = hour * 60 + minute - (utcHour * 60 + utcMinute);
  if (offsetMinutes > 12 * 60) offsetMinutes -= 24 * 60;
  if (offsetMinutes < -12 * 60) offsetMinutes += 24 * 60;
  return offsetMinutes / 60;
}

function generateShiftsFromStrategy({
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
        const offsetHours = getTimezoneOffsetHours({
          timezone: engineer.shift.timezone,
        });
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

    return {
      engineerId: engineer.id,
      startHour,
      endHour,
    };
  });
}

export function ModelPageClient() {
  const [scenarioAStrategy, setScenarioAStrategy] = useState<StrategyTemplate>(
    StrategyTemplate.FOLLOW_SUN,
  );
  const [scenarioBStrategy, setScenarioBStrategy] = useState<StrategyTemplate>(
    StrategyTemplate.TWELVE_HOUR,
  );
  const [riskWindows, setRiskWindows] =
    useState<RiskWindow[]>(DEFAULT_RISK_WINDOWS);
  const [utcHour, setUtcHour] = useState<number>(12);

  const scenarioAShifts = useMemo(
    () =>
      generateShiftsFromStrategy({
        strategy: scenarioAStrategy,
        engineers: allEngineers,
      }),
    [scenarioAStrategy],
  );

  const scenarioBShifts = useMemo(
    () =>
      generateShiftsFromStrategy({
        strategy: scenarioBStrategy,
        engineers: allEngineers,
      }),
    [scenarioBStrategy],
  );

  const scenarioA: ScenarioConfig = useMemo(
    () => ({
      name: 'Scenario A',
      strategy: scenarioAStrategy,
      shifts: scenarioAShifts,
      riskWindows,
    }),
    [scenarioAStrategy, scenarioAShifts, riskWindows],
  );

  const scenarioB: ScenarioConfig = useMemo(
    () => ({
      name: 'Scenario B',
      strategy: scenarioBStrategy,
      shifts: scenarioBShifts,
      riskWindows,
    }),
    [scenarioBStrategy, scenarioBShifts, riskWindows],
  );

  const handleScenarioAStrategyChange = useCallback(
    ({ strategy }: { strategy: StrategyTemplate }) => {
      setScenarioAStrategy(strategy);
    },
    [],
  );

  const handleScenarioBStrategyChange = useCallback(
    ({ strategy }: { strategy: StrategyTemplate }) => {
      setScenarioBStrategy(strategy);
    },
    [],
  );

  const handleRiskWindowsChange = useCallback(
    ({ windows }: { windows: RiskWindow[] }) => {
      setRiskWindows(windows);
    },
    [],
  );

  const handleHandoverHourChange = useCallback(
    ({ utcHour: hour }: { utcHour: number }) => {
      setUtcHour(hour);
    },
    [],
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-[320px] shrink-0 h-full border-r border-gray-200 dark:border-zinc-800">
        <ModelingSidebar
          scenarioAStrategy={scenarioAStrategy}
          scenarioBStrategy={scenarioBStrategy}
          riskWindows={riskWindows}
          handoverHour={utcHour}
          onScenarioAStrategyChange={handleScenarioAStrategyChange}
          onScenarioBStrategyChange={handleScenarioBStrategyChange}
          onRiskWindowsChange={handleRiskWindowsChange}
          onHandoverHourChange={handleHandoverHourChange}
        />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
        <button className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-md">
          <MenuIcon className="w-5 h-5 text-gray-900 dark:text-zinc-100" />
        </button>
        <div className="pointer-events-auto bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-full px-2 py-1 border border-gray-200 dark:border-zinc-800 shadow-md">
          <ThemeSwitch />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-y-auto">
        <div className="p-6 pt-16 md:pt-6">
          <ScenarioComparison
            scenarioA={scenarioA}
            scenarioB={scenarioB}
            engineers={allEngineers}
            utcHour={utcHour}
          />
        </div>
      </div>
    </div>
  );
}
