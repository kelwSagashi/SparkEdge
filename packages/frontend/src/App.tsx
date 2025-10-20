import React from 'react'
import './App.css'
import Header from './components/header'
import { SidebarInset, SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import SideBar from './components/sidebar';
import { Routes, Route, Navigate, } from 'react-router-dom'
import Instances from './pages/instances';
import Hub from './pages/Hub';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FlowBuilderPage } from './components/flow/flow-builder';


function App() {

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
                <Route path="/workflow/new" element={<FlowBuilderPage />} />
                <Route path="/workflow/:id" element={<FlowBuilderPage />} />
                <Route path="/workflow" element={<Instances />} />
                <Route path="/script-hub" element={<Hub />} />
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
