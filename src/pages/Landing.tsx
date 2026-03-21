import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Sparkles, Shield, Zap, Layout, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function Landing() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { setCurrentUser } = useAuth();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const body = isRegister ? { email, password, displayName } : { email, password };
      const response = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
      });
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        setCurrentUser(response.user);
        toast.success(isRegister ? 'Account created!' : 'Welcome back!');
      } else {
        toast.error(response.error || 'Authentication failed');
      }
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-text-heading tracking-tight">PromptVault</span>
        </div>
        <Button variant="outline" onClick={() => setIsLoginModalOpen(true)}>Sign In</Button>
      </nav>

      {/* Auth Modal overlay simple inline */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-bg-card p-8 rounded-3xl border border-border-subtle shadow-2xl relative"
          >
            <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-4 right-4 text-text-muted hover:text-text-heading">
              ✕
            </button>
            <h2 className="text-2xl font-bold text-text-heading mb-6">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
            <form onSubmit={handleAuth} className="space-y-4">
              {isRegister && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-muted">Display Name</label>
                  <Input required value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Jane Doe" />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Email</label>
                <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Password</label>
                <Input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isRegister ? 'Sign Up' : 'Log In')}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-text-muted">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button 
                type="button" 
                onClick={() => setIsRegister(!isRegister)} 
                className="text-indigo-400 font-medium hover:underline"
              >
                {isRegister ? 'Log in' : 'Sign up'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Hero Section */}
      <main className="relative z-10 pt-20 pb-32 px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-7xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-8 gradient-text">
              The premium vault for your AI prompts.
            </h1>
            <p className="text-xl text-text-muted mb-10 leading-relaxed max-w-xl">
              Store, organize, and optimize your engineering prompts in a beautiful, distraction-free environment. Built for the next generation of creators.
            </p>
            <div className="flex items-center gap-4">
              <Button size="lg" onClick={() => { setIsRegister(true); setIsLoginModalOpen(true); }} className="px-8">Get Started Free</Button>
              <Button size="lg" variant="outline" className="px-8">View Demo</Button>
            </div>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-40">
          {[
            { icon: Zap, title: 'Lightning Fast', desc: 'Instant search and retrieval for your entire library.' },
            { icon: Shield, title: 'Secure Storage', desc: 'Your prompts are private, encrypted, and safe.' },
            { icon: Layout, title: 'Organized', desc: 'Categorize with tags, folders, and custom metadata.' }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-8 rounded-3xl bg-bg-card border border-border-subtle hover:border-border-strong transition-all group"
            >
              <feature.icon className="w-8 h-8 text-text-heading mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold text-text-heading mb-3">{feature.title}</h3>
              <p className="text-text-muted leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border-subtle py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:row items-center justify-between gap-8">
          <div className="text-sm text-text-muted text-center md:text-left w-full max-w-3xl">
            © 2026 PromptVault. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
