'use client';

import { Engineer, EngineerStatus, EngineerRole } from '@/models/engineer';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/shared/ui/avatar';
import { cn } from '@/lib/utils';
import { MoonIcon, SunIcon } from 'lucide-react';

interface EngineerCardProps {
  engineer: Engineer;
  isActive: boolean;
  onClick: () => void;
}

export function EngineerCard({
  engineer,
  isActive,
  onClick,
}: EngineerCardProps) {
  const isPrimary = engineer.role === EngineerRole.PRIMARY;

  // Format the shift duration string
  const shiftText = `${engineer.location.city}, ${engineer.location.country} • ${engineer.role} 'til ${engineer.shift.end}`;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 text-left transition-all relative group',
        'border-b border-gray-100 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-800/50',
        isActive && [
          'bg-primary-50/50 dark:bg-primary-900/10 border-b-transparent',
          'after:absolute after:inset-x-2 after:-inset-y-[1px] after:border after:border-primary-500 after:rounded-lg',
          'after:shadow-[0_0_15px_rgba(74,222,128,0.2)] after:z-10',
        ],
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0 z-20 pl-2">
        <Avatar
          className={cn(
            'h-10 w-10',
            isActive &&
              'ring-2 ring-primary-500 ring-offset-2 ring-offset-background',
          )}
        >
          <AvatarImage src={engineer.avatarUrl} alt={engineer.name} />
          <AvatarFallback>
            {engineer.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center text-[10px]',
            engineer.status === EngineerStatus.AWAKE
              ? 'bg-green-500'
              : 'bg-gray-400 dark:bg-zinc-600',
            engineer.status === EngineerStatus.DND && 'bg-red-500',
          )}
        >
          {engineer.status === EngineerStatus.SLEEPING && (
            <span className="text-white text-[8px]">zZ</span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 z-20">
        <div className="flex items-baseline justify-between gap-2">
          <h3
            className={cn(
              'font-semibold text-sm truncate',
              isActive
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-900 dark:text-zinc-100',
            )}
          >
            {engineer.name}
          </h3>
          <span className="text-xs shrink-0 text-gray-500 dark:text-zinc-500 font-medium">
            {engineer.team}
          </span>
        </div>
        <p
          className={cn(
            'text-xs truncate mt-0.5',
            isActive && isPrimary
              ? 'text-primary-600 dark:text-primary-500 font-medium'
              : 'text-gray-500 dark:text-zinc-400',
          )}
        >
          {shiftText}
        </p>
      </div>

      {/* Right Icons */}
      <div className="shrink-0 flex items-center gap-1.5 z-20 pr-2">
        {engineer.status === EngineerStatus.AWAKE ? (
          <SunIcon className="w-4 h-4 text-amber-500" />
        ) : (
          <MoonIcon className="w-4 h-4 text-indigo-400" />
        )}
      </div>
    </button>
  );
}
