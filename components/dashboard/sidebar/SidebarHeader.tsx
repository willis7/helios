'use client';

import { ThemeSwitch } from '@/components/shared/ThemeSwitch';
import { ArrowLeftIcon, BarChart3Icon } from 'lucide-react';
import Link from 'next/link';

export function SidebarHeader() {
  return (
    <div className="flex flex-col gap-4 p-4 border-b border-gray-200 dark:border-zinc-800">
      <div className="flex items-center justify-between">
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
      <Link
        href="/model"
        className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 transition-colors text-sm font-medium"
      >
        <BarChart3Icon className="w-4 h-4" />
        <span>Modeling</span>
      </Link>
    </div>
  );
}
