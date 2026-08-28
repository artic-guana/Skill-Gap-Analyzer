import {
  Navigate,
  Outlet,
} from "react-router-dom"

import useUserStore
  from "../store/useUserStore"


const ProtectedRoute = () => {
  const {
    isAuthenticated,
    isAuthLoading,
  } = useUserStore()


  if (isAuthLoading) {
    return (
      <div className="route-loader">
        Checking session...
      </div>
    )
  }


  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }


  return <Outlet />
}


export default ProtectedRoute