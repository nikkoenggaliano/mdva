import React from 'react'
import axios from 'axios'
import { Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert, TablePagination } from '@mui/material'

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function ApprovalLeavesView({ basePath }) {
  const [rows, setRows] = React.useState([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)
  const [q, setQ] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState(null)
  const [status, setStatus] = React.useState(0)
  const [comment, setComment] = React.useState('')
  const [snack, setSnack] = React.useState({ open: false, message: '', severity: 'success' })

  const fetchList = React.useCallback(async () => {
    const p = page + 1
    const { data } = await axios.get(`${basePath}/approval-leaves?q=${encodeURIComponent(q)}&page=${p}&pageSize=${pageSize}`, { headers: authHeader() })
    setRows(data.data || [])
    setTotal(data.total || 0)
  }, [basePath, q, page, pageSize])

  React.useEffect(() => { fetchList() }, [fetchList])

  const handleChangePage = (_, newPage) => setPage(newPage)
  const handleChangeRowsPerPage = (e) => { setPageSize(parseInt(e.target.value, 10)); setPage(0) }

  const openDetail = async (row) => {
    const { data } = await axios.get(`${basePath}/approval-leaves/${row.id}`, { headers: authHeader() })
    setSelected(data)
    setStatus(data.status)
    setComment(data.comment || '')
    setOpen(true)
  }

  const saveStatus = async () => {
    try {
      await axios.put(`${basePath}/approval-leaves/${selected.id}/status`, { status, comment }, { headers: authHeader() })
      setSnack({ open: true, message: 'Status updated', severity: 'success' })
      setOpen(false)
      fetchList()
    } catch (e) {
      setSnack({ open: true, message: e?.response?.data?.message || 'Failed to update', severity: 'error' })
    }
  }

  const requireComment = Number(status) === 2

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Approval Leaves</Typography>
          <TextField size="small" placeholder="Search name or email" value={q} onChange={e => { setQ(e.target.value); setPage(0) }} />
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Start</TableCell>
              <TableCell>End</TableCell>
              <TableCell>Consume</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, idx) => (
              <TableRow key={r.id} hover>
                <TableCell>{page * pageSize + idx + 1}</TableCell>
                <TableCell>{r.user_full_name}</TableCell>
                <TableCell>{r.user_email}</TableCell>
                <TableCell>{r.start_date}</TableCell>
                <TableCell>{r.end_date}</TableCell>
                <TableCell>{r.consume_balance}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => openDetail(r)}>Detail</Button>
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

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Leave Detail</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Stack spacing={2}>
              <Typography variant="body2">Name: {selected.user_full_name} ({selected.user_email})</Typography>
              <Typography variant="body2">Start: {selected.start_date}</Typography>
              <Typography variant="body2">End: {selected.end_date}</Typography>
              <Typography variant="body2">Consume: {selected.consume_balance}</Typography>
              <Typography variant="body2">Reason:</Typography>
              <Typography variant="body1">{selected.reason}</Typography>
              <Stack direction="row" spacing={2}>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select labelId="status-label" label="Status" value={status} onChange={e => setStatus(e.target.value)}>
                    <MenuItem value={0}>Requested</MenuItem>
                    <MenuItem value={1}>Accepted</MenuItem>
                    <MenuItem value={2}>Rejected</MenuItem>
                    <MenuItem value={3}>Canceled</MenuItem>
                  </Select>
                </FormControl>
                <TextField label="Comment" value={comment} onChange={e => setComment(e.target.value)} error={requireComment && !comment} helperText={requireComment && !comment ? 'Required for rejection' : ''} fullWidth />
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
          <Button variant="contained" onClick={saveStatus} disabled={requireComment && !comment}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </Card>
  )
}


