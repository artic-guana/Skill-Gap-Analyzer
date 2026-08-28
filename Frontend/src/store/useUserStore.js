import { create } from "zustand"


const useUserStore = create((set) => ({
  user: null,

  isAuthenticated: false,

  isAuthLoading: true,


  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
      isAuthLoading: false,
    }),


  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
      isAuthLoading: false,
    }),


  setAuthLoading: (value) =>
    set({
      isAuthLoading: value,
    }),
}))


export default useUserStore