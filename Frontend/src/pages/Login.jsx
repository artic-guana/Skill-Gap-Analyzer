import { useState } from "react"

import {
  ArrowRight,
  KeyRound,
  UserRound,
} from "lucide-react"

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom"

import {
  getCurrentUser,
  loginUser,
} from "../api/auth.api"

import {
  submitOnboarding,
} from "../api/onboarding.api"

import Navbar from "../common/Navbar"

import useOnboardingStore from "../store/useOnboardingStore"
import useProcessingStore from "../store/useProcessingStore"
import useUserStore from "../store/useUserStore"


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


const Login = () => {
  const navigate =
    useNavigate()

  const location =
    useLocation()


  const setUser =
    useUserStore(
      (state) =>
        state.setUser
    )


  const {
    fullName,
    academicLevel,
    branch,
    yearOfStudy,
    studyHoursPerDay,
    githubUsername,

    getFormData,
    resetOnboarding,
  } = useOnboardingStore()


  const {
    startProcessing,
    updateProcessing,
    stopProcessing,
  } = useProcessingStore()


  const [
    form,
    setForm,
  ] = useState({
    email:
      location.state?.email ||
      "",

    password: "",
  })


  const [
    error,
    setError,
  ] = useState("")


  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)


  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target

    setForm(
      (current) => ({
        ...current,
        [name]: value,
      })
    )
  }


  const hasPendingOnboarding =
    Boolean(
      fullName?.trim() &&
      academicLevel &&
      branch?.trim() &&
      yearOfStudy &&
      studyHoursPerDay &&
      githubUsername?.trim()
    )


  const handleSubmit = async (
    event
  ) => {
    event.preventDefault()

    setError("")
    setIsSubmitting(true)

    try {

      // -------------------------
      // 1. LOGIN
      // -------------------------

      await loginUser(
        form.email,
        form.password
      )


      // -------------------------
      // 2. FETCH CURRENT USER
      // -------------------------

      const currentUser =
        await getCurrentUser()

      setUser(
        currentUser
      )


      // -------------------------
      // 3. ONBOARDING
      // -------------------------

      if (
        hasPendingOnboarding
      ) {

        startProcessing({
          title:
            "Personalizing SkillPath",

          message:
            "Analyzing your resume and developer profiles...",

          progress: 15,
        })


        updateProcessing({
          message:
            "Reading GitHub projects and your coding activity...",

          progress: 30,
        })


        const formData =
          getFormData()


        await submitOnboarding(
          formData
        )


        updateProcessing({
          message:
            "Gauging your technical skills and competitive programming profile...",

          progress: 65,
        })


        updateProcessing({
          message:
            "Generating career recommendations from your academic profile...",

          progress: 85,
        })


        updateProcessing({
          message:
            "Your personalized profile is ready.",

          progress: 100,
        })


        resetOnboarding()
      }


      // -------------------------
      // 4. NAVIGATE
      // -------------------------

      navigate(
        "/dashboard",
        {
          replace: true,
        }
      )

    } catch (
      submitError
    ) {

      setError(
        getErrorMessage(
          submitError,
          "Login failed. Check your details and try again."
        )
      )

    } finally {

      stopProcessing()

      setIsSubmitting(
        false
      )
    }
  }


  return (
    <>
      <Navbar />


      <main className="login-shell">

        <section className="login-panel">

          {/* HEADER */}

          <div className="login-heading">

            <div className="login-icon">

              <UserRound
                size={22}
              />

            </div>


            <div>

              <p className="eyebrow">
                Welcome back
              </p>

              <h1>
                Continue your{" "}
                <span>
                  path.
                </span>
              </h1>

              <p>
                Pick up where you left off
                and keep building momentum.
              </p>

            </div>

          </div>


          {/* REGISTER SUCCESS */}

          {location.state
            ?.registered && (

            <p
              className="login-security"
              role="status"
            >
              Account created.
              Sign in once to finish
              your profile analysis.
            </p>

          )}


          {/* FORM */}

          <form
            className="login-form"
            onSubmit={
              handleSubmit
            }
          >

            <label>

              <span>
                Email address
              </span>

              <input
                name="email"
                type="email"

                value={
                  form.email
                }

                onChange={
                  handleChange
                }

                placeholder=
                  "alex@example.com"

                autoComplete=
                  "email"

                required
              />

            </label>


            <label>

              <span>
                Password
              </span>

              <input
                name="password"
                type="password"

                value={
                  form.password
                }

                onChange={
                  handleChange
                }

                placeholder=
                  "Your password"

                autoComplete=
                  "current-password"

                required
              />

            </label>


            {/* ERROR */}

            {error && (

              <p
                className="login-error"
                role="alert"
              >
                {error}
              </p>

            )}


            {/* SUBMIT */}

            <button
              className="login-submit"
              type="submit"

              disabled={
                isSubmitting
              }
            >

              {
                isSubmitting
                  ? "Signing in..."
                  : "Sign in"
              }


              {!isSubmitting && (

                <ArrowRight
                  size={16}
                />

              )}

            </button>


            <p className="login-security">

              <KeyRound
                size={13}
              />

              Secure access to your
              personalized workspace.

            </p>

          </form>


          <p className="login-register-prompt">

            New to SkillPath?{" "}

            <Link to="/register">
              Create your profile
            </Link>

          </p>

        </section>

      </main>
    </>
  )
}


export default Login