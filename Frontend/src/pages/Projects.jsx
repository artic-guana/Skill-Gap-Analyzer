import { useEffect, useState } from "react";

import {
  ArrowUpRight,
  Bot,
  Check,
  CodeXml,
  ExternalLink,
  Layers3,
  Sparkles,
} from "lucide-react";

import Navbar from "../common/Navbar";

import {
  analyzeAllGithubProjects,
  getGithubProjects,
} from "../api/githubProjects.api";

import useProcessingStore from "../store/useProcessingStore";

const getErrorMessage = (error, fallback) => {
  const detail = error.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || String(item)).join(", ");
  }

  return fallback;
};

const Projects = () => {
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const { startProcessing, updateProcessing, stopProcessing } =
    useProcessingStore();

  const loadProjects = async () => {
    try {
      setError("");

      const data = await getGithubProjects();

      const savedProjects = Array.isArray(data) ? data : (data?.projects ?? []);

      setProjects(
        savedProjects.map((project) => ({
          ...project,
          project_name: project.project_name ?? project.repo_name,
          repository: project.repository ?? project.repo_url,
          skills_demonstrated: (project.skills_demonstrated ?? []).map(
            (skill) =>
              typeof skill === "string"
                ? {
                    skill,
                    evidence: "Skill demonstrated in repository analysis.",
                  }
                : skill,
          ),
        })),
      );
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Could not load project analyses."),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleAnalyzeAll = async () => {
    setError("");

    startProcessing({
      title: "Analyzing GitHub projects",

      message: "Reading your repositories and README files...",

      progress: 20,
    });

    try {
      await analyzeAllGithubProjects();

      updateProcessing({
        message: "AI analysis completed. Refreshing your project list...",

        progress: 80,
      });

      await loadProjects();

      updateProcessing({
        message: "All GitHub projects are analyzed and saved.",

        progress: 100,
      });
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "GitHub project analysis failed."),
      );
    } finally {
      stopProcessing();
    }
  };

  return (
    <>
      <Navbar />

      <main className="projects-shell">
        {/* HEADER */}

        <header className="projects-header">
          <div>
            <p className="eyebrow">Project analysis</p>

            <h1>
              Work that <span>speaks.</span>
            </h1>

            <p className="projects-intro">
              Analyze your GitHub once. The backend reads each project README,
              generates a short AI summary and difficulty level, then stores the
              results in MongoDB.
            </p>
          </div>

          <div className="projects-header-meta">
            <div className="projects-total">
              <strong>{String(projects.length).padStart(2, "0")}</strong>

              <span>projects analyzed</span>
            </div>
          </div>
        </header>

        {/* ANALYZE ALL GITHUB PROJECTS */}

        <section
          className="project-analysis-card"
          style={{
            marginBottom: 18,
          }}
        >
          <div className="project-analysis-topline">
            <span>
              <Sparkles size={14} /> Analyze your GitHub
            </span>
          </div>

          <div className="project-analysis-action">
            <p className="project-analysis-note pl-3">
              Analyze all public, non-fork repositories from your saved GitHub
              profile.
            </p>

            <button
              className="verify-project-button"
              type="button"
              onClick={handleAnalyzeAll}
            >
              Analyze all projects
              <ArrowUpRight size={15} />
            </button>
          </div>
        </section>

        {/* STATUS */}

        {loading && <p className="projects-intro">Loading saved projects...</p>}

        {error && (
          <p className="projects-intro" role="alert">
            {error}
          </p>
        )}

        {/* SAVED PROJECTS */}

        {projects.map((project) => {
          const projectId = project.id ?? project._id ?? project.repository;

          const hasScore =
            project.score !== null && project.score !== undefined;

          const score = hasScore
            ? Math.max(0, Math.min(Number(project.score), 100))
            : null;

          return (
            <section className="project-analysis-card" key={projectId}>
              <div className="project-analysis-topline">
                <span>
                  <Sparkles size={14} /> Repository insight
                </span>

                {score !== null && (
                  <span className="project-score-label">
                    {score}% project score
                  </span>
                )}
              </div>

              <div className="project-analysis-main">
                <div className="project-title-row">
                  <div className="project-icon">
                    <Bot size={26} />
                  </div>

                  <div>
                    <p className="eyebrow">
                      {project.project_type || "Project"}
                    </p>

                    <h2>{project.project_name || "Untitled project"}</h2>
                  </div>

                  {project.repository && (
                    <a
                      className="project-repo-link"
                      href={project.repository}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View repository
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>

                <p className="project-summary">
                  {project.summary || "No project summary available."}
                </p>

                {score !== null && (
                  <div className="project-score-block">
                    <div>
                      <span>Project strength</span>

                      <strong>
                        {score}

                        <small>/100</small>
                      </strong>
                    </div>

                    <div
                      className="project-progress-track"
                      aria-label={`Project score: ${score} out of 100`}
                    >
                      <span
                        style={{
                          width: `${score}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* DETAILS */}

              <div className="project-details-grid">
                <div className="project-detail-block">
                  <div className="project-detail-heading">
                    <Layers3 size={16} />

                    <span>Technologies</span>
                  </div>

                  <div className="project-chip-list">
                    {(project.technologies ?? []).length > 0 ? (
                      (project.technologies ?? []).map((technology, index) => (
                        <span key={`${technology}-${index}`}>{technology}</span>
                      ))
                    ) : (
                      <span>No technologies detected</span>
                    )}
                  </div>
                </div>

                <div className="project-detail-block">
                  <div className="project-detail-heading">
                    <CodeXml size={16} />

                    <span>Key features</span>
                  </div>

                  {(project.features ?? []).length > 0 ? (
                    <ul>
                      {(project.features ?? []).map((feature, index) => (
                        <li key={`${feature}-${index}`}>
                          <Check size={13} />

                          {feature}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No features detected.</p>
                  )}
                </div>
              </div>

              {/* SKILLS */}

              <div className="project-skills-section">
                <div className="project-detail-heading">
                  <CodeXml size={16} />

                  <span>Skills demonstrated</span>
                </div>

                <div className="project-skills-list">
                  {(project.skills_demonstrated ?? []).length > 0 ? (
                    (project.skills_demonstrated ?? []).map((item, index) => (
                      <div
                        className="project-skill-item"
                        key={`${item.skill ?? "skill"}-${index}`}
                      >
                        <strong>{item.skill ?? "Unknown skill"}</strong>

                        <span>{item.evidence ?? "No evidence provided."}</span>
                      </div>
                    ))
                  ) : (
                    <p>No demonstrated skills found.</p>
                  )}
                </div>
              </div>

              {/* FOOTER */}

              <div className="project-analysis-footer">
                <span>
                  <span className="project-status-dot" />
                  Difficulty: <strong>{project.difficulty || "Unrated"}</strong>
                </span>

                <p>
                  {project.stars ?? 0} stars · {project.forks ?? 0} forks
                </p>

                <ArrowUpRight size={18} />
              </div>
            </section>
          );
        })}

        {!loading && !projects.length && (
          <p className="projects-intro">
            No projects analyzed yet. Analyze your GitHub repositories above.
          </p>
        )}
      </main>
    </>
  );
};

export default Projects;
