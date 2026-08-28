import api from "./axios"


export const getSkills =
  async () => {
    const response =
      await api.get(
        "/skills/me"
      )

    return response.data
  }