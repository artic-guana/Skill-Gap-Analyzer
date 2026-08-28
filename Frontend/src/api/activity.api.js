import api from "./axios"


export const getActivityHeatmap =
  async (year) => {

    const params =
      year
        ? { year }
        : {}

    const response =
      await api.get(
        "/activity/heatmap",
        {
          params,
        }
      )

    return response.data
  }