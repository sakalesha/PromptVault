import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Prompt, PromptVersion } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { History, RotateCcw, Clock, ArrowLeftRight, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DiffView } from './DiffView';
import toast from 'react-hot-toast';

interface PromptHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt | null;
}

export function PromptHistory({ isOpen, onClose, prompt }: PromptHistoryProps) {
  const { currentUser } = useAuth();
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  
  const fetchData = useCallback(async () => {
    if (!prompt || !isOpen) return;
    setLoading(true);
    try {
      const data = await apiFetch(`/prompts/${prompt.id}/versions`);
      setVersions(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [prompt, isOpen]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  useEffect(() => {
    if (!isOpen) {
      setCompareMode(false);
      setSelectedIds([]);
    }
  }, [isOpen]);

  const handleRevert = async (version: PromptVersion) => {
    if (!prompt) return;

    try {
      // Save current state as a version before reverting
      await apiFetch(`/prompts/${prompt.id}/versions`, {
        method: 'POST',
        body: JSON.stringify({
          title: prompt.title,
          content: prompt.content,
          category: prompt.category,
          tags: prompt.tags,
          createdAt: prompt.updatedAt || prompt.createdAt,
        })
      });

      // Update prompt with version data
      await apiFetch(`/prompts/${prompt.id}`, { 
        method: 'PUT', 
        body: JSON.stringify({ 
          title: version.title, 
          content: version.content, 
          category: version.category, 
          tags: version.tags 
        }) 
      });

      toast.success('Prompt reverted to previous version');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to revert prompt');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const getSelectedVersions = () => {
    if (selectedIds.length !== 2) return null;
    const v1 = versions.find(v => v.id === selectedIds[0]);
    const v2 = versions.find(v => v.id === selectedIds[1]);
    if (!v1 || !v2) return null;
    
    // Sort by creation date to ensure consistent diff (old -> new)
    const sorted = [v1, v2].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return { old: sorted[0], new: sorted[1] };
  };

  const compared = getSelectedVersions();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={compareMode ? "Compare Versions" : "Version History"}
      className={cn("w-full", compareMode ? "max-w-3xl" : "max-w-xl")}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
              <History className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white truncate max-w-[200px]">{prompt?.title}</h3>
              <p className="text-xs text-zinc-500">
                {compareMode ? "Select two versions to see changes" : "View and restore previous versions"}
              </p>
            </div>
          </div>
          <Button
            variant={compareMode ? "secondary" : "ghost"}
            size="sm"
            onClick={() => {
              setCompareMode(!compareMode);
              setSelectedIds([]);
            }}
            className="h-9"
          >
            {compareMode ? (
              <>
                <X className="w-3.5 h-3.5 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <ArrowLeftRight className="w-3.5 h-3.5 mr-2" />
                Compare
              </>
            )}
          </Button>
        </div>

        {compareMode && compared && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500/50" />
                <span>{new Date(compared.old.createdAt).toLocaleString()}</span>
              </div>
              <ArrowLeftRight className="w-3 h-3" />
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500/50" />
                <span>{new Date(compared.new.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <DiffView 
              oldText={compared.old.content} 
              newText={compared.new.content} 
              className="min-h-[200px] max-h-[400px] overflow-y-auto custom-scrollbar"
            />
          </motion.div>
        )}

        <div className={cn(
          "space-y-3 overflow-y-auto pr-2 custom-scrollbar transition-all duration-300",
          compareMode ? "max-h-[250px]" : "max-h-[400px]"
        )}>
          {loading ? (
            <div className="py-12 text-center text-zinc-500">Loading history...</div>
          ) : versions.length === 0 ? (
            <div className="py-12 text-center">
              <Clock className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">No previous versions found.</p>
              <p className="text-xs text-zinc-600 mt-1">Versions are created automatically when you save changes.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {versions.map((version, index) => (
                <motion.div
                  key={version.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => compareMode && toggleSelect(version.id)}
                  className={cn(
                    "group p-4 bg-zinc-900/30 rounded-2xl border transition-all",
                    compareMode ? "cursor-pointer" : "",
                    selectedIds.includes(version.id) 
                      ? "border-indigo-500/50 bg-indigo-500/5" 
                      : "border-white/5 hover:border-white/10"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {compareMode && (
                          <div className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center transition-all",
                            selectedIds.includes(version.id)
                              ? "bg-indigo-500 border-indigo-500 text-white"
                              : "border-white/20"
                          )}>
                            {selectedIds.includes(version.id) && <Check className="w-3 h-3" />}
                          </div>
                        )}
                        <span className="text-xs font-medium text-zinc-400">
                          {new Date(version.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {index === 0 && (
                          <span className="px-1.5 py-0.5 bg-white/5 text-[10px] text-zinc-500 rounded border border-white/5 uppercase tracking-wider">
                            Latest Backup
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-medium text-white mb-2 truncate">{version.title}</h4>
                      {!compareMode && (
                        <p className="text-xs text-zinc-500 line-clamp-2 font-mono bg-black/20 p-2 rounded-lg border border-white/5">
                          {version.content}
                        </p>
                      )}
                    </div>
                    {!compareMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRevert(version);
                        }}
                        className="shrink-0 h-9 px-3 hover:bg-white/5 text-zinc-400 hover:text-white"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-2" />
                        Restore
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <div className="pt-4 border-t border-white/5 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
