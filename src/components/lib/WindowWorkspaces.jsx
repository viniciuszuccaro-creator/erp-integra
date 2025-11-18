import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Layers, Plus, Check } from 'lucide-react';
import { useWindowManager } from './WindowManagerPersistent';

/**
 * 🗂️ WORKSPACES - Grupos de Janelas
 * 
 * Permite salvar e alternar entre diferentes conjuntos de janelas
 * Exemplo: "Financeiro" = contas a pagar + receber + dashboard
 */

const WORKSPACES_KEY = 'erp-workspaces';

export function WindowWorkspaces() {
  const { windows, closeAllWindows, openWindow } = useWindowManager();
  const [workspaces, setWorkspaces] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(WORKSPACES_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const saveWorkspace = () => {
    const name = prompt('Nome do workspace:');
    if (!name) return;

    const workspace = {
      id: Date.now().toString(),
      name,
      windows: windows.map(w => ({
        id: w.id,
        title: w.title,
        position: w.position,
        dimensions: w.dimensions
      })),
      createdAt: new Date().toISOString()
    };

    const updated = [...workspaces, workspace];
    setWorkspaces(updated);
    localStorage.setItem(WORKSPACES_KEY, JSON.stringify(updated));
    setCurrentWorkspace(workspace.id);
  };

  const loadWorkspace = (workspace) => {
    closeAllWindows();
    
    // Reabrir janelas do workspace
    workspace.windows.forEach(w => {
      // Aqui você precisaria reimplementar a lógica de abrir cada janela
      // baseado no título/id salvo
    });

    setCurrentWorkspace(workspace.id);
  };

  const deleteWorkspace = (id) => {
    const updated = workspaces.filter(w => w.id !== id);
    setWorkspaces(updated);
    localStorage.setItem(WORKSPACES_KEY, JSON.stringify(updated));
    if (currentWorkspace === id) {
      setCurrentWorkspace(null);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-[9999]"
      >
        <Layers className="w-4 h-4 mr-2" />
        Workspaces
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-white rounded-lg shadow-xl p-4 w-64">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Workspaces</h3>
        <Button size="sm" variant="ghost" onClick={() => setIsOpen(false)}>×</Button>
      </div>

      <div className="space-y-2">
        {workspaces.map(ws => (
          <div
            key={ws.id}
            className={`p-2 rounded border ${
              currentWorkspace === ws.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-sm">{ws.name}</div>
                <div className="text-xs text-slate-500">
                  {ws.windows.length} janelas
                </div>
              </div>
              {currentWorkspace === ws.id && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </div>
            <div className="flex gap-1 mt-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => loadWorkspace(ws)}
              >
                Carregar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => deleteWorkspace(ws.id)}
              >
                ×
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        size="sm"
        className="w-full mt-3"
        onClick={saveWorkspace}
      >
        <Plus className="w-4 h-4 mr-2" />
        Salvar Atual
      </Button>
    </div>
  );
}

export default WindowWorkspaces;