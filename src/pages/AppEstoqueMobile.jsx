import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Scan, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Camera,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

/**
 * V21.4 - App Estoque Mobile
 * Scanner QR/NFC para movimentações rápidas
 */
export default function AppEstoqueMobile() {
  const [qrCode, setQrCode] = useState('');
  const [produtoEscaneado, setProdutoEscaneado] = useState(null);
  const [tipoMovimento, setTipoMovimento] = useState('entrada');
  const [quantidade, setQuantidade] = useState(0);
  const [localizacao, setLocalizacao] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user-estoque'],
    queryFn: () => base44.auth.me()
  });

  const escanearProdutoMutation = useMutation({
    mutationFn: async () => {
      // Buscar produto por código QR/código de barras
      const produtos = await base44.entities.Produto.filter({
        codigo_barras: qrCode
      });

      if (produtos.length === 0) {
        // Tentar por código normal
        const produtosCodigo = await base44.entities.Produto.filter({
          codigo: qrCode
        });

        if (produtosCodigo.length === 0) {
          throw new Error('Produto não encontrado');
        }

        return produtosCodigo[0];
      }

      return produtos[0];
    },
    onSuccess: (produto) => {
      setProdutoEscaneado(produto);
      setQuantidade(0);
      toast.success(`Produto encontrado: ${produto.descricao}`);
    },
    onError: () => {
      toast.error('❌ Produto não encontrado. Verifique o código.');
    }
  });

  const confirmarMovimentacaoMutation = useMutation({
    mutationFn: async () => {
      if (!produtoEscaneado || quantidade <= 0) {
        throw new Error('Dados incompletos');
      }

      const estoqueAnterior = produtoEscaneado.estoque_atual || 0;
      const novoEstoque = tipoMovimento === 'entrada'
        ? estoqueAnterior + quantidade
        : estoqueAnterior - quantidade;

      // Criar movimentação
      await base44.entities.MovimentacaoEstoque.create({
        empresa_id: produtoEscaneado.empresa_id,
        produto_id: produtoEscaneado.id,
        produto_descricao: produtoEscaneado.descricao,
        codigo_produto: produtoEscaneado.codigo,
        tipo_movimento: tipoMovimento,
        quantidade: quantidade,
        unidade_medida: 'KG',
        estoque_anterior: estoqueAnterior,
        estoque_atual: novoEstoque,
        disponivel_anterior: produtoEscaneado.estoque_disponivel || 0,
        disponivel_atual: tipoMovimento === 'entrada'
          ? (produtoEscaneado.estoque_disponivel || 0) + quantidade
          : (produtoEscaneado.estoque_disponivel || 0) - quantidade,
        data_movimentacao: new Date().toISOString(),
        documento: `APP-${Date.now()}`,
        motivo: `Movimentação via App Estoque Mobile`,
        localizacao_destino: localizacao,
        responsavel: user?.full_name || 'App Mobile'
      });

      // Atualizar produto
      await base44.entities.Produto.update(produtoEscaneado.id, {
        estoque_atual: novoEstoque,
        estoque_disponivel: tipoMovimento === 'entrada'
          ? (produtoEscaneado.estoque_disponivel || 0) + quantidade
          : (produtoEscaneado.estoque_disponivel || 0) - quantidade,
        localizacao: localizacao || produtoEscaneado.localizacao
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-estoque'] });
      toast.success(`✅ ${tipoMovimento === 'entrada' ? 'Entrada' : 'Saída'} registrada!`);
      setProdutoEscaneado(null);
      setQrCode('');
      setQuantidade(0);
      setLocalizacao('');
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <Card className="border-0 bg-white/90 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              App Estoque Mobile
            </CardTitle>
            <p className="text-xs text-slate-600">Movimentações rápidas via Scanner</p>
          </CardHeader>
        </Card>

        {/* Scanner */}
        <Card className="border-2 border-blue-300 bg-white">
          <CardHeader>
            <CardTitle className="text-sm">1. Escanear Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="QR Code ou Código de Barras"
                className="text-lg"
              />
              <Button
                onClick={() => escanearProdutoMutation.mutate()}
                className="bg-blue-600"
              >
                <Scan className="w-5 h-5" />
              </Button>
            </div>

            {/* Botão Câmera (Simulado) */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => toast.info('📷 Câmera em desenvolvimento')}
            >
              <Camera className="w-4 h-4 mr-2" />
              Usar Câmera
            </Button>
          </CardContent>
        </Card>

        {/* Produto Escaneado */}
        {produtoEscaneado && (
          <>
            <Card className="border-2 border-green-300 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="font-bold text-green-900">Produto Identificado</p>
                </div>
                
                <p className="font-bold text-lg">{produtoEscaneado.descricao}</p>
                <p className="text-sm text-slate-600 mb-3">Código: {produtoEscaneado.codigo}</p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-2 bg-white rounded">
                    <p className="text-xs text-slate-500">Estoque Atual</p>
                    <p className="font-bold text-blue-600">
                      {(produtoEscaneado.estoque_atual || 0).toFixed(2)} KG
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded">
                    <p className="text-xs text-slate-500">Disponível</p>
                    <p className="font-bold text-green-600">
                      {(produtoEscaneado.estoque_disponivel || 0).toFixed(2)} KG
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tipo de Movimento */}
            <Card className="border-2 border-slate-200">
              <CardHeader>
                <CardTitle className="text-sm">2. Tipo de Movimento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={tipoMovimento === 'entrada' ? 'default' : 'outline'}
                    onClick={() => setTipoMovimento('entrada')}
                    className={tipoMovimento === 'entrada' ? 'bg-green-600' : ''}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Entrada
                  </Button>
                  <Button
                    variant={tipoMovimento === 'saida' ? 'default' : 'outline'}
                    onClick={() => setTipoMovimento('saida')}
                    className={tipoMovimento === 'saida' ? 'bg-red-600' : ''}
                  >
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Saída
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quantidade e Localização */}
            <Card className="border-2 border-slate-200">
              <CardHeader>
                <CardTitle className="text-sm">3. Quantidade e Local</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Quantidade (KG)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={quantidade}
                    onChange={(e) => setQuantidade(parseFloat(e.target.value) || 0)}
                    className="text-2xl font-bold text-center"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Localização</label>
                  <div className="flex gap-2">
                    <Input
                      value={localizacao}
                      onChange={(e) => setLocalizacao(e.target.value)}
                      placeholder="Ex: Corredor A, Prat. 3"
                    />
                    <Button variant="outline">
                      <MapPin className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Confirmar */}
            <Button
              onClick={() => confirmarMovimentacaoMutation.mutate()}
              disabled={quantidade <= 0}
              className={`w-full h-16 text-lg font-bold ${
                tipoMovimento === 'entrada' ? 'bg-green-600' : 'bg-red-600'
              }`}
            >
              {tipoMovimento === 'entrada' ? (
                <TrendingUp className="w-6 h-6 mr-2" />
              ) : (
                <TrendingDown className="w-6 h-6 mr-2" />
              )}
              Confirmar {tipoMovimento === 'entrada' ? 'Entrada' : 'Saída'}
            </Button>
          </>
        )}

        {!produtoEscaneado && (
          <Card className="border-2 border-slate-200">
            <CardContent className="p-12 text-center text-slate-400">
              <Scan className="w-16 h-16 mx-auto mb-3" />
              <p>Escaneie um produto para iniciar</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}