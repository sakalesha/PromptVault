import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Mail, Check, X, Users, Loader2 } from 'lucide-react';
import { Invitation } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../services/api';
import { Button } from './ui/Button';
import toast from 'react-hot-toast';

export function InvitationHandler() {
  const { currentUser } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!currentUser?.email) return;
    try {
      const allInvs = await apiFetch('/invitations');
      setInvitations(
        Array.isArray(allInvs) 
          ? allInvs.filter(i => i.email === currentUser.email?.toLowerCase() && i.status === 'pending') 
          : []
      );
    } catch (e) {
      console.error(e);
    }
  }, [currentUser?.email]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAccept = async (invitation: Invitation) => {
    if (!currentUser) return;
    setIsProcessing(invitation.id);
    try {
      await apiFetch(`/invitations/${invitation.id}`, { method: 'PUT', body: JSON.stringify({ status: 'accepted' }) });
      fetchData();
      toast.success(`Joined team: ${invitation.teamName}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to accept invitation');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDecline = async (invitationId: string) => {
    setIsProcessing(invitationId);
    try {
      await apiFetch(`/invitations/${invitationId}`, { method: 'DELETE' });
      fetchData();
      toast.success('Invitation declined');
    } catch (error) {
      console.error(error);
      toast.error('Failed to decline invitation');
    } finally {
      setIsProcessing(null);
    }
  };

  if (invitations.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-80 z-[100] space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {invitations.map((inv) => (
        <div key={inv.id} className="bg-zinc-900 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Team Invitation</span>
              <p className="text-sm text-white font-medium truncate">
                Join <span className="text-indigo-400">{inv.teamName}</span>
              </p>
              <span className="text-[10px] text-zinc-500 mt-1">Invited by {inv.inviterName}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="flex-1 bg-white text-black hover:bg-zinc-200"
              onClick={() => handleAccept(inv)}
              disabled={!!isProcessing}
            >
              {isProcessing === inv.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-2" />}
              Accept
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 text-zinc-400 hover:text-white"
              onClick={() => handleDecline(inv.id)}
              disabled={!!isProcessing}
            >
              <X className="w-3.5 h-3.5 mr-2" />
              Decline
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
