import * as React from 'react';
import { useState } from 'react';
import { Users, ChevronDown, Plus, Settings, User, Check } from 'lucide-react';
import { Team } from '../../types';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface TeamSelectorProps {
  teams: Team[];
  selectedTeamId: string | null;
  onSelectTeam: (teamId: string | null) => void;
  onManageTeams: () => void;
  onCreateTeam: () => void;
}

export function TeamSelector({ teams, selectedTeamId, onSelectTeam, onManageTeams, onCreateTeam }: TeamSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedTeam = teams.find(t => t.id === selectedTeamId);

  return (
    <div className="relative mb-6 px-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200",
          isOpen 
            ? "bg-white/10 border-white/20 shadow-lg" 
            : "bg-zinc-900/50 border-white/5 hover:bg-white/5 hover:border-white/10"
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
            selectedTeamId ? "bg-indigo-500/20 text-indigo-400" : "bg-zinc-800 text-zinc-400"
          )}>
            {selectedTeamId ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
          </div>
          <div className="flex flex-col items-start min-w-0">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">Workspace</span>
            <span className="text-sm font-semibold text-white truncate w-full">
              {selectedTeamId ? selectedTeam?.name : 'Personal Library'}
            </span>
          </div>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-zinc-500 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-2 space-y-1">
              <button
                onClick={() => {
                  onSelectTeam(null);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors",
                  !selectedTeamId ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4" />
                  Personal Library
                </div>
                {!selectedTeamId && <Check className="w-3.5 h-3.5" />}
              </button>

              <div className="h-px bg-white/5 my-2" />
              
              <div className="px-2 py-1">
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Shared Teams</span>
              </div>

              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => {
                    onSelectTeam(team.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors",
                    selectedTeamId === team.id ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4" />
                    {team.name}
                  </div>
                  {selectedTeamId === team.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}

              <div className="h-px bg-white/5 my-2" />

              <button
                onClick={() => {
                  onCreateTeam();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 p-2 rounded-lg text-sm text-indigo-400 hover:bg-indigo-500/10 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create New Team
              </button>

              {selectedTeamId && (
                <button
                  onClick={() => {
                    onManageTeams();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-lg text-sm text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Team Settings
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
