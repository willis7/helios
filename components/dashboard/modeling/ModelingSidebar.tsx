'use client';

import { useState, useCallback } from 'react';
import { StrategyTemplate, RiskWindow } from '@/models/engineer';
import { StrategySelector } from './StrategySelector';
import { TimeSlider } from './TimeSlider';
import { RiskHeatmap } from './RiskHeatmap';
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { Label } from '@/components/shared/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/shared/ui/card';
import { cn } from '@/lib/utils';

interface ModelingSidebarProps {
  scenarioAStrategy: StrategyTemplate;
  scenarioBStrategy: StrategyTemplate;
  riskWindows: RiskWindow[];
  handoverHour: number;
  onScenarioAStrategyChange: ({
    strategy,
  }: {
    strategy: StrategyTemplate;
  }) => void;
  onScenarioBStrategyChange: ({
    strategy,
  }: {
    strategy: StrategyTemplate;
  }) => void;
  onRiskWindowsChange: ({ windows }: { windows: RiskWindow[] }) => void;
  onHandoverHourChange: ({ utcHour }: { utcHour: number }) => void;
  className?: string;
}

const DEFAULT_RISK_WINDOWS: RiskWindow[] = [
  { startHour: 22, endHour: 6, probability: 0.7, label: 'Night Risk' },
  { startHour: 12, endHour: 14, probability: 0.4, label: 'Lunch Gap' },
];

export function ModelingSidebar({
  scenarioAStrategy,
  scenarioBStrategy,
  riskWindows,
  handoverHour,
  onScenarioAStrategyChange,
  onScenarioBStrategyChange,
  onRiskWindowsChange,
  onHandoverHourChange,
  className,
}: ModelingSidebarProps) {
  const [localRiskWindows, setLocalRiskWindows] =
    useState<RiskWindow[]>(riskWindows);
  const [newWindowLabel, setNewWindowLabel] = useState('');
  const [newWindowStart, setNewWindowStart] = useState('');
  const [newWindowEnd, setNewWindowEnd] = useState('');
  const [newWindowProbability, setNewWindowProbability] = useState('');

  const handleAddWindow = useCallback(() => {
    const start = parseInt(newWindowStart, 10);
    const end = parseInt(newWindowEnd, 10);
    const probability = parseFloat(newWindowProbability);

    if (
      isNaN(start) ||
      isNaN(end) ||
      isNaN(probability) ||
      start < 0 ||
      start > 23 ||
      end < 0 ||
      end > 23 ||
      probability < 0 ||
      probability > 1
    ) {
      return;
    }

    const newWindow: RiskWindow = {
      startHour: start,
      endHour: end,
      probability,
      label: newWindowLabel || `Window ${localRiskWindows.length + 1}`,
    };

    const updatedWindows = [...localRiskWindows, newWindow];
    setLocalRiskWindows(updatedWindows);
    onRiskWindowsChange({ windows: updatedWindows });

    setNewWindowLabel('');
    setNewWindowStart('');
    setNewWindowEnd('');
    setNewWindowProbability('');
  }, [
    newWindowLabel,
    newWindowStart,
    newWindowEnd,
    newWindowProbability,
    localRiskWindows,
    onRiskWindowsChange,
  ]);

  const handleRemoveWindow = useCallback(
    ({ index }: { index: number }) => {
      const updatedWindows = localRiskWindows.filter((_, i) => i !== index);
      setLocalRiskWindows(updatedWindows);
      onRiskWindowsChange({ windows: updatedWindows });
    },
    [localRiskWindows, onRiskWindowsChange],
  );

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 overflow-y-auto',
        className,
      )}
    >
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-foreground">
          Model Configuration
        </h2>
        <p className="text-sm text-muted-foreground">
          Configure strategies and risk parameters
        </p>
      </div>

      <div className="flex flex-col gap-6 p-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Scenario A</CardTitle>
          </CardHeader>
          <CardContent>
            <StrategySelector
              value={scenarioAStrategy}
              onStrategyChange={onScenarioAStrategyChange}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Scenario B</CardTitle>
          </CardHeader>
          <CardContent>
            <StrategySelector
              value={scenarioBStrategy}
              onStrategyChange={onScenarioBStrategyChange}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Risk Windows</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {localRiskWindows.length > 0 && (
              <div className="flex flex-col gap-3">
                <RiskHeatmap riskWindows={localRiskWindows} />
                <div className="flex flex-col gap-2">
                  {localRiskWindows.map((window, index) => (
                    <div
                      key={`${window.label}-${index}`}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {window.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {window.startHour}:00 - {window.endHour}:00 (
                          {Math.round(window.probability * 100)}% risk)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveWindow({ index })}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 border-t border-border">
              <span className="text-sm font-medium text-foreground">
                Add New Window
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <Label htmlFor="window-label" className="text-xs">
                    Label
                  </Label>
                  <Input
                    id="window-label"
                    placeholder="e.g., Night Risk"
                    value={newWindowLabel}
                    onChange={(e) => setNewWindowLabel(e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="window-start" className="text-xs">
                    Start Hour (0-23)
                  </Label>
                  <Input
                    id="window-start"
                    type="number"
                    min={0}
                    max={23}
                    placeholder="22"
                    value={newWindowStart}
                    onChange={(e) => setNewWindowStart(e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="window-end" className="text-xs">
                    End Hour (0-23)
                  </Label>
                  <Input
                    id="window-end"
                    type="number"
                    min={0}
                    max={23}
                    placeholder="6"
                    value={newWindowEnd}
                    onChange={(e) => setNewWindowEnd(e.target.value)}
                    className="h-8"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="window-probability" className="text-xs">
                    Probability (0.0-1.0)
                  </Label>
                  <Input
                    id="window-probability"
                    type="number"
                    min={0}
                    max={1}
                    step={0.1}
                    placeholder="0.7"
                    value={newWindowProbability}
                    onChange={(e) => setNewWindowProbability(e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
              <Button
                onClick={handleAddWindow}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Add Window
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Handover Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeSlider value={handoverHour} onChange={onHandoverHourChange} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
