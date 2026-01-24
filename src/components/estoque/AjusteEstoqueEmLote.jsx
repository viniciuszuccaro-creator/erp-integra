import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import useContextoVisual from '@/components/lib/useContextoVisual';
import { Upload, FileText } from 'lucide-react';

/**
 * AJUSTE ESTOQUE EM LOTE - Importação de múltiplos ajustes
 * ETAPA 2: Processamento em massa
 */

export default function AjusteEstoqueEmLote() {
  const [arquivo, setArquivo] = useState(null);
  const [processando, setProcessando] = useState(false);
  const { carimbarContexto } = useContextoVisual();

  const handleProcessar = async () => {
    if (!arquivo) {
      alert('Selecione um arquivo CSV');
      return;
    }

    setProcessando(true);
    try {
      const texto = await arquivo.text();
      const linhas = texto.split('\n').slice(1); // Pula cabeçalho

      const ajustes = [];
      for (const linha of linhas) {
        if (!linha.trim()) continue;

        const [produto_id, qtd_sistema, qtd_fisica, motivo] = linha.split(',');
        const ajuste = await base44.entities.AjusteEstoque.create(
          carimbarContexto({
            numero_ajuste: `ADJ-LOTE-${Date.now()}-${Math.random()}`,
            data_ajuste: new Date().toISOString().split('T')[0],
            tipo_ajuste: motivo || 'inventario',
            itens_ajuste: [{
              produto_id,
              quantidade_sistema: parseFloat(qtd_sistema),
              quantidade_fisica: parseFloat(qtd_fisica),
              quantidade_ajuste: parseFloat(qtd_fisica) - parseFloat(qtd_sistema)
            }],
            status: 'pendente'
          })
        );
        ajustes.push(ajuste);
      }

      alert(`${ajustes.length} ajustes criados com sucesso!`);
      setArquivo(null);
    } catch (err) {
      alert('Erro: ' + err.message);
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-orange-50 to-slate-50 rounded-xl">
      <h2 className="text-xl font-bold text-slate-900">Ajuste em Lote</h2>

      {/* Template de Download */}
      <Card className="border-2 border-blue-300 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-sm">Formato CSV Esperado</span>
          </div>
          <div className="bg-white p-3 rounded text-xs font-mono text-slate-700">
            produto_id,qtd_sistema,qtd_fisica,motivo<br />
            PROD001,100,95,inventario<br />
            PROD002,50,50,inventario<br />
            PROD003,30,35,devolucao
          </div>
        </CardContent>
      </Card>

      {/* Upload */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setArquivo(e.target.files?.[0] || null)}
              className="flex-1 text-sm text-slate-600"
            />
          </div>
          {arquivo && (
            <p className="text-sm text-green-600 font-semibold">
              ✅ {arquivo.name} selecionado
            </p>
          )}
          <Button
            onClick={handleProcessar}
            disabled={!arquivo || processando}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            {processando ? 'Processando...' : 'Processar Lote'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}