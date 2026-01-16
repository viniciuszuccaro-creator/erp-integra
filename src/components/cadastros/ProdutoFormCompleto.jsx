import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Package, Calculator, Globe, TrendingUp
} from "lucide-react";
import ProdutoFormHeader from "./produto/ProdutoFormHeader";
import ProdutoForm from "./ProdutoForm";
import AbaConversoesProduto from "./AbaConversoesProduto";
import AbaEcommerceProduto from "./AbaEcommerceProduto";
import HistoricoProduto from "./HistoricoProduto";
import ImportacaoProdutoNFe from "./ImportacaoProdutoNFe";
import ImportacaoProdutoLote from "./ImportacaoProdutoLote";
import { toast } from "sonner";

/**
 * V21.1.2-R2 - CADASTRO COMPLETO DE PRODUTOS
 * ✅ Abas organizadas (Dados Gerais, Conversões, E-Commerce, Histórico)
 * ✅ Importação NF-e e Lote integradas
 * ✅ Mantém 100% do formulário original
 * ✅ Adiciona funcionalidades avançadas
 */
export default function ProdutoFormCompleto({ produto, onSubmit, isSubmitting, onProdutosCriados }) {
  const [abaAtiva, setAbaAtiva] = useState('dados-gerais');
  const [modoImportacao, setModoImportacao] = useState(null); // 'nfe' | 'lote' | null

  const handleSubmit = (formData) => {
    onSubmit(formData);
  };

  const handleProdutosCriadosImportacao = (produtos) => {
    toast.success(`✅ ${produtos.length} produto(s) importado(s)!`);
    if (onProdutosCriados) {
      onProdutosCriados(produtos);
    }
    setModoImportacao(null);
  };

  if (modoImportacao === 'nfe') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Importar Produtos via NF-e</h2>
          <Button variant="outline" onClick={() => setModoImportacao(null)}>
            Voltar ao Cadastro
          </Button>
        </div>
        <ImportacaoProdutoNFe onProdutosCriados={handleProdutosCriadosImportacao} />
      </div>
    );
  }

  if (modoImportacao === 'lote') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Importação em Lote</h2>
          <Button variant="outline" onClick={() => setModoImportacao(null)}>
            Voltar ao Cadastro
          </Button>
        </div>
        <ImportacaoProdutoLote onProdutosCriados={handleProdutosCriadosImportacao} />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full h-full overflow-auto">
      {/* Header com Botões de Importação */}
      <ProdutoFormHeader
        produto={produto}
        onImportarNFe={() => setModoImportacao('nfe')}
        onImportarLote={() => setModoImportacao('lote')}
      />

      {/* Abas do Formulário */}
      <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
        <TabsList className="grid grid-cols-4 w-full bg-slate-100">
          <TabsTrigger value="dados-gerais" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Dados Gerais
          </TabsTrigger>
          <TabsTrigger value="conversoes" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Conversões
          </TabsTrigger>
          <TabsTrigger value="ecommerce" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            E-Commerce
          </TabsTrigger>
          {produto && (
            <TabsTrigger value="historico" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Histórico
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="dados-gerais">
          <ProdutoForm 
            produto={produto} 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting} 
          />
        </TabsContent>

        <TabsContent value="conversoes">
          <Card>
            <div className="p-6">
              <AbaConversoesProduto 
                formData={produto || {}} 
                setFormData={() => {}} 
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="ecommerce">
          <Card>
            <div className="p-6">
              <AbaEcommerceProduto 
                formData={produto || {}} 
                setFormData={() => {}} 
              />
            </div>
          </Card>
        </TabsContent>

        {produto && (
          <TabsContent value="historico">
            <HistoricoProduto produtoId={produto.id} produto={produto} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}