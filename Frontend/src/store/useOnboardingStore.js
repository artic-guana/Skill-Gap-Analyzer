import { create } from "zustand"


const initialState = {
  fullName: "",
  academicLevel: "",
  branch: "",
  yearOfStudy: "",
  studyHoursPerDay: "",

  githubUsername: "",
  codeforcesHandle: "",

  resume: null,
}


const useOnboardingStore =
  create((set, get) => ({
    ...initialState,


    setField: (
      field,
      value
    ) => {
      set({
        [field]: value,
      })
    },


    setResume: (file) => {
      set({
        resume: file,
      })
    },


    hasOnboardingData: () => {
      const state = get()

      return Boolean(
        state.fullName?.trim()
        && state.academicLevel
        && state.branch?.trim()
        && state.yearOfStudy
        && state.studyHoursPerDay
        && state.githubUsername?.trim()
      )
    },


    getFormData: () => {
      const state = get()

      const formData =
        new FormData()

      formData.append(
        "full_name",
        state.fullName
      )

      formData.append(
        "academic_level",
        state.academicLevel
      )

      formData.append(
        "branch",
        state.branch
      )

      formData.append(
        "year_of_study",
        state.yearOfStudy
      )

      formData.append(
        "study_hours_per_day",
        state.studyHoursPerDay
      )

      formData.append(
        "github_username",
        state.githubUsername
      )

      if (
        state.codeforcesHandle
          ?.trim()
      ) {
        formData.append(
          "codeforces_handle",
          state.codeforcesHandle
        )
      }

      if (state.resume) {
        formData.append(
          "resume",
          state.resume
        )
      }

      return formData
    },


    resetOnboarding: () => {
      set({
        ...initialState,
      })
    },
  }))


export default useOnboardingStore