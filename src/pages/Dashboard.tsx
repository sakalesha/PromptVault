import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../services/api';
import { useCallback } from 'react';
import { Prompt, Category, UserSettings, Team } from '../types';
import { Sidebar } from '../components/layout/Sidebar';
import { PromptCard } from '../components/PromptCard';
import { PromptEditor } from '../components/PromptEditor';
import { PromptHistory } from '../components/PromptHistory';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { ShareModal } from '../components/ShareModal';
import { PromptGenerator } from '../components/PromptGenerator';
import { TeamManagement } from '../components/TeamManagement';
import { InvitationHandler } from '../components/InvitationHandler';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Plus, Search, Filter, Trash2, Tag, X, CheckSquare, Square, Calendar, LayoutTemplate, Download, Upload, Sparkles, ArrowUpDown, Copy, Menu } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

interface DashboardProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export function Dashboard({ theme, toggleTheme }: DashboardProps) {
  const { currentUser } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplatesOnly, setShowTemplatesOnly] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [promptToDelete, setPromptToDelete] = useState<Prompt | null>(null);
  const [historyPrompt, setHistoryPrompt] = useState<Prompt | null>(null);
  const [sharingPrompt, setSharingPrompt] = useState<Prompt | null>(null);
  const [previewPrompt, setPreviewPrompt] = useState<Prompt | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isTeamManagementOpen, setIsTeamManagementOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'top' | 'copies'>('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  
  // Bulk Actions State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkCategoryModalOpen, setIsBulkCategoryModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  
  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const qs = selectedTeamId ? `?teamId=${selectedTeamId}` : '';
      const [promptsData, categoriesData, teamsData] = await Promise.all([
        apiFetch('/prompts' + qs),
        apiFetch('/categories' + qs),
        apiFetch('/teams')
      ]);
      if (Array.isArray(promptsData)) setPrompts(promptsData);
      if (Array.isArray(categoriesData)) setCategories(categoriesData);
      if (Array.isArray(teamsData)) setTeams(teamsData);
    } catch (err) {
      console.error(err);
    }
  }, [selectedTeamId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!currentUser) return;
    apiFetch('/settings').then(data => {
      if (data && Object.keys(data).length > 0) setUserSettings(data);
    }).catch(console.error);
  }, []);


  const filteredPrompts = prompts.filter(p => {
    const matchesCategory = selectedCategory === 'favorites' 
      ? p.isFavorite 
      : (!selectedCategory || p.category === selectedCategory);
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTemplate = !showTemplatesOnly || p.isTemplate;
    const matchesTags = selectedTags.size === 0 || 
                       (p.tags && p.tags.some(tag => selectedTags.has(tag)));
    return matchesCategory && matchesSearch && matchesTemplate && matchesTags;
  });

  const sortedPrompts = [...filteredPrompts].sort((a, b) => {
    if (sortBy === 'newest') return (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0);
    if (sortBy === 'oldest') return (a.updatedAt?.toMillis() || 0) - (b.updatedAt?.toMillis() || 0);
    if (sortBy === 'top') return (b.score || 0) - (a.score || 0);
    if (sortBy === 'copies') return (b.copyCount || 0) - (a.copyCount || 0);
    return 0;
  });

  const allTags = Array.from(new Set(prompts.flatMap(p => p.tags || []))).sort();

  const toggleTag = (tag: string) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setSelectedTags(newTags);
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredPrompts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPrompts.map(p => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(Array.from(selectedIds).map(id => apiFetch(`/prompts/${id}`, { method: 'DELETE' })));
      fetchData();
      toast.success(`Deleted ${selectedIds.size} prompts`);
      setSelectedIds(new Set());
      setIsBulkDeleteModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete prompts');
    }
  };

  const handleBulkChangeCategory = async (categoryName: string) => {
    try {
      await Promise.all(Array.from(selectedIds).map(id => apiFetch(`/prompts/${id}`, { method: 'PUT', body: JSON.stringify({ category: categoryName }) })));
      fetchData();
      toast.success(`Updated ${selectedIds.size} prompts`);
      setSelectedIds(new Set());
      setIsBulkCategoryModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update prompts');
    }
  };

  const handleTogglePublic = async (isPublic: boolean) => {
    if (!sharingPrompt) return;
    try {
      await apiFetch(`/prompts/${sharingPrompt.id}`, { method: 'PUT', body: JSON.stringify({ isPublic }) });
      fetchData();
      setSharingPrompt({ ...sharingPrompt, isPublic });
      toast.success(isPublic ? 'Prompt is now public' : 'Prompt is now private');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update visibility');
    }
  };

  const handleSavePrompt = async (data: Partial<Prompt>) => {
    if (!currentUser) return;

    try {
      if (editingPrompt && editingPrompt.id) {
        // Save current version before updating
        await apiFetch(`/prompts/${editingPrompt.id}`, { method: 'PUT', body: JSON.stringify(data) });
        fetchData();
        toast.success('Prompt updated');
      } else {
        await apiFetch('/prompts', { method: 'POST', body: JSON.stringify({ ...data, teamId: selectedTeamId || null }) });
        fetchData();
        toast.success('Prompt created');
      }
      setIsEditorOpen(false);
      setEditingPrompt(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save prompt');
    }
  };

  const handleAutosavePrompt = async (data: Partial<Prompt>) => {
    if (!currentUser || !editingPrompt?.id) return;

    try {
      await apiFetch(`/prompts/${editingPrompt.id}`, { method: 'PUT', body: JSON.stringify(data) });
      fetchData();
    } catch (error) {
      console.error('Autosave error:', error);
    }
  };

  const handleDeletePrompt = async () => {
    if (!promptToDelete) return;

    try {
      await apiFetch(`/prompts/${promptToDelete.id}`, { method: 'DELETE' });
      fetchData();
      toast.success('Prompt deleted');
      setPromptToDelete(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete prompt');
    }
  };

  const handleVote = async (prompt: Prompt, voteValue: number) => {
    if (!currentUser) return;
    const userId = currentUser.uid;
    const currentVotes = prompt.userVotes || {};
    const currentVote = currentVotes[userId] || 0;

    let newScore = (prompt.score || 0);
    const newVotes = { ...currentVotes };

    if (currentVote === voteValue) {
      // Remove vote
      newScore -= voteValue;
      delete newVotes[userId];
    } else {
      // Change or add vote
      newScore = newScore - currentVote + voteValue;
      newVotes[userId] = voteValue;
    }

    try {
      await apiFetch(`/prompts/${prompt.id}`, { method: 'PUT', body: JSON.stringify({ score: newScore, userVotes: newVotes }) });
      fetchData();
    } catch (error) {
      console.error('Failed to vote:', error);
      toast.error('Failed to register vote');
    }
  };

  const handleToggleFavorite = async (prompt: Prompt) => {
    try {
      await apiFetch(`/prompts/${prompt.id}`, { method: 'PUT', body: JSON.stringify({ isFavorite: !prompt.isFavorite }) });
      fetchData();
      toast.success(prompt.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update favorite status');
    }
  };

  const handleSaveSettings = async (newSettings: UserSettings) => {
    if (!currentUser) return;
    try {
      await apiFetch('/settings', { method: 'PUT', body: JSON.stringify(newSettings) });
      setUserSettings(newSettings);
      toast.success('Settings saved');
      setIsSettingsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save settings');
    }
  };

  const handleUseTemplate = async (template: Prompt) => {
    try {
      await apiFetch(`/prompts/${template.id}`, { method: 'PUT', body: JSON.stringify({ templateUseCount: (template.templateUseCount || 0) + 1 }) });
      fetchData();
    } catch (error) {
      console.error('Failed to increment template use count:', error);
    }

    setEditingPrompt({
      ...template,
      id: '', // Clear ID to make it a new prompt
      title: `${template.title} (Copy)`,
      isTemplate: false, // Don't default the new one to be a template
    } as Prompt);
    setIsEditorOpen(true);
  };

  const handleCopyPrompt = async (prompt: Prompt) => {
    try {
      await apiFetch(`/prompts/${prompt.id}`, { method: 'PUT', body: JSON.stringify({ copyCount: (prompt.copyCount || 0) + 1 }) });
      fetchData();
    } catch (error) {
      console.error('Failed to increment copy count:', error);
    }
  };

  const handleCopySelected = async () => {
    const selectedPrompts = filteredPrompts.filter(p => selectedIds.has(p.id));
    const content = selectedPrompts.map(p => `### ${p.title}\n\n${p.content}`).join('\n\n---\n\n');
    
    try {
      await navigator.clipboard.writeText(content);
      
      // Increment copy counts
      await Promise.all(selectedPrompts.map(p => apiFetch(`/prompts/${p.id}`, { method: 'PUT', body: JSON.stringify({ copyCount: (p.copyCount || 0) + 1 }) })));
      fetchData();
      
      toast.success(`${selectedPrompts.length} prompts copied to clipboard`);
    } catch (error) {
      console.error('Failed to copy selected prompts:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleExport = (promptsToExport: Prompt[]) => {
    const data = JSON.stringify(promptsToExport, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prompts-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`${promptsToExport.length} prompts exported`);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedPrompts = JSON.parse(content);

        if (!Array.isArray(importedPrompts)) {
          throw new Error('Invalid format: Expected an array of prompts');
        }

        let count = 0;
        await Promise.all(importedPrompts.map(p => {
          if (!p.title || !p.content) return;
          count++;
          return apiFetch('/prompts', { method: 'POST', body: JSON.stringify(p) });
        }));
        fetchData();
        toast.success(`Successfully imported ${count} prompts`);
        event.target.value = '';
      } catch (error) {
        console.error(error);
        toast.error('Failed to import prompts. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex h-screen bg-bg-main text-text-main overflow-hidden relative">
      <Sidebar 
        categories={categories} 
        teams={teams}
        selectedCategory={selectedCategory} 
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setShowTemplatesOnly(false);
          setShowAnalytics(false);
          setIsSidebarOpen(false);
        }} 
        onSelectAnalytics={() => {
          setShowAnalytics(true);
          setShowTemplatesOnly(false);
          setSelectedCategory(null);
          setIsSidebarOpen(false);
        }}
        isAnalyticsSelected={showAnalytics}
        selectedTeamId={selectedTeamId}
        onSelectTeam={(id) => {
          setSelectedTeamId(id);
          setIsSidebarOpen(false);
        }}
        onManageTeam={() => setIsTeamManagementOpen(true)}
        onCreateTeam={() => {
          setSelectedTeamId(null);
          setIsTeamManagementOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        showTemplatesOnly={showTemplatesOnly}
        onToggleTemplates={(show) => {
          setShowTemplatesOnly(show);
          setShowAnalytics(false);
          setIsSidebarOpen(false);
        }}
        theme={theme}
        toggleTheme={toggleTheme}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Bulk Action Bar */}
        <AnimatePresence>
          {selectedIds.size > 0 && !showAnalytics && (
            <motion.div 
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 border border-white/10 rounded-2xl px-6 py-3 shadow-2xl flex items-center gap-6 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 border-r border-white/10 pr-6">
                <button 
                  onClick={selectAll}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  {selectedIds.size === filteredPrompts.length ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                </button>
                <span className="text-sm font-medium">
                  {selectedIds.size} selected
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCopySelected}
                  className="text-zinc-400 hover:text-white"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Selected
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleExport(filteredPrompts.filter(p => selectedIds.has(p.id)))}
                  className="text-zinc-400 hover:text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Selected
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsBulkCategoryModalOpen(true)}
                  className="text-zinc-400 hover:text-white"
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Change Category
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>

              <button 
                onClick={() => setSelectedIds(new Set())}
                className="ml-2 p-1 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        {!showAnalytics && (
          <header className="h-20 border-b border-white/5 flex items-center justify-between px-2 sm:px-4 lg:px-8 shrink-0 gap-1.5 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-4 flex-1 max-w-2xl">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden shrink-0 h-9 w-9"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="relative w-full max-w-[140px] sm:max-w-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input 
                  placeholder="Search..." 
                  className="pl-9 h-9 sm:h-10 bg-zinc-900/50 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsTagFilterOpen(!isTagFilterOpen)}
                  className={cn(
                    "h-9 sm:h-10 px-2 sm:px-4 rounded-xl border border-white/5 bg-zinc-900/50 hover:bg-white/5",
                    selectedTags.size > 0 && "text-indigo-400 border-indigo-500/30 bg-indigo-500/5"
                  )}
                >
                  <Tag className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Tags</span> {selectedTags.size > 0 && `(${selectedTags.size})`}
                </Button>

                <AnimatePresence>
                  {isTagFilterOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsTagFilterOpen(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50 p-4 max-h-80 overflow-y-auto"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Filter by Tags</span>
                          {selectedTags.size > 0 && (
                            <button 
                              onClick={() => setSelectedTags(new Set())}
                              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {allTags.length === 0 ? (
                            <p className="text-xs text-zinc-600 italic py-4 w-full text-center">No tags found</p>
                          ) : (
                            allTags.map(tag => (
                              <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={cn(
                                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                                  selectedTags.has(tag)
                                    ? "bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20"
                                    : "bg-zinc-800 border-white/5 text-zinc-400 hover:border-white/20 hover:text-white"
                                )}
                              >
                                {tag}
                              </button>
                            ))
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="h-9 sm:h-10 px-2 sm:px-4 rounded-xl border border-white/5 bg-zinc-900/50 hover:bg-white/5"
                >
                  <ArrowUpDown className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">
                    {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : sortBy === 'top' ? 'Top Rated' : 'Most Copied'}
                  </span>
                </Button>

                <AnimatePresence>
                  {isSortOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50 p-2"
                      >
                        <div className="space-y-1">
                          {[
                            { id: 'newest', label: 'Newest First' },
                            { id: 'oldest', label: 'Oldest First' },
                            { id: 'top', label: 'Top Rated' },
                            { id: 'copies', label: 'Most Copied' }
                          ].map((option) => (
                            <button
                              key={option.id}
                              onClick={() => {
                                setSortBy(option.id as any);
                                setIsSortOpen(false);
                              }}
                              className={cn(
                                "w-full px-3 py-2 text-left text-xs font-medium rounded-lg transition-all",
                                sortBy === option.id 
                                  ? "bg-white/10 text-white" 
                                  : "text-zinc-500 hover:bg-white/5 hover:text-white"
                              )}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-4">
              <div className="hidden sm:flex items-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImport}
                  accept=".json"
                  className="hidden"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-zinc-400 hover:text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleExport(prompts)}
                  className="text-zinc-400 hover:text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export All
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsGeneratorOpen(true)}
                className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 h-9 px-2 sm:px-3"
              >
                <Sparkles className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">AI Generate</span>
              </Button>
              <Button 
                size="sm"
                onClick={() => { setEditingPrompt(null); setIsEditorOpen(true); }}
                className="shrink-0 h-9 px-2 sm:px-4"
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">New Prompt</span>
              </Button>
            </div>
          </header>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {showAnalytics ? (
              <AnalyticsDashboard prompts={prompts} />
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                    {selectedCategory === 'favorites' ? 'Favorites' : (selectedCategory || 'All Prompts')}
                    <span className="ml-3 text-sm font-normal text-zinc-500">
                      {filteredPrompts.length} items
                    </span>
                  </h1>
                </div>

                {selectedTags.size > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center mr-2">
                      Active Filters:
                    </span>
                    {Array.from(selectedTags).map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded-full border border-indigo-500/20 hover:bg-indigo-500/20 transition-all group"
                      >
                        {tag}
                        <X className="w-3 h-3 text-indigo-400/50 group-hover:text-indigo-400" />
                      </button>
                    ))}
                    <button
                      onClick={() => setSelectedTags(new Set())}
                      className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest ml-2"
                    >
                      Clear All
                    </button>
                  </div>
                )}

                <AnimatePresence mode="popLayout">
                  {filteredPrompts.length === 0 ? (
                    <motion.div 
                      key="empty-state"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center justify-center py-40 text-center"
                    >
                      <div className="relative mb-8">
                        <motion.div 
                          animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{ 
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="w-24 h-24 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center relative z-10 border border-white/5 shadow-2xl"
                        >
                          <Plus className="w-10 h-10 text-zinc-400" />
                        </motion.div>
                        <motion.div 
                          animate={{ 
                            opacity: [0.2, 0.5, 0.2],
                            scale: [0.8, 1.2, 0.8]
                          }}
                          transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="absolute -top-4 -right-4 w-12 h-12 bg-white/5 rounded-full blur-xl"
                        />
                        <motion.div 
                          animate={{ 
                            opacity: [0.1, 0.3, 0.1],
                            scale: [1, 1.5, 1]
                          }}
                          transition={{ 
                            duration: 5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                          }}
                          className="absolute -bottom-6 -left-6 w-16 h-16 bg-white/5 rounded-full blur-2xl"
                        />
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-3 tracking-tight">Your vault is empty</h3>
                      <p className="text-zinc-500 max-w-sm mb-8 leading-relaxed">
                        Start building your personal library of high-performance AI prompts. 
                        Organize, refine, and access them whenever you need.
                      </p>
                      
                      <Button 
                        size="lg" 
                        onClick={() => { setEditingPrompt(null); setIsEditorOpen(true); }}
                        className="rounded-2xl px-8 h-14 text-base font-semibold shadow-xl shadow-white/5 hover:shadow-white/10 transition-all active:scale-95"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Create your first prompt
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="prompts-grid"
                      layout
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {sortedPrompts.map((prompt) => (
                        <PromptCard 
                          key={prompt.id} 
                          prompt={prompt} 
                          isSelected={selectedIds.has(prompt.id)}
                          onToggleSelect={() => toggleSelect(prompt.id)}
                          onEdit={() => { setEditingPrompt(prompt); setIsEditorOpen(true); }}
                          onDelete={() => setPromptToDelete(prompt)}
                          onViewHistory={() => setHistoryPrompt(prompt)}
                          onShare={() => setSharingPrompt(prompt)}
                          onUseTemplate={() => handleUseTemplate(prompt)}
                          onToggleFavorite={() => handleToggleFavorite(prompt)}
                          onVote={(val) => handleVote(prompt, val)}
                          currentUserId={currentUser?.uid}
                          onCopy={() => handleCopyPrompt(prompt)}
                          onClick={() => setPreviewPrompt(prompt)}
                          onTagClick={toggleTag}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </div>
      </main>

      <PromptEditor 
        isOpen={isEditorOpen} 
        onClose={() => { setIsEditorOpen(false); setEditingPrompt(null); }}
        onSave={handleSavePrompt}
        onAutosave={handleAutosavePrompt}
        initialData={editingPrompt}
        categories={categories}
        selectedTeamId={selectedTeamId}
        availableTags={allTags}
        defaultCategory={userSettings.defaultCategory}
      />

      <PromptHistory
        isOpen={!!historyPrompt}
        onClose={() => setHistoryPrompt(null)}
        prompt={historyPrompt}
      />

      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Settings"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Default Category</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSaveSettings({ ...userSettings, defaultCategory: '' })}
                className={cn(
                  "px-4 py-3 text-sm font-medium rounded-xl border transition-all text-left",
                  !userSettings.defaultCategory ? 'bg-white/10 border-white/20 text-white' : 'bg-zinc-900 border-white/5 text-zinc-500 hover:border-white/10'
                )}
              >
                No Category
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleSaveSettings({ ...userSettings, defaultCategory: c.name })}
                  className={cn(
                    "px-4 py-3 text-sm font-medium rounded-xl border transition-all text-left flex items-center gap-2",
                    userSettings.defaultCategory === c.name ? 'bg-white/10 border-white/20 text-white' : 'bg-zinc-900 border-white/5 text-zinc-500 hover:border-white/10'
                  )}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.name}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
              New prompts will automatically be assigned to this category
            </p>
          </div>
        </div>
      </Modal>

      <ShareModal
        isOpen={!!sharingPrompt}
        onClose={() => setSharingPrompt(null)}
        prompt={sharingPrompt}
        onTogglePublic={handleTogglePublic}
        teams={teams}
      />

      {/* Prompt Preview Modal */}
      <Modal
        isOpen={!!previewPrompt}
        onClose={() => setPreviewPrompt(null)}
        title={previewPrompt?.title || 'Prompt Preview'}
        className="max-w-3xl"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-md border border-white/5">
              <Calendar className="w-3.5 h-3.5" />
              {previewPrompt?.updatedAt?.toDate().toLocaleDateString()}
            </div>
            {previewPrompt?.category && (
              <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-md border border-white/5">
                <Tag className="w-3.5 h-3.5" />
                {previewPrompt.category}
              </div>
            )}
            {previewPrompt?.isTemplate && (
              <div className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-500/20">
                <LayoutTemplate className="w-3.5 h-3.5" />
                Template
              </div>
            )}
          </div>

          <div className="bg-black/40 rounded-2xl border border-white/5 p-6 prose prose-invert prose-sm max-w-none prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/5 max-h-[60vh] overflow-y-auto">
            {previewPrompt?.content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {previewPrompt.content}
              </ReactMarkdown>
            ) : (
              <p className="text-zinc-600 italic">No content available</p>
            )}
          </div>

          {previewPrompt?.tags && previewPrompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {previewPrompt.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-zinc-900 text-zinc-400 text-xs rounded-lg border border-white/5 uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button variant="ghost" onClick={() => setPreviewPrompt(null)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                if (previewPrompt) {
                  navigator.clipboard.writeText(previewPrompt.content);
                  toast.success('Prompt copied to clipboard');
                }
              }}
            >
              Copy Prompt
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Category Modal */}
      <Modal
        isOpen={isBulkCategoryModalOpen}
        onClose={() => setIsBulkCategoryModalOpen(false)}
        title="Change Category"
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            Select a new category for the {selectedIds.size} selected prompts.
          </p>
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2">
            <button
              onClick={() => handleBulkChangeCategory('')}
              className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-white/5 hover:border-white/20 transition-all text-left"
            >
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <span className="text-sm font-medium">No Category</span>
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => handleBulkChangeCategory(c.name)}
                className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-white/5 hover:border-white/20 transition-all text-left"
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-sm font-medium">{c.name}</span>
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-4">
            <Button variant="ghost" onClick={() => setIsBulkCategoryModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Delete Modal */}
      <Modal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        title="Delete Multiple Prompts"
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-zinc-400 leading-relaxed">
            Are you sure you want to delete <span className="text-white font-semibold">{selectedIds.size} prompts</span>? 
            This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsBulkDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="secondary" 
              className="bg-red-500 hover:bg-red-600 text-white border-none"
              onClick={handleBulkDelete}
            >
              Delete {selectedIds.size} Prompts
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!promptToDelete}
        onClose={() => setPromptToDelete(null)}
        title="Delete Prompt"
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-zinc-400 leading-relaxed">
            Are you sure you want to delete <span className="text-white font-semibold">"{promptToDelete?.title}"</span>? 
            This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setPromptToDelete(null)}>
              Cancel
            </Button>
            <Button 
              variant="secondary" 
              className="bg-red-500 hover:bg-red-600 text-white border-none"
              onClick={handleDeletePrompt}
            >
              Delete Prompt
            </Button>
          </div>
        </div>
      </Modal>
      <PromptGenerator
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onUsePrompt={(content, title) => {
          setEditingPrompt({ title, content, category: '', tags: [], teamId: selectedTeamId || undefined } as any);
          setIsGeneratorOpen(false);
          setIsEditorOpen(true);
        }}
      />
      <TeamManagement
        isOpen={isTeamManagementOpen}
        onClose={() => setIsTeamManagementOpen(false)}
        teamId={selectedTeamId}
      />
      <InvitationHandler />
    </div>
  );
}
