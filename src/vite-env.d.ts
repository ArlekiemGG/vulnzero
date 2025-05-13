
/// <reference types="vite/client" />

// Add custom type declarations for our toast variant
declare module '@/components/ui/toast' {
  interface ToastProps {
    variant?: "default" | "destructive" | "success";
  }
}

// Properly define the toast interface for hooks
declare module '@/hooks/use-toast' {
  interface ToasterToast {
    id: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactElement;
    variant?: "default" | "destructive" | "success";
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
  
  type Toast = Omit<ToasterToast, "id">;
}
