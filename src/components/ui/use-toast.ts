
import * as React from "react"
import { type Toast, type ToasterToast, type ToastActionElement } from "@/types/toast-types"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 5000 // 5 segundos para quitar notificaciones

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

/**
 * Genera un ID único para cada toast
 * @returns ID único como string
 */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

// Mapa para almacenar los timeouts de los toasts
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

/**
 * Agrega un toast a la cola de eliminación
 * @param toastId ID del toast a eliminar
 * @param duration Duración opcional antes de eliminar
 */
const addToRemoveQueue = (toastId: string, duration?: number) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "DISMISS_TOAST",
      toastId: toastId,
    })
  }, duration || TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

/**
 * Reducer para manejar las acciones de los toasts
 */
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

// Lista de listeners para actualizaciones de estado
const listeners: Array<(state: State) => void> = []

// Estado en memoria para los toasts
let memoryState: State = { toasts: [] }

/**
 * Dispatch para enviar acciones al reducer
 * @param action Acción a ejecutar
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

/**
 * Función para crear un nuevo toast
 * @param props Propiedades del toast
 * @returns Objeto con métodos para controlar el toast
 */
export function toast(props: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  const newToast = {
    ...props,
    id,
    open: true,
    onOpenChange: (open) => {
      if (!open) dismiss()
    },
  }

  dispatch({
    type: "ADD_TOAST",
    toast: newToast,
  })

  // Auto-eliminación basada en la duración si se proporciona
  if (newToast.duration) {
    addToRemoveQueue(id, newToast.duration)
  } else {
    addToRemoveQueue(id)
  }

  return {
    id: id,
    dismiss,
    update,
  }
}

/**
 * Hook para usar el sistema de toasts
 * @returns Estado y funciones para controlar los toasts
 */
export function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export type { Toast, ToasterToast, ToastActionElement }
