'use client';

import { Engineer } from '@/models/engineer';
import { EngineerCard } from './EngineerCard';
import { ScrollArea } from '@/components/shared/ui/scroll-area';

interface EngineerListProps {
  engineers: Engineer[];
  activeEngineerId: string | null;
  onSelectEngineer: (id: string) => void;
}

export function EngineerList({
  engineers,
  activeEngineerId,
  onSelectEngineer,
}: EngineerListProps) {
  if (engineers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 dark:text-zinc-500">
        <p>No engineers found matching your filters.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="flex flex-col">
        {engineers.map((eng) => (
          <EngineerCard
            key={eng.id}
            engineer={eng}
            isActive={eng.id === activeEngineerId}
            onClick={() => onSelectEngineer(eng.id)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
