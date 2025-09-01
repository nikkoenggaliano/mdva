import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Card, CardContent, Typography, Stack, Divider, Button, Link as MuiLink } from '@mui/material'

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function MessageDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = React.useState(null)
  const user = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  }, [])

  const fetchDetail = React.useCallback(async () => {
    const { data } = await axios.get(`/api/messages/${id}`, { headers: authHeader() })
    setData(data)
    if (user && data.to_user_id === user.id && data.status !== 1) {
      try { await axios.put(`/api/messages/${id}/read`, {}, { headers: authHeader() }) } catch {}
    }
  }, [id])

  React.useEffect(() => { fetchDetail() }, [fetchDetail])

  return (
    <div>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">Message Detail</Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
      </Stack>
      <Card>
        <CardContent>
          {data && (
            <Stack spacing={1}>
              <Typography variant="body2">From: {data.from_name} ({data.from_email})</Typography>
              <Typography variant="body2">To: {data.to_name} ({data.to_email})</Typography>
              <Typography variant="body2">Created: {new Date(data.created_at).toLocaleString()}</Typography>
              <Typography variant="body2">Status: {data.status === 1 ? 'Read' : 'Delivered'}</Typography>
              {data.attachment && (
                <Typography variant="body2">Attachment: <MuiLink href={`${import.meta.env.VITE_API_BASE}${data.attachment}`} target="_blank" rel="noreferrer">Download</MuiLink></Typography>
              )}
              <Divider sx={{ my: 1 }} />
              <div dangerouslySetInnerHTML={{ __html: data.message }} />
            </Stack>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


