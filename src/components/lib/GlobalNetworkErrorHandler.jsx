import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * GLOBAL NETWORK ERROR HANDLER V22.0
 * Intercepta erros de rede não tratados e exibe mensagens amigáveis
 */
export default function GlobalNetworkErrorHandler() {
  useEffect(() => {
    let errorCount = 0;
    let lastErrorTime = 0;
    const ERROR_THRESHOLD = 3;
    const TIME_WINDOW = 5000; // 5 segundos

    const handleError = (event) => {
      const now = Date.now();
      
      // Reset counter se passou tempo suficiente
      if (now - lastErrorTime > TIME_WINDOW) {
        errorCount = 0;
      }
      
      const errorMsg = event?.error?.message || event?.message || '';
      const isNetworkError = errorMsg.includes('Network Error') || 
                            errorMsg.includes('Failed to fetch') ||
                            errorMsg.includes('timeout');
      
      if (isNetworkError) {
        errorCount++;
        lastErrorTime = now;
        
        if (errorCount >= ERROR_THRESHOLD) {
          toast.error('⚠️ Problemas de conexão detectados', {
            description: 'Verifique sua internet. Tentando reconectar automaticamente...',
            duration: 5000
          });
          errorCount = 0; // Reset para não spammar
        }
      }
    };

    const handleUnhandledRejection = (event) => {
      const reason = event?.reason;
      const isNetworkError = reason?.message?.includes('Network Error') ||
                            reason?.message?.includes('Failed to fetch') ||
                            reason?.code === 'ECONNABORTED';
      
      if (isNetworkError) {
        event.preventDefault(); // Previne console spam
        handleError({ message: reason?.message });
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}