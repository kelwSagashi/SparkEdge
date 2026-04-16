import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { User, Mail, Lock, Save, Key } from 'lucide-react';

export default function SettingsPage() {
  const { user, generateNewApiKey } = useAuthStore();
  const [name, setName] = useState(user?.first_name ?? '');
  const [saving, setSaving] = useState(false);

  const inputClasses = "w-full px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.2] focus:bg-white/[0.06] transition-all";
  const labelClasses = "block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2";

  return (
    <main className="grow px-8 py-6 w-full max-w-[600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Configurações</h1>
        <p className="text-sm text-zinc-500 mt-1">Gerencie seu perfil e preferências do sistema.</p>
      </div>

      {/* Profile section */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/[0.06]">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {(user?.first_name ?? user?.email ?? '').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{user?.first_name ?? 'Usuário'}</h2>
            <p className="text-sm text-zinc-500">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className={labelClasses}>
              <User size={11} className="inline mr-1" /> Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Seu nome"
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>
              <Mail size={11} className="inline mr-1" /> Email
            </label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className={inputClasses + ' opacity-50 cursor-not-allowed'}
            />
          </div>

          <Button
            disabled={saving}
            className="gap-2 bg-white text-zinc-900 hover:bg-zinc-200 font-medium"
          >
            <Save size={14} />
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </div>

      {/* Security section */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Lock size={14} /> Segurança
        </h3>
        <div className="space-y-5">
          <div>
            <label className={labelClasses}>Senha atual</label>
            <input type="password" placeholder="••••••••" className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>Nova senha</label>
            <input type="password" placeholder="••••••••" className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>Confirmar nova senha</label>
            <input type="password" placeholder="••••••••" className={inputClasses} />
          </div>
          <Button variant="outline" className="gap-2 border-white/10 text-white hover:bg-white/5">
            <Lock size={14} /> Alterar senha
          </Button>
        </div>
      </div>

       <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Key size={14} /> API Key
        </h3>
        <div className="space-y-5">
            <div>
              <label className={labelClasses}>API Key</label>
              <div className={inputClasses}>{user?.api_key}</div>
          </div>
          <span className="text-xs text-zinc-500">* Ao gerar uma nova API Key, a antiga será invalidada. Copie sua API Key para um local seguro.</span>
          <Button
            onClick={() => generateNewApiKey(user?.id ?? '')}
            variant="outline" className="gap-2 border-white/10 text-white hover:bg-white/5">
            <Lock size={14} /> Gerar nova API Key
          </Button>
        </div>
      </div>
    </main>
  );
}
