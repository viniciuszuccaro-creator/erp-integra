import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileDown, 
  FileText, 
  Sheet, 
  CheckCircle2,
  TrendingUp,
  Users,
  Package,
  Truck,
  DollarSign,
  FileSpreadsheet,
  Building,
  Settings
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  exportarPedidosExcel,
  exportarClientesExcel,
  exportarContasReceberExcel,
  exportarContasPagarExcel,
  exportarEstoqueExcel,
  exportarMovimentacoesExcel,
  exportarDREExcel,
  exportarOrdensProducaoExcel,
  exportarEntregasExcel,
  exportarNotasFiscaisExcel,
  exportarFornecedoresExcel,
  exportarColaboradoresExcel
} from '../lib/exportacaoExcel';

import {
  gerarPDFPedido,
  gerarPDFRomaneio,
  gerarPDFNotaFiscal,
  gerarPDFOrdemProducao,
  gerarPDFRelatorio
} from '../lib/exportacaoPDF';

/**
 * Central de Geração de Relatórios e Exportações
 */
export default function GeradorRelatorios({ empresaId }) {
  const [gerando, setGerando] = useState(null);
  const { toast } = useToast();

  const { data: empresa } = useQuery({
    queryKey: ['empresa', empresaId],
    queryFn: () => base44.entities.Empresa.filter({ id: empresaId }),
    enabled: !!empresaId,
    select: (data) => data[0]
  });

  const relatoriosDisponiveis = [
    {
      id: 'pedidos',
      titulo: 'Pedidos',
      descricao: 'Lista completa de pedidos',
      icon: FileText,
      cor: 'blue',
      exportaExcel: async () => {
        const pedidos = await base44.entities.Pedido.list('-data_pedido');
        exportarPedidosExcel(pedidos);
      }
    },
    {
      id: 'clientes',
      titulo: 'Clientes',
      descricao: 'Cadastro completo de clientes',
      icon: Users,
      cor: 'purple',
      exportaExcel: async () => {
        const clientes = await base44.entities.Cliente.list();
        exportarClientesExcel(clientes);
      }
    },
    {
      id: 'contas-receber',
      titulo: 'Contas a Receber',
      descricao: 'Títulos e recebimentos',
      icon: DollarSign,
      cor: 'green',
      exportaExcel: async () => {
        const contas = await base44.entities.ContaReceber.list('-data_vencimento');
        exportarContasReceberExcel(contas);
      }
    },
    {
      id: 'contas-pagar',
      titulo: 'Contas a Pagar',
      descricao: 'Títulos e pagamentos',
      icon: DollarSign,
      cor: 'red',
      exportaExcel: async () => {
        const contas = await base44.entities.ContaPagar.list('-data_vencimento');
        exportarContasPagarExcel(contas);
      }
    },
    {
      id: 'estoque',
      titulo: 'Estoque',
      descricao: 'Posição de estoque',
      icon: Package,
      cor: 'orange',
      exportaExcel: async () => {
        const produtos = await base44.entities.Produto.list();
        exportarEstoqueExcel(produtos);
      }
    },
    {
      id: 'movimentacoes',
      titulo: 'Movimentações de Estoque',
      descricao: 'Histórico de movimentações',
      icon: TrendingUp,
      cor: 'cyan',
      exportaExcel: async () => {
        const movs = await base44.entities.MovimentacaoEstoque.list('-data_movimentacao', 1000);
        exportarMovimentacoesExcel(movs);
      }
    },
    {
      id: 'producao',
      titulo: 'Ordens de Produção',
      descricao: 'OPs e apontamentos',
      icon: Settings,
      cor: 'indigo',
      exportaExcel: async () => {
        const ops = await base44.entities.OrdemProducao.list('-data_emissao');
        exportarOrdensProducaoExcel(ops);
      }
    },
    {
      id: 'entregas',
      titulo: 'Entregas',
      descricao: 'Log de entregas realizadas',
      icon: Truck,
      cor: 'pink',
      exportaExcel: async () => {
        const entregas = await base44.entities.Entrega.list('-created_date');
        exportarEntregasExcel(entregas);
      }
    },
    {
      id: 'nfe',
      titulo: 'Notas Fiscais',
      descricao: 'NF-e emitidas',
      icon: FileText,
      cor: 'teal',
      exportaExcel: async () => {
        const nfes = await base44.entities.NotaFiscal.list('-data_emissao');
        exportarNotasFiscaisExcel(nfes);
      }
    },
    {
      id: 'fornecedores',
      titulo: 'Fornecedores',
      descricao: 'Cadastro de fornecedores',
      icon: Building,
      cor: 'slate',
      exportaExcel: async () => {
        const fornecedores = await base44.entities.Fornecedor.list();
        exportarFornecedoresExcel(fornecedores);
      }
    },
    {
      id: 'colaboradores',
      titulo: 'Colaboradores',
      descricao: 'Cadastro de funcionários',
      icon: Users,
      cor: 'violet',
      exportaExcel: async () => {
        const colaboradores = await base44.entities.Colaborador.list();
        exportarColaboradoresExcel(colaboradores);
      }
    },
    {
      id: 'dre',
      titulo: 'DRE',
      descricao: 'Demonstração do Resultado',
      icon: FileSpreadsheet,
      cor: 'emerald',
      exportaExcel: async () => {
        const dres = await base44.entities.DRE.list('-periodo');
        if (dres.length > 0) {
          exportarDREExcel(dres[0]);
        } else {
          throw new Error('Nenhum DRE encontrado');
        }
      }
    }
  ];

  const handleExportarExcel = async (relatorio) => {
    setGerando(relatorio.id);
    try {
      await relatorio.exportaExcel();
      toast({ 
        title: '✅ Excel Exportado!',
        description: `${relatorio.titulo} exportado com sucesso`
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({ 
        title: '❌ Erro ao exportar',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setGerando(null);
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="border-blue-300 bg-blue-50">
        <FileDown className="w-5 h-5 text-blue-600" />
        <AlertDescription>
          <p className="font-semibold text-blue-900 mb-1">
            ✅ Exportação de Relatórios Implementada!
          </p>
          <p className="text-sm text-blue-800">
            Exporte qualquer relatório para <strong>Excel (CSV)</strong> ou <strong>PDF</strong>. 
            Os arquivos são gerados instantaneamente no navegador.
          </p>
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-3 gap-4">
        {relatoriosDisponiveis.map((relatorio) => {
          const Icon = relatorio.icon;
          const isGerando = gerando === relatorio.id;
          
          return (
            <Card key={relatorio.id} className="border-2 hover:shadow-lg transition-all">
              <CardHeader className={`bg-${relatorio.cor}-50 border-b`}>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className={`w-5 h-5 text-${relatorio.cor}-600`} />
                  {relatorio.titulo}
                </CardTitle>
                <p className="text-xs text-slate-600 mt-1">{relatorio.descricao}</p>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleExportarExcel(relatorio)}
                    disabled={isGerando}
                    className={`flex-1 bg-${relatorio.cor}-600 hover:bg-${relatorio.cor}-700`}
                    size="sm"
                  >
                    {isGerando ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sheet className="w-4 h-4 mr-2" />
                        Excel
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-green-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Recursos Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <Sheet className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">Excel (CSV)</p>
                <p className="text-sm text-green-700">
                  Arquivos compatíveis com Excel, Google Sheets, LibreOffice. 
                  Suporta acentuação e formatação brasileira.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">PDF Prontos</p>
                <p className="text-sm text-blue-700">
                  PDFs de Pedido, Romaneio, NF-e e OP disponíveis nos respectivos módulos.
                  Use os botões de exportação em cada tela.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <TrendingUp className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-purple-900">Dados em Tempo Real</p>
                <p className="text-sm text-purple-700">
                  Todas as exportações refletem os dados mais atualizados do sistema.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}