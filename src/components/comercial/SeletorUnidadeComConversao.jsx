import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, AlertTriangle } from "lucide-react";
import { converterUnidade, PreviewConversao, validarConversao } from "@/components/lib/CalculadoraUnidades";

/**
 * V22.0: SELETOR UNIVERSAL DE UNIDADE COM CONVERSÃO
 * Usado em: PedidoForm, OrdemCompraForm, MovimentacaoEstoque
 * 
 * Props:
 * - produto: Objeto produto completo
 * - quantidadeInicial: Quantidade inicial
 * - unidadeInicial: Unidade inicial
 * - onChange: (quantidade, unidade, pesoKG) => void
 */
export default function SeletorUnidadeComConversao({ 
  produto, 
  quantidadeInicial = 0, 
  unidadeInicial = 'KG',
  onChange,
  label = "Quantidade",
  exibirPreview = true,
  className = ""
}) {
  const [quantidade, setQuantidade] = useState(quantidadeInicial);
  const [unidade, setUnidade] = useState(unidadeInicial);

  const unidadesDisponiveis = produto?.unidades_secundarias || ['UN'];

  useEffect(() => {
    if (onChange && produto) {
      const pesoKG = converterUnidade(quantidade, unidade, 'KG', produto);
      onChange(quantidade, unidade, pesoKG);
    }
  }, [quantidade, unidade]);

  const validacao = validarConversao(produto, unidade);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{label} *</Label>
          <Input
            type="number"
            step="0.01"
            value={quantidade}
            onChange={(e) => setQuantidade(parseFloat(e.target.value) || 0)}
            placeholder="0"
          />
        </div>

        <div>
          <Label>Unidade *</Label>
          <Select value={unidade} onValueChange={setUnidade}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {unidadesDisponiveis.map(u => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Validação */}
      {!validacao.valido && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-xs text-red-900">
            {validacao.mensagem}
          </AlertDescription>
        </Alert>
      )}

      {/* Preview de Conversão */}
      {exibirPreview && validacao.valido && quantidade > 0 && (
        <PreviewConversao 
          quantidade={quantidade} 
          unidadeOrigem={unidade} 
          produto={produto} 
        />
      )}
    </div>
  );
}