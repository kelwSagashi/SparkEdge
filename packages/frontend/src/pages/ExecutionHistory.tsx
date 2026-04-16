import { useEffect, useState } from 'react';
import { instancesApi, type InstanceExecution } from '@/rest-api-client/instances.service';
import {
  Clock, CheckCircle2, XCircle, Loader2, Timer,
  ChevronDown, ChevronRight, Search, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const statusMap: Record<InstanceExecution['status'], { icon: React.ElementType; color: string; bg: string; label: string }> = {
  queued:  { icon: Clock,        color: 'text-zinc-400',   bg: 'bg-zinc-500/10',   label: 'Na fila' },
  running: { icon: Loader2,      color: 'text-blue-400',   bg: 'bg-blue-500/10',   label: 'Executando' },
  success: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Sucesso' },
  failed:  { icon: XCircle,      color: 'text-red-400',    bg: 'bg-red-500/10',    label: 'Falha' },
  timeout: { icon: Timer,        color: 'text-amber-400',  bg: 'bg-amber-500/10',  label: 'Timeout' },
};

function ExecutionRow({ execution }: { execution: InstanceExecution }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = statusMap[execution.status];
  const Icon = cfg.icon;

  const duration = execution.duration_ms
    ? execution.duration_ms >= 1000
      ? `${(execution.duration_ms / 1000).toFixed(1)}s`
      : `${execution.duration_ms}ms`
    : '—';

  return (
    <motion.div layout className="border-b border-white/[0.04] last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className={`p-2 rounded-lg ${cfg.bg}`}>
          <Icon size={14} className={`${cfg.color} ${execution.status === 'running' ? 'animate-spin' : ''}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-500">{execution.id.slice(0, 8)}</span>
            <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
          </div>
          <p className="text-[11px] text-zinc-600 mt-0.5 truncate">
            Instância: {execution.instance_id.slice(0, 12)}...
          </p>
        </div>

        <div className="flex items-center gap-6 text-[11px] text-zinc-500">
          <div className="flex items-center gap-1">
            <Clock size={11} />
            <span>{duration}</span>
          </div>
          <span className="capitalize px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-500">{execution.trigger_type}</span>
          <span>{execution.started_at ? new Date(execution.started_at).toLocaleString('pt-BR') : '—'}</span>
          <ChevronDown size={14} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 space-y-3">
              {/* Timestamps */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  ['Iniciado', execution.started_at],
                  ['Finalizado', execution.finished_at],
                  ['Duração', duration],
                ].map(([label, val]) => (
                  <div key={label as string} className="bg-white/[0.02] rounded-lg p-3">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{label}</p>
                    <p className="text-xs text-white font-mono mt-1">{val ? new Date(val as string).toLocaleString('pt-BR') : val || '—'}</p>
                  </div>
                ))}
              </div>

              {/* Delivery status */}
              <div className="flex items-center gap-4 text-xs">
                <div className={`flex items-center gap-1 ${execution.destination_sent ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {execution.destination_sent ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  Destino {execution.destination_sent ? 'enviado' : 'não enviado'}
                </div>
                {execution.fallback_used && (
                  <div className="flex items-center gap-1 text-amber-400">
                    <Clock size={12} />
                    Fallback utilizado
                  </div>
                )}
              </div>

              {/* Error */}
              {execution.error_message && (
                <div className="bg-red-500/[0.06] border border-red-500/[0.1] rounded-lg p-3">
                  <p className="text-[10px] text-red-400 uppercase tracking-wider mb-1">Erro</p>
                  <p className="text-xs text-red-300 font-mono">{execution.error_message}</p>
                </div>
              )}

              {/* Output */}
              {execution.output && (
                <div className="bg-white/[0.02] rounded-lg p-3">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Output</p>
                  <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap max-h-48 overflow-auto">
                    {typeof execution.output === 'string' ? execution.output : JSON.stringify(execution.output, null, 2)}
                  </pre>
                </div>
              )}

              {/* Logs */}
              {execution.logs && execution.logs.length > 0 && (
                <div className="bg-white/[0.02] rounded-lg p-3">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Logs ({execution.logs.length})</p>
                  <div className="space-y-1 max-h-48 overflow-auto font-mono text-[11px]">
                    {execution.logs.map((log, idx) => (
                      <div key={idx} className={`flex items-start gap-2 ${
                        log.level === 'error' ? 'text-red-400' : log.level === 'warn' ? 'text-amber-400' : 'text-zinc-400'
                      }`}>
                        <span className="text-zinc-600 shrink-0">{new Date(log.timestamp).toLocaleTimeString('pt-BR')}</span>
                        <span className="uppercase text-[9px] font-bold w-10 shrink-0">{log.level}</span>
                        <span>{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ExecutionHistoryPage() {
  const [executions, setExecutions] = useState<InstanceExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InstanceExecution['status'] | 'all'>('all');

  useEffect(() => {
    // Mock data for now — will be replaced when execution endpoint is ready
    setLoading(false);
    setExecutions([]);
  }, []);

  const filtered = executions.filter(e => {
    const matchesSearch = !search || e.instance_id.includes(search) || e.id.includes(search);
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <main className="grow px-8 py-6 w-full max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Histórico de Execuções</h1>
        <p className="text-sm text-zinc-500 mt-1">Visualize todas as execuções de instâncias e seus resultados.</p>
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
          {(['all', 'success', 'failed', 'running', 'queued', 'timeout'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                statusFilter === s ? 'bg-white/[0.1] text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {s === 'all' ? 'Todos' : statusMap[s].label}
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
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
            <Clock size={24} className="text-zinc-600" />
          </div>
          <h3 className="text-sm font-medium text-white mb-1">Nenhuma execução encontrada</h3>
          <p className="text-xs text-zinc-500 max-w-sm">
            Sem execuções registradas. Execute uma instância para ver o histórico aqui.
          </p>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl overflow-hidden">
          {filtered.map(exec => (
            <ExecutionRow key={exec.id} execution={exec} />
          ))}
        </div>
      )}
    </main>
  );
}
