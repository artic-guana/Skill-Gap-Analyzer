import api from "./axios";


export const getExploreRoadmaps = async (
	targetRole = "",
	limit = 20,
) => {
	const response = await api.get(
		"/roadmap/explore",
		{
			params: {
				target_role:
					targetRole || undefined,

				limit,
			},
		},
	);

	return response.data;
};


export const getExploreRoadmap = async (
	roadmapId,
) => {
	const response = await api.get(
		`/roadmap/explore/${roadmapId}`,
	);

	return response.data;
};