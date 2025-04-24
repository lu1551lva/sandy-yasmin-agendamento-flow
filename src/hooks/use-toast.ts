
import * as React from "react"
import { toast } from "./toast/toast-utils"
import { dispatch, listeners, memoryState } from "./toast/reducer"
import type { UseToastReturn } from "./toast/types"

function useToast(): UseToastReturn {
  const [state, setState] = React.useState(memoryState)

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

// Re-export the type so it can be imported from "@/hooks/use-toast"
export type { UseToastReturn }
export { useToast, toast }
