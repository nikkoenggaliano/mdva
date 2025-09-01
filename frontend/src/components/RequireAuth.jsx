import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

export default function RequireAuth({ children }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const location = useLocation()
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}


