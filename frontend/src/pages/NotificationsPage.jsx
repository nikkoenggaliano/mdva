import React from 'react'
import axios from 'axios'
import { Card, CardContent, Typography } from '@mui/material'

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function NotificationsPage() {
  const [list, setList] = React.useState([])

  React.useEffect(() => {
    axios.get('/api/notifications', { headers: authHeader() }).then(({ data }) => setList(data)).catch(() => {})
  }, [])

  return (
    <div>
      <Typography variant="h6" sx={{ mb: 2 }}>Notifications</Typography>
      <div className="space-y-2">
        {list.map(n => (
          <Card key={n.id}>
            <CardContent>
              <Typography fontWeight={600}>{n.message}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>Status: {n.status}</Typography>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


