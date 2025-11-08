import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Package,
  DollarSign,
  Truck,
  Calendar,
  Building2,
  Hash,
  TrendingUp,
  Eye,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { parseNFeXML, validarXMLNFe, lerArquivoXML } from '../lib/parserXMLNFe';

/**
 * Componente de Importação de XML de NF-e
 * Processa XML, cria fornecedor, ordem de compra, entrada de estoque e contas a pagar
 */
export default function ImportarXMLNFe({ empresaId }) {
  const [arquivo, setArquivo] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [dadosNFe, setDadosNFe] = useState(null);
  const [erros, setErros] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [opcoes, setOpcoes] = useState({
    criarFornecedor: true,
    criarProdutos: true,
    criarOrdemCompra: true,
    darEntradaEstoque: true,
    criarContasPagar: true
  });

  const queryClient = useQueryClient();

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list(),
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: () => base44.entities.Fornecedor.list(),
  });

  // Processar arquivo XML
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xml')) {
      toast.error('Por favor, selecione um arquivo XML');
      return;
    }

    setArquivo(file);
    setProcessando(true);
    setErros([]);
    setAvisos([]);
    setDadosNFe(null);

    try {
      // Ler arquivo
      const xmlString = await lerArquivoXML(file);

      // Validar XML
      const validacao = validarXMLNFe(xmlString);
      if (!validacao.valido) {
        setErros(validacao.erros);
        setProcessando(false);
        toast.error('XML inválido');
        return;
      }

      // Parse do XML
      const dados = parseNFeXML(xmlString);

      // Verificar se fornecedor já existe
      const fornecedorExistente = fornecedores.find(f => 
        f.cnpj === dados.fornecedor.cnpj
      );

      // Mapear produtos
      const itensMapeados = dados.itens.map(item => {
        const produtoEncontrado = produtos.find(p => 
          p.codigo === item.codigo_produto || 
          p.codigo_barras === item.codigo_ean ||
          p.descricao?.toLowerCase() === item.descricao?.toLowerCase()
        );

        return {
          ...item,
          produto_id_mapeado: produtoEncontrado?.id || null,
          produto_encontrado: !!produtoEncontrado,
          produto_descricao_sistema: produtoEncontrado?.descricao || null
        };
      });

      const produtosNaoMapeados = itensMapeados.filter(i => !i.produto_encontrado);

      // Avisos
      const avisosTemp = [];
      if (fornecedorExistente) {
        avisosTemp.push(`Fornecedor "${fornecedorExistente.nome}" já existe no sistema`);
      }
      if (produtosNaoMapeados.length > 0) {
        avisosTemp.push(`${produtosNaoMapeados.length} produto(s) não encontrado(s) - serão criados automaticamente`);
      }

      setDadosNFe({
        ...dados,
        fornecedorExistente,
        itensMapeados,
        produtosNaoMapeados,
        xmlOriginal: xmlString
      });
      setAvisos(avisosTemp);
      setProcessando(false);
      toast.success('XML processado com sucesso!');

    } catch (error) {
      console.error('Erro ao processar XML:', error);
      setErros([error.message]);
      setProcessando(false);
      toast.error('Erro ao processar XML');
    }
  };

  // Importar NF-e
  const importarMutation = useMutation({
    mutationFn: async () => {
      const resultados = {
        fornecedor_id: null,
        ordem_compra_id: null,
        movimentacoes_ids: [],
        contas_pagar_ids: [],
        produtos_criados: []
      };

      // 1. Criar/Encontrar Fornecedor
      if (opcoes.criarFornecedor && !dadosNFe.fornecedorExistente) {
        const novoFornecedor = await base44.entities.Fornecedor.create({
          nome: dadosNFe.fornecedor.razao_social,
          nome_fantasia: dadosNFe.fornecedor.nome_fantasia,
          cnpj: dadosNFe.fornecedor.cnpj,
          inscricao_estadual: dadosNFe.fornecedor.inscricao_estadual,
          endereco: dadosNFe.fornecedor.endereco ? 
            `${dadosNFe.fornecedor.endereco.logradouro}, ${dadosNFe.fornecedor.endereco.numero}` : '',
          cidade: dadosNFe.fornecedor.endereco?.cidade,
          estado: dadosNFe.fornecedor.endereco?.estado,
          telefone: dadosNFe.fornecedor.endereco?.telefone,
          categoria: 'Matéria Prima',
          status: 'Ativo'
        });
        resultados.fornecedor_id = novoFornecedor.id;
      } else {
        resultados.fornecedor_id = dadosNFe.fornecedorExistente?.id;
      }

      // 2. Criar Produtos Não Mapeados
      if (opcoes.criarProdutos && dadosNFe.produtosNaoMapeados.length > 0) {
        for (const item of dadosNFe.produtosNaoMapeados) {
          const novoProduto = await base44.entities.Produto.create({
            empresa_id: empresaId,
            codigo: item.codigo_produto,
            codigo_barras: item.codigo_ean,
            descricao: item.descricao,
            ncm: item.ncm,
            unidade_medida: item.unidade,
            grupo: 'Matéria Prima',
            tipo_item: 'Matéria-Prima Produção',
            custo_aquisicao: item.valor_unitario,
            custo_medio: item.valor_unitario,
            preco_venda: item.valor_unitario * 1.3, // 30% markup padrão
            estoque_atual: 0,
            estoque_minimo: 0,
            status: 'Ativo',
            fornecedor_id: resultados.fornecedor_id,
            fornecedor_principal: dadosNFe.fornecedor.razao_social,
            ultima_compra: dadosNFe.dataEmissao,
            ultimo_preco_compra: item.valor_unitario
          });
          
          resultados.produtos_criados.push(novoProduto.id);
          
          // Atualizar mapeamento
          const itemIndex = dadosNFe.itensMapeados.findIndex(i => 
            i.codigo_produto === item.codigo_produto
          );
          if (itemIndex >= 0) {
            dadosNFe.itensMapeados[itemIndex].produto_id_mapeado = novoProduto.id;
          }
        }
      }

      // 3. Criar Ordem de Compra
      if (opcoes.criarOrdemCompra) {
        const ordemCompra = await base44.entities.OrdemCompra.create({
          numero_oc: `OC-NFE-${dadosNFe.numeroNFe}`,
          fornecedor_id: resultados.fornecedor_id,
          fornecedor_nome: dadosNFe.fornecedor.razao_social,
          data_solicitacao: dadosNFe.dataEmissao,
          data_entrega_real: dadosNFe.dataEmissao,
          valor_total: dadosNFe.valores.total,
          status: 'Recebida',
          itens: dadosNFe.itensMapeados.map(item => ({
            produto_id: item.produto_id_mapeado,
            codigo_sku: item.codigo_produto,
            descricao: item.descricao,
            quantidade_solicitada: item.quantidade,
            quantidade_recebida: item.quantidade,
            unidade: item.unidade,
            valor_unitario: item.valor_unitario,
            valor_total: item.valor_total
          })),
          nota_fiscal_entrada: dadosNFe.numeroNFe,
          observacoes: `Importado de XML NF-e ${dadosNFe.numeroNFe}. Chave: ${dadosNFe.chaveAcesso}`
        });
        resultados.ordem_compra_id = ordemCompra.id;
      }

      // 4. Dar Entrada no Estoque
      if (opcoes.darEntradaEstoque) {
        for (const item of dadosNFe.itensMapeados) {
          if (!item.produto_id_mapeado) continue;

          // Buscar produto atualizado
          const produtoAtual = await base44.entities.Produto.filter({ id: item.produto_id_mapeado });
          if (produtoAtual.length === 0) continue;

          const produto = produtoAtual[0];
          const novoEstoque = (produto.estoque_atual || 0) + item.quantidade;

          // Atualizar estoque do produto
          await base44.entities.Produto.update(produto.id, {
            estoque_atual: novoEstoque,
            ultima_compra: dadosNFe.dataEmissao,
            ultimo_preco_compra: item.valor_unitario
          });

          // Criar movimentação
          const movimentacao = await base44.entities.MovimentacaoEstoque.create({
            empresa_id: empresaId,
            origem_movimento: 'nfe',
            origem_documento_id: resultados.ordem_compra_id,
            tipo_movimento: 'entrada',
            produto_id: produto.id,
            produto_descricao: produto.descricao,
            codigo_produto: produto.codigo,
            quantidade: item.quantidade,
            unidade_medida: item.unidade,
            estoque_anterior: produto.estoque_atual || 0,
            estoque_atual: novoEstoque,
            data_movimentacao: new Date().toISOString(),
            documento: `NF-e ${dadosNFe.numeroNFe}`,
            motivo: `Entrada de compra - NF-e ${dadosNFe.numeroNFe}`,
            responsavel: 'Sistema - Importação XML',
            valor_unitario: item.valor_unitario,
            valor_total: item.valor_total,
            observacoes: `Importado de XML. Chave: ${dadosNFe.chaveAcesso}`
          });

          resultados.movimentacoes_ids.push(movimentacao.id);
        }
      }

      // 5. Criar Contas a Pagar
      if (opcoes.criarContasPagar && dadosNFe.duplicatas.length > 0) {
        for (const duplicata of dadosNFe.duplicatas) {
          const conta = await base44.entities.ContaPagar.create({
            empresa_id: empresaId,
            descricao: `NF-e ${dadosNFe.numeroNFe} - Parcela ${duplicata.numero}`,
            fornecedor: dadosNFe.fornecedor.razao_social,
            fornecedor_id: resultados.fornecedor_id,
            favorecido_cpf_cnpj: dadosNFe.fornecedor.cnpj,
            categoria: 'Fornecedores',
            valor: duplicata.valor,
            data_emissao: dadosNFe.dataEmissao,
            data_vencimento: duplicata.vencimento,
            status: 'Pendente',
            numero_documento: dadosNFe.numeroNFe,
            numero_parcela: duplicata.numero,
            nota_fiscal_id: null, // Poderia vincular à NF-e se ela existir na entidade NotaFiscal
            ordem_compra_id: resultados.ordem_compra_id,
            observacoes: `Importado de XML NF-e. Chave: ${dadosNFe.chaveAcesso}`
          });

          resultados.contas_pagar_ids.push(conta.id);
        }
      } else if (opcoes.criarContasPagar && dadosNFe.duplicatas.length === 0) {
        // Criar conta única
        const conta = await base44.entities.ContaPagar.create({
          empresa_id: empresaId,
          descricao: `NF-e ${dadosNFe.numeroNFe}`,
          fornecedor: dadosNFe.fornecedor.razao_social,
          fornecedor_id: resultados.fornecedor_id,
          favorecido_cpf_cnpj: dadosNFe.fornecedor.cnpj,
          categoria: 'Fornecedores',
          valor: dadosNFe.valores.total,
          data_emissao: dadosNFe.dataEmissao,
          data_vencimento: dadosNFe.dataEmissao,
          status: 'Pendente',
          numero_documento: dadosNFe.numeroNFe,
          ordem_compra_id: resultados.ordem_compra_id,
          observacoes: `Importado de XML NF-e. Chave: ${dadosNFe.chaveAcesso}`
        });

        resultados.contas_pagar_ids.push(conta.id);
      }

      return resultados;
    },
    onSuccess: async (resultados) => {
      // Criar registro de importação
      const arquivoUpload = await base44.integrations.Core.UploadFile({ file: arquivo });

      await base44.entities.ImportacaoXMLNFe.create({
        empresa_id: empresaId,
        numero_importacao: `IMP-${Date.now()}`,
        data_importacao: new Date().toISOString(),
        tipo_nfe: 'Entrada',
        arquivo_xml_nome: arquivo.name,
        arquivo_xml_url: arquivoUpload.file_url,
        chave_acesso: dadosNFe.chaveAcesso,
        numero_nfe: dadosNFe.numeroNFe,
        serie_nfe: dadosNFe.serieNFe,
        data_emissao: dadosNFe.dataEmissao,
        fornecedor_cnpj: dadosNFe.fornecedor.cnpj,
        fornecedor_nome: dadosNFe.fornecedor.razao_social,
        fornecedor_id: resultados.fornecedor_id,
        fornecedor_criado: !dadosNFe.fornecedorExistente,
        valor_total_nfe: dadosNFe.valores.total,
        valor_produtos: dadosNFe.valores.produtos,
        valor_icms: dadosNFe.valores.icms,
        valor_ipi: dadosNFe.valores.ipi,
        valor_pis: dadosNFe.valores.pis,
        valor_cofins: dadosNFe.valores.cofins,
        quantidade_itens: dadosNFe.quantidadeItens,
        itens_xml: dadosNFe.itensMapeados,
        status_processamento: 'Processado',
        validado_usuario: true,
        ordem_compra_criada: opcoes.criarOrdemCompra,
        ordem_compra_id: resultados.ordem_compra_id,
        entrada_estoque_realizada: opcoes.darEntradaEstoque,
        movimentacoes_estoque_ids: resultados.movimentacoes_ids,
        conta_pagar_criada: opcoes.criarContasPagar,
        contas_pagar_ids: resultados.contas_pagar_ids,
        produtos_criados_automaticamente: resultados.produtos_criados.length,
        produtos_nao_mapeados: dadosNFe.produtosNaoMapeados.map(p => p.codigo_produto),
        usuario_importacao: 'Sistema'
      });

      queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['ordens-compra'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
      queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
      queryClient.invalidateQueries({ queryKey: ['importacoes-xml'] });

      toast.success('✅ NF-e importada com sucesso!', {
        description: `${resultados.movimentacoes_ids.length} entrada(s) no estoque, ${resultados.contas_pagar_ids.length} conta(s) a pagar`
      });

      // Reset
      setArquivo(null);
      setDadosNFe(null);
      setErros([]);
      setAvisos([]);
    },
    onError: (error) => {
      console.error('Erro ao importar:', error);
      toast.error('❌ Erro ao importar NF-e', {
        description: error.message
      });
    }
  });

  return (
    <div className="space-y-6">
      {/* Upload */}
      <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
        <CardContent className="p-8">
          <div className="text-center">
            <Upload className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Importar XML de NF-e
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              Envie o XML da Nota Fiscal de Entrada para processar automaticamente
            </p>
            
            <input
              type="file"
              accept=".xml"
              onChange={handleFileUpload}
              className="hidden"
              id="xml-upload"
              disabled={processando}
            />
            <label htmlFor="xml-upload">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <span>
                  {processando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processando XML...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Selecionar Arquivo XML
                    </>
                  )}
                </span>
              </Button>
            </label>

            {arquivo && (
              <p className="text-xs text-blue-600 mt-3">
                📎 {arquivo.name}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Erros */}
      {erros.length > 0 && (
        <Alert className="border-red-300 bg-red-50">
          <XCircle className="w-5 h-5 text-red-600" />
          <AlertDescription>
            <p className="font-semibold text-red-900 mb-2">Erros ao processar XML:</p>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {erros.map((erro, i) => (
                <li key={i}>{erro}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Avisos */}
      {avisos.length > 0 && (
        <Alert className="border-orange-300 bg-orange-50">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <AlertDescription>
            <p className="font-semibold text-orange-900 mb-2">Avisos:</p>
            <ul className="list-disc list-inside text-sm text-orange-700 space-y-1">
              {avisos.map((aviso, i) => (
                <li key={i}>{aviso}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Preview dos Dados */}
      {dadosNFe && (
        <div className="space-y-6">
          {/* Resumo da NF-e */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Dados da NF-e
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Número</p>
                  <p className="font-bold text-lg text-blue-600">{dadosNFe.numeroNFe}</p>
                  <p className="text-xs text-slate-500">Série: {dadosNFe.serieNFe}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Data Emissão</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {new Date(dadosNFe.dataEmissao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Valor Total</p>
                  <p className="font-bold text-lg text-green-600">
                    R$ {dadosNFe.valores.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Itens</p>
                  <p className="font-bold text-lg text-indigo-600">{dadosNFe.quantidadeItens}</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded">
                <p className="text-xs text-slate-600 mb-1">Chave de Acesso</p>
                <p className="font-mono text-xs text-slate-800">{dadosNFe.chaveAcesso}</p>
              </div>

              {dadosNFe.fornecedorExistente && (
                <Alert className="mt-4 border-green-300 bg-green-50">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <AlertDescription>
                    <p className="font-semibold text-green-900">
                      Fornecedor "{dadosNFe.fornecedorExistente.nome}" já cadastrado
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Dados do Fornecedor */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Fornecedor
                {dadosNFe.fornecedorExistente ? (
                  <Badge className="bg-green-600">Já Cadastrado</Badge>
                ) : (
                  <Badge className="bg-blue-600">Será Criado</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-600">Razão Social</p>
                  <p className="font-semibold">{dadosNFe.fornecedor.razao_social}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">CNPJ</p>
                  <p className="font-mono font-semibold">{dadosNFe.fornecedor.cnpj}</p>
                </div>
                {dadosNFe.fornecedor.inscricao_estadual && (
                  <div>
                    <p className="text-xs text-slate-600">Inscrição Estadual</p>
                    <p className="font-semibold">{dadosNFe.fornecedor.inscricao_estadual}</p>
                  </div>
                )}
                {dadosNFe.fornecedor.endereco && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-slate-600 mb-1">Endereço</p>
                    <p className="text-sm">
                      {dadosNFe.fornecedor.endereco.logradouro}, {dadosNFe.fornecedor.endereco.numero}
                      <br />
                      {dadosNFe.fornecedor.endereco.bairro} - {dadosNFe.fornecedor.endereco.cidade}/{dadosNFe.fornecedor.endereco.estado}
                      <br />
                      CEP: {dadosNFe.fornecedor.endereco.cep}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Itens da NF-e */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                Itens da NF-e ({dadosNFe.quantidadeItens})
                {dadosNFe.produtosNaoMapeados.length > 0 && (
                  <Badge className="bg-orange-600">
                    {dadosNFe.produtosNaoMapeados.length} novos
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>#</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>NCM</TableHead>
                      <TableHead>Qtd</TableHead>
                      <TableHead>Un</TableHead>
                      <TableHead>Vlr Unit</TableHead>
                      <TableHead>Vlr Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dadosNFe.itensMapeados.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.numero_item}</TableCell>
                        <TableCell className="font-mono text-xs">{item.codigo_produto}</TableCell>
                        <TableCell className="max-w-xs truncate">{item.descricao}</TableCell>
                        <TableCell className="font-mono text-xs">{item.ncm}</TableCell>
                        <TableCell>{item.quantidade}</TableCell>
                        <TableCell>{item.unidade}</TableCell>
                        <TableCell>R$ {item.valor_unitario.toFixed(2)}</TableCell>
                        <TableCell className="font-semibold">
                          R$ {item.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          {item.produto_encontrado ? (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Mapeado
                            </Badge>
                          ) : (
                            <Badge className="bg-orange-100 text-orange-700">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Criar
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Duplicatas */}
          {dadosNFe.duplicatas.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Duplicatas / Contas a Pagar ({dadosNFe.duplicatas.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Parcela</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dadosNFe.duplicatas.map((dup, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-semibold">{dup.numero}</TableCell>
                        <TableCell>
                          {new Date(dup.vencimento).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          R$ {dup.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Opções de Importação */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-base">Opções de Importação</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={opcoes.criarFornecedor}
                  onCheckedChange={(checked) => setOpcoes({...opcoes, criarFornecedor: checked})}
                  disabled={!!dadosNFe.fornecedorExistente}
                />
                <div>
                  <p className="font-medium">Criar Fornecedor</p>
                  <p className="text-xs text-slate-600">
                    {dadosNFe.fornecedorExistente ? 'Fornecedor já existe' : 'Criar novo fornecedor no sistema'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  checked={opcoes.criarProdutos}
                  onCheckedChange={(checked) => setOpcoes({...opcoes, criarProdutos: checked})}
                  disabled={dadosNFe.produtosNaoMapeados.length === 0}
                />
                <div>
                  <p className="font-medium">Criar Produtos Não Cadastrados</p>
                  <p className="text-xs text-slate-600">
                    {dadosNFe.produtosNaoMapeados.length} produto(s) serão criados automaticamente
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  checked={opcoes.criarOrdemCompra}
                  onCheckedChange={(checked) => setOpcoes({...opcoes, criarOrdemCompra: checked})}
                />
                <div>
                  <p className="font-medium">Criar Ordem de Compra</p>
                  <p className="text-xs text-slate-600">
                    Gerar OC com status "Recebida" vinculada à NF-e
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  checked={opcoes.darEntradaEstoque}
                  onCheckedChange={(checked) => setOpcoes({...opcoes, darEntradaEstoque: checked})}
                />
                <div>
                  <p className="font-medium">Dar Entrada no Estoque</p>
                  <p className="text-xs text-slate-600">
                    Atualizar estoque de todos os produtos ({dadosNFe.itensMapeados.filter(i => i.produto_id_mapeado).length} itens)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  checked={opcoes.criarContasPagar}
                  onCheckedChange={(checked) => setOpcoes({...opcoes, criarContasPagar: checked})}
                />
                <div>
                  <p className="font-medium">Criar Contas a Pagar</p>
                  <p className="text-xs text-slate-600">
                    {dadosNFe.duplicatas.length > 0 
                      ? `Gerar ${dadosNFe.duplicatas.length} conta(s) a pagar`
                      : 'Gerar 1 conta a pagar com vencimento na data de emissão'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumo de Valores */}
          <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-blue-50">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-xs text-slate-600 mb-1">Produtos</p>
                  <p className="text-lg font-bold text-blue-600">
                    R$ {dadosNFe.valores.produtos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-600 mb-1">ICMS</p>
                  <p className="text-lg font-bold text-purple-600">
                    R$ {dadosNFe.valores.icms.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-600 mb-1">IPI</p>
                  <p className="text-lg font-bold text-orange-600">
                    R$ {dadosNFe.valores.ipi.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-600 mb-1">Frete</p>
                  <p className="text-lg font-bold text-yellow-600">
                    R$ {dadosNFe.valores.frete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-center p-3 bg-green-100 rounded-lg">
                  <p className="text-xs text-green-700 mb-1">TOTAL NF-e</p>
                  <p className="text-xl font-bold text-green-700">
                    R$ {dadosNFe.valores.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setDadosNFe(null);
                setArquivo(null);
                setErros([]);
                setAvisos([]);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => importarMutation.mutate()}
              disabled={importarMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {importarMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Importando...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Confirmar Importação
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}