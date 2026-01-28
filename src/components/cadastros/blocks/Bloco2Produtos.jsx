import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWindow } from "@/components/lib/useWindow";
import usePermissions from "@/components/lib/usePermissions";
import VisualizadorUniversalEntidade from "@/components/cadastros/VisualizadorUniversalEntidade";
import VisualizadorProdutos from "@/components/cadastros/VisualizadorProdutos";
import { Package, Stars, Factory, Boxes, Award, TrendingUp, Globe, Ruler, Plus } from "lucide-react";

import ProdutoFormV22_Completo from "@/components/cadastros/ProdutoFormV22_Completo";
import ServicoForm from "@/components/cadastros/ServicoForm";
import SetorAtividadeForm from "@/components/cadastros/SetorAtividadeForm";
import GrupoProdutoForm from "@/components/cadastros/GrupoProdutoForm";
import MarcaForm from "@/components/cadastros/MarcaForm";
import TabelaPrecoFormCompleto from "@/components/cadastros/TabelaPrecoFormCompleto";
import KitProdutoForm from "@/components/cadastros/KitProdutoForm";
import CatalogoWebForm from "@/components/cadastros/CatalogoWebForm";
import UnidadeMedidaForm from "@/components/cadastros/UnidadeMedidaForm";

export default function Bloco2Produtos() {
  const { openWindow } = useWindow();
  const { hasPermission } = usePermissions();

  const openProdutos = () => openWindow(VisualizadorProdutos, { windowMode: true }, { title: 'Todos os Produtos', width: 1400, height: 800 });

  const openList = (entidade, titulo, Icon, campos, FormComp) => () => {
    openWindow(VisualizadorUniversalEntidade, { nomeEntidade: entidade, tituloDisplay: titulo, icone: Icon, camposPrincipais: campos, componenteEdicao: FormComp, windowMode: true }, { title: titulo, width: 1400, height: 800 });
  };

  const tiles = [
    { k: 'Produto', custom: true, title: 'Produtos', Icon: Package },
    { k: 'Servico', title: 'Serviços', Icon: Stars, campos: ['nome','descricao','valor_padrao','unidade_medida'], form: ServicoForm },
    { k: 'SetorAtividade', title: 'Setores de Atividade', Icon: Factory, campos: ['nome','tipo_operacao','icone','descricao'], form: SetorAtividadeForm },
    { k: 'GrupoProduto', title: 'Grupos/Linhas de Produto', Icon: Boxes, campos: ['nome_grupo','descricao','codigo'], form: GrupoProdutoForm },
    { k: 'Marca', title: 'Marcas', Icon: Award, campos: ['nome_marca','pais_origem','site','descricao'], form: MarcaForm },
    { k: 'TabelaPreco', title: 'Tabelas de Preço', Icon: TrendingUp, campos: ['nome','tipo','ativo','data_inicio','data_fim'], form: TabelaPrecoFormCompleto },
    { k: 'KitProduto', title: 'Kits de Produto', Icon: Package, campos: ['nome_kit','descricao','valor_total','ativo'], form: KitProdutoForm },
    { k: 'CatalogoWeb', title: 'Catálogo Web', Icon: Globe, campos: ['titulo','slug','ativo'], form: CatalogoWebForm },
    { k: 'UnidadeMedida', title: 'Unidades de Medida', Icon: Ruler, campos: ['sigla','descricao'], form: UnidadeMedidaForm },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <Card className="hover:shadow-lg transition-all">
        <CardHeader className="bg-purple-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600"/> Produtos
            </CardTitle>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={openProdutos} disabled={!hasPermission('estoque','ver')}>
              Abrir
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 text-sm text-slate-600">Listagem e edição completa via janela com filtros avançados.</CardContent>
      </Card>

      {tiles.filter(t => !t.custom).map(({ k, title, Icon, campos, form: FormComp }) => (
        <Card key={k} className="hover:shadow-lg transition-all">
          <CardHeader className="bg-slate-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Icon className="w-5 h-5 text-slate-600"/> {title}
              </CardTitle>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={openList(k, title, Icon, campos, FormComp)} disabled={!hasPermission('cadastros','ver')}>
                Abrir
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 text-sm text-slate-600">Gerencie {title} em janelas redimensionáveis.</CardContent>
        </Card>
      ))}
    </div>
  );
}