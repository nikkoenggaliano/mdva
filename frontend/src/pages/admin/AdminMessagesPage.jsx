import React from 'react'
import axios from 'axios'
import { Card, CardContent, Typography, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Link as MuiLink } from '@mui/material'

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function AdminMessagesPage() {
  const [rows, setRows] = React.useState([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)
  const [openEdit, setOpenEdit] = React.useState(false)
  const [editing, setEditing] = React.useState(null)

  const fetchList = React.useCallback(async () => {
    const p = page + 1
    const { data } = await axios.get(`/api/admin/messages?page=${p}&pageSize=${pageSize}`, { headers: authHeader() })
    setRows(data.data || [])
    setTotal(data.total || 0)
  }, [page, pageSize])

  React.useEffect(() => { fetchList() }, [fetchList])

  const handleChangePage = (_, newPage) => setPage(newPage)
  const handleChangeRowsPerPage = (e) => { setPageSize(parseInt(e.target.value, 10)); setPage(0) }

  const openCreate = () => { setEditing({ from_user_id: '', to_user_id: '', message: '', attachment: null, status: 0 }); setOpenEdit(true) }
  const openUpdate = (row) => { setEditing({ ...row }); setOpenEdit(true) }
  const closeEdit = () => setOpenEdit(false)
  const save = async () => {
    const payload = { from_user_id: Number(editing.from_user_id), to_user_id: Number(editing.to_user_id), message: editing.message, attachment: editing.attachment, status: Number(editing.status) }
    if (editing.id) await axios.put(`/api/admin/messages/${editing.id}`, payload, { headers: authHeader() })
    else await axios.post(`/api/admin/messages`, payload, { headers: authHeader() })
    setOpenEdit(false)
    fetchList()
  }
  const del = async (row) => { if (!window.confirm('Delete message?')) return; await axios.delete(`/api/admin/messages/${row.id}`, { headers: authHeader() }); fetchList() }

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Messages</Typography>
          <Button variant="outlined" onClick={openCreate}>Create</Button>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id} hover>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.from_name} ({r.from_user_id})</TableCell>
                <TableCell>{r.to_name} ({r.to_user_id})</TableCell>
                <TableCell>
                  {(r.message || '').replace(/<[^>]+>/g,'').slice(0,80)} {r.attachment ? <MuiLink href={r.attachment} target="_blank" rel="noreferrer">[file]</MuiLink> : ''}
                </TableCell>
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
          rowsPerPageOptions={[10,25,50,100]}
        />
      </CardContent>

      <Dialog open={openEdit} onClose={closeEdit} fullWidth maxWidth="sm">
        <DialogTitle>{editing?.id ? 'Edit Message' : 'Create Message'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="From User ID" type="number" value={editing?.from_user_id ?? ''} onChange={e => setEditing(s => ({ ...s, from_user_id: e.target.value }))} />
            <TextField label="To User ID" type="number" value={editing?.to_user_id ?? ''} onChange={e => setEditing(s => ({ ...s, to_user_id: e.target.value }))} />
            <TextField label="Message" multiline minRows={3} value={editing?.message || ''} onChange={e => setEditing(s => ({ ...s, message: e.target.value }))} />
            <TextField label="Status" type="number" value={editing?.status ?? 0} onChange={e => setEditing(s => ({ ...s, status: e.target.value }))} />
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


