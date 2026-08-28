import {
  useEffect,
  useState,
} from "react"

import {ActivityCalendar}
  from "react-activity-calendar"

import {
  Flame,
} from "lucide-react"

import {
  getActivityHeatmap,
} from "../api/activity.api"


const ActivityHeatmap = () => {
  const [
    heatmap,
    setHeatmap,
  ] = useState([])

  const [
    totalActivity,
    setTotalActivity,
  ] = useState(0)

  const [
    activeDays,
    setActiveDays,
  ] = useState(0)

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState("")


  useEffect(() => {
    const loadHeatmap =
      async () => {

        try {

          setLoading(true)

          const response =
            await getActivityHeatmap()

          setHeatmap(
            response?.data ?? []
          )

          setTotalActivity(
            response
              ?.total_activity
            ?? 0
          )

          setActiveDays(
            response
              ?.active_days
            ?? 0
          )

        } catch (error) {

          console.error(
            "Failed to load heatmap:",
            error
          )

          setError(
            "Unable to load activity."
          )

        } finally {

          setLoading(false)
        }
      }


    loadHeatmap()

  }, [])


  if (loading) {
    return (
      <section className="dashboard-card activity-card">

        <p className="muted">
          Loading activity...
        </p>

      </section>
    )
  }


  return (
    <section className="dashboard-card activity-card">

      <div className="section-heading">

        <div>

          <p className="eyebrow">
            Learning activity
          </p>

          <h2>
            Your consistency
          </h2>

        </div>


        <div className="heatmap-flame">

          <Flame
            size={19}
          />

        </div>

      </div>


      {error ? (

        <p className="muted">
          {error}
        </p>

      ) : (

        <>
          <div className="heatmap-summary">

            <div>

              <strong>
                {totalActivity}
              </strong>

              <span>
                activities
              </span>

            </div>


            <div>

              <strong>
                {activeDays}
              </strong>

              <span>
                active days
              </span>

            </div>

          </div>


          <div className="heatmap-container">

            <ActivityCalendar
              data={heatmap}

              blockSize={10}

              blockMargin={3}

              fontSize={11}

              showWeekdayLabels

              maxLevel={4}

              labels={{
                totalCount:
                  "{{count}} learning activities",
              }}

              theme={{
                light: [
                  "#222629",
                  "#31563e",
                  "#477a52",
                  "#61a467",
                  "#81cf79",
                ],

                dark: [
                  "#222629",
                  "#31563e",
                  "#477a52",
                  "#61a467",
                  "#81cf79",
                ],
              }}

              renderBlock={(
                block,
                activity
              ) => {

                return (
                  <g>

                    {block}

                    <title>
                      {
                        `${activity.date}: ${activity.count} activities`
                      }
                    </title>

                  </g>
                )
              }}
            />

          </div>


          <div className="heatmap-legend">

            <span>
              Less
            </span>

            <i className="heat-level-0" />
            <i className="heat-level-1" />
            <i className="heat-level-2" />
            <i className="heat-level-3" />
            <i className="heat-level-4" />

            <span>
              More
            </span>

          </div>
        </>

      )}

    </section>
  )
}


export default ActivityHeatmap