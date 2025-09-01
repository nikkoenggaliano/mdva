import React from 'react'
import axios from 'axios'
import { Card, CardContent, Typography, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Stack, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function AdminLeaveRequestsPage() {
  const [rows, setRows] = React.useState([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)
  const [rejectOpen, setRejectOpen] = React.useState(false)
  const [rejecting, setRejecting] = React.useState(null)
  const [rejectNotes, setRejectNotes] = React.useState('')

  const fetchList = React.useCallback(async () => {
    const p = page + 1
    const { data } = await axios.get(`/api/admin/leave-requests?page=${p}&pageSize=${pageSize}`, { headers: authHeader() })
    setRows(data.data || [])
    setTotal(data.total || 0)
  }, [page, pageSize])

  React.useEffect(() => { fetchList() }, [fetchList])

  const handleChangePage = (_, newPage) => setPage(newPage)
  const handleChangeRowsPerPage = (e) => { setPageSize(parseInt(e.target.value, 10)); setPage(0) }

  const approve = async (r) => { await axios.put(`/api/admin/leave-requests/${r.id}/approve`, {}, { headers: authHeader() }); fetchList() }
  const openReject = (r) => { setRejecting(r); setRejectNotes(''); setRejectOpen(true) }
  const doReject = async () => { await axios.put(`/api/admin/leave-requests/${rejecting.id}/reject`, { comment: rejectNotes }, { headers: authHeader() }); setRejectOpen(false); fetchList() }

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Leave Requests</Typography>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Start</TableCell>
              <TableCell>End</TableCell>
              <TableCell>Consume</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id} hover>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.user_full_name}</TableCell>
                <TableCell>{r.user_email}</TableCell>
                <TableCell>{r.start_date}</TableCell>
                <TableCell>{r.end_date}</TableCell>
                <TableCell>{r.consume_balance}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" onClick={() => approve(r)}>Approve</Button>
                    <Button size="small" color="error" onClick={() => openReject(r)}>Reject</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </CardContent>

      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Reject Leave Request</DialogTitle>
        <DialogContent dividers>
          <TextField label="Notes" fullWidth multiline minRows={3} value={rejectNotes} onChange={e => setRejectNotes(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={doReject}>Reject</Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}


