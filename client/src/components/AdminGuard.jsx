import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

const AdminGuard = () => {
  const { adminToken } = useContext(AppContext)
  if (!adminToken) return <Navigate to='/admin/login' replace />
  return <Outlet />
}

export default AdminGuard
