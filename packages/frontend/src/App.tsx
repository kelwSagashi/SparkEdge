import React from 'react'
import './App.css'
import Header from './components/header'
import { SidebarInset, SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import SideBar from './components/sidebar';
import { Routes, Route, Navigate, } from 'react-router-dom'
import Instances from './pages/instances';
import Hub from './pages/Hub';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { useEffect } from 'react';
import { useAuthStore } from './stores/auth-store';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FlowBuilderPage } from './components/flow/flow-builder';


function App() {
  const loadMe = useAuthStore((s) => s.loadMe);
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  // While checking session, show a minimal loading state
  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  // Unauthenticated layout: only show auth pages (no header/sidebar)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  // Authenticated layout (original app)
  return (
    <DndProvider backend={HTML5Backend}>
      <SidebarProvider
        className="flex flex-col h-screen bg-background text-foreground"
        defaultOpen={false}
        style={
          {
            // "display": "flex",
            "position": "relative",
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <div className="flex flex-grow overflow-hidden">
          <SideBar />
          <SidebarInset className='flex flex-col flex-grow relative overflow-hidden'>
            <Header />
            <div className="flex-grow relative overflow-y-auto">
              <Routes>
                {/* Rotas para o Editor de Fluxos */}
                <Route path="/" element={<Navigate to="/workflow" replace />} />
                <Route path="/workflow/new" element={<ProtectedRoute><FlowBuilderPage /></ProtectedRoute>} />
                <Route path="/workflow/:id" element={<ProtectedRoute><FlowBuilderPage /></ProtectedRoute>} />
                <Route path="/workflow" element={<ProtectedRoute><Instances /></ProtectedRoute>} />
                <Route path="/script-hub" element={<ProtectedRoute><Hub /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/workflow" replace />} />
              </Routes>
            </div>
            {/* <SidebarTrigger className="relative -ml-4 -mb-4 top-4 z-10 bg-secondary-foreground rounded-full" /> */}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </DndProvider>
  );
}

export default App
