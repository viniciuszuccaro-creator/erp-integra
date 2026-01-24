import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import usePermissions from './usePermissions';

/**
 * VALIDADOR ETAPA 1 - Verifica se sistema está 100% seguro
 * Diagnostica problemas em RBAC, Multiempresa e Auditoria
 */

export default function ValidadorETAPA1() {
  const { user, isLoading: permissionsLoading } = usePermissions();
  const [status, setStatus] = useState({
    rbac: { ok: false, msg: 'Testando...', loading: true },
    multiempresa: { ok: false, msg: 'Testando...', loading: true },
    auditlog: { ok: false, msg: 'Testando...', loading: true },
    backend: { ok: false, msg: 'Testando...', loading: true }
  });

  useEffect(() => {
    const validate = async () => {
      try {
        // 1. Validar RBAC
        try {
          const rbacRes = await base44.functions.invoke('rbacValidator', {
            module: 'Comercial',
            section: 'Pedidos',
            action: 'visualizar',
            userId: user?.id,
            test: true
          });
          setStatus(s => ({
            ...s,
            rbac: { ok: rbacRes.data?.valid !== false, msg: 'RBAC Operacional', loading: false }
          }));
        } catch (err) {
          setStatus(s => ({
            ...s,
            rbac: { ok: false, msg: `Erro: ${err.message}`, loading: false }
          }));
        }

        // 2. Validar Multiempresa
        try {
          const meRes = await base44.functions.invoke('multiempresaValidator', {
            operation: 'create',
            entityName: 'Pedido',
            data: { empresa_id: 'test' },
            test: true
          });
          setStatus(s => ({
            ...s,
            multiempresa: { ok: meRes.data?.valid !== false, msg: 'Multiempresa Operacional', loading: false }
          }));
        } catch (err) {
          setStatus(s => ({
            ...s,
            multiempresa: { ok: false, msg: `Erro: ${err.message}`, loading: false }
          }));
        }

        // 3. Validar AuditLog
        try {
          const logs = await base44.entities.AuditLog.list('-data_hora', 1);
          setStatus(s => ({
            ...s,
            auditlog: { ok: logs.length > 0, msg: 'AuditLog Operacional', loading: false }
          }));
        } catch (err) {
          setStatus(s => ({
            ...s,
            auditlog: { ok: false, msg: `Erro: ${err.message}`, loading: false }
          }));
        }

        // 4. Validar Backend Guard
        try {
          const guardRes = await base44.functions.invoke('entityOperationGuard', {
            operation: 'create',
            entityName: 'Pedido',
            data: { empresa_id: 'test' },
            test: true
          });
          setStatus(s => ({
            ...s,
            backend: { ok: guardRes.data?.valid !== false, msg: 'Backend Guard Operacional', loading: false }
          }));
        } catch (err) {
          setStatus(s => ({
            ...s,
            backend: { ok: false, msg: `Erro: ${err.message}`, loading: false }
          }));
        }
      } catch (err) {
        console.error('Erro geral na validação:', err);
      }
    };

    if (!permissionsLoading && user) {
      validate();
    }
  }, [user?.id, permissionsLoading]);

  const allOk = Object.values(status).every(s => s.ok || s.loading);

  return (
    <Card className={`border-2 ${allOk ? 'border-green-300 bg-green-50' : 'border-yellow-300 bg-yellow-50'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {allOk ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <AlertCircle className="w-6 h-6 text-yellow-600" />}
          Validação ETAPA 1
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(status).map(([key, val]) => (
          <div key={key} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <div>
              <span className="capitalize font-semibold text-slate-900">{key}</span>
              <p className="text-sm text-slate-600">{val.msg}</p>
            </div>
            {val.loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            ) : val.ok ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}