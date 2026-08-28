import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, BriefcaseBusiness, Check, ChevronDown, Sparkles } from "lucide-react"
import Navbar from "../common/Navbar"
import { getCareerRecommendations } from "../api/career.api"
import { generateSkillGap } from "../api/skillGap.api"
import { generateRoadmap } from "../api/roadmap.api"
import useProcessingStore from "../store/useProcessingStore"

const normalizeCareerResult = (data) => ({
	roles: (data?.roles ?? data?.Roles ?? []).map((role) => ({
		name: role?.name ?? role?.["Job Role"] ?? "Unknown role",
		recommended: Boolean(role?.recommended),
	})),
	aiInput: data?.ai_input ?? data?.["AI Input"] ?? "",
	branch: data?.branch ?? "",
})

const Career = () => {
	const navigate = useNavigate()
	const [careerRecommendation, setCareerRecommendation] = useState({ roles: [], aiInput: "", branch: "" })
	const [selectedRole, setSelectedRole] = useState("")
	const [careerOptionsOpen, setCareerOptionsOpen] = useState(false)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")

	const { startProcessing, updateProcessing, stopProcessing } = useProcessingStore()

	useEffect(() => {
		const loadCareers = async () => {
			try {
				const data =
					await getCareerRecommendations()

				const normalized =
					normalizeCareerResult(data)

				if (!normalized.roles.length) {
					setError(
						"No career recommendations were found."
					)

					return
				}

				setCareerRecommendation(
					normalized
				)

				const recommended =
					normalized.roles.find(
						(role) =>
							role.recommended
					)

				setSelectedRole(
					recommended?.name
					?? normalized.roles[0]?.name
					?? ""
				)

			} catch (requestError) {

				setError(
					requestError.response
						?.data
						?.detail
					|| "Career recommendations are not available yet."
				)

			} finally {

				setLoading(false)
			}
		}

		loadCareers()
	}, [])

	const selectedRoleData = useMemo(
		() => careerRecommendation.roles.find((role) => role.name === selectedRole),
		[careerRecommendation.roles, selectedRole]
	)

	const handleBuildRoadmap = async () => {
		if (!selectedRole) return

		setError("")

		startProcessing({
			title: "Building your learning path",
			message:
				"Comparing your current skills with the selected career...",
			progress: 15,
		})

		try {
			await generateSkillGap(
				selectedRole
			)

			updateProcessing({
				message:
					"Generating a personalized roadmap from your skill gaps...",
				progress: 55,
			})

			await generateRoadmap(
				selectedRole
			)

			updateProcessing({
				message:
					"Roadmap saved. Opening your learning path...",
				progress: 100,
			})

			navigate(
				"/roadmap",
				{
					state: {
						generated: true,
					},
				}
			)

		} catch (requestError) {

			stopProcessing()

			setError(
				requestError.response
					?.data
					?.detail
				|| "Could not generate your learning path."
			)
		}
	}

	return (
		<>
			<Navbar />
			<main className="career-shell">
				<header className="career-header">
					<div>
						<p className="eyebrow">Career direction</p>
						<h1>Find your next <span>strong fit.</span></h1>
						<p className="career-intro">A focused recommendation based on your profile, academic context, and placement data.</p>
					</div>
					<div className="career-count"><strong>{careerRecommendation.roles.length}</strong><span>roles evaluated</span></div>
				</header>

				{loading && <p className="career-change-note">Loading saved recommendations...</p>}
				{error && <p className="career-change-note" role="alert">{error}</p>}

				{!loading && selectedRoleData && (
					<section className="career-layout">
						<article className="career-feature-card">
							<div className="career-feature-topline">
								<span><Sparkles size={14} /> {selectedRoleData.recommended ? "AI recommendation" : "Selected career"}</span>
								{selectedRoleData.recommended && <span className="career-match">Recommended</span>}
							</div>

							<div className="career-feature-body">
								<div className="career-role-icon"><BriefcaseBusiness size={25} /></div>
								<div>
									<p className="eyebrow">{selectedRoleData.recommended ? "Recommended career" : "Selected career"}</p>
									<h2>{selectedRole}</h2>
									<p className="career-rationale">{selectedRoleData.recommended && careerRecommendation.aiInput}</p>
								</div>
							</div>

							<div className="career-feature-footer">
								<span><Check size={15} /> {careerRecommendation.branch ? `Aligned with your ${careerRecommendation.branch} profile` : "Aligned with your saved profile"}</span>
								<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
									<button type="button" className="career-primary-button" onClick={() => setCareerOptionsOpen((open) => !open)} aria-expanded={careerOptionsOpen}>
										Change career <ChevronDown size={16} className={careerOptionsOpen ? "rotate" : ""} />
									</button>
									<button
										type="button"
										className="career-primary-button"
										onClick={handleBuildRoadmap}
										disabled={!selectedRole}
									>
										Build roadmap
										<ArrowRight size={16} />
									</button>
								</div>
							</div>
						</article>

						<section className="career-list-section">
							<div className="career-list-heading"><div><p className="eyebrow">Explore the field</p><h2>Available careers</h2></div><ArrowRight size={18} /></div>
							<div className="career-list">
								{careerRecommendation.roles.map((role, index) => (
									<button
										type="button"
										className={`career-option ${selectedRole === role.name ? "selected" : ""}`}
										key={role.name}
										onClick={() => {
											setSelectedRole(role.name)
											setCareerOptionsOpen(false)
										}}
									>
										<span className="career-option-number">{String(index + 1).padStart(2, "0")}</span>
										<span>{role.name}</span>
										{role.recommended && <span className="career-option-recommended">Recommended</span>}
										{selectedRole === role.name && <Check size={16} />}
									</button>
								))}
							</div>
							{careerOptionsOpen && <p className="career-change-note">Choose a role above, then build its roadmap when you are ready.</p>}
						</section>
					</section>
				)}
			</main>
		</>
	)
}

export default Career
