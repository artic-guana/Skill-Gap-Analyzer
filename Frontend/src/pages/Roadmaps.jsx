import {
  ArrowRight,
  BrainCircuit,
  Clock3,
  Code2,
  Database,
  Sparkles,
} from "lucide-react";

import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import Navbar from "../common/Navbar";

import { getExploreRoadmaps } from "../api/exploreRoadmap.api";

const getRoadmapVisual = (targetRole = "", index = 0) => {
  const role = targetRole.toLowerCase();

  if (role.includes("machine learning") || role.includes("ai")) {
    return {
      icon: BrainCircuit,
      accent: "cyan",
    };
  }

  if (role.includes("data") || role.includes("analyst")) {
    return {
      icon: Database,
      accent: "lime",
    };
  }

  if (
    role.includes("frontend") ||
    role.includes("software") ||
    role.includes("developer")
  ) {
    return {
      icon: Code2,
      accent: "coral",
    };
  }

  const fallback = [
    {
      icon: Code2,
      accent: "coral",
    },
    {
      icon: Database,
      accent: "lime",
    },
    {
      icon: BrainCircuit,
      accent: "cyan",
    },
  ];

  return fallback[index % fallback.length];
};

const Roadmaps = () => {
  const [roadmaps, setRoadmaps] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadRoadmaps = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getExploreRoadmaps();

        setRoadmaps(data?.roadmaps ?? []);
      } catch (error) {
        console.error("Failed to load roadmaps:", error);

        setError("Could not load roadmaps.");
      } finally {
        setLoading(false);
      }
    };

    loadRoadmaps();
  }, []);

  return (
    <>
      <Navbar />

      <main className="roadmaps-shell">
        <header className="roadmaps-header">
          <div>
            <p className="eyebrow">Choose your next direction</p>

            <h1>Explore roadmaps</h1>

            <p className="roadmaps-intro">
              Explore learning paths generated for other students and discover a
              roadmap that matches your next career direction.
            </p>
          </div>

          <div className="roadmaps-header-mark" aria-hidden="true">
            <Sparkles size={19} />
          </div>
        </header>

        {loading && (
          <div className="roadmaps-state">
            <p className="muted">Loading roadmaps...</p>
          </div>
        )}

        {error && (
          <div className="roadmaps-state">
            <p className="muted" role="alert">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && roadmaps.length === 0 && (
          <div className="roadmaps-state">
            <p className="muted">No roadmaps available yet.</p>
          </div>
        )}

        {!loading && !error && roadmaps.length > 0 && (
          <section className="roadmaps-grid" aria-label="Available roadmaps">
            {roadmaps.map((roadmap, index) => {
              const visual = getRoadmapVisual(roadmap.target_role, index);

              const Icon = visual.icon;

              return (
                <article
                  className={`roadmaps-option roadmap-accent-${visual.accent}`}
                  key={roadmap.id}
                >
                  <div className="roadmaps-option-topline">
                    <span className="roadmaps-option-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <Icon size={21} />
                  </div>

                  <h2>{roadmap.target_role}</h2>

                  <div className="roadmaps-detail">
                    <p className="eyebrow">Roadmap</p>

                    <p>
                      {roadmap.total_skills ?? 0} skills
                      {" • "}
                      {roadmap.total_subtopics ?? 0} subtopics
                    </p>
                  </div>

                  <div className="roadmaps-option-footer">
                    <span>
                      <Clock3 size={15} />
                      {roadmap.estimated_total_hours ?? 0}h estimated
                    </span>

                    <Link
                      to={`/roadmaps/explore/${roadmap.id}`}
                      className="roadmaps-button"
                    >
                      View path
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </>
  );
};

export default Roadmaps;
