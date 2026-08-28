import api from "./axios"


export const analyzeProject =
  async (repoUrl) => {
    const response =
      await api.post(
        "/project/analyze",
        {
          repo_url: repoUrl,
        }
      )

    return response.data
  }


export const getProjects =
  async () => {
    const response =
      await api.get(
        "/project/me"
      )

    return response.data
  }