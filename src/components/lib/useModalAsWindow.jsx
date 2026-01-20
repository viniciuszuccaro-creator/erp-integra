import { useCallback } from 'react';
import { useWindow } from './useWindow';

/**
 * V22.0 ETAPA 3 - Hook para Converter Modais em Janelas
 * 
 * Converte comportamento de modal em janela não-bloqueante
 * Permite múltiplas "janelas" abertas simultaneamente
 * Mantém interação com outras telas
 */
export function useModalAsWindow() {
  const { openWindow } = useWindow();

  const openAsWindow = useCallback((config) => {
    const {
      title,
      component: Component,
      props = {},
      width = '800px',
      height = '600px',
      modal = false // Se true, comporta como modal bloqueante (padrão: false)
    } = config;

    return openWindow({
      title,
      component: Component,
      props,
      width,
      height,
      modal,
      resizable: true
    });
  }, [openWindow]);

  const openFormAsWindow = useCallback((config) => {
    const {
      title,
      formComponent,
      data = null,
      onSave,
      onCancel,
      ...rest
    } = config;

    return openAsWindow({
      title,
      component: formComponent,
      props: {
        data,
        onSave: async (result) => {
          if (onSave) await onSave(result);
        },
        onCancel
      },
      ...rest
    });
  }, [openAsWindow]);

  return {
    openAsWindow,
    openFormAsWindow
  };
}

/**
 * Wrapper para converter Dialog em Window
 */
export function convertDialogToWindow(DialogComponent, defaultConfig = {}) {
  return function WindowWrappedComponent(props) {
    const { openAsWindow } = useModalAsWindow();

    const handleOpen = () => {
      openAsWindow({
        ...defaultConfig,
        component: DialogComponent,
        props
      });
    };

    // Retorna um trigger que abre como janela
    return props.children({
      onClick: handleOpen,
      ...props
    });
  };
}