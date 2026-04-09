import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { ServersTable } from '@/components/servers/servers-table';
import { ServersEmptyState } from '@/components/servers/servers-empty-state';
import { ServersTableSkeleton } from '@/components/servers/servers-table-skeleton';
import AddServerDialog from '@/components/add-server-dialog';
import Search from '@/components/search';
import { useServersMock } from '@/hooks/useServers';
import type { ServerWithRelations } from '@/interfaces/servers';

/**
 * Servers Management Page
 * 
 * Main dashboard for viewing, filtering, and managing integrated servers.
 * Features:
 * - Server list with data table
 * - Search functionality
 * - Add/Edit/Delete operations
 * - Empty state for first-time users
 * - Loading states with skeletons
 */
export default function ServersManagement() {
  const { servers, loading, error, deleteServer, refresh } = useServersMock();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<ServerWithRelations | null>(null);

  // Filter servers based on search query
  const filteredServers = React.useMemo(() => {
    if (!searchQuery.trim()) return servers;
    
    const query = searchQuery.toLowerCase();
    return servers.filter(
      (server) =>
        server.name.toLowerCase().includes(query) ||
        server.base_url.toLowerCase().includes(query) ||
        server.serverType?.name.toLowerCase().includes(query) ||
        server.project?.name.toLowerCase().includes(query)
    );
  }, [servers, searchQuery]);

  const handleAddServer = () => {
    setEditingServer(null);
    setIsAddDialogOpen(true);
  };

  const handleEditServer = (server: ServerWithRelations) => {
    setEditingServer(server);
    setIsAddDialogOpen(true);
  };

  const handleViewEndpoints = (server: ServerWithRelations) => {
    // TODO: Navigate to endpoints view or open endpoints dialog
    console.log('View endpoints for server:', server.id);
  };

  const handleDeleteServer = async (id: string) => {
    await deleteServer(id);
  };

  const handleRefresh = () => {
    refresh();
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Servers Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage your integrated servers and API connections
            </p>
          </div>
          <Button onClick={handleAddServer} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Add Server
          </Button>
        </div>

        {/* Search and Actions Bar */}
        {servers.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <Search
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={loading}
              className="text-primary hover:text-primary"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-red-500 font-medium">Error loading servers</p>
          <p className="text-red-400 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Content */}
      <div className="bg-background rounded-lg border border-primary-foreground/20">
        {loading && servers.length === 0 ? (
          <ServersTableSkeleton />
        ) : filteredServers.length === 0 && searchQuery ? (
          <div className="py-16 text-center">
            <p className="text-primary text-lg font-medium">No servers found</p>
            <p className="text-muted-foreground mt-2">
              Try adjusting your search query
            </p>
          </div>
        ) : filteredServers.length === 0 ? (
          <ServersEmptyState onAddServer={handleAddServer} />
        ) : (
          <ServersTable
            servers={filteredServers}
            onEdit={handleEditServer}
            onViewEndpoints={handleViewEndpoints}
            onDelete={handleDeleteServer}
            loading={loading}
          />
        )}
      </div>

      {/* Add/Edit Server Dialog */}
      <AddServerDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
