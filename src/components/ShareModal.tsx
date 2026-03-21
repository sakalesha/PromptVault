import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Globe, Lock, Copy, Check, ExternalLink, Users, UserPlus, X, Shield, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Prompt, Team } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../services/api';
import toast from 'react-hot-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt | null;
  onTogglePublic: (isPublic: boolean) => void;
  teams: Team[];
}

export function ShareModal({ isOpen, onClose, prompt, onTogglePublic, teams }: ShareModalProps) {
  const { currentUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  if (!prompt) return null;

  const shareUrl = `${window.location.origin}/share/${prompt.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateTeam = async (teamId: string | null) => {
    try {
      await apiFetch(`/prompts/${prompt.id}`, { method: 'PUT', body: JSON.stringify({ teamId }) });
      toast.success(teamId ? 'Prompt shared with team' : 'Prompt removed from team');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update team');
    }
  };

  const handleAddCollaborator = async () => {
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    try {
      const newCollabs = [...(prompt.collaborators || []), inviteEmail.toLowerCase().trim()];
      await apiFetch(`/prompts/${prompt.id}`, { method: 'PUT', body: JSON.stringify({ collaborators: newCollabs }) });
      toast.success('Collaborator added');
      setInviteEmail('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add collaborator');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveCollaborator = async (email: string) => {
    try {
      const newCollabs = (prompt.collaborators || []).filter(c => c !== email);
      await apiFetch(`/prompts/${prompt.id}`, { method: 'PUT', body: JSON.stringify({ collaborators: newCollabs }) });
      toast.success('Collaborator removed');
    } catch (error) {
      console.error(error);
      toast.error('Failed to remove collaborator');
    }
  };

  const isOwner = currentUser?.uid === prompt.userId;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share & Collaborate"
      className="w-full max-w-xl"
    >
      <div className="space-y-8">
        {/* Visibility Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
            <Globe className="w-3.5 h-3.5" />
            Public Visibility
          </div>
          <div className={`p-4 rounded-2xl border transition-all ${
            prompt.isPublic 
              ? 'bg-emerald-500/5 border-emerald-500/20' 
              : 'bg-zinc-900 border-white/5'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  prompt.isPublic ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {prompt.isPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {prompt.isPublic ? 'Publicly Shared' : 'Private Prompt'}
                  </h4>
                  <p className="text-xs text-zinc-500">
                    {prompt.isPublic 
                      ? 'Anyone with the link can view' 
                      : 'Only you and collaborators can view'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onTogglePublic(!prompt.isPublic)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  prompt.isPublic ? 'bg-emerald-500' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    prompt.isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {prompt.isPublic && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex gap-2">
                  <Input 
                    readOnly 
                    value={shareUrl} 
                    className="bg-black/40 border-white/10 text-xs h-10"
                  />
                  <Button 
                    size="icon" 
                    onClick={handleCopy}
                    className="shrink-0 h-10 w-10"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <a 
                  href={shareUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Preview Public Page
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Team Sharing Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
            <Users className="w-3.5 h-3.5" />
            Team Library
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleUpdateTeam(null)}
              className={`px-4 py-3 text-sm font-medium rounded-xl border transition-all text-left flex items-center gap-2 ${
                !prompt.teamId ? 'bg-white/10 border-white/20 text-white' : 'bg-zinc-900 border-white/5 text-zinc-500 hover:border-white/10'
              }`}
            >
              <Lock className="w-4 h-4" />
              Personal Only
            </button>
            {teams.map(team => (
              <button
                key={team.id}
                onClick={() => handleUpdateTeam(team.id)}
                className={`px-4 py-3 text-sm font-medium rounded-xl border transition-all text-left flex items-center gap-2 ${
                  prompt.teamId === team.id ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-zinc-900 border-white/5 text-zinc-500 hover:border-white/10'
                }`}
              >
                <Users className="w-4 h-4" />
                {team.name}
              </button>
            ))}
          </div>
        </div>

        {/* Individual Collaborators Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
            <UserPlus className="w-3.5 h-3.5" />
            Individual Collaborators
          </div>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="collaborator@example.com" 
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleAddCollaborator} 
                disabled={isInviting || !inviteEmail.trim()}
                className="bg-white text-black hover:bg-zinc-200"
              >
                {isInviting ? <Check className="w-4 h-4 animate-spin" /> : 'Invite'}
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">You (Owner)</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Full Access</span>
                  </div>
                </div>
              </div>
              {prompt.collaborators?.map((email) => (
                <div key={email} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-zinc-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{email}</span>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Can View & Edit</span>
                    </div>
                  </div>
                  {isOwner && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-zinc-500 hover:text-red-500"
                      onClick={() => handleRemoveCollaborator(email)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}
