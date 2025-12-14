import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import {
  Shield, CheckCircle, AlertTriangle, RefreshCw, CheckSquare, Info,
  Eye, Plus, Pencil, Trash2, Download, LayoutDashboard, ShoppingCart,
  DollarSign, Package, Truck, Factory, UserCircle, FileText, BarChart3,
  MessageCircle, Briefcase
} from "lucide-react";

const ESTRUTURA_SISTEMA = {
  dashboard: {
    nome: "Dashboard",
    icone: LayoutDashboard,
    cor: "blue",
    secoes: {
      principal: { nome: "Visão Geral", abas: ["kpis", "graficos", "alertas"] },
      corporativo: { nome: "Dashboard Corporativo", abas: ["multiempresa", "consolidado"] }
    }
  },
  comercial: {
    nome: "Comercial e Vendas",
    icone: ShoppingCart,
    cor: "green",
    secoes: {
      clientes: { nome: "Clientes", abas: ["lista", "detalhes", "historico", "crm"] },
      pedidos: { nome: "Pedidos", abas: ["lista", "novo", "aprovacao", "faturamento"] },
      orcamentos: { nome: "Orçamentos", abas: ["lista", "novo", "conversao"] },
      tabelas_preco: { nome: "Tabelas de Preço", abas: ["lista", "itens", "clientes_vinculados"] },
      comissoes: { nome: "Comissões", abas: ["lista", "calculo", "pagamento"] },
      notas_fiscais: { nome: "Notas Fiscais", abas: ["emissao", "lista", "cancelamento"] }
    }
  },
  financeiro: {
    nome: "Financeiro e Contábil",
    icone: DollarSign,
    cor: "emerald",
    secoes: {
      contas_receber: { nome: "Contas a Receber", abas: ["lista", "baixa", "cobranca", "boletos"] },
      contas_pagar: { nome: "Contas a Pagar", abas: ["lista", "baixa", "aprovacao", "pagamento"] },
      caixa: { nome: "Caixa Diário", abas: ["movimentos", "fechamento", "transferencias"] },
      conciliacao: { nome: "Conciliação Bancária", abas: ["importar", "conciliar", "historico"] },
      relatorios: { nome: "Relatórios Financeiros", abas: ["dre", "fluxo_caixa", "inadimplencia"] }
    }
  },
  estoque: {
    nome: "Estoque e Almoxarifado",
    icone: Package,
    cor: "purple",
    secoes: {
      produtos: { nome: "Produtos", abas: ["lista", "novo", "lotes", "validade"] },
      movimentacoes: { nome: "Movimentações", abas: ["entrada", "saida", "transferencia", "ajuste"] },
      inventario: { nome: "Inventário", abas: ["contagem", "acerto", "historico"] },
      requisicoes: { nome: "Requisições", abas: ["lista", "aprovacao", "atendimento"] }
    }
  },
  compras: {
    nome: "Compras e Suprimentos",
    icone: Briefcase,
    cor: "orange",
    secoes: {
      fornecedores: { nome: "Fornecedores", abas: ["lista", "avaliacao", "historico"] },
      solicitacoes: { nome: "Solicitações", abas: ["lista", "nova", "aprovacao"] },
      cotacoes: { nome: "Cotações", abas: ["lista", "nova", "comparativo"] },
      ordens_compra: { nome: "Ordens de Compra", abas: ["lista", "nova", "recebimento"] }
    }
  },
  expedicao: {
    nome: "Expedição e Logística",
    icone: Truck,
    cor: "cyan",
    secoes: {
      entregas: { nome: "Entregas", abas: ["lista", "separacao", "despacho", "rastreamento"] },
      romaneios: { nome: "Romaneios", abas: ["lista", "novo", "impressao"] },
      roteirizacao: { nome: "Roteirização", abas: ["mapa", "otimizacao", "motoristas"] },
      transportadoras: { nome: "Transportadoras", abas: ["lista", "tabelas_frete"] }
    }
  },
  producao: {
    nome: "Produção e Manufatura",
    icone: Factory,
    cor: "indigo",
    secoes: {
      ordens_producao: { nome: "Ordens de Produção", abas: ["lista", "nova", "programacao", "kanban"] },
      apontamentos: { nome: "Apontamentos", abas: ["producao", "paradas", "refugo"] },
      qualidade: { nome: "Qualidade", abas: ["inspecao", "nao_conformidades", "acoes"] }
    }
  },
  rh: {
    nome: "Recursos Humanos",
    icone: UserCircle,
    cor: "pink",
    secoes: {
      colaboradores: { nome: "Colaboradores", abas: ["lista", "documentos", "historico"] },
      ponto: { nome: "Ponto Eletrônico", abas: ["registros", "ajustes", "relatorios"] },
      ferias: { nome: "Férias", abas: ["programacao", "solicitacoes", "aprovacao"] },
      folha: { nome: "Folha de Pagamento", abas: ["calculo", "holerites", "encargos"] }
    }
  },
  fiscal: {
    nome: "Fiscal e Tributário",
    icone: FileText,
    cor: "red",
    secoes: {
      nfe: { nome: "NF-e", abas: ["emissao", "entrada", "manifestacao", "inutilizacao"] },
      tabelas_fiscais: { nome: "Tabelas Fiscais", abas: ["cfop", "cst", "ncm", "aliquotas"] },
      sped: { nome: "SPED", abas: ["fiscal", "contribuicoes", "contabil"] }
    }
  },
  cadastros_gerais: {
    nome: "Cadastros Gerais",
    icone: Shield,
    cor: "slate",
    secoes: {
      clientes: { nome: "Clientes", abas: ["lista", "novo", "historico"] },
      fornecedores: { nome: "Fornecedores", abas: ["lista", "novo", "avaliacoes"] },
      produtos: { nome: "Produtos", abas: ["lista", "novo", "importacao"] },
      colaboradores: { nome: "Colaboradores", abas: ["lista", "novo", "documentos"] },
      usuarios: { nome: "Usuários", abas: ["lista", "novo", "permissoes"] },
      empresas: { nome: "Empresas", abas: ["lista", "novo", "config"] }
    }
  },
  crm: {
    nome: "CRM - Relacionamento",
    icone: MessageCircle,
    cor: "violet",
    secoes: {
      oportunidades: { nome: "Oportunidades", abas: ["funil", "lista", "conversao"] },
      interacoes: { nome: "Interações", abas: ["historico", "nova", "follow_up"] },
      campanhas: { nome: "Campanhas", abas: ["lista", "nova", "resultados"] }
    }
  },
  relatorios: {
    nome: "Relatórios e Análises",
    icone: BarChart3,
    cor: "teal",
    secoes: {
      dashboards: { nome: "Dashboards", abas: ["executivo", "operacional", "financeiro"] },
      relatorios: { nome: "Relatórios", abas: ["vendas", "estoque", "financeiro", "rh"] },
      exportacao: { nome: "Exportação", abas: ["excel", "pdf", "api"] }
    }
  },
  chatbot: {
    nome: "Hub de Atendimento",
    icone: MessageCircle,
    cor: "green",
    secoes: {
      atendimento: { nome: "Atendimento", abas: ["conversas", "fila", "transferencia"] },
      configuracoes: { nome: "Configurações", abas: ["canais", "templates", "base_conhecimento"] }
    }
  }
};

const ACOES = [
  { id: "visualizar", nome: "Visualizar", icone: Eye, cor: "slate" },
  { id: "criar", nome: "Criar", icone: Plus, cor: "blue" },
  { id: "editar", nome: "Editar", icone: Pencil, cor: "green" },
  { id: "excluir", nome: "Excluir", icone: Trash2, cor: "red" },
  { id: "aprovar", nome: "Aprovar", icone: CheckSquare, cor: "purple" },
  { id: "exportar", nome: "Exportar", icone: Download, cor: "cyan" }
];

export default function FormularioPerfilAcessoCompleto({ perfil, onSalvar, onCancelar, empresaAtual }) {
  const [formPerfil, setFormPerfil] = useState({
    nome_perfil: "",
    descricao: "",
    nivel_perfil: "Operacional",
    permissoes: {},
    ativo: true
  });

  const [modulosExpandidos, setModulosExpandidos] = useState([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (perfil) {
      const permissoes = perfil.permissoes || {};
      setFormPerfil({
        nome_perfil: perfil.nome_perfil || "",
        descricao: perfil.descricao || "",
        nivel_perfil: perfil.nivel_perfil || "Operacional",
        permissoes: permissoes,
        ativo: perfil.ativo !== false
      });
      // EXPANDIR TODOS OS MÓDULOS
      setModulosExpandidos(Object.keys(ESTRUTURA_SISTEMA));
      console.log("📂 Perfil carregado, TODOS módulos expandidos:", Object.keys(ESTRUTURA_SISTEMA));
    } else {
      // Novo perfil - expandir todos também
      setModulosExpandidos(Object.keys(ESTRUTURA_SISTEMA));
    }
  }, [perfil]);

  const togglePermissao = (modulo, secao, acao) => {
    setFormPerfil(prev => {
      const novasPerms = { ...prev.permissoes };
      if (!novasPerms[modulo]) novasPerms[modulo] = {};
      if (!novasPerms[modulo][secao]) novasPerms[modulo][secao] = [];

      const index = novasPerms[modulo][secao].indexOf(acao);
      if (index > -1) {
        novasPerms[modulo][secao] = novasPerms[modulo][secao].filter(a => a !== acao);
      } else {
        novasPerms[modulo][secao] = [...novasPerms[modulo][secao], acao];
      }

      console.log(`🔄 Toggle: ${modulo}.${secao}.${acao} →`, novasPerms[modulo][secao]);
      return { ...prev, permissoes: novasPerms };
    });
  };

  const selecionarTudoSecao = (modulo, secao) => {
    setFormPerfil(prev => {
      const novasPerms = { ...prev.permissoes };
      if (!novasPerms[modulo]) novasPerms[modulo] = {};
      
      const todasAcoes = ACOES.map(a => a.id);
      const temTodas = todasAcoes.every(a => novasPerms[modulo][secao]?.includes(a));
      
      novasPerms[modulo][secao] = temTodas ? [] : [...todasAcoes];
      
      console.log(`🔄 Seção ${modulo}.${secao}:`, novasPerms[modulo][secao]);
      return { ...prev, permissoes: novasPerms };
    });
  };

  const selecionarTudoModulo = (modulo) => {
    setFormPerfil(prev => {
      const novasPerms = { ...prev.permissoes };
      const todasAcoes = ACOES.map(a => a.id);
      
      const secoes = Object.keys(ESTRUTURA_SISTEMA[modulo].secoes);
      const tudoMarcado = secoes.every(secao => 
        todasAcoes.every(a => novasPerms[modulo]?.[secao]?.includes(a))
      );
      
      novasPerms[modulo] = {};
      secoes.forEach(secao => {
        novasPerms[modulo][secao] = tudoMarcado ? [] : [...todasAcoes];
      });
      
      console.log(`🔄 Módulo ${modulo}:`, novasPerms[modulo]);
      return { ...prev, permissoes: novasPerms };
    });
  };

  const selecionarTudoGlobal = () => {
    setFormPerfil(prev => {
      const novasPerms = {};
      const todasAcoes = ACOES.map(a => a.id);
      
      const algumVazio = Object.keys(ESTRUTURA_SISTEMA).some(modId => {
        const secoes = Object.keys(ESTRUTURA_SISTEMA[modId].secoes);
        return secoes.some(secaoId => {
          return !prev.permissoes?.[modId]?.[secaoId] || 
                 prev.permissoes[modId][secaoId].length < todasAcoes.length;
        });
      });

      Object.keys(ESTRUTURA_SISTEMA).forEach(modId => {
        novasPerms[modId] = {};
        Object.keys(ESTRUTURA_SISTEMA[modId].secoes).forEach(secaoId => {
          novasPerms[modId][secaoId] = algumVazio ? [...todasAcoes] : [];
        });
      });

      console.log("🌐 Seleção Global:", algumVazio ? "TUDO MARCADO" : "TUDO DESMARCADO");
      return { ...prev, permissoes: novasPerms };
    });
  };

  const temPermissao = (modulo, secao, acao) => {
    return formPerfil.permissoes?.[modulo]?.[secao]?.includes(acao) || false;
  };

  const contarPermissoesModulo = (modulo) => {
    let total = 0;
    const perms = formPerfil.permissoes?.[modulo] || {};
    Object.values(perms).forEach(secao => {
      total += secao?.length || 0;
    });
    return total;
  };

  const contarPermissoesTotal = () => {
    let total = 0;
    Object.values(formPerfil.permissoes || {}).forEach(modulo => {
      Object.values(modulo || {}).forEach(secao => {
        total += secao?.length || 0;
      });
    });
    return total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formPerfil.nome_perfil) {
      toast.error("❌ Nome do perfil é obrigatório");
      return;
    }

    setSalvando(true);
    try {
      const dadosSalvar = {
        ...formPerfil,
        group_id: empresaAtual?.group_id || null
      };
      
      console.log("💾 Enviando para salvar:", dadosSalvar);
      await onSalvar(dadosSalvar);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 border-b">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">
              {perfil?.id ? `Editar: ${perfil.nome_perfil}` : 'Novo Perfil de Acesso'}
            </h2>
            <p className="text-blue-100">Controle Granular Total • Módulo → Seção → Aba → Ações</p>
          </div>
          {contarPermissoesTotal() > 0 && (
            <Badge className="bg-white/20 text-white ml-auto px-4 py-2">
              {contarPermissoesTotal()} permissões selecionadas
            </Badge>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
        <div className="p-6 space-y-6 border-b bg-slate-50">
          {/* Dados Básicos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <Label>Nome do Perfil *</Label>
              <Input
                value={formPerfil.nome_perfil}
                onChange={(e) => setFormPerfil({ ...formPerfil, nome_perfil: e.target.value })}
                placeholder="Ex: Vendedor, Gerente Financeiro"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label>Nível</Label>
              <Select
                value={formPerfil.nivel_perfil}
                onValueChange={(v) => setFormPerfil({ ...formPerfil, nivel_perfil: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Gerencial">Gerencial</SelectItem>
                  <SelectItem value="Operacional">Operacional</SelectItem>
                  <SelectItem value="Consulta">Consulta</SelectItem>
                  <SelectItem value="Personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <div className="flex items-center gap-2 mt-2">
                <Switch
                  checked={formPerfil.ativo}
                  onCheckedChange={(v) => setFormPerfil({ ...formPerfil, ativo: v })}
                />
                <span className="text-sm">{formPerfil.ativo ? 'Ativo' : 'Inativo'}</span>
              </div>
            </div>
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              value={formPerfil.descricao}
              onChange={(e) => setFormPerfil({ ...formPerfil, descricao: e.target.value })}
              placeholder="Descreva as responsabilidades deste perfil"
              className="mt-1"
              rows={2}
            />
          </div>
        </div>

        {/* PERMISSÕES GRANULARES */}
        <div className="flex-1 overflow-hidden flex flex-col p-6">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-lg font-bold">Permissões Granulares por Módulo</Label>
            <Button
              type="button"
              variant="outline"
              onClick={selecionarTudoGlobal}
              className="text-sm"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Selecionar/Desmarcar Tudo
            </Button>
          </div>

          <Alert className="mb-4 border-blue-200 bg-blue-50">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-800 space-y-1">
              <div>
                <strong>✅ Todos os {Object.keys(ESTRUTURA_SISTEMA).length} módulos estão expandidos e visíveis</strong>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-green-600 text-white">
                  {contarPermissoesTotal()} permissões ativas
                </Badge>
                <Badge className="bg-blue-100 text-blue-700">
                  {Object.keys(formPerfil.permissoes).filter(m => contarPermissoesModulo(m) > 0).length}/{Object.keys(ESTRUTURA_SISTEMA).length} módulos configurados
                </Badge>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex-1 overflow-auto border rounded-lg bg-slate-50">
            <Accordion type="multiple" value={modulosExpandidos} onValueChange={setModulosExpandidos} className="w-full">
              {Object.entries(ESTRUTURA_SISTEMA).map(([moduloId, modulo]) => {
                const Icone = modulo.icone;
                const qtdPerms = contarPermissoesModulo(moduloId);
                const temPermissoes = qtdPerms > 0;
                
                return (
                  <AccordionItem key={moduloId} value={moduloId} className={`border-b ${temPermissoes ? 'bg-blue-50/30' : ''}`}>
                    <AccordionTrigger className={`px-4 py-3 hover:bg-white/50 ${temPermissoes ? 'font-bold' : ''}`}>
                      <div className="flex items-center gap-3 flex-1">
                        <Icone className={`w-5 h-5 text-${modulo.cor}-600`} />
                        <span className={temPermissoes ? 'font-bold' : 'font-medium'}>{modulo.nome}</span>
                        {temPermissoes ? (
                          <Badge className="bg-green-600 text-white ml-2 shadow-md">
                            ✓ {qtdPerms} ativas
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-200 text-slate-500 ml-2">
                            0
                          </Badge>
                        )}
                        <div className="ml-auto mr-4">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              selecionarTudoModulo(moduloId);
                            }}
                            className="text-xs"
                          >
                            <CheckSquare className="w-3 h-3 mr-1" />
                            Tudo
                          </Button>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-3">
                        {Object.entries(modulo.secoes).map(([secaoId, secao]) => {
                          const qtdSecao = formPerfil.permissoes?.[moduloId]?.[secaoId]?.length || 0;
                          const temPermissoesSecao = qtdSecao > 0;
                          
                          return (
                            <Card key={secaoId} className={`border-2 ${temPermissoesSecao ? 'bg-green-50/50 border-green-300' : 'bg-white'}`}>
                              <CardHeader className={`${temPermissoesSecao ? 'bg-green-100/50' : 'bg-slate-50'} border-b pb-3`}>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <CardTitle className={`text-sm ${temPermissoesSecao ? 'font-bold' : 'font-semibold'}`}>
                                      {temPermissoesSecao && <CheckCircle className="w-3.5 h-3.5 text-green-600 inline mr-1" />}
                                      {secao.nome}
                                    </CardTitle>
                                    {secao.abas?.length > 0 && (
                                      <p className="text-xs text-slate-500 mt-1">
                                        Abas: {secao.abas.join(", ")}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {temPermissoesSecao ? (
                                      <Badge className="bg-green-600 text-white shadow-sm">
                                        ✓ {qtdSecao}/{ACOES.length}
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-slate-200 text-slate-500">
                                        0/{ACOES.length}
                                      </Badge>
                                    )}
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => selecionarTudoSecao(moduloId, secaoId)}
                                      className="h-6 px-2 text-xs"
                                    >
                                      <CheckSquare className="w-3 h-3 mr-1" />
                                      Todas
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className={`p-3 ${temPermissoesSecao ? 'bg-white' : ''}`}>
                                <div className="flex flex-wrap gap-2">
                                  {ACOES.map(acao => {
                                    const marcado = temPermissao(moduloId, secaoId, acao.id);
                                    const IconeAcao = acao.icone;
                                    
                                    return (
                                      <label
                                        key={acao.id}
                                        className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border-2 text-xs transition-all shadow-sm ${
                                          marcado
                                            ? `bg-gradient-to-r from-${acao.cor}-500 to-${acao.cor}-600 border-${acao.cor}-400 text-white font-bold shadow-md scale-105`
                                            : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                        }`}
                                      >
                                        <Checkbox
                                          checked={marcado}
                                          onCheckedChange={() => togglePermissao(moduloId, secaoId, acao.id)}
                                          className={marcado ? 'border-white' : ''}
                                        />
                                        <IconeAcao className="w-4 h-4" />
                                        <span className="font-semibold">{acao.nome}</span>
                                        {marcado && <CheckCircle className="w-3 h-3 ml-1" />}
                                      </label>
                                    );
                                  })}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-between items-center gap-3 p-6 border-t bg-white">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md px-3 py-1.5">
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              {contarPermissoesTotal()} permissões ativas
            </Badge>
            <Badge className="bg-blue-100 text-blue-700 px-3 py-1.5">
              {Object.keys(formPerfil.permissoes).filter(m => contarPermissoesModulo(m) > 0).length}/{Object.keys(ESTRUTURA_SISTEMA).length} módulos
            </Badge>
            {contarPermissoesTotal() === 0 && (
              <Badge className="bg-orange-100 text-orange-700 px-3 py-1.5">
                <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                Nenhuma permissão selecionada
              </Badge>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onCancelar}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={salvando || !formPerfil.nome_perfil}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {salvando ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Salvar Perfil
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}