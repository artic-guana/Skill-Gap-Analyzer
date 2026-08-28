import { useState } from "react"

import {
  ArrowRight,
  FileUp,
  LockKeyhole,
  UserRound,
} from "lucide-react"

import {
  Link,
  useNavigate,
} from "react-router-dom"

import {
  registerUser,
} from "../api/auth.api"

import Navbar from "../common/Navbar"

import useOnboardingStore
  from "../store/useOnboardingStore"


const getErrorMessage = (
  error,
  fallback
) => {
  const detail =
    error.response?.data?.detail

  if (typeof detail === "string") {
    return detail
  }

  if (Array.isArray(detail)) {
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


const Register = () => {
  const navigate =
    useNavigate()


  const {
    fullName,
    academicLevel,
    branch,
    yearOfStudy,
    studyHoursPerDay,
    githubUsername,
    codeforcesHandle,
    resume,

    setField,
    setResume,
  } = useOnboardingStore()


  // Keep authentication credentials
  // outside the onboarding store.
  const [
    email,
    setEmail,
  ] = useState("")

  const [
    password,
    setPassword,
  ] = useState("")

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("")

  const [
    error,
    setError,
  ] = useState("")

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)


  const handleSubmit = async (
    event
  ) => {
    event.preventDefault()

    setError("")


    if (
      !fullName.trim()
      || !email.trim()
      || !academicLevel
      || !branch.trim()
      || !yearOfStudy
      || !studyHoursPerDay
      || !githubUsername.trim()
    ) {
      setError(
        "Please complete all required fields."
      )

      return
    }


    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      )

      return
    }


    if (
      password.length < 8
    ) {
      setError(
        "Password must be at least 8 characters."
      )

      return
    }


    const hours =
      Number(
        studyHoursPerDay
      )

    if (
      Number.isNaN(hours)
      || hours <= 0
      || hours > 24
    ) {
      setError(
        "Study hours must be between 0 and 24."
      )

      return
    }


    const year =
      Number(
        yearOfStudy
      )

    if (
      Number.isNaN(year)
      || year < 1
      || year > 4
    ) {
      setError(
        "Please select a valid year of study."
      )

      return
    }


    if (
      resume &&
      resume.type !==
      "application/pdf"
    ) {
      setError(
        "Resume must be a PDF file."
      )

      return
    }


    setIsSubmitting(true)


    try {

      // Only create the authentication account.
      await registerUser(
        email.trim(),
        password
      )


      /*
        Onboarding data remains in Zustand.

        After login:
        1. Authenticate user
        2. GET /users/me
        3. POST /onboarding
        4. Save generated data to MongoDB
      */

      navigate(
        "/login",
        {
          replace: true,

          state: {
            registered: true,
            email:
              email.trim(),
          },
        }
      )

    } catch (
    submitError
    ) {

      setError(
        getErrorMessage(
          submitError,
          "Registration failed. Please try again."
        )
      )

    } finally {

      setIsSubmitting(
        false
      )
    }
  }


  return (
    <>
      <Navbar />


      <main className="register-shell">

        <section className="register-panel">

          {/* HEADER */}

          <div className="register-heading">

            <div className="register-icon">

              <UserRound
                size={22}
              />

            </div>


            <div>

              <p className="eyebrow">
                Start your path
              </p>

              <h1>
                Create your{" "}
                <span>
                  profile.
                </span>
              </h1>

              <p>
                Give SkillPath the
                context it needs to
                build a useful learning
                direction.
              </p>

            </div>

          </div>


          <form
            className="register-form"
            onSubmit={
              handleSubmit
            }
          >

            {/* ACCOUNT DETAILS */}

            <fieldset>

              <legend>
                Account details
              </legend>


              <div className="register-field-grid">

                <label>

                  <span>
                    Full name
                  </span>

                  <input
                    name="fullName"

                    value={
                      fullName
                    }

                    onChange={
                      (event) =>
                        setField(
                          "fullName",
                          event.target.value
                        )
                    }

                    placeholder=
                    "Alex Smith"

                    autoComplete=
                    "name"

                    required
                  />

                </label>


                <label>

                  <span>
                    Email address
                  </span>

                  <input
                    name="email"

                    type="email"

                    value={
                      email
                    }

                    onChange={
                      (event) =>
                        setEmail(
                          event.target.value
                        )
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
                      password
                    }

                    onChange={
                      (event) =>
                        setPassword(
                          event.target.value
                        )
                    }

                    placeholder=
                    "Create a password"

                    autoComplete=
                    "new-password"

                    minLength={8}

                    required
                  />

                </label>


                <label>

                  <span>
                    Confirm password
                  </span>

                  <input
                    name="confirmPassword"

                    type="password"

                    value={
                      confirmPassword
                    }

                    onChange={
                      (event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                    }

                    placeholder=
                    "Repeat your password"

                    autoComplete=
                    "new-password"

                    minLength={8}

                    required
                  />

                </label>

              </div>

            </fieldset>


            {/* ACADEMIC BACKGROUND */}

            <fieldset>

              <legend>
                Academic background
              </legend>


              <div className="register-field-grid">

                <label>

                  <span>
                    Academic level
                  </span>

                  <select
                    name="academicLevel"

                    value={
                      academicLevel
                    }

                    onChange={
                      (event) =>
                        setField(
                          "academicLevel",
                          event.target.value
                        )
                    }

                    required
                  >

                    <option value="">
                      Select level
                    </option>

                    <option value="Diploma">
                      Diploma
                    </option>

                    <option value="B.Tech">
                      B.Tech / B.E.
                    </option>

                    <option value="B.Sc">
                      B.Sc
                    </option>

                    <option value="M.Tech">
                      M.Tech / M.E.
                    </option>

                    <option value="M.Sc">
                      M.Sc
                    </option>

                    <option value="PhD">
                      PhD
                    </option>

                  </select>

                </label>


                <label>

                  <span>
                    Branch /
                    specialization
                  </span>

                  <input
                    name="branch"

                    value={
                      branch
                    }

                    onChange={
                      (event) =>
                        setField(
                          "branch",
                          event.target.value
                        )
                    }

                    placeholder=
                    "ECE, CSE, Mechanical..."

                    required
                  />

                </label>


                <label>

                  <span>
                    Year of study
                  </span>

                  <select
                    name="yearOfStudy"

                    value={
                      yearOfStudy
                    }

                    onChange={
                      (event) =>
                        setField(
                          "yearOfStudy",
                          event.target.value
                        )
                    }

                    required
                  >

                    <option value="">
                      Select year
                    </option>

                    <option value="1">
                      Year 1
                    </option>

                    <option value="2">
                      Year 2
                    </option>

                    <option value="3">
                      Year 3
                    </option>

                    <option value="4">
                      Year 4
                    </option>

                  </select>

                </label>


                <label>

                  <span>
                    Study hours per day
                  </span>

                  <input
                    name="studyHoursPerDay"

                    type="number"

                    min="0.5"

                    max="24"

                    step="0.5"

                    value={
                      studyHoursPerDay
                    }

                    onChange={
                      (event) =>
                        setField(
                          "studyHoursPerDay",
                          event.target.value
                        )
                    }

                    placeholder="2"

                    required
                  />

                </label>

              </div>

            </fieldset>


            {/* DEVELOPER PROFILES */}

            <fieldset>

              <legend>
                Developer profiles
              </legend>


              <div className="register-field-grid">

                <label>

                  <span>
                    GitHub username
                  </span>

                  <input
                    name="githubUsername"

                    value={
                      githubUsername
                    }

                    onChange={
                      (event) =>
                        setField(
                          "githubUsername",
                          event.target.value
                        )
                    }

                    placeholder=
                    "artic-guana"

                    autoComplete="off"

                    required
                  />

                </label>


                <label>

                  <span>
                    Codeforces handle
                  </span>

                  <input
                    name="codeforcesHandle"

                    value={
                      codeforcesHandle
                    }

                    onChange={
                      (event) =>
                        setField(
                          "codeforcesHandle",
                          event.target.value
                        )
                    }

                    placeholder=
                    "Artic_Guana"

                    autoComplete="off"
                  />

                </label>

              </div>

            </fieldset>


            {/* RESUME */}

            <label className="resume-upload">

              <span>
                Resume{" "}
              </span>


              <div>

                <FileUp
                  size={18}
                />


                <strong>

                  {
                    resume
                      ? resume.name
                      : "Upload your resume"
                  }

                </strong>


                <small>

                  {
                    resume
                      ? `${Math.ceil(
                        resume.size /
                        1024
                      )} KB selected`

                      : "PDF only"
                  }

                </small>

              </div>


              <input
                type="file"

                accept=
                ".pdf,application/pdf"

                onChange={
                  (event) =>
                    setResume(
                      event.target
                        .files?.[0]
                      || null
                    )
                }
              />

            </label>


            {/* ERROR */}

            {error && (

              <p
                className="register-error"
                role="alert"
              >
                {error}
              </p>

            )}


            {/* SUBMIT */}

            <button
              className="register-submit"

              type="submit"

              disabled={
                isSubmitting
              }
            >

              {
                isSubmitting
                  ? "Creating account..."
                  : "Create account"
              }


              {!isSubmitting && (

                <ArrowRight
                  size={16}
                />

              )}

            </button>


            <p className="register-security">

              <LockKeyhole
                size={13}
              />

              Your details stay private
              and are used to personalize
              your learning path.

            </p>


            <p className="register-login-link">

              Already have an
              account?{" "}

              <Link to="/login">
                Sign in
              </Link>

            </p>

          </form>

        </section>

      </main>
    </>
  )
}


export default Register