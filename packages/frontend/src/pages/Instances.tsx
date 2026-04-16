import { useEffect, useState } from 'react';
import { useInstancesStore } from '@/stores/instances-store';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Plus, Play, Pause, Trash2, Settings, Activity, Clock,
  ChevronDown, Search, Filter, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InstanceReturningValues } from 'nmg8-db/src/types';

const statusConfig: Record<InstanceReturningValues['status'], { label: string; color: string; dotColor: string }> = {
  idle:    { label: 'Idle',    color: 'text-zinc-400', dotColor: 'bg-zinc-400' },
  running: { label: 'Running', color: 'text-emerald-400', dotColor: 'bg-emerald-400' },
  paused:  { label: 'Paused',  color: 'text-amber-400', dotColor: 'bg-amber-400' },
  error:   { label: 'Error',   color: 'text-red-400', dotColor: 'bg-red-400' },
};

function StatusBadge({ status }: { status: InstanceReturningValues['status'] }) {
  const cfg = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color} bg-white/5 border border-white/10`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor} ${status === 'running' ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  );
}

function InstanceCard({ instance, onTrigger, onDelete }: {
  instance: InstanceReturningValues;
  onTrigger: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.15] rounded-xl p-5 transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/instances/${instance.id}`)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">{instance.name}</h3>
          <p className="text-xs text-zinc-500 mt-0.5 truncate">
            {instance.description || 'Sem descrição'}
          </p>
        </div>
        <StatusBadge status={instance.status} />
      </div>

      {/* Tags 
        <div className="flex flex-wrap gap-1.5 mb-3">
          {instance.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/[0.06] text-zinc-400 border border-white/[0.06]">
              {tag}
            </span>
          ))}
          {instance.tags.length > 3 && (
            <span className="text-[10px] text-zinc-500">+{instance.tags.length - 3}</span>
          )}
        </div>
      */}

      {/* Info Row */}
      <div className="flex items-center gap-4 text-[11px] text-zinc-500">
        <div className="flex items-center gap-1">
          <Zap size={11} />
          <span className="capitalize">{instance.trigger_type}</span>
          {instance.trigger_type === 'interval' && instance.trigger_config?.interval_seconds && (
            <span className="text-zinc-600">({instance.trigger_config.interval_seconds}s)</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Clock size={11} />
          <span>{new Date(instance.created_at).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      {/* Hover actions */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute top-3 right-3 flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onTrigger(instance.id)}
              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
              title="Run now"
            >
              <Play size={12} />
            </button>
            <button
              onClick={() => onDelete(instance.id)}
              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Running glow */}
      {instance.status === 'running' && (
        <div className="absolute inset-0 rounded-xl ring-1 ring-emerald-500/20 pointer-events-none" />
      )}
    </motion.div>
  );
}

export default function InstancesPage() {
  const { instances, loading, fetchAll, triggerInstance, deleteInstance } = useInstancesStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InstanceReturningValues['status'] | 'all'>('all');

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filtered = instances.filter(i => {
    const matchesSearch = !search ||
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: instances.length,
    running: instances.filter(i => i.status === 'running').length,
    idle: instances.filter(i => i.status === 'idle').length,
    error: instances.filter(i => i.status === 'error').length,
  };

  return (
    <main className="grow px-8 py-6 w-full max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Instâncias</h1>
          <p className="text-sm text-zinc-500 mt-1">Gerencie e monitore suas instâncias de coleta de dados.</p>
        </div>
        <Button
          onClick={() => navigate('/instances/new')}
          className="gap-2 bg-white text-zinc-900 hover:bg-zinc-200 font-medium"
        >
          <Plus size={16} />
          Nova Instância
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, icon: Activity, color: 'text-white' },
          { label: 'Running', value: stats.running, icon: Play, color: 'text-emerald-400' },
          { label: 'Idle', value: stats.idle, icon: Pause, color: 'text-zinc-400' },
          { label: 'Errors', value: stats.error, icon: Zap, color: 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white/[0.05] ${s.color}`}>
              <s.icon size={16} />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar instâncias..."
            className="w-full pl-9 pr-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.2] transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.1] rounded-lg p-0.5">
          {(['all', 'running', 'idle', 'paused', 'error'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                statusFilter === s
                  ? 'bg-white/[0.1] text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {s === 'all' ? 'Todos' : statusConfig[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
            <Activity size={24} className="text-zinc-600" />
          </div>
          <h3 className="text-sm font-medium text-white mb-1">
            {search || statusFilter !== 'all' ? 'Nenhuma instância encontrada' : 'Nenhuma instância criada'}
          </h3>
          <p className="text-xs text-zinc-500 mb-4 max-w-sm">
            {search || statusFilter !== 'all'
              ? 'Tente ajustar os filtros de busca.'
              : 'Crie sua primeira instância para começar a coletar dados.'}
          </p>
          {!search && statusFilter === 'all' && (
            <Button
              onClick={() => navigate('/instances/new')}
              variant="outline"
              size="sm"
              className="gap-2 border-white/10 text-white hover:bg-white/5"
            >
              <Plus size={14} />
              Criar instância
            </Button>
          )}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((instance) => (
              <InstanceCard
                key={instance.id}
                instance={instance}
                onTrigger={triggerInstance}
                onDelete={deleteInstance}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </main>
  );
}
