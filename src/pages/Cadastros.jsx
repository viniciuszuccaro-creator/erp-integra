import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Users, Building2, Truck, DollarSign, User, Plus, Search, Edit, Mail,
  Package, CreditCard, Landmark, Network, Sparkles, Link2, Cpu,
  MessageCircle, CheckCircle2, AlertTriangle, Bell, Shield, Briefcase,
  UserCircle, Clock, UserCheck, Target, Receipt, TrendingUp, Eye,
  Maximize2, FileText, Boxes, MapPin, Phone
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PainelDinamicoCliente from "../components/cadastros/PainelDinamicoCliente";
import IconeAcessoCliente from "../components/cadastros/IconeAcessoCliente";
import PainelDinamicoFornecedor from "../components/cadastros/PainelDinamicoFornecedor";
import IconeAcessoFornecedor from "../components/cadastros/IconeAcessoFornecedor";
import PainelDinamicoTransportadora from "../components/cadastros/PainelDinamicoTransportadora";
import IconeAcessoTransportadora from "../components/cadastros/IconeAcessoTransportadora";
import IconeAcessoColaborador from "../components/cadastros/IconeAcessoColaborador";
import PainelDinamicoColaborador from "../components/cadastros/PainelDinamicoColaborador";
import BotaoNovaJanela from "@/components/cadastros/BotaoNovaJanela";
import { useWindow } from "@/components/lib/useWindow";

/**
 * V21.0 - CADASTROS 100% MULTITAREFA
 * ✅ Zero dialogs antigos
 * ✅ Todos os formulários abrem em janelas
 * ✅ Ícones de acesso rápido mantidos
 */
export default function Cadastros() {
  const [buscaGlobal, setBuscaGlobal] = useState("");
  const [painelClienteAberto, setPainelClienteAberto] = useState(false);
  const [clienteParaPainel, setClienteParaPainel] = useState(null);
  const [painelFornecedorAberto, setPainelFornecedorAberto] = useState(false);
  const [fornecedorParaPainel, setFornecedorParaPainel] = useState(null);
  const [painelTransportadoraAberto, setPainelTransportadoraAberto] = useState(false);
  const [transportadoraParaPainel, setTransportadoraParaPainel] = useState(null);
  const [painelColaboradorAberto, setPainelColaboradorAberto] = useState(false);
  const [colaboradorParaPainel, setColaboradorParaPainel] = useState(null);

  const queryClient = useQueryClient();
  
  const {
    openProductWindow,
    openClienteWindow,
    openFornecedorWindow,
    openTabelaPrecoWindow,
    openColaboradorWindow,
    openTransportadoraWindow,
    openCentroCustoWindow,
    openBancoWindow,
    openFormaPagamentoWindow,
    openVeiculoWindow,
    openEmpresaWindow,
    openGrupoWindow,
    openUsuarioWindow,
    openPerfilAcessoWindow,
    openServicoWindow
  } = useWindow();

  // QUERIES
  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list('-created_date'),
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: () => base44.entities.Fornecedor.list('-created_date'),
  });

  const { data: transportadoras = [] } = useQuery({
    queryKey: ['transportadoras'],
    queryFn: () => base44.entities.Transportadora.list('-created_date'),
  });

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores'],
    queryFn: () => base44.entities.Colaborador.list('-created_date'),
  });

  const { data: centrosCusto = [] } = useQuery({
    queryKey: ['centrosCusto'],
    queryFn: () => base44.entities.CentroCusto.list('-created_date'),
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list('-created_date'),
  });

  const { data: formasPagamento = [] } = useQuery({
    queryKey: ['formas-pagamento'],
    queryFn: () => base44.entities.FormaPagamento.list(),
  });

  const { data: bancos = [] } = useQuery({
    queryKey: ['bancos'],
    queryFn: () => base44.entities.Banco.list(),
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  const { data: grupos = [] } = useQuery({
    queryKey: ['grupos'],
    queryFn: () => base44.entities.GrupoEmpresarial.list(),
  });

  const { data: veiculos = [] } = useQuery({
    queryKey: ['veiculos'],
    queryFn: () => base44.entities.Veiculo.list('-created_date'),
  });

  const { data: servicos = [] } = useQuery({
    queryKey: ['servicos'],
    queryFn: () => base44.entities.Servico.list(),
  });

  const { data: tabelasPreco = [] } = useQuery({
    queryKey: ['tabelas-preco'],
    queryFn: () => base44.entities.TabelaPreco.list(),
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: perfisAcesso = [] } = useQuery({
    queryKey: ['perfis-acesso'],
    queryFn: () => base44.entities.PerfilAcesso.list(),
  });

  const statusColors = {
    'Ativo': 'bg-green-100 text-green-700 border-green-300',
    'Inativo': 'bg-gray-100 text-gray-700 border-gray-300',
    'Prospect': 'bg-blue-100 text-blue-700 border-blue-300',
    'Bloqueado': 'bg-red-100 text-red-700 border-red-300',
    'Ativa': 'bg-green-100 text-green-700 border-green-300'
  };

  const totalItensGrupo1 = empresas.length + grupos.length + usuarios.length + perfisAcesso.length + centrosCusto.length;
  const totalItensGrupo2 = clientes.length + fornecedores.length + colaboradores.length + transportadoras.length;
  const totalItensGrupo3 = produtos.length + servicos.length + tabelasPreco.length;
  const totalItensGrupo4 = bancos.length + formasPagamento.length;
  const totalItensGrupo5 = veiculos.length;

  const produtosFiltrados = produtos.filter(p =>
    p.codigo?.toLowerCase().includes(buscaGlobal.toLowerCase()) ||
    p.descricao?.toLowerCase().includes(buscaGlobal.toLowerCase()) ||
    p.grupo?.toLowerCase().includes(buscaGlobal.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* V21.0: Banner Multitarefa */}
      <Alert className="border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50">
        <Maximize2 className="w-5 h-5 text-purple-600" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-purple-900">🚀 V21.0 - Sistema 100% Multitarefa!</p>
              <p className="text-sm text-purple-700 mt-1">
                Todos os cadastros abrem em janelas independentes. Use <kbd className="px-2 py-1 bg-white rounded border">Ctrl+K</kbd> para comandos.
              </p>
            </div>
            <div className="flex gap-2">
              <BotaoNovaJanela tipo="produto" label="Produto" variant="outline" size="sm" />
              <BotaoNovaJanela tipo="cliente" label="Cliente" variant="outline" size="sm" />
              <BotaoNovaJanela tipo="tabela-preco" label="Tabela" variant="outline" size="sm" />
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Hub de Cadastros Gerais</h1>
          <p className="text-slate-600">Central de dados mestres - V21.0</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar em todos os cadastros..."
            value={buscaGlobal}
            onChange={(e) => setBuscaGlobal(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" onClick={() => setBuscaGlobal('')}>
            Limpar
          </Button>
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["grupo-1", "produtos"]} className="space-y-4">
        
        {/* GRUPO 1: EMPRESA E ESTRUTURA */}
        <AccordionItem value="grupo-1" className="border-0 shadow-md rounded-lg overflow-hidden">
          <AccordionTrigger className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 hover:bg-blue-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">🏢 Empresa e Estrutura</h3>
                <p className="text-xs text-slate-600">Multiempresa, Grupos, Usuários e Controle</p>
              </div>
              <Badge className="ml-auto">{totalItensGrupo1} itens</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 bg-white space-y-6">
            {/* Empresas */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Empresas ({empresas.length})
                </h4>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => openEmpresaWindow()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Empresa
                </Button>
              </div>
              
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-slate-50">
                    <TableRow>
                      <TableHead>Razão Social</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Regime</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {empresas.map((empresa) => (
                      <TableRow key={empresa.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium">{empresa.razao_social}</TableCell>
                        <TableCell className="text-sm">{empresa.cnpj}</TableCell>
                        <TableCell className="text-sm">{empresa.regime_tributario}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[empresa.status]}>{empresa.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => openEmpresaWindow(empresa)}>
                            <Maximize2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Grupos */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold flex items-center gap-2">
                  <Network className="w-5 h-5 text-purple-600" />
                  Grupos Empresariais ({grupos.length})
                </h4>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => openGrupoWindow()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Grupo
                </Button>
              </div>
              
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-slate-50">
                    <TableRow>
                      <TableHead>Nome do Grupo</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Empresas</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grupos.map((grupo) => (
                      <TableRow key={grupo.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium">{grupo.nome_do_grupo}</TableCell>
                        <TableCell className="text-sm">{grupo.cnpj_opcional || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{(grupo.empresas_ids || []).length} empresas</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => openGrupoWindow(grupo)}>
                            <Maximize2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Grid: Usuários, Perfis, Centros de Custo */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Usuários */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Usuários ({usuarios.length})
                  </h4>
                  <Button size="sm" variant="outline" onClick={() => openUsuarioWindow()}>
                    <Plus className="w-3 h-3 mr-2" />
                  </Button>
                </div>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50">
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usuarios.map((u) => (
                        <TableRow key={u.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium text-sm">{u.full_name}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => openUsuarioWindow(u)}>
                              <Maximize2 className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Perfis */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-600" />
                    Perfis ({perfisAcesso.length})
                  </h4>
                  <Button size="sm" variant="outline" onClick={() => openPerfilAcessoWindow()}>
                    <Plus className="w-3 h-3 mr-2" />
                  </Button>
                </div>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50">
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {perfisAcesso.map((p) => (
                        <TableRow key={p.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium text-sm">{p.nome}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => openPerfilAcessoWindow(p)}>
                              <Maximize2 className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Centros de Custo */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                    Centros de Custo ({centrosCusto.length})
                  </h4>
                  <Button size="sm" variant="outline" onClick={() => openCentroCustoWindow()}>
                    <Plus className="w-3 h-3 mr-2" />
                  </Button>
                </div>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50">
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {centrosCusto.map((cc) => (
                        <TableRow key={cc.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium text-sm">{cc.codigo}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => openCentroCustoWindow(cc)}>
                              <Maximize2 className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* GRUPO 2: PESSOAS E PARCEIROS */}
        <AccordionItem value="grupo-2" className="border-0 shadow-md rounded-lg overflow-hidden">
          <AccordionTrigger className="px-6 py-4 bg-gradient-to-r from-green-50 to-cyan-50 hover:bg-green-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">👥 Pessoas e Parceiros</h3>
                <p className="text-xs text-slate-600">Clientes, Fornecedores, Colaboradores, Transportadoras</p>
              </div>
              <Badge className="ml-auto">{totalItensGrupo2} itens</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 bg-white space-y-6">
            {/* Clientes */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Clientes ({clientes.length})
                </h4>
                <Button onClick={() => openClienteWindow()} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Cliente
                </Button>
              </div>
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-slate-50">
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>CPF/CNPJ</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientes.map((cliente) => (
                      <TableRow key={cliente.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-sm">{cliente.nome}</TableCell>
                        <TableCell className="text-xs">{cliente.cpf || cliente.cnpj || '-'}</TableCell>
                        <TableCell className="text-xs">{cliente.endereco_principal?.cidade || '-'}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[cliente.status]}>{cliente.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <IconeAcessoCliente
                              cliente={cliente}
                              onView={() => { setClienteParaPainel(cliente); setPainelClienteAberto(true); }}
                            />
                            <Button size="sm" variant="ghost" onClick={() => openClienteWindow(cliente)}>
                              <Maximize2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Fornecedores */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-600" />
                  Fornecedores ({fornecedores.length})
                </h4>
                <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700" onClick={() => openFornecedorWindow()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Fornecedor
                </Button>
              </div>
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-slate-50">
                    <TableRow>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fornecedores.map((f) => (
                      <TableRow key={f.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-sm">{f.nome}</TableCell>
                        <TableCell className="text-xs">{f.cnpj || '-'}</TableCell>
                        <TableCell className="text-xs">{f.categoria}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <IconeAcessoFornecedor
                              fornecedor={f}
                              onView={() => { setFornecedorParaPainel(f); setPainelFornecedorAberto(true); }}
                            />
                            <Button size="sm" variant="ghost" onClick={() => openFornecedorWindow(f)}>
                              <Maximize2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Colaboradores */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold flex items-center gap-2">
                  <User className="w-5 h-5 text-pink-600" />
                  Colaboradores ({colaboradores.length})
                </h4>
                <Button size="sm" className="bg-pink-600 hover:bg-pink-700" onClick={() => openColaboradorWindow()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Colaborador
                </Button>
              </div>
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-slate-50">
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {colaboradores.map((c) => (
                      <TableRow key={c.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-sm">{c.nome_completo}</TableCell>
                        <TableCell className="text-xs">{c.cargo}</TableCell>
                        <TableCell className="text-xs">{c.departamento}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <IconeAcessoColaborador
                              colaborador={c}
                              onView={() => { setColaboradorParaPainel(c); setPainelColaboradorAberto(true); }}
                            />
                            <Button size="sm" variant="ghost" onClick={() => openColaboradorWindow(c)}>
                              <Maximize2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Transportadoras */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold flex items-center gap-2">
                  <Truck className="w-5 h-5 text-orange-600" />
                  Transportadoras ({transportadoras.length})
                </h4>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => openTransportadoraWindow()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Transportadora
                </Button>
              </div>
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-slate-50">
                    <TableRow>
                      <TableHead>Razão Social</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transportadoras.map((t) => (
                      <TableRow key={t.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-sm">{t.razao_social}</TableCell>
                        <TableCell className="text-xs">{t.cnpj}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <IconeAcessoTransportadora
                              transportadora={t}
                              onView={() => { setTransportadoraParaPainel(t); setPainelTransportadoraAberto(true); }}
                            />
                            <Button size="sm" variant="ghost" onClick={() => openTransportadoraWindow(t)}>
                              <Maximize2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* GRUPO 3: PRODUTOS */}
        <AccordionItem value="produtos" className="border-0 shadow-md rounded-lg overflow-hidden">
          <AccordionTrigger className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:bg-purple-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">🧱 Produtos e Serviços</h3>
                <p className="text-xs text-slate-600">Cadastro Master V21.0</p>
              </div>
              <Badge className="ml-auto">{totalItensGrupo3} itens</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 bg-white space-y-6">
            {/* Botões Rápidos */}
            <div className="flex gap-2 flex-wrap">
              <BotaoNovaJanela tipo="produto" label="➕ Novo Produto" />
              <BotaoNovaJanela tipo="tabela-preco" label="💰 Nova Tabela" />
            </div>

            {/* Produtos */}
            <Card>
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="text-base">📦 Produtos ({produtosFiltrados.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Grupo</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produtosFiltrados.slice(0, 10).map(produto => (
                      <TableRow key={produto.id}>
                        <TableCell className="font-mono text-xs">{produto.codigo}</TableCell>
                        <TableCell className="font-semibold">{produto.descricao}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{produto.grupo}</Badge>
                        </TableCell>
                        <TableCell>{produto.estoque_atual || 0}</TableCell>
                        <TableCell>R$ {(produto.preco_venda || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => openProductWindow(produto)}>
                            <Maximize2 className="w-3 h-3 mr-1" />
                            Abrir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Tabelas de Preço */}
            <Card>
              <CardHeader className="bg-yellow-50 border-b">
                <CardTitle className="text-base">💰 Tabelas de Preço ({tabelasPreco.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {tabelasPreco.slice(0, 5).map(tabela => (
                    <div key={tabela.id} className="flex items-center justify-between p-3 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-semibold">{tabela.nome}</p>
                        <p className="text-xs text-slate-600">{tabela.tipo} • {tabela.ativo ? '✅ Ativa' : '⏸️ Inativa'}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openTabelaPrecoWindow(tabela)}>
                        <Maximize2 className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Serviços */}
            <Card>
              <CardHeader className="bg-cyan-50 border-b">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>🔧 Serviços ({servicos.length})</span>
                  <Button size="sm" variant="outline" onClick={() => openServicoWindow()}>
                    <Plus className="w-3 h-3 mr-2" />
                    Novo
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {servicos.slice(0, 3).map(servico => (
                    <div key={servico.id} className="flex items-center justify-between p-2 border rounded text-sm">
                      <span>{servico.nome}</span>
                      <Button size="sm" variant="ghost" onClick={() => openServicoWindow(servico)}>
                        <Maximize2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* GRUPO 4: FINANCEIRO */}
        <AccordionItem value="grupo-4" className="border-0 shadow-md rounded-lg overflow-hidden">
          <AccordionTrigger className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:bg-green-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">💰 Financeiro e Fiscal</h3>
                <p className="text-xs text-slate-600">Bancos, Formas de Pagamento</p>
              </div>
              <Badge className="ml-auto">{totalItensGrupo4} itens</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 bg-white space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Bancos */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-blue-600" />
                    Contas Bancárias ({bancos.length})
                  </h4>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => openBancoWindow()}>
                    <Plus className="w-3 h-3 mr-2" />
                    Nova
                  </Button>
                </div>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50">
                      <TableRow>
                        <TableHead>Banco</TableHead>
                        <TableHead>Conta</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bancos.map((b) => (
                        <TableRow key={b.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium text-sm">{b.nome_banco}</TableCell>
                          <TableCell className="text-xs">{b.agencia}/{b.conta}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => openBancoWindow(b)}>
                              <Maximize2 className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Formas de Pagamento */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-green-600" />
                    Formas Pagamento ({formasPagamento.length})
                  </h4>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => openFormaPagamentoWindow()}>
                    <Plus className="w-3 h-3 mr-2" />
                    Nova
                  </Button>
                </div>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50">
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formasPagamento.map((f) => (
                        <TableRow key={f.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium text-sm">{f.descricao}</TableCell>
                          <TableCell className="text-xs">{f.tipo}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => openFormaPagamentoWindow(f)}>
                              <Maximize2 className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* GRUPO 5: OPERAÇÃO E LOGÍSTICA */}
        <AccordionItem value="grupo-5" className="border-0 shadow-md rounded-lg overflow-hidden">
          <AccordionTrigger className="px-6 py-4 bg-gradient-to-r from-orange-50 to-red-50 hover:bg-orange-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">🚚 Operação e Logística</h3>
                <p className="text-xs text-slate-600">Veículos e Frota</p>
              </div>
              <Badge className="ml-auto">{totalItensGrupo5} itens</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 bg-white space-y-6">
            {/* Veículos */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold flex items-center gap-2">
                  <Truck className="w-4 h-4 text-slate-600" />
                  Veículos / Frota ({veiculos.length})
                </h4>
                <Button size="sm" variant="outline" onClick={() => openVeiculoWindow()}>
                  <Plus className="w-3 h-3 mr-2" />
                  Novo Veículo
                </Button>
              </div>
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-slate-50">
                    <TableRow>
                      <TableHead>Placa</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Capacidade</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {veiculos.map((v) => (
                      <TableRow key={v.id} className="hover:bg-slate-50">
                        <TableCell className="font-mono text-sm">{v.placa}</TableCell>
                        <TableCell className="text-xs">{v.modelo}</TableCell>
                        <TableCell className="text-xs">{v.capacidade_kg} kg</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => openVeiculoWindow(v)}>
                            <Maximize2 className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* PAINÉIS DINÂMICOS - Mantidos para acesso rápido */}
      <PainelDinamicoCliente
        cliente={clienteParaPainel}
        isOpen={painelClienteAberto}
        onClose={() => { setPainelClienteAberto(false); setClienteParaPainel(null); }}
        onEdit={(c) => {
          setPainelClienteAberto(false);
          openClienteWindow(c);
        }}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['clientes'] })}
      />

      <PainelDinamicoFornecedor
        fornecedor={fornecedorParaPainel}
        isOpen={painelFornecedorAberto}
        onClose={() => { setPainelFornecedorAberto(false); setFornecedorParaPainel(null); }}
        onEdit={(f) => {
          setPainelFornecedorAberto(false);
          openFornecedorWindow(f);
        }}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['fornecedores'] })}
      />

      <PainelDinamicoTransportadora
        transportadora={transportadoraParaPainel}
        isOpen={painelTransportadoraAberto}
        onClose={() => { setPainelTransportadoraAberto(false); setTransportadoraParaPainel(null); }}
        onEdit={(t) => {
          setPainelTransportadoraAberto(false);
          openTransportadoraWindow(t);
        }}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['transportadoras'] })}
      />

      <PainelDinamicoColaborador
        colaborador={colaboradorParaPainel}
        isOpen={painelColaboradorAberto}
        onClose={() => { setPainelColaboradorAberto(false); setColaboradorParaPainel(null); }}
        onEdit={(c) => {
          setPainelColaboradorAberto(false);
          openColaboradorWindow(c);
        }}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['colaboradores'] })}
      />
    </div>
  );
}