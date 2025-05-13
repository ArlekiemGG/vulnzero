
/// <reference types="vite/client" />

// Add custom type declarations for our toast variant
declare module '@/components/ui/toast' {
  interface ToastProps {
    variant?: "default" | "destructive" | "success";
  }
}
