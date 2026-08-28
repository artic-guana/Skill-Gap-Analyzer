import api from "./axios"


export const getCareerRecommendations =
  async () => {
    const response =
      await api.get(
        "/recommendations/me"
      )

    return response.data
  }


export const regenerateCareers =
  async () => {
    const response =
      await api.post(
        "/recommendations/generate"
      )

    return response.data
  }