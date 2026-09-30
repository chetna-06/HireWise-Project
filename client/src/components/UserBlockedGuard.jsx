import React, { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

// Redirects blocked seekers back to /blocked if they try to open
// job-seeker pages (apply, applications). Server still enforces 403.
const UserBlockedGuard = () => {
  const { userBlocked } = useContext(AppContext)
  if (userBlocked) return <Navigate to='/blocked' replace />
  return <Outlet />
}

export default UserBlockedGuard
