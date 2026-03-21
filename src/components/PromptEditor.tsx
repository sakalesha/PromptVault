import * as React from 'react';
import { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input, TextArea } from './ui/Input';
import { Prompt, Category } from '../types';
import { X, Tag as TagIcon, Eye, Edit3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';

interface PromptEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Prompt>) => void;
  onAutosave?: (data: Partial<Prompt>) => void;
  initialData: Prompt | null;
  categories: Category[];
  selectedTeamId: string | null;
  availableTags: string[];
  defaultCategory?: string;
}

export function PromptEditor({ isOpen, onClose, onSave, onAutosave, initialData, categories, selectedTeamId, availableTags, defaultCategory }: PromptEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [isTemplate, setIsTemplate] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'category' | 'tags'>('content');
  const [contentMode, setContentMode] = useState<'edit' | 'preview'>('edit');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutosaving, setIsAutosaving] = useState(false);

  const suggestions = availableTags.filter(tag => 
    tag.toLowerCase().includes(tagInput.toLowerCase()) && 
    !tags.includes(tag)
  ).slice(0, 5);

  // Load draft from localStorage for NEW prompts
  useEffect(() => {
    if (isOpen && !initialData) {
      const savedDraft = localStorage.getItem('prompt_draft');
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          // Only restore if current fields are empty to avoid overwriting
          if (!title && !content) {
            setTitle(draft.title || '');
            setContent(draft.content || '');
            setCategory(draft.category || '');
            setTags(draft.tags || []);
            setIsPublic(draft.isPublic || false);
            setIsTemplate(draft.isTemplate || false);
            toast.success('Draft restored from local storage', { icon: '📝' });
          }
        } catch (e) {
          console.error('Failed to parse draft', e);
        }
      }
    }
  }, [isOpen, initialData]);

  // Autosave logic
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      const hasChanges = 
        title !== (initialData?.title || '') ||
        content !== (initialData?.content || '') ||
        category !== (initialData?.category || '') ||
        JSON.stringify(tags) !== JSON.stringify(initialData?.tags || []) ||
        isPublic !== (initialData?.isPublic || false) ||
        isTemplate !== (initialData?.isTemplate || false);

      if (hasChanges && title.trim()) {
        if (initialData?.id) {
          // Autosave to Firestore for existing prompts
          if (onAutosave) {
            setIsAutosaving(true);
            try {
              await onAutosave({
                title,
                content,
                category,
                tags,
                isPublic,
                isTemplate,
                isDraft: initialData?.isDraft || false
              });
              setLastSaved(new Date());
            } catch (e) {
              console.error('Autosave failed', e);
            } finally {
              setIsAutosaving(false);
            }
          }
        } else {
          // Autosave to localStorage for new prompts
          const draftData = { title, content, category, tags, isPublic, isTemplate };
          localStorage.setItem('prompt_draft', JSON.stringify(draftData));
          setLastSaved(new Date());
        }
      }
    }, 5000); // 5 seconds of inactivity

    return () => clearTimeout(timer);
  }, [title, content, category, tags, isPublic, isTemplate, isOpen, initialData, onAutosave]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setCategory(initialData.category || (initialData.id ? '' : defaultCategory) || '');
      setTags(initialData.tags || []);
      setIsPublic(initialData.isPublic || false);
      setIsTemplate(initialData.isTemplate || false);
    } else {
      setTitle('');
      setContent('');
      setCategory(defaultCategory || '');
      setTags([]);
      setIsPublic(false);
      setIsTemplate(false);
    }
    setTagInput('');
    setTitleError('');
    setActiveTab('content');
  }, [initialData, isOpen, defaultCategory]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const addTag = (tag: string) => {
    const newTag = tag.trim().replace(/,/g, '').toLowerCase();
    if (newTag && !tags.includes(newTag)) {
      if (tags.length >= 10) {
        toast.error('Maximum 10 tags allowed');
        return;
      }
      if (newTag.length > 20) {
        toast.error('Tag too long (max 20 chars)');
        return;
      }
      setTags([...tags, newTag]);
    }
    setTagInput('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSave = (isDraft: boolean = false) => {
    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }
    if (title.length > 100) {
      setTitleError('Title must be 100 characters or less');
      return;
    }

    onSave({
      title,
      content,
      category,
      tags,
      isPublic,
      isTemplate,
      isDraft,
      copyCount: initialData?.copyCount || 0,
      templateUseCount: initialData?.templateUseCount || 0,
    });
    localStorage.removeItem('prompt_draft');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? (initialData.id ? 'Edit Prompt' : 'New Prompt from Template') : 'New Prompt'}
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {selectedTeamId && !initialData?.id && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400 text-xs font-bold">T</span>
            </div>
            <div>
              <p className="text-xs font-medium text-blue-400">Saving to Team Library</p>
              <p className="text-[10px] text-blue-400/60">This prompt will be visible to all team members.</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-bg-card rounded-2xl border border-border-subtle">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-text-heading">Public Visibility</span>
              <span className="text-xs text-text-muted">Anyone with link can view</span>
            </div>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                isPublic ? 'bg-indigo-600' : 'bg-border-strong'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-bg-card rounded-2xl border border-border-subtle">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-text-heading">Save as Template</span>
              <span className="text-xs text-text-muted">Use this as a starting point</span>
            </div>
            <button
              onClick={() => setIsTemplate(!isTemplate)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                isTemplate ? 'bg-indigo-600' : 'bg-border-strong'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isTemplate ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-zinc-400">Title</label>
            <span className={`text-[10px] uppercase tracking-wider ${title.length > 100 ? 'text-red-500' : 'text-zinc-600'}`}>
              {title.length} / 100
            </span>
          </div>
          <Input 
            placeholder="e.g. Creative Writing Assistant" 
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError('');
            }}
            className={titleError ? 'border-red-500/50 focus:ring-red-500/20' : ''}
          />
          {titleError && (
            <p className="text-xs text-red-500 mt-1">{titleError}</p>
          )}
        </div>

        <div className="flex items-center gap-1 p-1 bg-bg-card rounded-xl border border-border-subtle">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex-1 px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'content' ? 'bg-indigo-600 text-white shadow-lg' : 'text-text-muted hover:text-text-heading'
            }`}
          >
            Prompt Content
          </button>
          <button
            onClick={() => setActiveTab('category')}
            className={`flex-1 px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'category' ? 'bg-indigo-600 text-white shadow-lg' : 'text-text-muted hover:text-text-heading'
            }`}
          >
            Category
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`flex-1 px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'tags' ? 'bg-indigo-600 text-white shadow-lg' : 'text-text-muted hover:text-text-heading'
            }`}
          >
            Tags
          </button>
        </div>

        <div className="min-h-[300px]">
          {activeTab === 'content' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-text-muted">Prompt Content</label>
                <div className="flex items-center gap-1 p-1 bg-bg-card rounded-lg border border-border-subtle">
                  <button
                    onClick={() => setContentMode('edit')}
                    className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1.5 ${
                      contentMode === 'edit' ? 'bg-indigo-600 text-white' : 'text-text-muted hover:text-text-heading'
                    }`}
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => setContentMode('preview')}
                    className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1.5 ${
                      contentMode === 'preview' ? 'bg-indigo-600 text-white' : 'text-text-muted hover:text-text-heading'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    Preview
                  </button>
                </div>
              </div>
              
              {contentMode === 'edit' ? (
                <TextArea 
                  placeholder="Write your prompt here... (Markdown supported)" 
                  className="min-h-[250px] font-mono"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              ) : (
                <div className="min-h-[250px] p-4 bg-bg-card rounded-2xl border border-border-subtle overflow-y-auto prose prose-sm max-w-none prose-pre:bg-border-subtle prose-pre:border prose-pre:border-border-subtle">
                  {content ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-zinc-600 italic">No content to preview</p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'category' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Select Category</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCategory('')}
                    className={`px-4 py-3 text-sm font-medium rounded-xl border transition-all text-left ${
                      category === '' ? 'bg-indigo-600/10 border-indigo-600/20 text-indigo-600' : 'bg-bg-card border-border-subtle text-text-muted hover:border-border-strong'
                    }`}
                  >
                    No Category
                  </button>
                  {categories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setCategory(c.name)}
                      className={`px-4 py-3 text-sm font-medium rounded-xl border transition-all text-left flex items-center gap-2 ${
                        category === c.name ? 'bg-indigo-600/10 border-indigo-600/20 text-indigo-600' : 'bg-bg-card border-border-subtle text-text-muted hover:border-border-strong'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Manage Tags</label>
                <div className="relative">
                  <Input 
                    placeholder="Type a tag and press Enter" 
                    value={tagInput}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onKeyDown={handleAddTag}
                    onFocus={() => setShowSuggestions(true)}
                  />
                  
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-bg-card border border-border-strong rounded-xl shadow-2xl z-50 overflow-hidden">
                      {suggestions.map(suggestion => (
                        <button
                          key={suggestion}
                          onClick={() => addTag(suggestion)}
                          className="w-full px-4 py-2 text-left text-xs text-text-muted hover:bg-border-subtle hover:text-text-heading transition-colors flex items-center gap-2"
                        >
                          <TagIcon className="w-3 h-3 text-zinc-600" />
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                  Press Enter or comma to add a tag (Max 10 tags)
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.length === 0 ? (
                  <div className="w-full py-8 flex flex-col items-center justify-center border border-dashed border-border-strong rounded-2xl text-text-muted">
                    <TagIcon className="w-8 h-8 mb-2 opacity-20" />
                    <span className="text-xs">No tags added yet</span>
                  </div>
                ) : (
                  tags.map(tag => (
                    <span 
                      key={tag} 
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-bg-card text-text-muted text-xs rounded-xl border border-border-subtle group hover:border-border-strong transition-all"
                    >
                      <TagIcon className="w-3 h-3 text-text-muted" />
                      {tag}
                      <button 
                        onClick={() => removeTag(tag)} 
                        className="text-text-muted hover:text-red-500 transition-colors ml-1"
                        title="Remove tag"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-6 border-t border-border-subtle">
          <div className="flex items-center gap-2">
            {isAutosaving ? (
              <div className="flex items-center gap-2 text-[10px] text-text-muted uppercase tracking-widest">
                <div className="w-1 h-1 bg-text-muted rounded-full animate-pulse" />
                Autosaving...
              </div>
            ) : lastSaved && (
              <div className="text-[10px] text-text-muted uppercase tracking-widest">
                Last saved at {formatTime(lastSaved)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            {!initialData && (
              <Button variant="secondary" onClick={() => handleSave(true)} disabled={!title || !content}>
                Save as Draft
              </Button>
            )}
            <Button onClick={() => handleSave(false)} disabled={!title || !content}>
              {initialData ? 'Update Prompt' : 'Create Prompt'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
