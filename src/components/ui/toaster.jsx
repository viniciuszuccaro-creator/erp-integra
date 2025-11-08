import React, { useEffect } from "react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <ToastProvider>
      <ToastViewport>
        {toasts.map(function ({ id, title, description, action, variant, ...props }) {
          return (
            <ToastItem 
              key={id} 
              id={id}
              title={title}
              description={description}
              action={action}
              variant={variant}
              dismiss={dismiss}
              {...props}
            />
          );
        })}
      </ToastViewport>
    </ToastProvider>
  );
}

function ToastItem({ id, title, description, action, variant, dismiss, ...props }) {
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    // Anima a entrada
    setTimeout(() => setIsVisible(true), 10);

    // Auto-dismiss após 5 segundos
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => dismiss(id), 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, dismiss]);

  return (
    <Toast 
      variant={variant} 
      {...props}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'all 0.3s ease-in-out'
      }}
    >
      <div className="grid gap-1">
        {title && <ToastTitle>{title}</ToastTitle>}
        {description && (
          <ToastDescription>{description}</ToastDescription>
        )}
      </div>
      {action}
      <ToastClose onClick={() => {
        setIsVisible(false);
        setTimeout(() => dismiss(id), 300);
      }} />
    </Toast>
  );
}