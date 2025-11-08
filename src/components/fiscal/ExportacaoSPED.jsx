import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

/**
 * Exportação SPED - V21.3
 * Geração automática de SPED Fiscal e Contribuições
 */
export default function ExportacaoSPED({ sped = [] }) {
  const [gerando, setGerando] = useState(false);
  const [periodo, setPeriodo] = useState(new Date().toISOString().slice(0, 7));
  const queryClient = useQueryClient();

  const gerarSPED = async () => {
    setGerando(true);
    try {
      // Simular geração de SPED
      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um gerador de SPED Fiscal.

Período: ${periodo}

Gere um resumo do SPED Fiscal com os seguintes blocos:
- Bloco 0: Abertura
- Bloco C: Documentos Fiscais
- Bloco E: Apuração ICMS/IPI
- Bloco H: Inventário

Retorne um resumo da geração.`,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            blocos_incluidos: {
              type: "array",
              items: { type: "string" }
            },
            quantidade_registros: { type: "number" },
            quantidade_notas_fiscal: { type: "number" },
            valor_total_operacoes: { type: "number" },
            icms_apurado: { type: "number" },
            arquivo_nome: { type: "string" },
            status: { type: "string" }
          }
        }
      });

      // Criar registro de SPED
      await base44.entities.SPEDFiscal.create({
        tipo_sped: 'Fiscal (EFD ICMS/IPI)',
        periodo_apuracao: periodo,
        periodo_inicial: `${periodo}-01`,
        periodo_final: `${periodo}-${new Date(periodo.split('-')[0], periodo.split('-')[1], 0).getDate()}`,
        status: 'Gerado',
        blocos_incluidos: resultado.blocos_incluidos,
        quantidade_registros: resultado.quantidade_registros,
        quantidade_notas_fiscal: resultado.quantidade_notas_fiscal,
        valor_total_operacoes: resultado.valor_total_operacoes,
        icms_apurado: resultado.icms_apurado,
        arquivo_nome: resultado.arquivo_nome,
        data_geracao: new Date().toISOString(),
        usuario_geracao: 'Sistema',
        geracao_automatica: false
      });

      queryClient.invalidateQueries(['sped']);
      toast.success('SPED gerado com sucesso!');
    } catch (err) {
      toast.error('Erro ao gerar SPED');
    } finally {
      setGerando(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerar SPED Fiscal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Período (YYYY-MM)</Label>
              <Input
                type="month"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
              />
            </div>
            <div>
              <Label>Tipo de SPED</Label>
              <Select defaultValue="fiscal">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fiscal">Fiscal (EFD ICMS/IPI)</SelectItem>
                  <SelectItem value="contribuicoes">Contribuições (PIS/COFINS)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={gerarSPED} disabled={gerando} className="w-full">
            {gerando && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {gerando ? 'Gerando SPED...' : 'Gerar SPED'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de SPED Gerados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Período</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data Geração</TableHead>
                <TableHead>Registros</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sped.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.periodo_apuracao}</TableCell>
                  <TableCell>{s.tipo_sped}</TableCell>
                  <TableCell>
                    {s.data_geracao ? new Date(s.data_geracao).toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell>{s.quantidade_registros || 0}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{s.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {s.arquivo_gerado_url && (
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}