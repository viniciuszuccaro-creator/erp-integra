import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Componente de estado vazio padronizado
 * 
 * Exibe mensagem amigável quando não há dados para mostrar,
 * com opção de ação primária (ex: criar novo registro).
 * 
 * @param {Component} icon - Ícone do lucide-react
 * @param {string} title - Título da mensagem
 * @param {string} description - Descrição adicional
 * @param {string} actionLabel - Texto do botão de ação
 * @param {function} onAction - Callback ao clicar no botão
 * @param {string} actionIcon - Ícone do botão de ação
 * @param {string} className - Classes CSS adicionais
 * 
 * @example
 * <EmptyState
 *   icon={Package}
 *   title="Nenhum produto cadastrado"
 *   description="Cadastre seu primeiro produto para começar"
 *   actionLabel="Novo Produto"
 *   onAction={() => setDialogOpen(true)}
 * />
 */
export default function EmptyState({
  icon: Icon,
  title = "Nenhum registro encontrado",
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  className = ""
}) {
  return (
    <div className={cn("text-center py-12", className)}>
      {Icon && (
        <Icon className="w-16 h-16 text-slate-300 mx-auto mb-4 opacity-50" />
      )}
      
      <h3 className="text-lg font-semibold text-slate-700 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      
      {onAction && actionLabel && (
        <Button onClick={onAction} className="mt-4">
          {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
          {actionLabel}
        </Button>
      )}
    </div>
  );
}