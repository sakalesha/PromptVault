import { Prompt } from '../types';
import { Card } from '../components/ui/Card';
import { BarChart3, Copy, LayoutTemplate, TrendingUp, Star, Tag } from 'lucide-react';
import { motion } from 'motion/react';

interface AnalyticsDashboardProps {
  prompts: Prompt[];
}

export function AnalyticsDashboard({ prompts }: AnalyticsDashboardProps) {
  const totalCopies = prompts.reduce((acc, p) => acc + (p.copyCount || 0), 0);
  const totalTemplateUses = prompts.reduce((acc, p) => acc + (p.templateUseCount || 0), 0);
  const totalFavorites = prompts.filter(p => p.isFavorite).length;
  
  const topCopied = [...prompts]
    .sort((a, b) => (b.copyCount || 0) - (a.copyCount || 0))
    .slice(0, 5)
    .filter(p => (p.copyCount || 0) > 0);

  const topUsedTemplates = [...prompts]
    .filter(p => p.isTemplate)
    .sort((a, b) => (b.templateUseCount || 0) - (a.templateUseCount || 0))
    .slice(0, 5)
    .filter(p => (p.templateUseCount || 0) > 0);

  const stats = [
    {
      label: 'Total Copies',
      value: totalCopies,
      icon: Copy,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10'
    },
    {
      label: 'Template Uses',
      value: totalTemplateUses,
      icon: LayoutTemplate,
      color: 'text-indigo-400',
      bg: 'bg-indigo-400/10'
    },
    {
      label: 'Favorites',
      value: totalFavorites,
      icon: Star,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10'
    },
    {
      label: 'Total Prompts',
      value: prompts.length,
      icon: Tag,
      color: 'text-zinc-400',
      bg: 'bg-zinc-400/10'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 text-text-heading">Usage Analytics</h2>
          <p className="text-text-muted">Track how your prompt library is performing.</p>
        </div>
        <div className="bg-bg-card px-4 py-2 rounded-xl border border-border-subtle flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-text-main">Live Updates</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden group">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-muted">{stat.label}</p>
                  <p className="text-2xl font-bold text-text-heading">{stat.value}</p>
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 group-hover:w-full w-0 ${stat.bg.replace('/10', '')}`} />
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-400/10 rounded-lg">
              <Copy className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-text-heading">Most Copied Prompts</h3>
          </div>
          <div className="space-y-4 flex-1">
            {topCopied.length > 0 ? (
              topCopied.map((prompt, index) => (
                <div key={prompt.id} className="flex items-center justify-between p-4 bg-bg-main rounded-xl border border-border-subtle group hover:bg-bg-card transition-all">
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-xs font-bold text-text-muted w-4">{index + 1}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-text-heading truncate">{prompt.title}</p>
                      <p className="text-xs text-text-muted truncate">{prompt.category || 'Uncategorized'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm">
                    <span className="font-bold">{prompt.copyCount}</span>
                    <span className="text-[10px] uppercase tracking-wider opacity-50">copies</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
                <Copy className="w-12 h-12 mb-4 opacity-20" />
                <p>No copy data available yet.</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-400/10 rounded-lg">
              <LayoutTemplate className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-text-heading">Top Templates</h3>
          </div>
          <div className="space-y-4 flex-1">
            {topUsedTemplates.length > 0 ? (
              topUsedTemplates.map((prompt, index) => (
                <div key={prompt.id} className="flex items-center justify-between p-4 bg-bg-main rounded-xl border border-border-subtle group hover:bg-bg-card transition-all">
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-xs font-bold text-text-muted w-4">{index + 1}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-text-heading truncate">{prompt.title}</p>
                      <p className="text-xs text-text-muted truncate">{prompt.category || 'Uncategorized'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-400 font-mono text-sm">
                    <span className="font-bold">{prompt.templateUseCount}</span>
                    <span className="text-[10px] uppercase tracking-wider opacity-50">uses</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
                <LayoutTemplate className="w-12 h-12 mb-4 opacity-20" />
                <p>No template usage data available yet.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
