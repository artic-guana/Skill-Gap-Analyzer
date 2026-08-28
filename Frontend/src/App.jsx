import {
  useEffect,
} from "react"

import {
  Routes,
  Route,
} from "react-router-dom"


import Home from "./pages/Home"
import Register from "./pages/Register"
import Login from "./pages/Login"

import Dashboard from "./pages/Dashboard"
import Skills from "./pages/Skills"
import Career from "./pages/Career"
import Roadmap from "./pages/Roadmap"
import Projects from "./pages/Projects"


import ProtectedRoute
  from "./components/ProtectedRoute"

import ProcessingLoader
  from "./components/ProcessingLoader"


import {
  getCurrentUser,
} from "./api/auth.api"

import useUserStore
  from "./store/useUserStore"


const App = () => {
  const {
    setUser,
    clearUser,
    setAuthLoading,
  } = useUserStore()


  useEffect(() => {
    const restoreSession =
      async () => {

        setAuthLoading(true)

        try {
          const user =
            await getCurrentUser()

          setUser(user)

        } catch {
          clearUser()
        }
      }


    restoreSession()

  }, [
    setUser,
    clearUser,
    setAuthLoading,
  ])


  return (
    <>
      <ProcessingLoader />


      <Routes>

        {/* Public */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />


        {/* Protected */}

        <Route
          element={
            <ProtectedRoute />
          }
        >

          <Route
            path="/dashboard"
            element={
              <Dashboard />
            }
          />

          <Route
            path="/skills"
            element={
              <Skills />
            }
          />

          <Route
            path="/careers"
            element={
              <Career />
            }
          />

          <Route
            path="/roadmap"
            element={
              <Roadmap />
            }
          />

          <Route
            path="/projects"
            element={
              <Projects />
            }
          />

        </Route>


        {/* Fallback */}

        <Route
          path="*"
          element={
            <Home />
          }
        />

      </Routes>
    </>
  )
}


export default App