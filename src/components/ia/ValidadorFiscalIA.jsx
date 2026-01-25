import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * ETAPA 4: Validador Fiscal com IA
 * Consulta Receita Federal e valida dados
 */

export default function ValidadorFiscalIA({ cnpj, cpf, entidade_id, tipo_entidade, onValidado }) {
  const [validando, setValidando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const validar = async () => {
    setValidando(true);
    try {
      const res = await base44.functions.invoke('validarDadosFiscaisIA', {
        cnpj,
        cpf,
        entidade_id,
        tipo_entidade
      });

      setResultado(res.data.validacao);
      toast.success(res.data.mensagem);
      if (onValidado) onValidado(res.data.validacao);

    } catch (err) {
      toast.error('Erro na validação: ' + err.message);
    } finally {
      setValidando(false);
    }
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="w-5 h-5 text-blue-600" />
          Validação Fiscal Inteligente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!resultado ? (
          <Button 
            onClick={validar} 
            disabled={validando || (!cnpj && !cpf)}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {validando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Consultando Receita Federal...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Validar via IA
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status Fiscal:</span>
              <Badge className={
                resultado.status_fiscal_receita === 'Ativa' ? 'bg-green-600' :
                resultado.status_fiscal_receita === 'Inapta' ? 'bg-yellow-600' : 'bg-red-600'
              }>
                {resultado.status_fiscal_receita === 'Ativa' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                {resultado.status_fiscal_receita}
              </Badge>
            </div>

            {resultado.razao_social && (
              <div>
                <span className="text-sm font-medium">Razão Social:</span>
                <p className="text-sm text-slate-600">{resultado.razao_social}</p>
              </div>
            )}

            {resultado.cnae_principal && (
              <div>
                <span className="text-sm font-medium">CNAE:</span>
                <p className="text-sm text-slate-600">{resultado.cnae_principal}</p>
              </div>
            )}

            {resultado.ramo_atividade && (
              <div>
                <span className="text-sm font-medium">Ramo:</span>
                <p className="text-sm text-slate-600">{resultado.ramo_atividade}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-sm font-medium">Risco Cadastro:</span>
              <Badge variant="outline" className={
                resultado.risco_cadastro_ia === 'Baixo' ? 'text-green-600' :
                resultado.risco_cadastro_ia === 'Médio' ? 'text-yellow-600' : 'text-red-600'
              }>
                {resultado.risco_cadastro_ia}
              </Badge>
            </div>

            <Button variant="outline" onClick={() => setResultado(null)} className="w-full">
              Nova Validação
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}