import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  Activity,
  AlertTriangle,
  Check,
  CodeXml,
  Database,
  ExternalLink,
  Gauge,
  Trophy,
} from "lucide-react"

import Navbar from "../common/Navbar"

import {
  getSkills,
} from "../api/skills.api"

import {
  getSkillGap,
} from "../api/skillGap.api"


const getErrorMessage = (
  error,
  fallback
) => {
  const detail =
    error.response?.data?.detail

  if (
    typeof detail === "string"
  ) {
    return detail
  }

  if (
    Array.isArray(detail)
  ) {
    return detail
      .map(
        (item) =>
          item?.msg ||
          String(item)
      )
      .join(", ")
  }

  return fallback
}


const clampScore = (
  value
) => {
  const score =
    Number(value ?? 0)

  if (
    Number.isNaN(score)
  ) {
    return 0
  }

  return Math.max(
    0,
    Math.min(
      score,
      100
    )
  )
}


const SkillCard = ({
  skill,
}) => {
  const score =
    clampScore(
      skill.score
    )

  return (
    <article className="skills-assessment-card">

      <div className="skills-card-header">

        <div>

          <h2>
            {
              skill.skill ||
              "Unknown skill"
            }
          </h2>

          <span className="skills-level">
            {
              skill.level ||
              "Unrated"
            }
          </span>

        </div>


        <strong>

          {score}

          <small>
            /100
          </small>

        </strong>

      </div>


      <div
        className="skills-progress-track"

        aria-label={
          `${skill.skill || "Skill"} score: ${score} out of 100`
        }
      >

        <span
          style={{
            width:
              `${score}%`,
          }}
        />

      </div>


      <div className="skills-evidence">

        <p className="eyebrow">
          Evidence found
        </p>


        {(
          skill.evidence ??
          []
        ).length > 0
          ? (
            skill.evidence
            ?? []
          ).map(
            (
              item,
              index
            ) => (

              <span
                key={
                  `${item}-${index}`
                }
              >

                <Check
                  size={13}
                />

                {item}

              </span>

            )
          )

          : (

            <span>
              No evidence text
              available.
            </span>

          )
        }

      </div>


      {skill.ai_input && (

        <p className="skills-ai-input">
          {skill.ai_input}
        </p>

      )}

    </article>
  )
}


const MissingSkillCard = ({
  skill,
}) => {
  const requiredScore =
    clampScore(
      skill.required_score
    )

  const gap =
    Number(
      skill.gap ??
      skill.required_score ??
      0
    )

  const importance =
    skill.importance ||
    "medium"

  return (
    <article className="missing-skill-card">

      <div className="missing-skill-header">

        <div className="missing-skill-icon">

          <AlertTriangle
            size={19}
          />

        </div>


        <div>

          <h3>
            {
              skill.skill ||
              "Unknown skill"
            }
          </h3>

          <span
            className={
              `missing-skill-importance ${importance}`
            }
          >
            {importance} priority
          </span>

        </div>


        <strong>

          {gap}

          <small>
            pt gap
          </small>

        </strong>

      </div>


      <div className="missing-skill-progress-label">

        <span>
          Required proficiency
        </span>

        <strong>
          {requiredScore}/100
        </strong>

      </div>


      <div
        className="missing-skill-progress"

        aria-label={
          `${skill.skill || "Skill"} required score: ${requiredScore} out of 100`
        }
      >

        <span
          style={{
            width:
              `${requiredScore}%`,
          }}
        />

      </div>


      <p>
        Build this skill to
        strengthen your readiness
        for the selected target
        career.
      </p>

    </article>
  )
}


const Skills = () => {
  const [
    skillsData,
    setSkillsData,
  ] = useState(null)

  const [
    gapData,
    setGapData,
  ] = useState(null)

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState("")


  useEffect(() => {
    const load =
      async () => {

        try {
          setError("")

          const [
            skillsResult,
            gapResult,
          ] =
            await Promise.allSettled([
              getSkills(),
              getSkillGap(),
            ])


          if (
            skillsResult.status ===
            "rejected"
          ) {
            throw (
              skillsResult.reason
            )
          }


          setSkillsData(
            skillsResult.value
          )


          if (
            gapResult.status ===
            "fulfilled"
          ) {
            setGapData(
              gapResult.value
            )
          }

        } catch (
          requestError
        ) {

          setError(
            getErrorMessage(
              requestError,
              "Could not load your saved skill profile."
            )
          )

        } finally {

          setLoading(false)
        }
      }


    load()

  }, [])


  const cp =
    skillsData
      ?.competitive_programming
    ?? null


  const topicEntries =
    useMemo(
      () =>
        Object.entries(
          cp?.topics ??
          {}
        ),

      [cp]
    )


  const maxTopicScore =
    useMemo(
      () =>
        Math.max(
          1,
          ...topicEntries.map(
            (
              [, score]
            ) =>
              Number(score) ||
              0
          )
        ),

      [topicEntries]
    )


  const assessment =
    skillsData?.assessment ??
    []


  const missingSkills =
    gapData?.missing_skills ??
    []


  const dsaScore =
    clampScore(
      cp?.dsa_score
    )


  return (
    <>
      <Navbar />


      <main className="skills-shell">

        {/* HEADER */}

        <header className="skills-header">

          <div>

            <p className="eyebrow">
              Skill assessment
            </p>

            <h1>
              Your skills,{" "}
              <span>
                measured.
              </span>
            </h1>

            <p className="skills-intro">
              This page reads your
              saved onboarding analysis
              from MongoDB instead of
              rerunning the AI.
            </p>

          </div>


          {skillsData && (

            <section
              className="profile-links-card"

              aria-label=
                "Developer profiles"
            >

              <div className="skills-section-heading">

                <div>

                  <p className="eyebrow">
                    Connected profiles
                  </p>

                  <h2>
                    Developer profiles
                  </h2>

                </div>


                <ExternalLink
                  size={18}
                />

              </div>


              <div className="profile-link-list">

                {skillsData
                  .github_username && (

                  <a
                    className="profile-link-item"

                    href={
                      `https://github.com/${encodeURIComponent(
                        skillsData
                          .github_username
                      )}`
                    }

                    target="_blank"

                    rel="noreferrer"
                  >

                    <span className="profile-link-icon github-profile">

                      <CodeXml
                        size={20}
                      />

                    </span>


                    <span>

                      <strong>
                        GitHub
                      </strong>

                      <small>
                        {
                          skillsData
                            .github_username
                        }
                      </small>

                    </span>


                    <ExternalLink
                      size={15}
                    />

                  </a>

                )}


                {skillsData
                  .codeforces_handle && (

                  <a
                    className="profile-link-item"

                    href={
                      `https://codeforces.com/profile/${encodeURIComponent(
                        skillsData
                          .codeforces_handle
                      )}`
                    }

                    target="_blank"

                    rel="noreferrer"
                  >

                    <span className="profile-link-icon codeforces-profile">

                      <Trophy
                        size={20}
                      />

                    </span>


                    <span>

                      <strong>
                        Codeforces
                      </strong>

                      <small>
                        {
                          skillsData
                            .codeforces_handle
                        }
                      </small>

                    </span>


                    <ExternalLink
                      size={15}
                    />

                  </a>

                )}

              </div>

            </section>

          )}

        </header>


        {/* STATUS */}

        {loading && (

          <p className="skills-intro">
            Loading saved skill
            analysis...
          </p>

        )}


        {error && (

          <p
            className="skills-intro"
            role="alert"
          >
            {error}
          </p>

        )}


        {skillsData && (
          <>

            {/* OVERVIEW */}

            <section
              className="skills-overview"

              aria-label=
                "Assessment overview"
            >

              <div>

                <Database
                  size={17}
                />

                <span>
                  Repositories analyzed
                </span>

                <strong>
                  {
                    skillsData
                      .repositories_analyzed
                    ?? 0
                  }
                </strong>

              </div>


              <div>

                <Gauge
                  size={17}
                />

                <span>
                  Skills assessed
                </span>

                <strong>
                  {assessment.length}
                </strong>

              </div>


              <div>

                <CodeXml
                  size={17}
                />

                <span>
                  Problems solved
                </span>

                <strong>
                  {
                    cp?.total_solved
                    ?? 0
                  }
                </strong>

              </div>

            </section>


            {/* MAIN CONTENT */}

            <div className="skills-content-layout">

              {/* SKILL CARDS */}

              <section>

                <div className="skills-section-heading">

                  <div>

                    <p className="eyebrow">
                      Project analysis
                    </p>

                    <h2>
                      Core skills
                    </h2>

                  </div>


                  <span>
                    Score / 100
                  </span>

                </div>


                {assessment.length
                  ? (

                    <div className="skills-card-grid">

                      {assessment.map(
                        (
                          skill,
                          index
                        ) => (

                          <SkillCard

                            key={
                              `${skill.skill ?? "skill"}-${index}`
                            }

                            skill={
                              skill
                            }
                          />

                        )
                      )}

                    </div>

                  )

                  : (

                    <p className="skills-intro">
                      No assessed skills
                      were found in your
                      saved profile.
                    </p>

                  )
                }

              </section>


              {/* COMPETITIVE PROGRAMMING */}

              <aside className="competitive-card">

                <div className="skills-section-heading">

                  <div>

                    <p className="eyebrow">
                      Competitive
                      programming
                    </p>

                    <h2>
                      Problem-solving
                      profile
                    </h2>

                  </div>


                  <Activity
                    size={18}
                  />

                </div>


                {cp
                  ? (
                    <>

                      <div className="dsa-score">

                        <div>

                          <strong>
                            {dsaScore}
                          </strong>

                          <span>
                            /100 DSA score
                          </span>

                        </div>


                        <div className="dsa-progress-track">

                          <span
                            style={{
                              width:
                                `${dsaScore}%`,
                            }}
                          />

                        </div>

                      </div>


                      <div className="topic-heading">

                        <span>
                          Topics solved
                        </span>

                        <span>
                          Peak:{" "}
                          {
                            maxTopicScore
                          }
                        </span>

                      </div>


                      {topicEntries.length
                        ? (

                          <div className="topic-bars">

                            {topicEntries.map(
                              (
                                [
                                  topic,
                                  rawScore,
                                ]
                              ) => {

                                const score =
                                  Number(
                                    rawScore
                                  ) ||
                                  0

                                const width =
                                  (
                                    score /
                                    maxTopicScore
                                  ) * 100


                                return (

                                  <div
                                    className="topic-bar-row"

                                    key={
                                      topic
                                    }
                                  >

                                    <span>
                                      {topic}
                                    </span>


                                    <div>

                                      <i
                                        style={{
                                          width:
                                            `${width}%`,
                                        }}
                                      />

                                    </div>


                                    <strong>
                                      {score}
                                    </strong>

                                  </div>

                                )
                              }
                            )}

                          </div>

                        )

                        : (

                          <p className="skills-ai-input">
                            No solved-topic
                            data is available
                            yet.
                          </p>

                        )
                      }

                    </>

                  )

                  : (

                    <p className="skills-ai-input">
                      No Codeforces profile
                      was provided during
                      onboarding.
                    </p>

                  )
                }

              </aside>

            </div>


            {/* MISSING SKILLS */}

            <section
              className="missing-skills-section"

              aria-label=
                "Missing skills"
            >

              <div className="skills-section-heading">

                <div>

                  <p className="eyebrow">
                    Target-role gaps
                  </p>

                  <h2>
                    Missing skills
                  </h2>

                </div>


                <span>

                  {
                    missingSkills.length
                      ? `${missingSkills.length} to develop`
                      : "Choose a career first"
                  }

                </span>

              </div>


              {missingSkills.length
                ? (

                  <div className="missing-skills-grid">

                    {missingSkills.map(
                      (
                        skill,
                        index
                      ) => (

                        <MissingSkillCard

                          key={
                            `${skill.skill ?? "missing-skill"}-${index}`
                          }

                          skill={
                            skill
                          }
                        />

                      )
                    )}

                  </div>

                )

                : (

                  <p className="skills-intro">
                    Skill gaps appear here
                    after you select a
                    career and run the
                    target-role analysis.
                  </p>

                )
              }

            </section>

          </>
        )}

      </main>
    </>
  )
}


export default Skills