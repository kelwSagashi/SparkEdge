import { useState, useEffect, useCallback, useRef } from 'react';
import { cloudService, type CloudStatus } from '@/rest-api-client/cloud.service';
import { Button } from '@/components/ui/button';
import {
  Wifi, WifiOff, Loader2, Unplug, RefreshCw, Mail, Lock, Zap, CheckCircle2,
  AlertCircle, PlugZap, Building2
} from 'lucide-react';

const inputCls =
  'w-full px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.2] focus:bg-white/[0.06] transition-all';
const labelCls = 'block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2';

type PageState = 'loading' | 'disconnected' | 'connecting' | 'connected';

export default function CloudSettingsPage() {
  const [pageState, setPageState] = useState<PageState>('loading');
  const [status, setStatus] = useState<CloudStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [edgeName, setEdgeName] = useState('');

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const s = await cloudService.getStatus();
      setStatus(s);
      setPageState(s.connected ? 'connected' : 'disconnected');
    } catch {
      setPageState('disconnected');
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchStatus();
    pollingRef.current = setInterval(fetchStatus, 8000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [fetchStatus]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPageState('connecting');
    setActionLoading(true);
    try {
      await cloudService.connect({ email, password, edge_name: edgeName || undefined });
      setPassword(''); // clear sensitive data
      await fetchStatus();
    } catch (err: any) {
      setError(err?.message ?? 'Falha ao conectar ao Spark. Verifique suas credenciais.');
      setPageState('disconnected');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setError(null);
    setActionLoading(true);
    try {
      await cloudService.disconnect();
      await fetchStatus();
      setEmail('');
      setPassword('');
      setEdgeName('');
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao desconectar.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReconnect = async () => {
    setError(null);
    setActionLoading(true);
    try {
      await cloudService.reconnect();
      await fetchStatus();
    } catch (err: any) {
      setError(err?.message ?? 'Falha ao reconectar.');
    } finally {
      setActionLoading(false);
    }
  };

  // ──────────────────────────────────────────────
  // Render helpers
  // ──────────────────────────────────────────────

  const MqttBadge = ({ connected }: { connected: boolean }) => (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
        connected
          ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30'
          : 'bg-zinc-700/50 text-zinc-400 ring-1 ring-white/10'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
      {connected ? 'MQTT online' : 'MQTT offline'}
    </span>
  );

  if (pageState === 'loading') {
    return (
      <main className="grow px-8 py-6 w-full max-w-[600px] mx-auto">
        <div className="flex items-center gap-2 text-zinc-500 mt-24 justify-center">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Verificando status...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="grow px-8 py-6 w-full max-w-[600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Conectar ao Spark</h1>
        </div>
        <p className="text-sm text-zinc-500 mt-1 ml-11">
          Vincule este Edge à sua conta no Spark para receber comandos remotos.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 text-sm text-red-400">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── CONNECTED STATE ─────────────────────────────── */}
      {pageState === 'connected' && status && (
        <>
          {/* Status card */}
          <div className="bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Conectado ao Spark</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Este Edge está vinculado à sua conta</p>
                </div>
              </div>
              <MqttBadge connected={status.mqtt.connected} />
            </div>

            {status.edge_id && (
              <div className="mt-5 pt-4 border-t border-white/[0.06]">
                <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold mb-1">Edge ID</p>
                <code className="text-xs text-zinc-300 font-mono bg-white/[0.04] px-3 py-1.5 rounded-lg block break-all">
                  {status.edge_id}
                </code>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="gap-2 border-white/10 text-white hover:bg-white/5"
              disabled={actionLoading}
              onClick={handleReconnect}
            >
              {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Reconectar MQTT
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
              disabled={actionLoading}
              onClick={handleDisconnect}
            >
              {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Unplug size={14} />}
              Desconectar do Spark
            </Button>
          </div>

          {/* Info note */}
          <p className="text-xs text-zinc-600 mt-4">
            Ao desconectar, as credenciais MQTT serão removidas localmente. Execute{' '}
            <span className="font-mono text-zinc-500">spark-edge connect</span> novamente para re-vincular.
          </p>
        </>
      )}

      {/* ── CONNECTING STATE ─────────────────────────────── */}
      {pageState === 'connecting' && (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-8 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-cyan-500/15 flex items-center justify-center">
            <Loader2 size={26} className="text-cyan-400 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">Conectando ao Spark...</p>
            <p className="text-xs text-zinc-500 mt-1">Autenticando e registrando este Edge</p>
          </div>
        </div>
      )}

      {/* ── DISCONNECTED STATE ─────────────────────────────── */}
      {pageState === 'disconnected' && (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6">
          {/* Info header */}
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/[0.06]">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
              <WifiOff size={18} className="text-zinc-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Não conectado</p>
              <p className="text-xs text-zinc-500">Use sua conta do Spark (cloud) para vincular este Edge</p>
            </div>
          </div>

          <form onSubmit={handleConnect} className="space-y-5">
            <div>
              <label className={labelCls}>
                <Building2 size={11} className="inline mr-1" />
                Nome do Edge (opcional)
              </label>
              <input
                type="text"
                value={edgeName}
                onChange={(e) => setEdgeName(e.target.value)}
                placeholder={`Edge ${new Date().toLocaleDateString('pt-BR')}`}
                className={inputCls}
                disabled={actionLoading}
              />
              <p className="text-[11px] text-zinc-600 mt-1.5">Como este Edge aparecerá no painel do Spark</p>
            </div>

            <div>
              <label className={labelCls}>
                <Mail size={11} className="inline mr-1" />
                Email da conta Spark
              </label>
              <input
                id="cloud-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                className={inputCls}
                required
                autoComplete="email"
                disabled={actionLoading}
              />
            </div>

            <div>
              <label className={labelCls}>
                <Lock size={11} className="inline mr-1" />
                Senha da conta Spark
              </label>
              <input
                id="cloud-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputCls}
                required
                autoComplete="current-password"
                disabled={actionLoading}
              />
            </div>

            <div className="pt-1">
              <Button
                type="submit"
                id="cloud-connect-btn"
                disabled={actionLoading || !email || !password}
                className="w-full gap-2 bg-white text-zinc-900 hover:bg-zinc-100 font-medium h-11"
              >
                {actionLoading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <PlugZap size={15} />
                )}
                {actionLoading ? 'Conectando...' : 'Conectar ao Spark'}
              </Button>
            </div>
          </form>

          {/* Security note */}
          <div className="mt-5 pt-4 border-t border-white/[0.06]">
            <p className="text-[11px] text-zinc-600">
              🔒 Suas credenciais são usadas apenas para registrar este Edge e são descartadas imediatamente.
              Apenas as credenciais MQTT atribuídas ao Edge são armazenadas localmente.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
