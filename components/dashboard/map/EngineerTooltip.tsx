'use client';

import { Engineer } from '@/models/engineer';
import { MailIcon, MessageSquareIcon, PhoneIcon } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/shared/ui/avatar';
import { cn } from '@/lib/utils';

interface EngineerTooltipProps {
  engineer: Engineer;
  x: number;
  y: number;
  visible: boolean;
}

export function EngineerTooltip({
  engineer,
  x,
  y,
  visible,
}: EngineerTooltipProps) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        'absolute z-50 pointer-events-none transition-opacity duration-200',
        'w-64 -translate-x-1/2 -translate-y-[calc(100%+16px)]',
      )}
      style={{ left: x, top: y }}
    >
      <div className="relative p-4 rounded-xl border border-gray-200/50 dark:border-zinc-700/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-xl">
        {/* Pointer triangle */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-white/80 dark:bg-zinc-900/80 border-b border-r border-gray-200/50 dark:border-zinc-700/50 backdrop-blur-md" />

        <div className="flex items-start gap-3 relative z-10">
          <Avatar className="w-10 h-10 border border-gray-200 dark:border-zinc-800">
            <AvatarImage src={engineer.avatarUrl} />
            <AvatarFallback>{engineer.name.substring(0, 2)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-zinc-50 truncate">
              {engineer.name}
            </h4>
            <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-1">
              {engineer.role}
            </p>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mb-3 truncate">
              {engineer.location.city}, {engineer.location.country}
            </p>

            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300">
                <MessageSquareIcon className="w-3.5 h-3.5" />
              </span>
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300">
                <PhoneIcon className="w-3.5 h-3.5" />
              </span>
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300">
                <MailIcon className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
