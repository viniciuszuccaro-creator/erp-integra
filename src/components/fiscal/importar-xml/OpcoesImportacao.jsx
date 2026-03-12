import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export default function OpcoesImportacao({ opcoes, setOpcoes, dadosNFe }) {
  if (!dadosNFe) return null;
  return (
    <Card className="border-0 shadow-md w-full">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-base">Opções de Importação</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={opcoes.criarFornecedor}
            onCheckedChange={(checked) => setOpcoes({ ...opcoes, criarFornecedor: checked })}
            disabled={!!dadosNFe.fornecedorExistente}
          />
          <div>
            <p className="font-medium">Criar Fornecedor</p>
            <p className="text-xs text-slate-600">
              {dadosNFe.fornecedorExistente ? 'Fornecedor já existe' : 'Criar novo fornecedor no sistema'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            checked={opcoes.criarProdutos}
            onCheckedChange={(checked) => setOpcoes({ ...opcoes, criarProdutos: checked })}
            disabled={dadosNFe.produtosNaoMapeados.length === 0}
          />
          <div>
            <p className="font-medium">Criar Produtos Não Cadastrados</p>
            <p className="text-xs text-slate-600">
              {dadosNFe.produtosNaoMapeados.length} produto(s) serão criados automaticamente
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            checked={opcoes.criarOrdemCompra}
            onCheckedChange={(checked) => setOpcoes({ ...opcoes, criarOrdemCompra: checked })}
          />
          <div>
            <p className="font-medium">Criar Ordem de Compra</p>
            <p className="text-xs text-slate-600">Gerar OC com status "Recebida" vinculada à NF-e</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            checked={opcoes.darEntradaEstoque}
            onCheckedChange={(checked) => setOpcoes({ ...opcoes, darEntradaEstoque: checked })}
          />
          <div>
            <p className="font-medium">Dar Entrada no Estoque</p>
            <p className="text-xs text-slate-600">
              Atualizar estoque de todos os produtos ({dadosNFe.itensMapeados.filter(i => i.produto_id_mapeado).length} itens)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            checked={opcoes.criarContasPagar}
            onCheckedChange={(checked) => setOpcoes({ ...opcoes, criarContasPagar: checked })}
          />
          <div>
            <p className="font-medium">Criar Contas a Pagar</p>
            <p className="text-xs text-slate-600">
              {dadosNFe.duplicatas.length > 0
                ? `Gerar ${dadosNFe.duplicatas.length} conta(s) a pagar`
                : 'Gerar 1 conta a pagar com vencimento na data de emissão'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}