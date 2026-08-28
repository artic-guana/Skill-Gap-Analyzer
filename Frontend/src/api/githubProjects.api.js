import api from "./axios"


export const analyzeAllGithubProjects =
	async () => {

		const response =
			await api.post(
				"/github-projects/analyze"
			)

		return response.data
	}


export const getGithubProjects =
	async () => {

		const response =
			await api.get(
				"/github-projects/me"
			)

		return response.data
	}