import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useWindow } from "@/components/lib/useWindow";
import usePermissions from "@/components/lib/usePermissions";
import VisualizadorUniversalEntidade from "@/components/cadastros/VisualizadorUniversalEntidade";
import { Users, Building2, Truck, User, Award, MessageCircle, TrendingUp, MapPin, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import CadastroClienteCompleto from "@/components/cadastros/CadastroClienteCompleto";
import CadastroFornecedorCompleto from "@/components/cadastros/CadastroFornecedorCompleto";
import TransportadoraForm from "@/components/cadastros/TransportadoraForm";
import ColaboradorForm from "@/components/rh/ColaboradorForm";
import RepresentanteFormCompleto from "@/components/cadastros/RepresentanteFormCompleto";
import ContatoB2BForm from "@/components/cadastros/ContatoB2BForm";
import SegmentoClienteForm from "@/components/cadastros/SegmentoClienteForm";
import RegiaoAtendimentoForm from "@/components/cadastros/RegiaoAtendimentoForm";

function CountBadge({ entityName }) {
  const { getFiltroContexto } = useContextoVisual();
  const { data: count = 0 } = useQuery({
    queryKey: ['count', 'cadastros', entityName, (() => { const m={Fornecedor:'empresa_dona_id',Transportadora:'empresa_dona_id',Colaborador:'empresa_alocada_id'}; const c=m[entityName]||'empresa_id'; return getFiltroContexto(c, true); })()],
    queryFn: async () => {
      const campoMap = { Fornecedor: 'empresa_dona_id', Transportadora: 'empresa_dona_id', Colaborador: 'empresa_alocada_id' };
      const campo = campoMap[entityName] || 'empresa_id';
      const fc = getFiltroContexto(campo, true) || {};

      // Cliente pode estar em empresa_id, empresa_dona_id ou compartilhado; também considerar group_id sem forçar AND
      let filtro = fc;
      if (entityName === 'Cliente' && (fc?.empresa_id || fc?.group_id)) {
        const empresaId = fc.empresa_id;
        const groupId = fc.group_id;
        const rest = { ...fc };
        if ('empresa_id' in rest) delete rest.empresa_id;
        if ('group_id' in rest) delete rest.group_id;
        const orConds = [];
        if (empresaId) {
          orConds.push(
            { empresa_id: empresaId },
            { empresa_dona_id: empresaId },
            { empresas_compartilhadas_ids: { $in: [empresaId] } }
          );
        }
        if (groupId) {
          orConds.push({ group_id: groupId });
        }
        filtro = { ...rest, $or: orConds };
      }

      const resp = await base44.functions.invoke('countEntities', {
        entityName,
        filter: filtro
      });
      return resp?.data?.count || 0;
    },
    staleTime: 60000,
    enabled: (() => { const m={Fornecedor:'empresa_dona_id',Transportadora:'empresa_dona_id',Colaborador:'empresa_alocada_id'}; const c=m[entityName]||'empresa_id'; return Object.keys(getFiltroContexto(c, true)).length>0; })(),
  });
  return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">{count}</Badge>;
}

export default function Bloco1Pessoas() {
  const { openWindow } = useWindow();
  const { hasPermission } = usePermissions();

  const openList = (entidade, titulo, Icon, campos, FormComp) => () => {
    openWindow(
      VisualizadorUniversalEntidade,
      {
        nomeEntidade: entidade,
        tituloDisplay: titulo,
        icone: Icon,
        camposPrincipais: campos,
        componenteEdicao: FormComp,
        windowMode: true,
      },
      { title: titulo, width: 1400, height: 800 }
    );
  };

  const tiles = [
    { k: 'Cliente', t: 'Clientes', i: Users, c: ['nome','razao_social','cnpj','cpf','status','email'], f: CadastroClienteCompleto },
    { k: 'Fornecedor', t: 'Fornecedores', i: Building2, c: ['nome','razao_social','cnpj','status','categoria'], f: CadastroFornecedorCompleto },
    { k: 'Transportadora', t: 'Transportadoras', i: Truck, c: ['razao_social','nome_fantasia','cnpj','status'], f: TransportadoraForm },
    { k: 'Colaborador', t: 'Colaboradores', i: User, c: ['nome_completo','cpf','cargo','departamento','status','email'], f: ColaboradorForm },
    { k: 'Representante', t: 'Representantes & Indicadores', i: Award, c: ['nome','tipo_representante','percentual_comissao','email','telefone'], f: RepresentanteFormCompleto },
    { k: 'ContatoB2B', t: 'Contatos B2B', i: MessageCircle, c: ['nome','empresa','cargo','email','telefone'], f: ContatoB2BForm },
    { k: 'SegmentoCliente', t: 'Segmentos de Cliente', i: TrendingUp, c: ['nome_segmento','descricao','criterios'], f: SegmentoClienteForm },
    { k: 'RegiaoAtendimento', t: 'Regiões de Atendimento', i: MapPin, c: ['nome_regiao','tipo_regiao','estados_abrangidos'], f: RegiaoAtendimentoForm },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {tiles.map(({ k, t, i: Icon, c, f: FormComp }) => (
        <Card key={k} className="hover:shadow-lg transition-all">
          <CardHeader className="bg-slate-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Icon className="w-5 h-5 text-slate-600" /> {t}
                <span className="ml-2"><CountBadge entityName={k} /></span>
              </CardTitle>
              <div className="flex items-center gap-2">

                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={openList(k, t, Icon, c, FormComp)} disabled={!hasPermission('Cadastros', null, 'visualizar')}>
                  Abrir
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 text-sm text-slate-600">
            Gestão de {t}. Clique em Abrir para listar, criar e editar em janela redimensionável.
          </CardContent>
        </Card>
      ))}
    </div>
  );
}