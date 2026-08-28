import { create } from "zustand"


const useProcessingStore =
  create((set) => ({
    isProcessing: false,

    title: "",

    message: "",

    progress: 0,


    startProcessing: ({
      title =
        "Processing",
      message = "",
      progress = 0,
    } = {}) => {
      set({
        isProcessing: true,
        title,
        message,
        progress,
      })
    },


    updateProcessing: ({
      title,
      message,
      progress,
    }) => {
      set((state) => ({
        title:
          title ??
          state.title,

        message:
          message ??
          state.message,

        progress:
          progress ??
          state.progress,
      }))
    },


    stopProcessing: () => {
      set({
        isProcessing: false,
        title: "",
        message: "",
        progress: 0,
      })
    },
  }))


export default useProcessingStore