'use client';

import { ThemeSwitch } from '@/components/shared/ThemeSwitch';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';

export function SidebarHeader() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 transition-colors"
          aria-label="Back"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center font-bold text-gray-900 dark:text-zinc-950">
            H
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
            On-Call
          </span>
        </div>
      </div>
      <div>
        <ThemeSwitch />
      </div>
    </div>
  );
}
