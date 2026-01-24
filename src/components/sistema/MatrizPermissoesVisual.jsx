import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LayoutDashboard,
  ShoppingCart,
  DollarSign,
  Package,
  Truck,
  Factory,
  UserCircle,
  FileText,
  BarChart3,
  Calendar,
  MessageCircle,
  Search,
  Eye,
  Filter,
  Download
} from "lucide-react";

const MODULOS_ICONES = {
  dashboard: LayoutDashboard,
  comercial: ShoppingCart,
  financeiro: DollarSign,
  estoque: Package,
  compras: Package,
  expedicao: Truck,
  producao: Factory,
  rh: UserCircle,
  fiscal: FileText,
  cadastros: UserCircle,
  crm: MessageCircle,
  agenda: Calendar,
  relatorios: BarChart3,
  contratos: FileText,
  chatbot: MessageCircle,
  configuracoes: LayoutDashboard
};

export default function MatrizPermissoesVisual({ perfis = [], estruturaSistema }) {
  const [busca, setBusca] = useState("");
  const [perfilDetalhesOpen, setPerfilDetalhesOpen] = useState(false);
  const [perfilSelecionado, setPerfilSelecionado] = useState(null);

  const perfisAtivos = Array.isArray(perfis) ? perfis.filter(p => p.ativo !== false) : [];
  const estruturaValida = estruturaSistema && typeof estruturaSistema === 'object' ? estruturaSistema : {};
  const modulosFiltrados = Object.entries(estruturaValida).filter(([id, mod]) =>
    !busca || (mod?.nome && mod.nome.toLowerCase().includes(busca.toLowerCase()))
  );

  const calcularNivelAcesso = (perfil, moduloId, modulo) => {
    const perms = perfil?.permissoes?.[moduloId] || {};
    const totalSecoes = modulo?.secoes ? Object.keys(modulo.secoes).length : 0;
    if (totalSecoes === 0) return { nivel: "nenhum", label: "Sem Acesso", cor: "slate" };
    const secoesComAcesso = Object.values(perms).filter(arr => arr?.length > 0).length;
    
    if (secoesComAcesso === 0) return { nivel: "nenhum", label: "Sem Acesso", cor: "slate" };
    if (secoesComAcesso === totalSecoes) {
      const todasCompletas = Object.values(perms).every(arr => arr?.length >= 4);
      if (todasCompletas) return { nivel: "total", label: "Total", cor: "green" };
      return { nivel: "alto", label: "Alto", cor: "blue" };
    }
    if (secoesComAcesso > totalSecoes / 2) return { nivel: "medio", label: "Médio", cor: "yellow" };
    return { nivel: "baixo", label: "Baixo", cor: "orange" };
  };

  return (
    <div className="w-full h-full space-y-4">
      {/* Busca */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar módulos..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Matriz */}
      <Card className="w-full">
        <ScrollArea className="w-full h-[600px]">
          <div className="min-w-max">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-white z-10">
                <tr>
                  <th className="border p-3 bg-slate-100 text-left min-w-[200px]">
                    Módulo do Sistema
                  </th>
                  {perfisAtivos.map(p => (
                    <th 
                      key={p.id} 
                      className="border p-3 bg-slate-100 text-center min-w-[120px] cursor-pointer hover:bg-slate-200"
                      onClick={() => {
                        setPerfilSelecionado(p);
                        setPerfilDetalhesOpen(true);
                      }}
                    >
                      <div className="text-sm font-medium">{p.nome_perfil}</div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {p.nivel_perfil}
                      </Badge>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modulosFiltrados.map(([moduloId, modulo]) => {
                 const Icone = MODULOS_ICONES[moduloId] || LayoutDashboard;
                 const totalSecoes = modulo?.secoes ? Object.keys(modulo.secoes).length : 0;

                 return (
                   <tr key={moduloId} className="hover:bg-slate-50">
                     <td className="border p-3">
                       <div className="flex items-center gap-2">
                         <Icone className="w-5 h-5 text-blue-600" />
                         <span className="font-medium">{modulo?.nome || moduloId}</span>
                       </div>
                       <p className="text-xs text-slate-500 mt-1">
                         {totalSecoes} seções
                       </p>
                     </td>
                      {perfisAtivos.map(perfil => {
                        const { nivel, label, cor } = calcularNivelAcesso(perfil, moduloId, modulo);
                        
                        const badgeClass = 
                          cor === 'green' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                          cor === 'blue' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                          cor === 'yellow' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
                          cor === 'orange' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' :
                          'bg-slate-100 text-slate-700 hover:bg-slate-200';
                        
                        return (
                          <td key={perfil.id} className="border p-3 text-center">
                            <Badge className={`${badgeClass} cursor-pointer`}>
                              {label}
                            </Badge>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </Card>

      {/* Modal Detalhes do Perfil */}
      <Dialog open={perfilDetalhesOpen} onOpenChange={setPerfilDetalhesOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Detalhes: {perfilSelecionado?.nome_perfil}</DialogTitle>
          </DialogHeader>
          {perfilSelecionado && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Nível</p>
                  <Badge variant="outline">{perfilSelecionado.nivel_perfil}</Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <Badge className={perfilSelecionado.ativo ? 'bg-green-600' : 'bg-slate-600'}>
                    {perfilSelecionado.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-2">Descrição</p>
                <p className="text-sm">{perfilSelecionado.descricao || 'Sem descrição'}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-2">Módulos com Acesso</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(perfilSelecionado.permissoes || {}).map(([mod, perms]) => {
                    const temAcesso = Object.values(perms).some(arr => arr?.length > 0);
                    if (!temAcesso) return null;
                    
                    return (
                      <Badge key={mod} variant="outline" className="capitalize">
                        {mod.replace(/_/g, ' ')}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}