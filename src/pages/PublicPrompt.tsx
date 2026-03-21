import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { Prompt } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Copy, ArrowLeft, Globe, Calendar, Tag, Terminal } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export function PublicPrompt() {
  const { id } = useParams<{ id: string }>();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrompt = async () => {
      if (!id) return;
      try {
        const data = await apiFetch(`/prompts/${id}`);
        if (data && data.isPublic) {
          setPrompt(data);
        } else {
          setError('This prompt is private or does not exist.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load prompt.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrompt();
  }, [id]);

  const handleCopy = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt.content);
      toast.success('Prompt copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-500 animate-pulse">Loading shared prompt...</div>
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
          <Globe className="w-8 h-8 text-zinc-700" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-zinc-500 max-w-xs mb-8">{error}</p>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(prompt.updatedAt || prompt.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }) || 'Recently';

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <Link to="/">
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Terminal className="w-6 h-6 text-black" />
              </div>
              <span className="text-xl font-bold tracking-tighter">PROMPTVAULT</span>
            </div>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 md:p-12 border-white/10 bg-zinc-900/30 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full border border-emerald-500/20 uppercase tracking-widest flex items-center gap-1.5">
                    <Globe className="w-3 h-3" />
                    Public Shared Prompt
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                  {prompt.title}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formattedDate}
                  </div>
                  {prompt.category && (
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      {prompt.category}
                    </div>
                  )}
                </div>
              </div>
              <Button size="lg" onClick={handleCopy} className="h-14 px-8 rounded-2xl text-base font-semibold shadow-2xl shadow-white/10">
                <Copy className="w-5 h-5 mr-3" />
                Copy Prompt
              </Button>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-transparent rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-black/40 border border-white/5 rounded-2xl p-6 md:p-10 font-mono text-lg leading-relaxed text-zinc-300 whitespace-pre-wrap">
                {prompt.content}
              </div>
            </div>

            {prompt.tags && prompt.tags.length > 0 && (
              <div className="mt-12 flex flex-wrap gap-3">
                {prompt.tags.map(tag => (
                  <span key={tag} className="px-4 py-2 bg-white/5 text-zinc-400 text-xs rounded-xl border border-white/5 uppercase tracking-widest font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Card>

          <footer className="mt-12 text-center">
            <p className="text-zinc-600 text-sm">
              Shared via PromptVault — The ultimate library for prompt engineers.
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
}
