import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProvider } from "@/components/lib/UserContext";
import { WindowProvider } from "@/components/lib/WindowManager";
import WindowRenderer from "@/components/lib/WindowRenderer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, LogOut } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
      onError: (error) => {
        try { base44.analytics.track({ eventName: 'react_query_error', properties: { success: false } }); } catch (_) {}
      }
    }
  }
});

const MultiempresaContext = createContext({ empresaId: null, setEmpresaId: () => {}, user: null, rbac: { has: () => true } });
export const useMultiempresa = () => useContext(MultiempresaContext);

function HeaderBar({ empresas, empresaId, setEmpresaId, user }) {
  return (
    <div className="w-full h-14 border-b bg-white flex items-center justify-between px-4 gap-3 sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <img src="/favicon.ico" alt="logo" className="h-6 w-6" />
        <div className="font-semibold truncate">ERP Zuccaro</div>
        <div className="text-xs text-muted-foreground ml-2 truncate hidden sm:block">Multiempresa</div>
      </div>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-48 sm:w-64">
          <Select value={empresaId || undefined} onValueChange={(v) => setEmpresaId(v)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Selecionar empresa" />
            </SelectTrigger>
            <SelectContent>
              {(empresas || []).map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.nome_fantasia || e.razao_social || e.nome || e.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="hidden sm:flex items-center text-sm text-muted-foreground max-w-[160px] truncate">
          {user?.full_name || user?.email}
        </div>
        <Button size="icon" variant="ghost" onClick={() => base44.auth.logout()}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  const [empresas, setEmpresas] = useState([]);
  const [empresaId, setEmpresaId] = useState(() => localStorage.getItem("empresaId") || null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        setUser(me || null);
      } catch (_) { /* not logged */ }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.Empresa.list();
        setEmpresas(list || []);
        if (!empresaId && list?.[0]?.id) {
          setEmpresaId(list[0].id);
          localStorage.setItem("empresaId", list[0].id);
        }
      } catch (err) {
        base44.analytics.track({ eventName: "empresas_fetch_error", properties: { success: false } });
      }
    })();
  }, []);

  useEffect(() => {
    if (empresaId) localStorage.setItem("empresaId", empresaId);
  }, [empresaId]);

  const rbac = useMemo(() => ({
    has: (modulo, acao) => {
      // Regra básica: admin vê tudo; outros: apenas leitura em alguns módulos
      if (user?.role === "admin") return true;
      const readOnlyModules = ["Dashboard", "Comercial", "Financeiro", "Estoque", "Fiscal"];
      if (acao === "view" && readOnlyModules.includes(modulo)) return true;
      return false;
    }
  }), [user]);

  const ctxValue = useMemo(() => ({ empresaId, setEmpresaId, user, rbac }), [empresaId, user, rbac]);

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <MultiempresaContext.Provider value={ctxValue}>
          <WindowProvider>
        <div className="w-full h-full min-h-screen bg-muted/20">
          <HeaderBar empresas={empresas} empresaId={empresaId} setEmpresaId={setEmpresaId} user={user} />
          <div className="w-full h-[calc(100vh-56px)] overflow-auto p-4">{children}</div>
              <WindowRenderer />
        </div>
      </WindowProvider>
        </MultiempresaContext.Provider>
      </UserProvider>
    </QueryClientProvider>
  );
}