import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Layers3,
} from "lucide-react";

import { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import Navbar from "../common/Navbar";

import { getExploreRoadmap } from "../api/exploreRoadmap.api";

const ExploreRoadmap = () => {
  const { roadmapId } = useParams();

  const [roadmap, setRoadmap] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadRoadmap = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getExploreRoadmap(roadmapId);

        setRoadmap(data);
      } catch (error) {
        console.error("Failed to load roadmap:", error);

        setError("Could not load this roadmap.");
      } finally {
        setLoading(false);
      }
    };

    loadRoadmap();
  }, [roadmapId]);

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="roadmaps-shell">
          <p className="muted">Loading roadmap...</p>
        </main>
      </>
    );
  }

  if (error || !roadmap) {
    return (
      <>
        <Navbar />

        <main className="roadmaps-shell">
          <Link to="/roadmaps" className="roadmap-back roadmap-error-back">
            <ArrowLeft size={15} />
            Back to roadmaps
          </Link>

          <section className="roadmap-error-panel">
            <p className="eyebrow">Roadmap unavailable</p>
            <h1>{error || "Roadmap not found."}</h1>
            <p className="muted">This learning path may have been removed or is no longer shared.</p>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="roadmaps-shell">
        <Link to="/roadmaps" className="roadmap-back">
          <ArrowLeft size={15} />
          Explore roadmaps
        </Link>

        <section className="explore-roadmap-hero">
          <div className="explore-roadmap-hero-copy">
            <p className="eyebrow">Community roadmap / shared path</p>
            <h1>{roadmap.target_role}</h1>
            <p className="roadmaps-intro">
              {roadmap.ai_input ||
                "Explore this learning path and its recommended resources."}
            </p>
          </div>

          <div className="explore-roadmap-hero-icon" aria-hidden="true">
            <BookOpen size={30} />
          </div>
        </section>

        <section className="explore-roadmap-metrics" aria-label="Roadmap summary">
          <div>
            <Layers3 size={17} />
            <strong>{roadmap.roadmap?.length ?? 0}</strong>
            <span>learning modules</span>
          </div>
          <div>
            <CheckCircle2 size={17} />
            <strong>
              {(roadmap.roadmap ?? []).reduce(
                (total, skill) => total + (skill.subtopics?.length ?? 0),
                0,
              )}
            </strong>
            <span>subtopics to explore</span>
          </div>
          <div>
            <Clock3 size={17} />
            <strong>{roadmap.estimated_total_hours ?? 0}h</strong>
            <span>estimated completion</span>
          </div>
        </section>

        <section className="explore-roadmap-list" aria-label="Learning modules">
          <div className="explore-roadmap-section-heading">
            <div>
              <p className="eyebrow">The path</p>
              <h2>Build your foundation</h2>
            </div>
            <span>{roadmap.roadmap?.length ?? 0} modules</span>
          </div>

          {(roadmap.roadmap ?? []).map((skill, skillIndex) => (
            <article
              key={`${skill.skill}-${skillIndex}`}
              className="explore-roadmap-skill"
            >
              <div className="explore-skill-heading">
                <span className="explore-skill-number">{String(skillIndex + 1).padStart(2, "0")}</span>
                <div>
                  <p className="eyebrow">Learning module</p>
                  <h3>{skill.skill}</h3>
                  {skill.goal && <p>{skill.goal}</p>}
                </div>
                <BookOpen size={19} />
              </div>

              <div className="explore-subtopics">
                {(skill.subtopics ?? []).map((subtopic, subtopicIndex) => (
                  <div
                    key={`${subtopic.title ?? subtopic.name}-${subtopicIndex}`}
                    className="explore-subtopic"
                  >
                    <div className="explore-subtopic-title">
                      <span className="explore-subtopic-number">{subtopicIndex + 1}</span>
                      <strong>{subtopic.title ?? subtopic.name}</strong>
                    </div>

                    <div className="explore-resources">
                      {(subtopic.resources ?? []).map((resource, resourceIndex) => (
                        <a
                          key={`${resource.url}-${resourceIndex}`}
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {resource.title}
                          <ExternalLink size={13} />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
};

export default ExploreRoadmap;
