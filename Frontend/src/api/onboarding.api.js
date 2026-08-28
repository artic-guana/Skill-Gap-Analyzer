import api from "./axios"


export const submitOnboarding =
  async (formData) => {
    const response =
      await api.post(
        "/onboarding",
        formData
      )

    return response.data
  }