'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/ui/select';
import { FilterIcon } from 'lucide-react';
import { Team, EngineerRole } from '@/models/engineer';

interface EngineerFiltersProps {
  selectedTeam: Team | 'All';
  selectedRole: EngineerRole | 'All';
  onTeamChange: (team: Team | 'All') => void;
  onRoleChange: (role: EngineerRole | 'All') => void;
}

export function EngineerFilters({
  selectedTeam,
  selectedRole,
  onTeamChange,
  onRoleChange,
}: EngineerFiltersProps) {
  return (
    <div className="flex items-center gap-2 px-4 pb-3 border-b border-gray-200 dark:border-zinc-800 overflow-x-auto no-scrollbar">
      <Select
        value={selectedTeam}
        onValueChange={(val: Team | 'All') => onTeamChange(val)}
      >
        <SelectTrigger className="h-8 w-[130px] text-xs bg-transparent dark:bg-zinc-900 border-gray-200 dark:border-zinc-700">
          <SelectValue placeholder="Team" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Teams</SelectItem>
          {Object.values(Team).map((team) => (
            <SelectItem key={team} value={team}>
              {team}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedRole}
        onValueChange={(val: EngineerRole | 'All') => onRoleChange(val)}
      >
        <SelectTrigger className="h-8 w-[130px] text-xs bg-transparent dark:bg-zinc-900 border-gray-200 dark:border-zinc-700">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Roles</SelectItem>
          {Object.values(EngineerRole).map((role) => (
            <SelectItem key={role} value={role}>
              {role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button
        className="flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium text-gray-600 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors ml-auto shrink-0"
        aria-label="More filters"
      >
        <FilterIcon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">More</span>
      </button>
    </div>
  );
}
