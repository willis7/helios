'use client';

import { Engineer, StrategyTemplate, RiskWindow } from '@/models/engineer';
import { SunlightTimeline } from './SunlightTimeline';
import { FairnessRadar, ScenarioMetrics } from './FairnessRadar';
import { cn } from '@/lib/utils';

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

interface ScenarioComparisonProps {
  scenarioA: ScenarioConfig;
  scenarioB: ScenarioConfig;
  engineers: Engineer[];
  utcHour: number;
  scenarioAMetrics?: ScenarioMetrics;
  scenarioBMetrics?: ScenarioMetrics;
  className?: string;
}

function getEngineerById({
  engineers,
  id,
}: {
  engineers: Engineer[];
  id: string;
}): Engineer | undefined {
  return engineers.find((e) => e.id === id);
}

function getShiftForEngineer({
  shifts,
  engineerId,
}: {
  shifts: ShiftConfig[];
  engineerId: string;
}): ShiftConfig | undefined {
  return shifts.find((s) => s.engineerId === engineerId);
}

function calculateScenarioMetrics({
  scenario,
  engineers,
}: {
  scenario: ScenarioConfig;
  engineers: Engineer[];
}): ScenarioMetrics {
  let totalWakingHoursCoverage = 0;
  let totalSleepInterruptionRisk = 0;
  let totalWeekendLiability = 0;
  let totalHandoverFriction = 0;
  let engineerCount = 0;

  for (const shift of scenario.shifts) {
    const engineer = getEngineerById({ engineers, id: shift.engineerId });
    if (!engineer) continue;

    engineerCount++;

    const startHour = shift.startHour;
    const endHour = shift.endHour;
    const shiftDuration =
      endHour < startHour ? endHour + 24 - startHour : endHour - startHour;

    const businessHours = Math.max(
      0,
      Math.min(endHour, 18) - Math.max(startHour, 9),
    );
    const wakingHoursCoverage = Math.round(
      (businessHours / shiftDuration) * 100,
    );
    totalWakingHoursCoverage += wakingHoursCoverage;

    const normalizedStart = startHour;
    const normalizedEnd = endHour < startHour ? endHour + 24 : endHour;
    let sleepHours = 0;
    for (let h = normalizedStart; h < normalizedEnd; h++) {
      const hour = h % 24;
      if (hour >= 23 || hour < 7) sleepHours++;
    }
    const sleepInterruptionRisk = Math.round(
      (sleepHours / shiftDuration) * 100,
    );
    totalSleepInterruptionRisk += sleepInterruptionRisk;

    const isWeekendShift = startHour < 8 || endHour > 20;
    const weekendLiability = isWeekendShift ? 100 : 0;
    totalWeekendLiability += weekendLiability;

    const handoverRisk = shiftDuration > 12 ? 80 : shiftDuration > 8 ? 50 : 20;
    totalHandoverFriction += handoverRisk;
  }

  if (engineerCount === 0) {
    return {
      wakingHoursCoverage: 0,
      sleepInterruptionRisk: 0,
      weekendLiability: 0,
      handoverFriction: 0,
    };
  }

  return {
    wakingHoursCoverage: Math.round(totalWakingHoursCoverage / engineerCount),
    sleepInterruptionRisk: Math.round(
      totalSleepInterruptionRisk / engineerCount,
    ),
    weekendLiability: Math.round(totalWeekendLiability / engineerCount),
    handoverFriction: Math.round(totalHandoverFriction / engineerCount),
  };
}

export function ScenarioComparison({
  scenarioA,
  scenarioB,
  engineers,
  utcHour,
  scenarioAMetrics,
  scenarioBMetrics,
  className,
}: ScenarioComparisonProps) {
  const metricsA =
    scenarioAMetrics ??
    calculateScenarioMetrics({ scenario: scenarioA, engineers });
  const metricsB =
    scenarioBMetrics ??
    calculateScenarioMetrics({ scenario: scenarioB, engineers });

  const sortedEngineers = [...engineers].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            Scenario Comparison
          </h2>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>UTC: {utcHour}:00</span>
          </div>
        </div>

        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span className="font-medium text-foreground">
                {scenarioA.name}
              </span>
              <span className="text-xs text-muted-foreground">
                ({scenarioA.strategy})
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {sortedEngineers.map((engineer) => {
                const shift = getShiftForEngineer({
                  shifts: scenarioA.shifts,
                  engineerId: engineer.id,
                });
                if (!shift) return null;

                return (
                  <SunlightTimeline
                    key={`${scenarioA.name}-${engineer.id}`}
                    engineer={engineer}
                    shiftStartHour={shift.startHour}
                    shiftEndHour={shift.endHour}
                    scenarioName={scenarioA.name}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-secondary" />
              <span className="font-medium text-foreground">
                {scenarioB.name}
              </span>
              <span className="text-xs text-muted-foreground">
                ({scenarioB.strategy})
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {sortedEngineers.map((engineer) => {
                const shift = getShiftForEngineer({
                  shifts: scenarioB.shifts,
                  engineerId: engineer.id,
                });
                if (!shift) return null;

                return (
                  <SunlightTimeline
                    key={`${scenarioB.name}-${engineer.id}`}
                    engineer={engineer}
                    shiftStartHour={shift.startHour}
                    shiftEndHour={shift.endHour}
                    scenarioName={scenarioB.name}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <FairnessRadar
        scenarioA={metricsA}
        scenarioB={metricsB}
        scenarioAName={scenarioA.name}
        scenarioBName={scenarioB.name}
      />
    </div>
  );
}
