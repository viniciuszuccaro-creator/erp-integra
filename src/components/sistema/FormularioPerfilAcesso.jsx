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
  Shield, CheckCircle, AlertTriangle, RefreshCw, CheckSquare,
  Eye, Plus, Pencil, Trash2, Download, ChevronDown, Info
} from "lucide-react";

const ACOES = [
  { id: "visualizar", nome: "Visualizar", icone: Eye, cor: "slate" },
  { id: "criar", nome: "Criar", icone: Plus, cor: "blue" },
  { id: "editar", nome: "Editar", icone: Pencil, cor: "green" },
  { id: "excluir", nome: "Excluir", icone: Trash2, cor: "red" },
  { id: "aprovar", nome: "Aprovar", icone: CheckSquare, cor: "purple" },
  { id: "exportar", nome: "Exportar", icone: Download, cor: "cyan" }
];

export default function FormularioPerfilAcesso({ perfil, onSalvar, onCancelar, estruturaSistema }) {
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
    if (perfil && !perfil.novo) {
      const permissoes = perfil.permissoes || {};
      setFormPerfil({
        nome_perfil: perfil.nome_perfil || "",
        descricao: perfil.descricao || "",
        nivel_perfil: perfil.nivel_perfil || "Operacional",
        permissoes: permissoes,
        ativo: perfil.ativo !== false
      });
      // Expandir TODOS os módulos
      setModulosExpandidos(Object.keys(estruturaSistema));
    } else {
      // Novo perfil - expandir todos
      setModulosExpandidos(Object.keys(estruturaSistema));
    }
  }, [perfil, estruturaSistema]);

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
      return { ...prev, permissoes: novasPerms };
    });
  };

  const selecionarTudoModulo = (modulo) => {
    setFormPerfil(prev => {
      const novasPerms = { ...prev.permissoes };
      const todasAcoes = ACOES.map(a => a.id);
      
      const secoes = Object.keys(estruturaSistema[modulo].secoes);
      const tudoMarcado = secoes.every(secao => 
        todasAcoes.every(a => novasPerms[modulo]?.[secao]?.includes(a))
      );
      
      novasPerms[modulo] = {};
      secoes.forEach(secao => {
        novasPerms[modulo][secao] = tudoMarcado ? [] : [...todasAcoes];
      });
      
      return { ...prev, permissoes: novasPerms };
    });
  };

  const selecionarTudoGlobal = () => {
    setFormPerfil(prev => {
      const novasPerms = {};
      const todasAcoes = ACOES.map(a => a.id);
      
      const algumVazio = Object.keys(estruturaSistema).some(modId => {
        const secoes = Object.keys(estruturaSistema[modId].secoes);
        return secoes.some(secaoId => {
          return !prev.permissoes?.[modId]?.[secaoId] || 
                 prev.permissoes[modId][secaoId].length < todasAcoes.length;
        });
      });

      Object.keys(estruturaSistema).forEach(modId => {
        novasPerms[modId] = {};
        Object.keys(estruturaSistema[modId].secoes).forEach(secaoId => {
          novasPerms[modId][secaoId] = algumVazio ? [...todasAcoes] : [];
        });
      });

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
    if (e) e.preventDefault();
    if (!formPerfil.nome_perfil) {
      toast.error("❌ Nome do perfil é obrigatório");
      return;
    }
    
    setSalvando(true);
    try {
      const sucesso = await onSalvar(formPerfil);
      if (sucesso) {
        toast.success("✅ Perfil salvo com sucesso!");
        if (onCancelar) onCancelar();
      }
    } catch (error) {
      console.error("❌ Erro ao salvar:", error);
      toast.error("❌ Erro ao salvar perfil");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">
                {perfil?.novo ? 'Novo Perfil de Acesso' : `Editar: ${perfil?.nome_perfil || 'Perfil'}`}
              </h2>
              <p className="text-sm text-blue-100">Controle Granular • Módulo → Seção → Ações</p>
            </div>
          </div>
          {contarPermissoesTotal() > 0 && (
            <Badge className="bg-white/20 px-4 py-2">
              {contarPermissoesTotal()} permissões selecionadas
            </Badge>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6 space-y-6">
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

        {/* PERMISSÕES GRANULARES */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-lg font-bold flex items-center gap-2">
              Permissões Granulares por Módulo
              <Badge className="bg-blue-100 text-blue-700">
                {modulosExpandidos.length}/{Object.keys(estruturaSistema).length} expandidos
              </Badge>
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (modulosExpandidos.length === Object.keys(estruturaSistema).length) {
                    setModulosExpandidos([]);
                    toast.info("📁 Todos os módulos foram recolhidos");
                  } else {
                    setModulosExpandidos(Object.keys(estruturaSistema));
                    toast.info("📂 Todos os módulos foram expandidos");
                  }
                }}
                className="text-sm"
              >
                <ChevronDown className="w-4 h-4 mr-2" />
                {modulosExpandidos.length === Object.keys(estruturaSistema).length ? 'Recolher Todos' : 'Expandir Todos'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={selecionarTudoGlobal}
                className="text-sm bg-blue-100 hover:bg-blue-200"
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Selecionar/Desmarcar Tudo
              </Button>
            </div>
          </div>

          <Alert className="mb-4 border-blue-300 bg-blue-50">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-800 space-y-1">
              <div>
                <strong>✓ TODOS os módulos visíveis abaixo:</strong> Role para ver e configurar qualquer módulo
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-green-600 text-white shadow-md">
                  ✓ {contarPermissoesTotal()} permissões ativas
                </Badge>
                <Badge className="bg-blue-100 text-blue-700">
                  {Object.keys(formPerfil.permissoes).filter(m => contarPermissoesModulo(m) > 0).length}/{Object.keys(estruturaSistema).length} módulos configurados
                </Badge>
              </div>
            </AlertDescription>
          </Alert>

          <div className="border-2 border-blue-300 rounded-lg bg-slate-50 shadow-inner max-h-[600px] overflow-auto">
            <Accordion 
              type="multiple" 
              value={modulosExpandidos} 
              onValueChange={setModulosExpandidos}
              className="w-full"
            >
              {Object.entries(estruturaSistema).map(([moduloId, modulo]) => {
                const Icone = modulo.icone;
                const qtdPerms = contarPermissoesModulo(moduloId);
                const temPermissoes = qtdPerms > 0;
                const estaExpandido = modulosExpandidos.includes(moduloId);
                
                return (
                  <AccordionItem 
                    key={moduloId} 
                    value={moduloId} 
                    className={`border-b-2 ${temPermissoes ? 'bg-gradient-to-r from-blue-50 to-green-50 border-green-300' : 'bg-white border-slate-200'}`}
                  >
                    <AccordionTrigger className={`px-4 py-4 hover:bg-white/70 ${temPermissoes ? 'font-bold' : ''} ${estaExpandido ? 'bg-white/50' : ''}`}>
                      <div className="flex items-center gap-3 flex-1">
                        <Icone className={`w-6 h-6 text-${modulo.cor}-600`} />
                        <span className={`text-base ${temPermissoes ? 'font-bold text-green-700' : 'font-medium'}`}>
                          {modulo.nome}
                        </span>
                        {temPermissoes ? (
                          <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white ml-2 shadow-lg px-3 py-1">
                            ✓ {qtdPerms} ativas
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-200 text-slate-600 ml-2">
                            Vazio - Clique para configurar
                          </Badge>
                        )}
                        {estaExpandido && (
                          <Badge className="bg-blue-600 text-white ml-2 animate-pulse">
                            ⬇ Aberto
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
                            className="text-xs bg-blue-100 hover:bg-blue-200"
                          >
                            <CheckSquare className="w-3 h-3 mr-1" />
                            Tudo
                          </Button>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 bg-white">
                      <div className="space-y-3 pt-2">
                        {Object.entries(modulo.secoes).map(([secaoId, secao]) => {
                          const qtdSecao = formPerfil.permissoes?.[moduloId]?.[secaoId]?.length || 0;
                          const temPermissoesSecao = qtdSecao > 0;
                          
                          return (
                            <Card key={secaoId} className={`border-2 ${temPermissoesSecao ? 'bg-green-50/50 border-green-300 shadow-md' : 'bg-white border-slate-200'}`}>
                              <CardHeader className={`${temPermissoesSecao ? 'bg-green-100/50' : 'bg-slate-50'} border-b pb-3`}>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <CardTitle className={`text-sm ${temPermissoesSecao ? 'font-bold text-green-800' : 'font-semibold'}`}>
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
                                      <Badge className="bg-green-600 text-white shadow-sm px-2 py-1">
                                        ✓ {qtdSecao}/{ACOES.length}
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-slate-200 text-slate-500 px-2 py-1">
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
                                        className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border-2 text-xs transition-all shadow-sm hover:scale-105 ${
                                          marcado
                                            ? `bg-gradient-to-r from-${acao.cor}-500 to-${acao.cor}-600 border-${acao.cor}-400 text-white font-bold shadow-lg`
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
      </form>

      {/* Footer com botões */}
      <div className="border-t bg-slate-50 p-4 sticky bottom-0">
        <div className="flex justify-between items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md px-3 py-1.5">
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              {contarPermissoesTotal()} permissões ativas
            </Badge>
            <Badge className="bg-blue-100 text-blue-700 px-3 py-1.5">
              {Object.keys(formPerfil.permissoes).filter(m => contarPermissoesModulo(m) > 0).length}/{Object.keys(estruturaSistema).length} módulos configurados
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
              onClick={handleSubmit}
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
      </div>
    </div>
  );
}