import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Card, CardContent, Typography, Stack, Button, Snackbar, Alert } from '@mui/material'

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function LeaveDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = React.useState(null)
  const [snack, setSnack] = React.useState({ open: false, message: '', severity: 'success' })

  const fetchDetail = React.useCallback(async () => {
    const { data } = await axios.get(`/api/leave/${id}`, { headers: authHeader() })
    setData(data)
  }, [id])

  React.useEffect(() => { fetchDetail() }, [fetchDetail])

  const cancelReq = async () => {
    try {
      await axios.put(`/api/leave/${id}/cancel`, {}, { headers: authHeader() })
      setSnack({ open: true, message: 'Leave request canceled', severity: 'success' })
      fetchDetail()
    } catch {
      setSnack({ open: true, message: 'Failed to cancel', severity: 'error' })
    }
  }

  const isPending = Number(data?.status) === 0

  return (
    <div>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">Leave Detail</Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
      </Stack>
      <Card>
        <CardContent>
          {data && (
            <Stack spacing={1}>
              <Typography variant="body2">Start: {data.start_date}</Typography>
              <Typography variant="body2">End: {data.end_date}</Typography>
              <Typography variant="body2">Status: {data.status}</Typography>
              <Typography variant="body2">Consume: {data.consume_balance}</Typography>
              <Typography variant="body2">Reason:</Typography>
              <Typography variant="body1">{data.reason}</Typography>
              {data.comment && (
                <>
                  <Typography variant="body2">Notes:</Typography>
                  <Typography variant="body1">{data.comment}</Typography>
                </>
              )}
              {isPending && (
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button color="error" variant="contained" onClick={cancelReq}>Cancel</Button>
                </Stack>
              )}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </div>
  )
}


