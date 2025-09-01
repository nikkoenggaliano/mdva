import React from 'react'
import axios from 'axios'
import { Card, CardContent, Typography, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Stack } from '@mui/material'

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function AdminUsersPage() {
  const [rows, setRows] = React.useState([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)
  const [search, setSearch] = React.useState('')

  const [openEdit, setOpenEdit] = React.useState(false)
  const [editing, setEditing] = React.useState(null)

  const fetchList = React.useCallback(async () => {
    const p = page + 1
    const { data } = await axios.get(`/api/admin/users?search=${encodeURIComponent(search)}&page=${p}&pageSize=${pageSize}`, { headers: authHeader() })
    setRows(data.data || [])
    setTotal(data.total || 0)
  }, [page, pageSize, search])

  React.useEffect(() => { fetchList() }, [fetchList])

  const handleChangePage = (_, newPage) => setPage(newPage)
  const handleChangeRowsPerPage = (e) => { setPageSize(parseInt(e.target.value, 10)); setPage(0) }

  const openCreate = () => { setEditing({ full_name: '', email: '', password: '', role: 'user', status: 1 }); setOpenEdit(true) }
  const openUpdate = (row) => { setEditing({ ...row, password: '' }); setOpenEdit(true) }
  const closeEdit = () => setOpenEdit(false)

  const saveUser = async () => {
    const payload = { full_name: editing.full_name, email: editing.email, password: editing.password, role: editing.role, status: editing.status }
    if (editing.id) {
      await axios.put(`/api/admin/users/${editing.id}`, payload, { headers: authHeader() })
    } else {
      await axios.post(`/api/admin/users`, payload, { headers: authHeader() })
    }
    setOpenEdit(false)
    fetchList()
  }

  const deleteUser = async (row) => {
    if (!window.confirm('Delete this user?')) return
    await axios.delete(`/api/admin/users/${row.id}`, { headers: authHeader() })
    fetchList()
  }

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Users</Typography>
          <Stack direction="row" spacing={1}>
            <TextField size="small" placeholder="Search name/email" value={search} onChange={e => setSearch(e.target.value)} />
            <Button variant="contained" onClick={() => { setPage(0); fetchList() }}>Search</Button>
            <Button variant="outlined" onClick={openCreate}>Create</Button>
          </Stack>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id} hover>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.full_name}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.role}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" onClick={() => openUpdate(r)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => deleteUser(r)}>Delete</Button>
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
        <DialogTitle>{editing?.id ? 'Edit User' : 'Create User'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Full Name" value={editing?.full_name || ''} onChange={e => setEditing(s => ({ ...s, full_name: e.target.value }))} />
            <TextField label="Email" value={editing?.email || ''} onChange={e => setEditing(s => ({ ...s, email: e.target.value }))} />
            <TextField label="Password" type="password" value={editing?.password || ''} onChange={e => setEditing(s => ({ ...s, password: e.target.value }))} helperText={editing?.id ? 'Leave blank to keep current password' : ''} />
            <TextField label="Role" select value={editing?.role || 'user'} onChange={e => setEditing(s => ({ ...s, role: e.target.value }))}>
              <MenuItem value="admin">admin</MenuItem>
              <MenuItem value="hrd">hrd</MenuItem>
              <MenuItem value="user">user</MenuItem>
            </TextField>
            <TextField label="Status" select value={editing?.status ?? 1} onChange={e => setEditing(s => ({ ...s, status: Number(e.target.value) }))}>
              <MenuItem value={0}>0: inactive</MenuItem>
              <MenuItem value={1}>1: active</MenuItem>
              <MenuItem value={2}>2: suspended</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit}>Cancel</Button>
          <Button variant="contained" onClick={saveUser}>Save</Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}


