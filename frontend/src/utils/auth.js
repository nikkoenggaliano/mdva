export function getTokenPayload() {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    const parts = token.split('.')
    if (parts.length < 2) return null
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function getRole() {
  const payload = getTokenPayload()
  if (payload && payload.role) return payload.role
  try {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null
    return JSON.parse(userStr).role
  } catch {
    return null
  }
}


