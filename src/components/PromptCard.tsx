import { motion } from 'motion/react';
import { Prompt } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Copy, Edit2, Trash2, Calendar, Tag, History, Share2, Globe, Check, LayoutTemplate, Star, Users, ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';

interface PromptCardProps {
  prompt: Prompt;
  onEdit: () => void;
  onDelete: () => void;
  onViewHistory: () => void;
  onShare: () => void;
  onUseTemplate?: () => void;
  onToggleFavorite?: () => void;
  onCopy?: () => void;
  onClick?: () => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onTagClick?: (tag: string) => void;
  onVote?: (score: number) => void;
  currentUserId?: string;
  key?: string;
}

export function PromptCard({ prompt, onEdit, onDelete, onViewHistory, onShare, onUseTemplate, onToggleFavorite, onCopy, onClick, isSelected, onToggleSelect, onTagClick, onVote, currentUserId }: PromptCardProps) {
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.content);
    onCopy?.();
    toast.success('Prompt copied to clipboard');
  };

  const formattedDate = prompt.updatedAt ? new Date(prompt.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : 'Just now';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card 
        onClick={onClick}
        className={cn(
          "group flex flex-col h-full transition-all duration-300 cursor-pointer",
          isSelected ? "border-indigo-500/40 ring-1 ring-indigo-500/20 bg-indigo-500/5" : "",
          prompt.isTemplate ? "border-indigo-500/30 bg-indigo-500/5 hover:border-indigo-500/50" : ""
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect?.();
              }}
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                isSelected 
                  ? 'bg-indigo-600 border-indigo-600 text-white' 
                  : 'bg-bg-card border-border-strong text-transparent group-hover:border-indigo-500/30'
              }`}
            >
              <Check className={`w-3.5 h-3.5 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
            </button>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-text-heading line-clamp-1 group-hover:text-indigo-500 transition-colors">
                  {prompt.title}
                </h3>
                {prompt.isPublic && (
                  <div title="Public">
                    <Globe className="w-3 h-3 text-emerald-500" />
                  </div>
                )}
                {prompt.isTemplate && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-md">
                    <LayoutTemplate className="w-3 h-3 text-indigo-400" />
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Template</span>
                  </div>
                )}
                {prompt.isDraft && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Draft</span>
                  </div>
                )}
                {prompt.isFavorite && (
                  <div title="Favorite">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  </div>
                )}
                {prompt.teamId && (
                  <div title="Team Prompt">
                    <Users className="w-3 h-3 text-blue-400" />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(); }} 
              className={`h-8 w-8 ${prompt.isFavorite ? 'text-amber-400' : 'text-text-muted'} hover:text-amber-400`}
              title={prompt.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            >
              <Star className={`w-3.5 h-3.5 ${prompt.isFavorite ? 'fill-amber-400' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8 text-text-muted hover:text-text-heading" title="Copy Content">
              <Copy className="w-3.5 h-3.5" />
            </Button>
            {prompt.isTemplate && (
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onUseTemplate?.(); }} className="h-8 w-8 text-indigo-400 hover:text-text-heading" title="Use Template">
                <LayoutTemplate className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onShare(); }} className="h-8 w-8 text-text-muted hover:text-text-heading">
              <Share2 className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onViewHistory(); }} className="h-8 w-8 text-text-muted hover:text-text-heading">
              <History className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(); }} className="h-8 w-8">
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="h-8 w-8 text-red-500 hover:bg-red-500/10">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 mb-6">
          <p className="text-sm text-text-muted line-clamp-4 leading-relaxed font-mono bg-border-subtle p-3 rounded-xl border border-border-subtle mb-4">
            {prompt.content}
          </p>
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {prompt.tags.map(tag => (
                <button 
                  key={tag} 
                  onClick={(e) => {
                    e.stopPropagation();
                    onTagClick?.(tag);
                  }}
                  className="px-2 py-0.5 bg-border-subtle text-text-muted text-[10px] rounded-md border border-border-subtle uppercase tracking-wider hover:bg-indigo-500/10 hover:text-indigo-500 transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border-subtle">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-border-subtle rounded-lg p-1 border border-border-subtle">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onVote?.(1);
                }}
                className={`p-1 rounded-md transition-all hover:bg-indigo-500/10 ${
                  currentUserId && prompt.userVotes?.[currentUserId] === 1 
                    ? 'text-emerald-500 bg-emerald-500/10' 
                    : 'text-text-muted'
                }`}
                title="Upvote"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <span className={`text-xs font-bold min-w-[1.5rem] text-center ${
                (prompt.score || 0) > 0 ? 'text-emerald-500' : 
                (prompt.score || 0) < 0 ? 'text-red-500' : 'text-text-muted'
              }`}>
                {prompt.score || 0}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onVote?.(-1);
                }}
                className={`p-1 rounded-md transition-all hover:bg-indigo-500/10 ${
                  currentUserId && prompt.userVotes?.[currentUserId] === -1 
                    ? 'text-red-500 bg-red-500/10' 
                    : 'text-text-muted'
                }`}
                title="Downvote"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </div>
              {prompt.category && (
                <div className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {prompt.category}
                </div>
              )}
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={handleCopy} className="h-8">
            <Copy className="w-3.5 h-3.5 mr-2" />
            Copy
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
