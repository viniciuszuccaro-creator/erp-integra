import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWindow } from "@/components/lib/useWindow";
import usePermissions from "@/components/lib/usePermissions";
import VisualizadorUniversalEntidadeV24 from "@/components/cadastros/VisualizadorUniversalEntidadeV24";
import VisualizadorProdutos from "@/components/cadastros/VisualizadorProdutos";
import { Package, Stars, Factory, Boxes, Award, TrendingUp, Globe, Ruler } from "lucide-react";
import CountBadgeSimplificado from "@/components/cadastros/CountBadgeSimplificado";

import ProdutoFormV22_Completo from "@/components/cadastros/ProdutoFormV22_Completo";
import ServicoForm from "@/components/cadastros/ServicoForm";
import SetorAtividadeForm from "@/components/cadastros/SetorAtividadeForm";
import GrupoProdutoForm from "@/components/cadastros/GrupoProdutoForm";
import MarcaForm from "@/components/cadastros/MarcaForm";
import TabelaPrecoFormCompleto from "@/components/cadastros/TabelaPrecoFormCompleto";
import KitProdutoForm from "@/components/cadastros/KitProdutoForm";
import CatalogoWebForm from "@/components/cadastros/CatalogoWebForm";
import UnidadeMedidaForm from "@/components/cadastros/UnidadeMedidaForm";

export default function Bloco2Produtos({ allCounts, isLoading }) {
  const { openWindow } = useWindow();
  const { hasPermission } = usePermissions();

  const openProdutos = () => openWindow(VisualizadorProdutos, { windowMode: true }, { title: 'Todos os Produtos', width: 1400, height: 800 });

  const openList = (entidade, titulo, Icon, campos, FormComp) => () => {
    openWindow(VisualizadorUniversalEntidadeV24, { nomeEntidade: entidade, tituloDisplay: titulo, icone: Icon, camposPrincipais: campos, componenteEdicao: FormComp, windowMode: true }, { title: titulo, width: 1400, height: 800 });
  };

  // ATENÇÃO: sempre usar o campo real que a entidade salva (não alias como nome_grupo, nome_marca etc.)
  // getDisplayValue no visualizador faz fallback automático se o campo estiver vazio
  const tiles = [
    { k: 'Servico',        title: 'Serviços',                Icon: Stars,      campos: ['nome','descricao','tipo_servico','ativo'],      form: ServicoForm },
    { k: 'SetorAtividade', title: 'Setores de Atividade',    Icon: Factory,    campos: ['nome','descricao','codigo'],                    form: SetorAtividadeForm },
    { k: 'GrupoProduto',   title: 'Grupos/Linhas de Produto', Icon: Boxes,     campos: ['nome','nome_grupo','codigo','natureza'],        form: GrupoProdutoForm },
    { k: 'Marca',          title: 'Marcas',                   Icon: Award,     campos: ['nome','nome_marca','pais_origem','categoria'],  form: MarcaForm },
    { k: 'TabelaPreco',    title: 'Tabelas de Preço',         Icon: TrendingUp,campos: ['nome','tipo','ativo'],                          form: TabelaPrecoFormCompleto },
    { k: 'KitProduto',     title: 'Kits de Produto',          Icon: Package,   campos: ['nome','descricao','ativo'],                     form: KitProdutoForm },
    { k: 'CatalogoWeb',    title: 'Catálogo Web',             Icon: Globe,     campos: ['titulo','descricao','slug'],                    form: CatalogoWebForm },
    { k: 'UnidadeMedida',  title: 'Unidades de Medida',       Icon: Ruler,     campos: ['sigla','nome','descricao'],                     form: UnidadeMedidaForm },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <Card className="rounded-sm shadow-sm border bg-white/80 backdrop-blur">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b rounded-t-sm">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-700"/> Produtos & Serviços
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 text-sm text-slate-600">Total consolidado do grupo/empresa.</CardContent>
      </Card>

      {/* Card Produtos (abre VisualizadorProdutos especializado) */}
      <Card className="rounded-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150 cursor-pointer group border"
        onClick={hasPermission('Estoque', null, 'visualizar') ? openProdutos : undefined}>
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
              <div className="p-1.5 rounded-sm bg-purple-50 group-hover:bg-purple-100 transition-colors">
                <Package className="w-4 h-4 text-purple-600" />
              </div>
              Produtos
              <CountBadgeSimplificado entities={["Produto"]} allCounts={allCounts} isLoading={isLoading} />
            </CardTitle>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 rounded-sm text-xs h-7"
              onClick={(e) => { e.stopPropagation(); openProdutos(); }}
              disabled={!hasPermission('Estoque', null, 'visualizar')}>
              Abrir
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 text-xs text-slate-500">Listagem e edição completa com filtros avançados.</CardContent>
      </Card>

      {tiles.map(({ k, title, Icon, campos, form: FormComp }) => (
        <Card key={k} className="rounded-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150 cursor-pointer group border"
          onClick={hasPermission('Cadastros', null, 'visualizar') ? openList(k, title, Icon, campos, FormComp) : undefined}>
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                <div className="p-1.5 rounded-sm bg-purple-50 group-hover:bg-purple-100 transition-colors">
                  <Icon className="w-4 h-4 text-purple-600" />
                </div>
                {title}
                <CountBadgeSimplificado entities={[k]} allCounts={allCounts} isLoading={isLoading} />
              </CardTitle>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-sm text-xs h-7"
                onClick={(e) => { e.stopPropagation(); openList(k, title, Icon, campos, FormComp)(); }}
                disabled={!hasPermission('Cadastros', null, 'visualizar')}>
                Abrir
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 text-xs text-slate-500">Clique para listar, criar e editar.</CardContent>
        </Card>
      ))}
    </div>
  );
}