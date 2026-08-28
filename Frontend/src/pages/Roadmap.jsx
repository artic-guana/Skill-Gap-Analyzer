import { useEffect, useMemo, useState } from "react";

import {
  Check,
  ChevronDown,
  ExternalLink,
  Flame,
  PlayCircle,
  Trophy,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";

import Navbar from "../common/Navbar";

import { getRoadmap, updateRoadmapProgress } from "../api/roadmap.api";

import { analyzeProject } from "../api/project.api";

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

const getTopicProgress = (topic) => {
  const subtopics = topic.subtopics ?? [];

  if (!subtopics.length) {
    return 0;
  }

  const completed = subtopics.filter((item) => item.completed).length;

  return Math.round((completed / subtopics.length) * 100);
};

function ProgressArc({ color, completion, rotation }) {
  const segmentLength = 28;

  const dash = (segmentLength * completion) / 100;

  return (
    <circle
      className="stat-arc"
      cx="70"
      cy="70"
      r="57"
      fill="none"
      stroke={color}
      strokeWidth="9"
      pathLength="100"
      strokeDasharray={`${dash} ${100 - dash}`}
      transform={`rotate(${rotation} 70 70)`}
    />
  );
}

function ArcTrack({ rotation }) {
  return (
    <circle
      className="stat-arc-track"
      cx="70"
      cy="70"
      r="57"
      fill="none"
      stroke="var(--line)"
      strokeWidth="9"
      pathLength="100"
      strokeDasharray="28 72"
      transform={`rotate(${rotation} 70 70)`}
    />
  );
}

const Roadmap = () => {
  const location = useLocation();

  const [roadmap, setRoadmap] = useState(null);

  const [githubLinks, setGithubLinks] = useState({});

  const [verificationMessages, setVerificationMessages] = useState({});

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [progressError, setProgressError] = useState("");

  const [updatingSubtopics, setUpdatingSubtopics] = useState({});

  const { startProcessing, updateProcessing, stopProcessing } =
    useProcessingStore();

  useEffect(() => {
    const loadRoadmap = async () => {
      try {
        setError("");

        if (location.state?.generated) {
          updateProcessing({
            message: "Loading your saved roadmap...",

            progress: 95,
          });
        }

        const data = await getRoadmap();

        setRoadmap(data);
      } catch (requestError) {
        setError(
          getErrorMessage(requestError, "No saved roadmap is available yet."),
        );
      } finally {
        setLoading(false);

        stopProcessing();
      }
    };

    loadRoadmap();
  }, [location.state, updateProcessing, stopProcessing]);

  const topics = roadmap?.roadmap ?? [];

  const topicProgress = useMemo(() => topics.map(getTopicProgress), [topics]);

  const overallProgress = useMemo(() => {
    const allSubtopics = topics.flatMap((topic) => topic.subtopics ?? []);

    if (!allSubtopics.length) {
      return 0;
    }

    const completed = allSubtopics.filter((item) => item.completed).length;

    return Math.round((completed / allSubtopics.length) * 100);
  }, [topics]);

  const setSubtopicCompletion = (topicIndex, subtopicIndex, completed) => {
    setRoadmap((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,

        roadmap: (current.roadmap ?? []).map((topic, currentTopicIndex) => {
          if (currentTopicIndex !== topicIndex) {
            return topic;
          }

          return {
            ...topic,

            subtopics: (topic.subtopics ?? []).map(
              (subtopic, currentSubtopicIndex) => {
                if (currentSubtopicIndex !== subtopicIndex) {
                  return subtopic;
                }

                return {
                  ...subtopic,
                  completed,
                };
              },
            ),
          };
        }),
      };
    });
  };

  const toggleSubtopic = async (topicIndex, subtopicIndex) => {
    const subtopic = roadmap?.roadmap?.[topicIndex]?.subtopics?.[subtopicIndex];

    if (!subtopic) {
      return;
    }

    const key = `${topicIndex}-${subtopicIndex}`;

    if (updatingSubtopics[key]) {
      return;
    }

    const previousCompleted = Boolean(subtopic.completed);

    const nextCompleted = !previousCompleted;

    setProgressError("");

    setUpdatingSubtopics((current) => ({
      ...current,
      [key]: true,
    }));

    // Optimistic UI update.
    setSubtopicCompletion(topicIndex, subtopicIndex, nextCompleted);

    try {
      await updateRoadmapProgress({
        skillIndex: topicIndex,

        subtopicIndex: subtopicIndex,

        completed: nextCompleted,
      });
    } catch (requestError) {
      // Revert if backend update fails.
      setSubtopicCompletion(topicIndex, subtopicIndex, previousCompleted);

      setProgressError(
        getErrorMessage(requestError, "Could not save roadmap progress."),
      );
    } finally {
      setUpdatingSubtopics((current) => {
        const updated = {
          ...current,
        };

        delete updated[key];

        return updated;
      });
    }
  };

  const handleVerifyProject = async (topic) => {
    const repoUrl = githubLinks[topic.skill]?.trim();

    if (!repoUrl) {
      return;
    }

    setVerificationMessages((current) => ({
      ...current,
      [topic.skill]: "",
    }));

    startProcessing({
      title: "Verifying project",

      message:
        "Analyzing your GitHub repository README and technical evidence...",

      progress: 25,
    });

    try {
      await analyzeProject(repoUrl);

      updateProcessing({
        message: "Project analysis saved successfully.",

        progress: 100,
      });

      setVerificationMessages((current) => ({
        ...current,

        [topic.skill]: "Repository analyzed and saved to Projects.",
      }));
    } catch (requestError) {
      setVerificationMessages((current) => ({
        ...current,

        [topic.skill]: getErrorMessage(
          requestError,
          "Project verification failed.",
        ),
      }));
    } finally {
      stopProcessing();
    }
  };

  const arcColors = ["var(--coral)", "var(--lime)", "var(--cyan)"];

  const arcRotations = [-90, 30, 150];

  const arcClasses = ["coral", "lime", "cyan"];

  return (
    <>
      <Navbar />

      <main className="roadmap-shell">
        <header className="roadmap-header">
          <div>
            <p className="eyebrow">Your learning path</p>

            <h1>Roadmap</h1>
          </div>

          <button className="roadmap-filter" type="button">
            In progress
            <ChevronDown size={15} />
          </button>
        </header>

        {loading && <p className="muted">Loading your saved roadmap...</p>}

        {error && (
          <div
            className="roadmap-card"
            style={{
              padding: 20,
            }}
          >
            <p className="muted">{error}</p>

            <Link to="/careers" className="verify-project-button">
              Choose a career
            </Link>
          </div>
        )}

        {roadmap && (
          <div className="roadmap-layout">
            {/* MAIN */}

            <section className="roadmap-main">
              {/* TITLE */}

              <article className="roadmap-title-card roadmap-card">
                <div className="roadmap-title-icon">
                  <Trophy size={21} />
                </div>

                <div className="roadmap-title-copy">
                  <div className="roadmap-title-row">
                    <h2>{roadmap.target_role} Roadmap</h2>
                  </div>

                  <p className="muted">
                    {roadmap.ai_input || "Your personalized learning roadmap."}
                  </p>

                  <div className="roadmap-title-meta">
                    <span>
                      <Check size={14} />
                      {overallProgress}% completed
                    </span>

                    <span>{roadmap.estimated_total_hours ?? 0}h estimated</span>
                  </div>
                </div>
              </article>

              {progressError && (
                <p className="muted" role="alert">
                  {progressError}
                </p>
              )}

              {/* TOPICS */}

              <div className="topic-list">
                {topics.map((topic, topicIndex) => {
                  const progress = topicProgress[topicIndex] ?? 0;

                  const completedCount = (topic.subtopics ?? []).filter(
                    (item) => item.completed,
                  ).length;

                  return (
                    <article
                      className="topic-card roadmap-card"
                      key={`${topic.order ?? topicIndex}-${topic.skill}`}
                    >
                      {/* HEADING */}

                      <div className="topic-heading">
                        <div className="topic-heading-copy">
                          <span className="topic-number">
                            {String(topic.order ?? topicIndex + 1).padStart(
                              2,
                              "0",
                            )}
                          </span>

                          <h2>{topic.skill}</h2>

                          <p className="muted">{topic.goal}</p>
                        </div>

                        <div className="topic-progress-value">{progress}%</div>
                      </div>

                      <div
                        className="roadmap-progress-track"
                        role="progressbar"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-valuenow={progress}
                      >
                        <span
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>

                      {/* SUBTOPICS */}

                      <section className="roadmap-subtopics">
                        <div className="subtopics-header">
                          <p className="eyebrow">Learning modules</p>

                          <span>
                            {completedCount}/{topic.subtopics?.length ?? 0}
                          </span>
                        </div>

                        <div className="subtopic-list">
                          {(topic.subtopics ?? []).map(
                            (subtopic, subtopicIndex) => {
                              const checkboxId = `roadmap-${topicIndex}-${subtopicIndex}`;

                              return (
                                <article
                                  className={`subtopic-card ${
                                    subtopic.completed ? "is-complete" : ""
                                  }`}
                                  key={`${subtopic.order ?? subtopicIndex}-${subtopic.title}`}
                                >
                                  <label
                                    className="subtopic-checkbox"
                                    htmlFor={checkboxId}
                                  >
                                    <input
                                      id={checkboxId}
                                      type="checkbox"
                                      checked={Boolean(subtopic.completed)}
                                      disabled={Boolean(
                                        updatingSubtopics[
                                          `${topicIndex}-${subtopicIndex}`
                                        ],
                                      )}
                                      onChange={() =>
                                        toggleSubtopic(
                                          topicIndex,
                                          subtopicIndex,
                                        )
                                      }
                                    />

                                    <span
                                      className="subtopic-check"
                                      aria-hidden="true"
                                    >
                                      {subtopic.completed && (
                                        <Check size={14} />
                                      )}
                                    </span>
                                  </label>

                                  <div className="subtopic-copy">
                                    <label
                                      className="subtopic-title"
                                      htmlFor={checkboxId}
                                    >
                                      {subtopic.title}
                                    </label>

                                    <p>{subtopic.description}</p>

                                    {subtopic.estimated_hours != null && (
                                      <small>
                                        {subtopic.estimated_hours}h estimated
                                      </small>
                                    )}

                                    <div className="resource-list">
                                      {subtopic.resources?.length ? (
                                        subtopic.resources.map(
                                          (resource, resourceIndex) => (
                                            <a
                                              href={resource.url}
                                              target="_blank"
                                              rel="noreferrer"
                                              key={
                                                resource.url ??
                                                `${resource.title}-${resourceIndex}`
                                              }
                                            >
                                              {resource.type === "video" ? (
                                                <PlayCircle size={13} />
                                              ) : (
                                                <ExternalLink size={13} />
                                              )}

                                              <span>{resource.title}</span>
                                            </a>
                                          ),
                                        )
                                      ) : (
                                        <span className="empty-resource">
                                          No resources available
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </article>
                              );
                            },
                          )}
                        </div>
                      </section>

                      {/* PROJECT */}

                      {topic.project && (
                        <section className="project-card-section">
                          <div className="project-card-header">
                            <div>
                              <p className="eyebrow">Project practice</p>

                              <h3>{topic.project.title}</h3>
                            </div>

                            {topic.project.verification_required && (
                              <span className="verification-tag">
                                <Check size={12} />
                                Verification required
                              </span>
                            )}
                          </div>

                          <p className="project-problem">
                            {topic.project.description}
                          </p>

                          <div className="skill-tags">
                            {(topic.project.skills_verified ?? []).map(
                              (skill) => (
                                <span key={skill}>{skill}</span>
                              ),
                            )}
                          </div>

                          <div className="project-inputs">
                            <label>
                              <span>Project</span>

                              <select value={topic.project.title} disabled>
                                <option>{topic.project.title}</option>
                              </select>
                            </label>

                            <label>
                              <span>GitHub repository</span>

                              <input
                                type="url"
                                placeholder="https://github.com/username/repository"
                                value={githubLinks[topic.skill] ?? ""}
                                onChange={(event) =>
                                  setGithubLinks((current) => ({
                                    ...current,

                                    [topic.skill]: event.target.value,
                                  }))
                                }
                              />
                            </label>

                            <button
                              type="button"
                              className="verify-project-button"
                              disabled={!githubLinks[topic.skill]?.trim()}
                              onClick={() => handleVerifyProject(topic)}
                            >
                              Verify project
                              <ExternalLink size={14} />
                            </button>
                          </div>

                          {verificationMessages[topic.skill] && (
                            <p className="muted">
                              {verificationMessages[topic.skill]}
                            </p>
                          )}
                        </section>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>

            {/* SIDEBAR */}

            <aside className="roadmap-side">
              <section className="roadmap-progress-card roadmap-card">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Roadmap progress</p>

                    <h2>Keep moving</h2>
                  </div>
                </div>

                <div className="roadmap-arc-wrap">
                  <svg
                    viewBox="0 0 140 140"
                    aria-label={`${overallProgress} percent roadmap complete`}
                  >
                    {arcRotations.map((rotation) => (
                      <ArcTrack key={rotation} rotation={rotation} />
                    ))}

                    {topics.slice(0, 3).map((topic, index) => (
                      <ProgressArc
                        key={topic.skill}
                        color={arcColors[index]}
                        completion={topicProgress[index] ?? 0}
                        rotation={arcRotations[index]}
                      />
                    ))}
                  </svg>

                  <div className="arc-center">
                    <strong>
                      {overallProgress}

                      <span>%</span>
                    </strong>

                    <small>complete</small>
                  </div>
                </div>

                <div className="roadmap-stat-list">
                  {topics.slice(0, 3).map((topic, index) => (
                    <div key={topic.skill}>
                      <i className={arcClasses[index]} />

                      <span>{topic.skill}</span>

                      <strong>{topicProgress[index] ?? 0}%</strong>
                    </div>
                  ))}
                </div>
              </section>

              <section className="roadmap-streak-card roadmap-card">
                <div className="streak-icon">
                  <Flame size={20} />
                </div>

                <p className="eyebrow">Learning rhythm</p>

                <p className="muted">
                  Complete modules consistently and submit projects when you are
                  ready to verify your work.
                </p>
              </section>

              <section className="roadmap-explore-card roadmap-card">
                <p className="eyebrow">Find your next path</p>

                <h2>Explore other roadmaps</h2>

                <Link to="/roadmaps" className="verify-project-button">
                  Explore roadmaps
                  <ExternalLink size={14} />
                </Link>
              </section>
            </aside>
          </div>
        )}
      </main>
    </>
  );
};

export default Roadmap;
