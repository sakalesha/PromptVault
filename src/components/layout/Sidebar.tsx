import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Sparkles, LayoutGrid, Hash, Settings, Plus, X, Star, Pipette, BarChart3, Moon, Sun, LayoutTemplate } from 'lucide-react';
import { Button } from '../ui/Button';
import { Team, Category } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../services/api';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { cn } from '../../utils/cn';
import { TeamSelector } from './TeamSelector';
import toast from 'react-hot-toast';

interface SidebarProps {
  categories: Category[];
  teams: Team[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  onSelectAnalytics: () => void;
  isAnalyticsSelected: boolean;
  selectedTeamId: string | null;
  onSelectTeam: (teamId: string | null) => void;
  onManageTeam: () => void;
  onCreateTeam: () => void;
  onOpenSettings: () => void;
  showTemplatesOnly: boolean;
  onToggleTemplates: (show: boolean) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ 
  categories, 
  teams,
  selectedCategory, 
  onSelectCategory, 
  onSelectAnalytics, 
  isAnalyticsSelected,
  selectedTeamId,
  onSelectTeam,
  onManageTeam,
  onCreateTeam,
  onOpenSettings,
  showTemplatesOnly,
  onToggleTemplates,
  theme,
  toggleTheme,
  isOpen,
  onClose
}: SidebarProps) {
  const { currentUser, logout } = useAuth();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#ffffff');
  const colorInputRef = useRef<HTMLInputElement>(null);

  const PRESET_COLORS = ['#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];

  const handleCreateCategory = async () => {
    if (!currentUser || !newCategoryName) return;

    try {
      await apiFetch('/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: newCategoryName,
          color: newCategoryColor,
          teamId: selectedTeamId || null
        })
      });
      toast.success('Category created');
      setIsCategoryModalOpen(false);
      setNewCategoryName('');
      setNewCategoryColor('#ffffff');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create category');
    }
  };

  return (
    <AnimatePresence mode="wait">
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 border-r border-border-subtle flex flex-col bg-bg-sidebar shrink-0 transition-transform duration-300 lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-text-heading tracking-tight">PromptVault</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </motion.div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <TeamSelector
            teams={teams}
            selectedTeamId={selectedTeamId}
            onSelectTeam={onSelectTeam}
            onManageTeams={onManageTeam}
            onCreateTeam={onCreateTeam}
          />
        </motion.div>

        <div className="px-4 py-2 mb-4">
          <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => onToggleTemplates(false)}
              className={cn(
                "flex-1 px-3 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
                !showTemplatesOnly ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
              )}
            >
              All
            </button>
            <button
              onClick={() => onToggleTemplates(true)}
              className={cn(
                "flex-1 px-3 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2",
                showTemplatesOnly ? 'bg-indigo-500 text-white' : 'text-zinc-500 hover:text-white'
              )}
            >
              <LayoutTemplate className="w-3 h-3" />
              Templates
            </button>
          </div>
        </div>

        <div className="space-y-1 mb-8">
          {[
            { id: null, label: 'All Prompts', icon: LayoutGrid, color: '' },
            { id: 'favorites', label: 'Favorites', icon: Star, color: 'text-amber-400 hover:text-amber-300' },
            { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-indigo-400 hover:text-indigo-300' }
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <Button 
                variant={(item.id === 'analytics' ? isAnalyticsSelected : selectedCategory === item.id) ? 'secondary' : 'ghost'} 
                className={cn("w-full justify-start", item.color)}
                onClick={() => {
                  if (item.id === 'analytics') {
                    onSelectAnalytics();
                  } else {
                    onSelectCategory(item.id);
                  }
                }}
              >
                <item.icon className={cn("w-4 h-4 mr-3", item.id === 'favorites' && selectedCategory === 'favorites' && "fill-amber-400")} />
                {item.label}
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="mb-4 px-2">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between mb-4"
          >
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Categories</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => setIsCategoryModalOpen(true)}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </motion.div>
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                >
                  <Button
                    variant={selectedCategory === category.name ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => {
                      onSelectCategory(category.name);
                      onToggleTemplates(false);
                    }}
                  >
                    <Hash className="w-4 h-4 mr-3" style={{ color: category.color }} />
                    {category.name}
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-4 border-t border-border-subtle space-y-2"
      >
        <Button 
          variant="ghost" 
          className="w-full justify-start text-text-muted hover:text-text-heading"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 mr-3" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 mr-3" />
              Dark Mode
            </>
          )}
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-text-muted hover:text-text-heading"
          onClick={onOpenSettings}
        >
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:bg-red-500/10"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </motion.div>

      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="New Category"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Name</label>
            <Input 
              placeholder="e.g. Writing, Coding" 
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    newCategoryColor === color ? "border-white scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewCategoryColor(color)}
                />
              ))}
              <div className="relative">
                <input
                  ref={colorInputRef}
                  type="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="absolute inset-0 opacity-0 w-8 h-8 cursor-pointer"
                />
                <button
                  onClick={() => colorInputRef.current?.click()}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                    !PRESET_COLORS.includes(newCategoryColor) 
                      ? "border-white scale-110" 
                      : "border-white/10 hover:border-white/30"
                  )}
                  style={{ backgroundColor: !PRESET_COLORS.includes(newCategoryColor) ? newCategoryColor : 'transparent' }}
                >
                  <Pipette className={cn(
                    "w-3 h-3",
                    !PRESET_COLORS.includes(newCategoryColor) ? "text-black mix-blend-difference" : "text-zinc-500"
                  )} />
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCategory} disabled={!newCategoryName}>Create</Button>
          </div>
        </div>
      </Modal>
    </aside>
  </AnimatePresence>
);
}
