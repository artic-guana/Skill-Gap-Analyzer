import { useEffect, useMemo, useState } from "react";

import ActivityHeatmap from "../components/ActivityHeatmap"

import {
  ArrowUpRight,
  Check,
  CodeXml,
  ExternalLink,
  Flame,
  Pencil,
  Trophy,
  UserRound,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import Navbar from "../common/Navbar";

import { getProfile } from "../api/profile.api";

import { getSkills } from "../api/skills.api";

import { getCareerRecommendations } from "../api/career.api";

import { getSkillGap } from "../api/skillGap.api";

import { getRoadmap } from "../api/roadmap.api";

import useUserStore from "../store/useUserStore";

const clampScore = (value) => {
  const score = Number(value ?? 0);

  if (Number.isNaN(score)) {
    return 0;
  }

  return Math.max(0, Math.min(score, 100));
};

const Dashboard = () => {
  const navigate = useNavigate();

  const user = useUserStore((state) => state.user);

  const [profile, setProfile] = useState(null);

  const [skills, setSkills] = useState(null);

  const [career, setCareer] = useState(null);

  const [gap, setGap] = useState(null);

  const [roadmap, setRoadmap] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const results = await Promise.allSettled([
          getProfile(),
          getSkills(),
          getCareerRecommendations(),
          getSkillGap(),
          getRoadmap(),
        ]);

        if (results[0].status === "fulfilled") {
          setProfile(results[0].value);
        }

        if (results[1].status === "fulfilled") {
          setSkills(results[1].value);
        }

        if (results[2].status === "fulfilled") {
          setCareer(results[2].value);
        }

        if (results[3].status === "fulfilled") {
          setGap(results[3].value);
        }

        if (results[4].status === "fulfilled") {
          setRoadmap(results[4].value);
        }

        const coreFailed =
          results[0].status === "rejected" && results[1].status === "rejected";

        if (coreFailed) {
          setError("Could not load your saved profile data.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const recommendedRole = useMemo(() => {
    const roles = career?.roles ?? career?.Roles ?? [];

    const recommended = roles.find((role) => role.recommended);

    return (
      recommended?.["Job Role"] ?? recommended?.name ?? "Choose a target career"
    );
  }, [career]);

  const assessment = skills?.assessment ?? [];

  const averageSkillScore = useMemo(() => {
    if (!assessment.length) {
      return 0;
    }

    const total = assessment.reduce(
      (sum, item) => sum + clampScore(item.score),

      0,
    );

    return Math.round(total / assessment.length);
  }, [assessment]);

  const roadmapTopics = roadmap?.roadmap ?? [];

  const roadmapStats = useMemo(() => {
    const subtopics = roadmapTopics.flatMap((topic) => topic.subtopics ?? []);

    const total = subtopics.length;

    const completed = subtopics.filter((item) => item.completed).length;

    const progress = total ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      progress,
    };
  }, [roadmapTopics]);

  const githubUsername =
    profile?.github_username ?? skills?.github_username ?? "";

  const codeforcesHandle =
    profile?.codeforces_handle ?? skills?.codeforces_handle ?? "";

  const displayName =
    profile?.full_name ?? user?.email?.split("@")[0] ?? "Student";

  const readinessScore = clampScore(gap?.readiness_score);

  return (
    <>
      <Navbar />

      <main className="dashboard-shell">
        {loading && <p className="muted">Loading your saved workspace...</p>}

        {error && (
          <p className="muted" role="alert">
            {error}
          </p>
        )}

        <div className="dashboard-grid">
          {/* SIDEBAR */}

          <aside className="dashboard-sidebar">
            {/* PROFILE */}

            <section className="profile-card dashboard-card">
              <div className="profile-topline">
                <span className="status-dot" />
                Online
              </div>

              <div className="profile-identity">
                <div className="avatar">
                  <UserRound size={28} />
                </div>

                <h2>{displayName}</h2>
              </div>

              <div className="profile-meta">
                <span>Profile</span>

                <strong>{profile ? "Ready" : "Pending"}</strong>
              </div>

              <div className="xp-track">
                <span
                  style={{
                    width: profile ? "100%" : "20%",
                  }}
                />
              </div>

              <button
                type="button"
                className="outline-button edit-profile-button"
                onClick={() => navigate("/settings")}
              >
                <Pencil size={14} />
                Edit profile
              </button>
            </section>

            {/* PROFILE LINKS */}

            <section className="links-card dashboard-card">
              <div className="section-heading">
                <h3>Find me online</h3>

                <ArrowUpRight size={16} />
              </div>

              {githubUsername && (
                <a
                  href={`https://github.com/${encodeURIComponent(
                    githubUsername,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="social-link"
                >
                  <span className="social-icon github">
                    <CodeXml size={17} />
                  </span>

                  <span>
                    <strong>GitHub</strong>

                    <small>
                      github.com/
                      {githubUsername}
                    </small>
                  </span>

                  <ExternalLink size={14} />
                </a>
              )}

              {codeforcesHandle && (
                <a
                  href={`https://codeforces.com/profile/${encodeURIComponent(
                    codeforcesHandle,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="social-link"
                >
                  <span className="social-icon codeforces">
                    <Trophy size={17} />
                  </span>

                  <span>
                    <strong>Codeforces</strong>

                    <small>
                      codeforces.com/profile/
                      {codeforcesHandle}
                    </small>
                  </span>

                  <ExternalLink size={14} />
                </a>
              )}

              {!githubUsername && !codeforcesHandle && (
                <p className="muted">No developer profiles connected yet.</p>
              )}
            </section>

            {/* ACADEMIC CONTEXT */}

            <section className="quest-card dashboard-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Academic profile</p>

                  <h3>Your context</h3>
                </div>
              </div>

              <div className="quest-list">
                <div className="quest">
                  <div className="quest-line">
                    <span className="quest-mark coral" />

                    <div>
                      <strong>{profile?.academic_level || "Not set"}</strong>

                      <small>{profile?.branch || "Branch not set"}</small>
                    </div>
                  </div>
                </div>

                <div className="quest">
                  <div className="quest-line">
                    <span className="quest-mark lime" />

                    <div>
                      <strong>
                        {profile?.year_of_study
                          ? `Year ${profile.year_of_study}`
                          : "Year not set"}
                      </strong>

                      <small>
                        {profile?.study_hours_per_day
                          ? `${profile.study_hours_per_day} study hours/day`
                          : "Study time not set"}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </aside>

          {/* CONTENT */}

          <section className="dashboard-content">
            <div className="overview-row">
              {/* SKILLS */}

              <section className="progress-card dashboard-card">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Skill progression</p>

                    <h2>Current profile</h2>
                  </div>

                  <ArrowUpRight size={15} />
                </div>

                <div className="progress-body">
                  <div className="arc-wrap">
                    <svg
                      viewBox="0 0 140 140"
                      aria-label={`Average skill score ${averageSkillScore} percent`}
                    >
                      <circle
                        cx="70"
                        cy="70"
                        r="57"
                        fill="none"
                        stroke="var(--line)"
                        strokeWidth="9"
                      />

                      <circle
                        cx="70"
                        cy="70"
                        r="57"
                        fill="none"
                        stroke="var(--lime)"
                        strokeWidth="9"
                        pathLength="100"
                        strokeDasharray={`${averageSkillScore} ${100 - averageSkillScore}`}
                        transform="rotate(-90 70 70)"
                      />
                    </svg>

                    <div className="arc-center">
                      <strong>
                        {averageSkillScore}

                        <span>%</span>
                      </strong>

                      <small>average</small>
                    </div>
                  </div>

                  <div className="legend">
                    {assessment.slice(0, 3).map((skill, index) => (
                      <div key={skill.skill}>
                        <i className={["coral", "lime", "cyan"][index]} />

                        <span>{skill.skill}</span>

                        <strong>{clampScore(skill.score)}%</strong>
                      </div>
                    ))}

                    {!assessment.length && (
                      <span className="muted">
                        No skill assessment available yet.
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* ROADMAP PROGRESS */}

              <section className="streak-card dashboard-card">
                <div className="streak-icon">
                  <Flame size={20} />
                </div>

                <p className="eyebrow">Roadmap progress</p>

                <strong className="streak-number">
                  {roadmapStats.progress}

                  <small className="ml-2">%</small>
                </strong>

                <p className="muted">
                  {roadmap
                    ? `${roadmapStats.completed} of ${roadmapStats.total} learning modules completed`
                    : "Generate a roadmap after choosing your target role."}
                </p>
              </section>
            </div>

            <ActivityHeatmap />

            {/* CAREER */}

            <section
              className="dashboard-card"
              style={{
                padding: 22,
                marginTop: 18,
              }}
            >
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Career direction</p>

                  <h2>{gap?.target_role || recommendedRole}</h2>
                </div>

                <Trophy size={18} />
              </div>

              <p className="muted">
                {career?.ai_input ??
                  career?.["AI Input"] ??
                  "Your career recommendation will appear after onboarding."}
              </p>

              {gap && (
                <div
                  className="skills-overview"
                  style={{
                    marginTop: 18,
                  }}
                >
                  <div>
                    <Check size={17} />

                    <span>Readiness</span>

                    <strong>{readinessScore}%</strong>
                  </div>

                  <div>
                    <CodeXml size={17} />

                    <span>Matched</span>

                    <strong>{gap.summary?.matched ?? 0}</strong>
                  </div>

                  <div>
                    <ArrowUpRight size={17} />

                    <span>Missing</span>

                    <strong>{gap.summary?.missing ?? 0}</strong>
                  </div>
                </div>
              )}
            </section>

            {/* ROADMAP */}

            <section
              className="dashboard-card"
              style={{
                padding: 22,
                marginTop: 18,
              }}
            >
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Learning path</p>

                  <h2>
                    {roadmap?.target_role
                      ? `${roadmap.target_role} roadmap`
                      : "No roadmap yet"}
                  </h2>
                </div>

                <ArrowUpRight size={16} />
              </div>

              {roadmapTopics.length ? (
                <div className="roadmap-stat-list mt-3">
                  {roadmapTopics.slice(0, 4).map((topic, index) => (
                    <div key={`${topic.skill}-${index}`}>
                      <span>{topic.skill}</span>

                      <strong className="ml-15">
                        {topic.estimated_hours ?? 0}h
                      </strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted">
                  Choose a career to generate your personalized roadmap.
                </p>
              )}
            </section>
          </section>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
