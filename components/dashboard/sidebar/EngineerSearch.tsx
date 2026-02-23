'use client';

import { SearchIcon } from 'lucide-react';

interface EngineerSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function EngineerSearch({ value, onChange }: EngineerSearchProps) {
  return (
    <div className="px-4 py-3">
      <div className="relative w-full">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-zinc-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search engineers..."
          className="w-full h-10 pl-9 pr-4 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-full text-sm text-gray-900 dark:text-zinc-100 placeholder:text-gray-500 dark:placeholder:text-zinc-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-colors"
        />
      </div>
    </div>
  );
}
