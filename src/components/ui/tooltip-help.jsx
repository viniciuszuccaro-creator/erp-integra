import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Info } from 'lucide-react';

/**
 * Tooltip de Ajuda - Explica campos complexos
 * V12.0 - UX Premium
 */
export default function TooltipHelp({ 
  text, 
  variant = "info",
  side = "top",
  className 
}) {
  const Icon = variant === "help" ? HelpCircle : Info;
  
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            type="button"
            className="inline-flex items-center justify-center ml-1"
          >
            <Icon className={cn(
              "w-4 h-4 cursor-help transition-colors",
              variant === "help" ? "text-blue-500 hover:text-blue-700" : "text-slate-400 hover:text-slate-600",
              className
            )} />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p className="text-sm">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Import necessário
import { cn } from '@/lib/utils';