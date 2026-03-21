import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { PublicPrompt } from './pages/PublicPrompt';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { currentUser: user, loading } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#18181b' : '#fff',
            color: theme === 'dark' ? '#fff' : '#18181b',
            border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '1rem',
          },
        }}
      />
      <Routes>
        <Route path="/" element={user ? <Dashboard theme={theme} toggleTheme={toggleTheme} /> : <Landing />} />
        <Route path="/share/:id" element={<PublicPrompt />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
