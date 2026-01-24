import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';

/**
 * RELATÓRIO CONFORMIDADE PDF
 * Gera relatório executivo de conformidade da ETAPA 1
 */

export default function RelatorioConformidadePDF() {
  const { toast } = useToast();

  const gerarRelatorio = async () => {
    try {
      toast({ title: '📄 Gerando relatório...' });

      // Buscar dados
      const [perfis, usuarios, empresas, logs] = await Promise.all([
        base44.entities.PerfilAcesso.list(),
        base44.entities.User.list(),
        base44.entities.Empresa.list(),
        base44.entities.AuditLog.filter({
          data_hora: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
        }, '-data_hora', 1000)
      ]);

      // Calcular métricas
      const metricas = {
        perfisAtivos: perfis.filter(p => p.ativo).length,
        usuariosComPerfil: usuarios.filter(u => u.perfil_acesso_id).length,
        cobertura: Math.round((usuarios.filter(u => u.perfil_acesso_id).length / usuarios.length) * 100),
        empresasAtivas: empresas.filter(e => e.status === 'Ativa').length,
        acoesAuditadas: logs.length,
        bloqueios: logs.filter(l => l.acao === 'Bloqueio').length
      };

      // Gerar HTML do relatório
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório de Conformidade - ETAPA 1</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px; }
    h2 { color: #334155; margin-top: 30px; }
    .metric { background: #f1f5f9; padding: 15px; margin: 10px 0; border-radius: 8px; }
    .metric-title { font-weight: bold; color: #475569; }
    .metric-value { font-size: 24px; color: #1e40af; font-weight: bold; }
    .success { color: #16a34a; }
    .warning { color: #ea580c; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #cbd5e1; text-align: center; color: #64748b; }
  </style>
</head>
<body>
  <h1>🛡️ Relatório de Conformidade - ETAPA 1</h1>
  <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
  <p><strong>Período:</strong> Últimos 30 dias</p>

  <h2>📊 Resumo Executivo</h2>
  <div class="metric">
    <div class="metric-title">Score Geral de Conformidade</div>
    <div class="metric-value ${metricas.cobertura >= 90 ? 'success' : 'warning'}">${metricas.cobertura}%</div>
  </div>

  <h2>🔐 RBAC - Controle de Acesso</h2>
  <div class="metric">
    <div class="metric-title">Perfis de Acesso Ativos</div>
    <div class="metric-value">${metricas.perfisAtivos}</div>
  </div>
  <div class="metric">
    <div class="metric-title">Usuários com Perfil Definido</div>
    <div class="metric-value">${metricas.usuariosComPerfil} / ${usuarios.length}</div>
  </div>
  <div class="metric">
    <div class="metric-title">Cobertura RBAC</div>
    <div class="metric-value ${metricas.cobertura === 100 ? 'success' : 'warning'}">${metricas.cobertura}%</div>
  </div>

  <h2>🏢 Multiempresa - Isolamento de Dados</h2>
  <div class="metric">
    <div class="metric-title">Empresas Cadastradas</div>
    <div class="metric-value">${metricas.empresasAtivas} ativas / ${empresas.length} total</div>
  </div>
  <div class="metric">
    <div class="metric-title">Validações Multiempresa (30d)</div>
    <div class="metric-value">${metricas.validacoes24h}</div>
  </div>
  <div class="metric">
    <div class="metric-title">Bloqueios de Acesso Cruzado (30d)</div>
    <div class="metric-value ${metricas.bloqueios > 0 ? 'warning' : 'success'}">${metricas.bloqueios}</div>
  </div>

  <h2>📋 Auditoria - Rastreabilidade</h2>
  <div class="metric">
    <div class="metric-title">Ações Auditadas (30d)</div>
    <div class="metric-value">${metricas.acoesAuditadas}</div>
  </div>
  <div class="metric">
    <div class="metric-title">Módulos Monitorados</div>
    <div class="metric-value">${metricas.modulos}</div>
  </div>
  <div class="metric">
    <div class="metric-title">Usuários Ativos (30d)</div>
    <div class="metric-value">${metricas.usuariosAtivos}</div>
  </div>

  <h2>✅ Certificação</h2>
  <div class="metric">
    <p><strong>Status da ETAPA 1:</strong> ${metricas.cobertura >= 95 ? '<span class="success">✅ COMPLETA</span>' : '<span class="warning">⚠️ EM PROGRESSO</span>'}</p>
    <p><strong>Data de Validação:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
  </div>

  <div class="footer">
    <p>Relatório gerado automaticamente pelo ERP Zuccaro</p>
    <p>Sistema de Governança, Segurança e Multiempresa - V21.7</p>
  </div>
</body>
</html>
      `;

      // Converter para PDF usando API (simulado - usar biblioteca real em produção)
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conformidade_etapa1_${new Date().toISOString().split('T')[0]}.html`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: '✅ Relatório gerado com sucesso!' });

    } catch (error) {
      toast({
        title: '❌ Erro ao gerar relatório',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Relatório Executivo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 mb-4">
          Gere um relatório completo de conformidade da ETAPA 1 para apresentação executiva.
        </p>
        <Button onClick={gerarRelatorio} className="w-full">
          <Download className="w-4 h-4 mr-2" />
          Gerar Relatório de Conformidade
        </Button>
      </CardContent>
    </Card>
  );
}