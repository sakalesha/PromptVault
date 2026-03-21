import * as React from 'react';
import { useState, useEffect } from 'react';
import { Users, Plus, X, Mail, Check, Loader2, Trash2, UserPlus, Shield, User } from 'lucide-react';
import { Team, Invitation } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../services/api';
import { useCallback } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import toast from 'react-hot-toast';

interface TeamManagementProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string | null;
}

export function TeamManagement({ isOpen, onClose, teamId }: TeamManagementProps) {
  const { currentUser } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  
  const fetchData = useCallback(async () => {
    if (!teamId || !isOpen) return;
    try {
      const teamData = await apiFetch(`/teams`);
      const myTeam = teamData.find(t => t.id === teamId);
      if (myTeam) setTeam(myTeam);

      const invData = await apiFetch('/invitations');
      const teamInvs = Array.isArray(invData) ? invData.filter(i => i.teamId === teamId && i.status === 'pending') : [];
      setInvitations(teamInvs);
    } catch (e) {
      console.error(e);
    }
  }, [teamId, isOpen]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);



    

  const handleCreateTeam = async () => {
    if (!currentUser || !newTeamName.trim()) return;

    setIsCreating(true);
    try {
      await apiFetch('/teams', { method: 'POST', body: JSON.stringify({ name: newTeamName }) });
      fetchData();
      toast.success('Team created successfully!');
      setNewTeamName('');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create team');
    } finally {
      setIsCreating(false);
    }
  };

  const handleInvite = async () => {
    if (!currentUser || !team || !inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      // Check if already a member
      // (In a real app, we'd check if the user exists and get their UID)
      
      await apiFetch('/invitations', { method: 'POST', body: JSON.stringify({ teamId: team.id, teamName: team.name, email: inviteEmail.toLowerCase().trim(), inviterName: currentUser.displayName || currentUser.email }) });
      fetchData();
      toast.success('Invitation sent!');
      setInviteEmail('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!team || !currentUser) return;
    if (memberId === team.ownerId) {
      toast.error('Cannot remove the team owner');
      return;
    }

    try {
      await apiFetch(`/teams/${team.id}`, { method: 'PUT', body: JSON.stringify({ members: team.members.filter(m => m !== memberId) }) });
      fetchData();
      toast.success('Member removed');
    } catch (error) {
      console.error(error);
      toast.error('Failed to remove member');
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await apiFetch(`/invitations/${invitationId}`, { method: 'DELETE' });
      fetchData();
      toast.success('Invitation cancelled');
    } catch (error) {
      console.error(error);
      toast.error('Failed to cancel invitation');
    }
  };

  if (!teamId) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Create New Team" className="w-full max-w-md">
        <div className="space-y-6">
          <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-heading mb-1">Collaborative Workspaces</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Create a team to share prompts, templates, and categories with your colleagues in real-time.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Team Name</label>
              <Input 
                placeholder="e.g. Marketing Team, Engineering" 
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                autoFocus
              />
            </div>
            <Button 
              className="w-full h-11 bg-indigo-500 hover:bg-indigo-600"
              disabled={isCreating || !newTeamName.trim()}
              onClick={handleCreateTeam}
            >
              {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Create Team
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  const isOwner = currentUser?.uid === team?.ownerId;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Team Settings: ${team?.name}`} className="w-full max-w-xl">
      <div className="space-y-8">
        {/* Invite Section */}
        {isOwner && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-text-heading">
              <UserPlus className="w-4 h-4 text-indigo-400" />
              Invite Members
            </div>
            <div className="flex gap-2">
              <Input 
                placeholder="colleague@example.com" 
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleInvite} 
                disabled={isInviting || !inviteEmail.trim()}
                className="bg-text-heading text-bg-main hover:bg-text-main"
              >
                {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invite'}
              </Button>
            </div>
          </div>
        )}

        {/* Members List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-text-heading">
              <Users className="w-4 h-4 text-text-muted" />
              Team Members
            </div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
              {team?.members.length} Total
            </span>
          </div>
          <div className="space-y-2">
            {team?.members.map((memberId) => (
              <div key={memberId} className="flex items-center justify-between p-3 bg-bg-card rounded-xl border border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-bg-main flex items-center justify-center">
                    <User className="w-4 h-4 text-text-muted" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-text-heading">
                      {memberId === currentUser?.uid ? 'You' : `User ${memberId.slice(0, 5)}...`}
                    </span>
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">
                      {memberId === team.ownerId ? (
                        <span className="flex items-center gap-1 text-amber-500">
                          <Shield className="w-2.5 h-2.5" />
                          Owner
                        </span>
                      ) : 'Member'}
                    </span>
                  </div>
                </div>
                {isOwner && memberId !== team.ownerId && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-text-muted hover:text-red-500"
                    onClick={() => handleRemoveMember(memberId)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-text-heading">
              <Mail className="w-4 h-4 text-text-muted" />
              Pending Invitations
            </div>
            <div className="space-y-2">
              {invitations.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 bg-bg-card rounded-xl border border-dashed border-border-subtle">
                  <div className="flex flex-col">
                    <span className="text-sm text-text-main">{inv.email}</span>
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">Sent by {inv.inviterName}</span>
                  </div>
                  {isOwner && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-text-muted hover:text-text-heading"
                      onClick={() => handleCancelInvitation(inv.id)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-border-subtle flex justify-end">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}
