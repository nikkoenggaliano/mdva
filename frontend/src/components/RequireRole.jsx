import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getRole } from '../utils/auth'

export default function RequireRole({ role, children }) {
  const location = useLocation()
  const currentRole = getRole()
  if (currentRole !== role) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}


