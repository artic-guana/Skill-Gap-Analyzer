import api from "./axios"


export const getRoadmap =
  async () => {

    const response =
      await api.get(
        "/roadmap/me"
      )

    return response.data
  }


export const generateRoadmap =
  async (
    jobRole
  ) => {

    const response =
      await api.post(
        "/roadmap/generate",
        {
          job_role:
            jobRole,
        }
      )

    return response.data
  }


export const updateRoadmapProgress =
  async ({
    skillIndex,
    subtopicIndex,
    completed,
  }) => {

    const response =
      await api.patch(
        "/roadmap/progress",
        {
          skill_index:
            skillIndex,

          subtopic_index:
            subtopicIndex,

          completed,
        }
      )

    return response.data
  }