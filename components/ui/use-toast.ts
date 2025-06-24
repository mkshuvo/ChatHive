import * as React from "react"

import { type ToastActionElement, type ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type Action = 
  | { type: "ADD_TOAST"; toast: ToastProps }
  | { type: "UPDATE_TOAST"; toast: ToastProps }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string }

interface State { 
  toasts: ToastProps[]
}

const reducers = (state: State, action: Action): State => {
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

    case "DISMISS_TOAST":
      const { toastId } = action

      // ! Side effect ! - This will be executed in a separate render cycle
      if (toastId) {
        dismissToast(toastId)
      } else {
        state.toasts.forEach((toast) => dismissToast(toast.id))
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

const listeners: ((state: State) => void)[] = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducers(memoryState, action)
  listeners.forEach((listener) => listener(memoryState))
}

type Toast = {
  id: string
  title?: string
  description?: string
  action?: ToastActionElement
  duration?: number
  className?: string
  variant?: "default" | "destructive"
}

type ToastOptions = Omit<Toast, "id">

function useToast() {
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
    dismiss: React.useCallback(function toast(toastId?: string) {
      dispatch({ type: "DISMISS_TOAST", toastId })
    }, []),
  }
}

let count = 0

function genId() {
  count = count + 1
  return `toast-${count}`
}

function toast({ ...props }: ToastOptions) {
  const id = genId()

  const update = (props: ToastProps) =>
    dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })
  const remove = () => dispatch({ type: "REMOVE_TOAST", toastId: id })

  dispatch({ 
    type: "ADD_TOAST", 
    toast: { 
      ...props, 
      id, 
      open: true, 
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return { 
    id: id,
    dismiss,
    update,
    remove,
  }
}

function dismissToast(toastId?: string) {
  dispatch({ type: "DISMISS_TOAST", toastId })
}

export { useToast, toast }