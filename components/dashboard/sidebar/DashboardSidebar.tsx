'use client';

import { useState, useMemo } from 'react';
import { SidebarHeader } from './SidebarHeader';
import { EngineerSearch } from './EngineerSearch';
import { EngineerFilters } from './EngineerFilters';
import { EngineerList } from './EngineerList';
import { engineers as allEngineers } from '@/data/dashboard/engineers';
import { Team, EngineerRole } from '@/models/engineer';

interface DashboardSidebarProps {
  activeEngineerId: string | null;
  onSelectEngineer: (id: string) => void;
}

export function DashboardSidebar({
  activeEngineerId,
  onSelectEngineer,
}: DashboardSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | 'All'>('All');
  const [selectedRole, setSelectedRole] = useState<EngineerRole | 'All'>('All');

  // Filter engineers based on search, team, and role
  const filteredEngineers = useMemo(() => {
    return allEngineers.filter((eng) => {
      // Search filter
      if (
        searchQuery &&
        !eng.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Team filter
      if (selectedTeam !== 'All' && eng.team !== selectedTeam) {
        return false;
      }

      // Role filter
      if (selectedRole !== 'All' && eng.role !== selectedRole) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedTeam, selectedRole]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800">
      <SidebarHeader />
      <EngineerSearch value={searchQuery} onChange={setSearchQuery} />
      <EngineerFilters
        selectedTeam={selectedTeam}
        selectedRole={selectedRole}
        onTeamChange={setSelectedTeam}
        onRoleChange={setSelectedRole}
      />
      <div className="flex-1 min-h-0 overflow-hidden">
        <EngineerList
          engineers={filteredEngineers}
          activeEngineerId={activeEngineerId}
          onSelectEngineer={onSelectEngineer}
        />
      </div>
    </div>
  );
}
