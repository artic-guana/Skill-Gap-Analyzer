import api from "./axios"


export const generateSkillGap =
  async (jobRole) => {
    const response =
      await api.post(
        "/skill-gap/analyze",
        {
          job_role: jobRole,
        }
      )

    return response.data
  }


export const getSkillGap =
  async () => {
    const response =
      await api.get(
        "/skill-gap/me"
      )

    return response.data
  }