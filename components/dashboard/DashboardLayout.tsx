'use client';

import { useState } from 'react';
import { DashboardSidebar } from './sidebar/DashboardSidebar';
import { GlobalMap } from './map/GlobalMap';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from '@/components/shared/ui/drawer';
import { MenuIcon } from 'lucide-react';
import { ThemeSwitch } from '@/components/shared/ThemeSwitch';

export function DashboardLayout() {
  const [activeEngineerId, setActiveEngineerId] = useState<string | null>(null);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground transition-colors">
      {/* Desktop Sidebar (Fixed 320px) */}
      <div className="hidden md:block w-[320px] shrink-0 h-full border-r border-gray-200 dark:border-zinc-800">
        <DashboardSidebar
          activeEngineerId={activeEngineerId}
          onSelectEngineer={setActiveEngineerId}
        />
      </div>

      {/* Mobile Header Overlay */}
      <div className="md:hidden absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
        <Drawer>
          <DrawerTrigger asChild>
            <button className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-md">
              <MenuIcon className="w-5 h-5 text-gray-900 dark:text-zinc-100" />
            </button>
          </DrawerTrigger>
          <DrawerContent className="h-[85vh]">
            <div className="h-full overflow-hidden">
              <DashboardSidebar
                activeEngineerId={activeEngineerId}
                onSelectEngineer={setActiveEngineerId}
              />
            </div>
          </DrawerContent>
        </Drawer>

        <div className="pointer-events-auto bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-full px-2 py-1 border border-gray-200 dark:border-zinc-800 shadow-md">
          <ThemeSwitch />
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 h-full relative">
        <GlobalMap
          activeEngineerId={activeEngineerId}
          onSelectEngineer={setActiveEngineerId}
        />
      </div>
    </div>
  );
}
