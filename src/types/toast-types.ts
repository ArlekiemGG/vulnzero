
// Define ToastActionElement type
export type ToastActionElement = React.ReactElement<{
  className: string
  altText?: string
  onClick: () => void
}>

// Define Toast and ToasterToast types
export interface ToasterToast {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: "default" | "destructive" | "success"
  duration?: number // Añadir propiedad para duración  
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export type Toast = Omit<ToasterToast, "id">
