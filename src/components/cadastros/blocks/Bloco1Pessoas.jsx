import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWindow } from "@/components/lib/useWindow";
import usePermissions from "@/components/lib/usePermissions";
import VisualizadorUniversalEntidade from "@/components/cadastros/VisualizadorUniversalEntidade";
import { Users, Building2, Truck, User, Award, MessageCircle, TrendingUp, MapPin } from "lucide-react";
import CountBadgeSimplificado from "@/components/cadastros/CountBadgeSimplificado";

import CadastroClienteCompleto from "@/components/cadastros/CadastroClienteCompleto";
import CadastroFornecedorCompleto from "@/components/cadastros/CadastroFornecedorCompleto";
import TransportadoraForm from "@/components/cadastros/TransportadoraForm";
import ColaboradorForm from "@/components/rh/ColaboradorForm";
import RepresentanteFormCompleto from "@/components/cadastros/RepresentanteFormCompleto";
import ContatoB2BForm from "@/components/cadastros/ContatoB2BForm";
import SegmentoClienteForm from "@/components/cadastros/SegmentoClienteForm";
import RegiaoAtendimentoForm from "@/components/cadastros/RegiaoAtendimentoForm";

export default function Bloco1Pessoas() {
  const { openWindow } = useWindow();
  const { hasPermission } = usePermissions();

  const openList = (entidade, titulo, Icon, campos, FormComp) => () => {
    openWindow(
      VisualizadorUniversalEntidade,
      { nomeEntidade: entidade, tituloDisplay: titulo, icone: Icon, camposPrincipais: campos, componenteEdicao: FormComp, windowMode: true },
      { title: titulo, width: 1400, height: 800 }
    );
  };

  const tiles = [
    { k: 'Cliente', t: 'Clientes', i: Users, c: ['nome','razao_social','cnpj','cpf','status'], f: CadastroClienteCompleto },
    { k: 'Fornecedor', t: 'Fornecedores', i: Building2, c: ['nome','razao_social','cnpj','status','categoria'], f: CadastroFornecedorCompleto },
    { k: 'Transportadora', t: 'Transportadoras', i: Truck, c: ['razao_social','nome_fantasia','cnpj','status'], f: TransportadoraForm },
    { k: 'Colaborador', t: 'Colaboradores', i: User, c: ['nome_completo','cpf','cargo','departamento','status'], f: ColaboradorForm },
    { k: 'Representante', t: 'Representantes & Indicadores', i: Award, c: ['nome','tipo_representante','percentual_comissao','email'], f: RepresentanteFormCompleto },
    { k: 'ContatoB2B', t: 'Contatos B2B', i: MessageCircle, c: ['nome','empresa','cargo','email','telefone'], f: ContatoB2BForm },
    { k: 'SegmentoCliente', t: 'Segmentos de Cliente', i: TrendingUp, c: ['nome_segmento','descricao'], f: SegmentoClienteForm },
    { k: 'RegiaoAtendimento', t: 'Regiões de Atendimento', i: MapPin, c: ['nome_regiao','tipo_regiao','estados_abrangidos'], f: RegiaoAtendimentoForm },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <Card className="rounded-sm shadow-sm border bg-white/80 backdrop-blur">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b rounded-t-sm">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-700" /> Pessoas & Parceiros
              <CountBadgeSimplificado entities={["Cliente","Fornecedor","Colaborador","Representante","ContatoB2B","SegmentoCliente","RegiaoAtendimento"]} />
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 text-sm text-slate-600">Total consolidado do grupo/empresa.</CardContent>
      </Card>

      {tiles.map(({ k, t, i: Icon, c, f: FormComp }) => (
        <Card key={k} className="rounded-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150 cursor-pointer group border"
          onClick={hasPermission('Cadastros', null, 'visualizar') ? openList(k, t, Icon, c, FormComp) : undefined}>
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                <div className="p-1.5 rounded-sm bg-blue-50 group-hover:bg-blue-100 transition-colors">
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
                {t}
                <CountBadgeSimplificado entities={[k]} />
              </CardTitle>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-sm text-xs h-7"
                onClick={(e) => { e.stopPropagation(); openList(k, t, Icon, c, FormComp)(); }}
                disabled={!hasPermission('Cadastros', null, 'visualizar')}>
                Abrir
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 text-xs text-slate-500">
            Clique para listar, criar e editar em janela flutuante.
          </CardContent>
        </Card>
      ))}
    </div>
  );
}