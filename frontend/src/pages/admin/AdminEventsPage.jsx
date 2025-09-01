import React from 'react'
import axios from 'axios'
import { Card, CardContent, Typography, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, Stack } from '@mui/material'

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function AdminEventsPage() {
  const [rows, setRows] = React.useState([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)
  const [search, setSearch] = React.useState('')

  const [openEdit, setOpenEdit] = React.useState(false)
  const [editing, setEditing] = React.useState(null)

  const fetchList = React.useCallback(async () => {
    const p = page + 1
    const { data } = await axios.get(`/api/admin/events?search=${encodeURIComponent(search)}&page=${p}&pageSize=${pageSize}`, { headers: authHeader() })
    setRows(data.data || [])
    setTotal(data.total || 0)
  }, [page, pageSize, search])

  React.useEffect(() => { fetchList() }, [fetchList])

  const handleChangePage = (_, newPage) => setPage(newPage)
  const handleChangeRowsPerPage = (e) => { setPageSize(parseInt(e.target.value, 10)); setPage(0) }

  const openCreate = () => { setEditing({ title: '', description: '', image: '', start_date: '', end_date: '', status: 0 }); setOpenEdit(true) }
  const openUpdate = (row) => { setEditing({ ...row }); setOpenEdit(true) }
  const closeEdit = () => setOpenEdit(false)

  const save = async () => {
    const payload = { title: editing.title, description: editing.description, image: editing.image, start_date: editing.start_date?.slice(0,10), end_date: editing.end_date?.slice(0,10), status: editing.status }
    if (editing.id) await axios.put(`/api/admin/events/${editing.id}`, payload, { headers: authHeader() })
    else await axios.post(`/api/admin/events`, payload, { headers: authHeader() })
    setOpenEdit(false)
    fetchList()
  }

  const del = async (row) => {
    if (!window.confirm('Delete this event?')) return
    await axios.delete(`/api/admin/events/${row.id}`, { headers: authHeader() })
    fetchList()
  }

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Events</Typography>
          <Stack direction="row" spacing={1}>
            <TextField size="small" placeholder="Search title" value={search} onChange={e => setSearch(e.target.value)} />
            <Button variant="contained" onClick={() => { setPage(0); fetchList() }}>Search</Button>
            <Button variant="outlined" onClick={openCreate}>Create</Button>
          </Stack>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Start</TableCell>
              <TableCell>End</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id} hover>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.title}</TableCell>
                <TableCell>{r.start_date}</TableCell>
                <TableCell>{r.end_date}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" onClick={() => openUpdate(r)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => del(r)}>Delete</Button>
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

      <Dialog open={openEdit} onClose={closeEdit} fullWidth maxWidth="sm">
        <DialogTitle>{editing?.id ? 'Edit Event' : 'Create Event'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" value={editing?.title || ''} onChange={e => setEditing(s => ({ ...s, title: e.target.value }))} />
            <TextField label="Image URL" value={editing?.image || ''} onChange={e => setEditing(s => ({ ...s, image: e.target.value }))} />
            <TextField label="Start" type="date" InputLabelProps={{ shrink: true }} value={(editing?.start_date || '').slice(0,10)} onChange={e => setEditing(s => ({ ...s, start_date: e.target.value }))} />
            <TextField label="End" type="date" InputLabelProps={{ shrink: true }} value={(editing?.end_date || '').slice(0,10)} onChange={e => setEditing(s => ({ ...s, end_date: e.target.value }))} />
            <TextField label="Status" type="number" value={editing?.status ?? 0} onChange={e => setEditing(s => ({ ...s, status: Number(e.target.value) }))} />
            <TextField label="Description" multiline minRows={3} value={editing?.description || ''} onChange={e => setEditing(s => ({ ...s, description: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save</Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}


