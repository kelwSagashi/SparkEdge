import { useEffect, useState } from 'react';
import {
  FileText, HardDrive, RefreshCw, Clock, CheckCircle2,
  XCircle, AlertTriangle, Trash2, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface FallbackItem {
  id: string;
  instance_id: string;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  payload: string;
  filepath: string | null;
  retry_count: number;
  last_retry_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<FallbackItem['status'], { icon: React.ElementType; color: string; bg: string; label: string }> = {
  pending: { icon: Clock,         color: 'text-amber-400',   bg: 'bg-amber-500/10',   label: 'Pendente' },
  sending: { icon: RefreshCw,     color: 'text-blue-400',    bg: 'bg-blue-500/10',    label: 'Enviando' },
  sent:    { icon: CheckCircle2,  color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Enviado' },
  failed:  { icon: XCircle,       color: 'text-red-400',     bg: 'bg-red-500/10',     label: 'Falhado' },
};

export default function LocalDataPage() {
  const [items, setItems] = useState<FallbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FallbackItem['status'] | 'all'>('all');

  useEffect(() => {
    // TODO: fetch from API
    setLoading(false);
    setItems([]);
  }, []);

  const filtered = items.filter(i => {
    const matchesSearch = !search || i.instance_id.includes(search) || i.id.includes(search);
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: items.length,
    pending: items.filter(i => i.status === 'pending').length,
    sent: items.filter(i => i.status === 'sent').length,
    failed: items.filter(i => i.status === 'failed').length,
  };

  return (
    <main className="grow px-8 py-6 w-full max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/[0.08] flex items-center justify-center">
            <HardDrive size={20} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Dados Locais</h1>
            <p className="text-sm text-zinc-500">Dados armazenados no fallback local para reenvio.</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-white/10 text-white hover:bg-white/5"
          onClick={() => {/* TODO: trigger flush */}}
        >
          <RefreshCw size={14} />
          Reenviar pendentes
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-white', Icon: HardDrive },
          { label: 'Pendentes', value: stats.pending, color: 'text-amber-400', Icon: Clock },
          { label: 'Enviados', value: stats.sent, color: 'text-emerald-400', Icon: CheckCircle2 },
          { label: 'Falhados', value: stats.failed, color: 'text-red-400', Icon: XCircle },
        ].map(({ label, value, color, Icon }) => (
          <div key={label} className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white/[0.05] ${color}`}>
              <Icon size={16} />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider">{label}</p>
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
            placeholder="Buscar por ID..."
            className="w-full pl-9 pr-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.2] transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.1] rounded-lg p-0.5">
          {(['all', 'pending', 'sending', 'sent', 'failed'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                statusFilter === s ? 'bg-white/[0.1] text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {s === 'all' ? 'Todos' : statusConfig[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-white/[0.08] flex items-center justify-center mb-4">
            <FileText size={24} className="text-zinc-600" />
          </div>
          <h3 className="text-sm font-medium text-white mb-1">Nenhum dado local</h3>
          <p className="text-xs text-zinc-500 max-w-sm">
            Dados serão armazenados aqui quando o destino primário estiver indisponível.
          </p>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl overflow-hidden">
          {filtered.map(item => {
            const cfg = statusConfig[item.status];
            const Icon = cfg.icon;
            return (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                <div className={`p-2 rounded-lg ${cfg.bg}`}>
                  <Icon size={14} className={`${cfg.color} ${item.status === 'sending' ? 'animate-spin' : ''}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-400">{item.id.slice(0, 8)}</span>
                    <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 mt-0.5">
                    Instância: {item.instance_id.slice(0, 12)}... • Tentativas: {item.retry_count}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-zinc-500">
                  {item.last_error && (
                    <span className="flex items-center gap-1 text-red-400" title={item.last_error}>
                      <AlertTriangle size={11} />
                      Erro
                    </span>
                  )}
                  <span>{new Date(item.created_at).toLocaleString('pt-BR')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

