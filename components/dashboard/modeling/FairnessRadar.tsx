'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { cn } from '@/lib/utils';

export interface ScenarioMetrics {
  wakingHoursCoverage: number; // 0-100, higher = better
  sleepInterruptionRisk: number; // 0-100, lower = better
  weekendLiability: number; // 0-100, lower = better
  handoverFriction: number; // 0-100, lower = better
}

interface FairnessRadarProps {
  scenarioA: ScenarioMetrics;
  scenarioB: ScenarioMetrics;
  scenarioAName?: string;
  scenarioBName?: string;
  className?: string;
}

const METRICS = [
  { key: 'wakingHoursCoverage', label: 'Waking Hours Coverage', fullMark: 100 },
  {
    key: 'sleepInterruptionRisk',
    label: 'Sleep Interruption Risk',
    fullMark: 100,
  },
  { key: 'weekendLiability', label: 'Weekend Liability', fullMark: 100 },
  { key: 'handoverFriction', label: 'Handover Friction', fullMark: 100 },
] as const;

const COLORS = {
  scenarioA: '#22c55e', // primary.main (green)
  scenarioB: '#10b981', // secondary.main (emerald)
  scenarioAFill: 'rgba(34, 197, 94, 0.2)',
  scenarioBFill: 'rgba(16, 185, 129, 0.2)',
};

function transformToChartData({
  scenarioA,
  scenarioB,
}: {
  scenarioA: ScenarioMetrics;
  scenarioB: ScenarioMetrics;
}) {
  return METRICS.map((metric) => ({
    metric: metric.label,
    scenarioA: scenarioA[metric.key],
    scenarioB: scenarioB[metric.key],
    fullMark: metric.fullMark,
  }));
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { metric: string } }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
      <p className="font-medium text-foreground mb-2">
        {payload[0].payload.metric}
      </p>
      <div className="flex flex-col gap-1">
        {payload.map((entry) => (
          <div
            key={entry.name}
            className="flex items-center justify-between gap-4"
          >
            <span className="text-muted-foreground capitalize">
              {entry.name}
            </span>
            <span
              className="font-mono font-medium"
              style={{
                color:
                  entry.name === 'scenarioA'
                    ? COLORS.scenarioA
                    : COLORS.scenarioB,
              }}
            >
              {entry.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FairnessRadar({
  scenarioA,
  scenarioB,
  scenarioAName = 'Scenario A',
  scenarioBName = 'Scenario B',
  className,
}: FairnessRadarProps) {
  const data = transformToChartData({ scenarioA, scenarioB });

  return (
    <div
      className={cn(
        'flex flex-col gap-4 p-4 bg-card rounded-lg border',
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-foreground">
          Fairness Comparison
        </h3>
        <p className="text-sm text-muted-foreground">
          Compare on-call burden metrics between scenarios
        </p>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              axisLine={false}
            />
            <Radar
              name={scenarioAName}
              dataKey="scenarioA"
              stroke={COLORS.scenarioA}
              fill={COLORS.scenarioAFill}
              strokeWidth={2}
            />
            <Radar
              name={scenarioBName}
              dataKey="scenarioB"
              stroke={COLORS.scenarioB}
              fill={COLORS.scenarioBFill}
              strokeWidth={2}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-xs text-muted-foreground">{value}</span>
              )}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="flex flex-col gap-2 p-3 rounded-md bg-muted/50">
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: COLORS.scenarioA }}
            />
            <span className="font-medium text-foreground">{scenarioAName}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
            <span>Waking Hours:</span>
            <span className="font-mono text-foreground">
              {scenarioA.wakingHoursCoverage}%
            </span>
            <span>Sleep Risk:</span>
            <span className="font-mono text-foreground">
              {scenarioA.sleepInterruptionRisk}%
            </span>
            <span>Weekend:</span>
            <span className="font-mono text-foreground">
              {scenarioA.weekendLiability}%
            </span>
            <span>Handover:</span>
            <span className="font-mono text-foreground">
              {scenarioA.handoverFriction}%
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 p-3 rounded-md bg-muted/50">
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: COLORS.scenarioB }}
            />
            <span className="font-medium text-foreground">{scenarioBName}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
            <span>Waking Hours:</span>
            <span className="font-mono text-foreground">
              {scenarioB.wakingHoursCoverage}%
            </span>
            <span>Sleep Risk:</span>
            <span className="font-mono text-foreground">
              {scenarioB.sleepInterruptionRisk}%
            </span>
            <span>Weekend:</span>
            <span className="font-mono text-foreground">
              {scenarioB.weekendLiability}%
            </span>
            <span>Handover:</span>
            <span className="font-mono text-foreground">
              {scenarioB.handoverFriction}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sample data for demonstration
export const SAMPLE_SCENARIO_A: ScenarioMetrics = {
  wakingHoursCoverage: 85,
  sleepInterruptionRisk: 25,
  weekendLiability: 30,
  handoverFriction: 20,
};

export const SAMPLE_SCENARIO_B: ScenarioMetrics = {
  wakingHoursCoverage: 65,
  sleepInterruptionRisk: 45,
  weekendLiability: 55,
  handoverFriction: 40,
};
