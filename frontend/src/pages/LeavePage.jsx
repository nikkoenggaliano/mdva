'use client'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { TextField, Button, Card, CardContent, Typography, Stack, Snackbar, Alert, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material'

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function LeavePage() {
  const navigate = useNavigate()
  const [list, setList] = React.useState([])
  const [balance, setBalance] = React.useState(0)
  const [start, setStart] = React.useState('')
  const [end, setEnd] = React.useState('')
  const [reason, setReason] = React.useState('')
  const [consume, setConsume] = React.useState(0)
  const [snack, setSnack] = React.useState({ open: false, message: '', severity: 'success' })

  const fetchList = React.useCallback(() => {
    axios.get('/api/leave', { headers: authHeader() }).then(({ data }) => { setList(data.list || []); setBalance(data.balance || 0) }).catch(() => {})
  }, [])

  React.useEffect(() => { fetchList() }, [fetchList])

  const isWeekend = (dateStr) => {
    const d = new Date(dateStr)
    const day = d.getDay()
    return day === 0 || day === 6
  }

  React.useEffect(() => {
    if (start && end) {
      const s = new Date(start)
      const e = new Date(end)
      if (e < s) { setConsume(0); return }
      let c = 0
      const cursor = new Date(s)
      while (cursor <= e) {
        if (!isWeekend(cursor.toISOString().slice(0,10))) c += 1
        cursor.setDate(cursor.getDate() + 1)
      }
      setConsume(c)
    } else {
      setConsume(0)
    }
  }, [start, end])

  const submit = async () => {
    try {
      await axios.post('/api/leave', { start_date: start, end_date: end, reason, consume_balance: Number(consume) }, { headers: authHeader() })
      setSnack({ open: true, message: 'Leave request submitted', severity: 'success' })
      setStart(''); setEnd(''); setReason(''); setConsume(0);
      fetchList()
    } catch {
      setSnack({ open: true, message: 'Failed to submit leave request', severity: 'error' })
    }
  }

  return (
    <div>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Leave Requests</Typography>
        <Typography variant="body2">Leave Balance: <b>{balance}</b></Typography>
      </Stack>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <TextField label="Start" type="date" InputLabelProps={{ shrink: true }} value={start} onChange={e => setStart(e.target.value)} />
            <TextField label="End" type="date" InputLabelProps={{ shrink: true }} value={end} onChange={e => setEnd(e.target.value)} />
            <TextField label="Reason" multiline minRows={2} value={reason} onChange={e => setReason(e.target.value)} />
            <div className="flex items-center gap-2">
              <TextField label="Consume" type="number" value={consume} InputProps={{ readOnly: true }} />
              <Button variant="contained" onClick={submit} disabled={consume <= 0 || balance < consume}>Submit</Button>
            </div>
          </div>
          {balance < consume && <Typography color="error" variant="caption">Insufficient balance for selected dates.</Typography>}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell>Consume</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{item.start_date}</TableCell>
                  <TableCell>{item.end_date}</TableCell>
                  <TableCell>{item.consume_balance}</TableCell>
                  <TableCell>
                    {
                      item.status === 0 ? 'Requested' :
                      item.status === 1 ? 'Approved' :
                      item.status === 2 ? 'Rejected' :
                      item.status === 3 ? 'Canceled' : ''
                    }
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => navigate(`/leave/${item.id}`)}>Detail</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </div>
  )
}


