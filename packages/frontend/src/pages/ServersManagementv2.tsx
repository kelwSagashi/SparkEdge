import React, { useState } from 'react';
import { 
  Server, 
  Globe, 
  Key, 
  Plus, 
  Search, 
  MoreVertical, 
  ExternalLink, 
  Activity, 
  Settings2,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ServerWithDetails {
  id: string;
  name: string;
  type: {
    id: string;
    name: string;
    key: string;
  };
  base_url: string;
  credential_id?: string | null;
  headers?: any;
  project_id: string;
  created_at: string;
  updated_at: string;
  _count?: {
    endpoints: number;
  };
}
// Mock para demonstração (Substitua pelo fetch do seu tRPC ou API)
const MOCK_SERVERS: ServerWithDetails[] = [
  {
    id: '1',
    name: 'Produção API Gateway',
    type: { id: 'rest', name: 'REST API', key: 'rest' },
    base_url: 'https://api.production.com/v1',
    credential_id: 'cred_1',
    project_id: 'proj_default',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    _count: { endpoints: 12 }
  },
  {
    id: '2',
    name: 'Microserviço Webhook',
    type: { id: 'webhook', name: 'Webhook Receiver', key: 'webhook' },
    base_url: 'https://hooks.internal.net',
    credential_id: null,
    project_id: 'proj_default',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    _count: { endpoints: 4 }
  }
];

export const ServerManagementScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-8 min-h-screen text-primary">
      {/* Header Profissional */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Servidores</h1>
          <p className="text-foreground">Gerencie seus servidores, endpoints, autenticações e integrações externas.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
            <input 
              type="text"
              placeholder="Buscar servidor..."
              className="pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none w-64 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {MOCK_SERVERS.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((server) => (
            <ServerCard key={server.id} server={server} />
          ))}
      </div>
    </div>
  );
};

const ServerCard = ({ server }: { server: ServerWithDetails }) => {
  return (
    <motion.div 
      layout
    //   initial={{ opacity: 0, y: 20 }}
    //   animate={{ opacity: 1, y: 0 }}
    //   exit={{ opacity: 0, scale: 0.95 }}
      className="bg-card-foreground border border-border rounded-xl p-6 hover:shadow-md hover:border-blue-200 transition-all group relative overflow-hidden"
    >
      {/* Indicador de Status/Tipo no topo */}
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <Server className="w-6 h-6" />
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <Settings2 className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info Principal */}
      <div className="space-y-1 mb-6">
        <h3 className="font-bold text-lg text-primary flex items-center gap-2">
          {server.name}
        </h3>
        <div className="flex items-center text-foreground text-sm font-mono truncate">
          <Globe className="w-3 h-3 mr-1.5 shrink-0" />
          {server.base_url}
        </div>
      </div>

      {/* Metadata / Tags */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-foreground rounded-md text-xs font-semibold uppercase tracking-wider">
          <Layers className="w-3 h-3" />
          {server.type.name}
        </div>
        {server.credential_id && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-md text-xs font-semibold text-green-700">
            <Key className="w-3 h-3" />
            Autenticado
          </div>
        )}
      </div>

      {/* Footer do Card com Estatísticas Rápidas */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-tighter">Endpoints</span>
            <span className="text-slate-700 font-medium">{server._count?.endpoints || 0} rotas</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-tighter">Status</span>
            <span className="flex items-center gap-1 text-green-600 font-medium">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Ativo
            </span>
          </div>
        </div>

        <button className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 group/btn">
          Ver Detalhes
          <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};