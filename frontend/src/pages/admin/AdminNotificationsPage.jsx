import React from 'react'
import axios from 'axios'
import { Card, CardContent, Typography, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Paper } from '@mui/material'

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function AdminNotificationsPage() {
  const [rows, setRows] = React.useState([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)
  const [openEdit, setOpenEdit] = React.useState(false)
  const [editing, setEditing] = React.useState(null)
  const [userQuery, setUserQuery] = React.useState('')
  const [userResults, setUserResults] = React.useState([])
  const [selectedUser, setSelectedUser] = React.useState(null)

  const fetchList = React.useCallback(async () => {
    const p = page + 1
    const { data } = await axios.get(`/api/admin/notifications?page=${p}&pageSize=${pageSize}`, { headers: authHeader() })
    setRows(data.data || [])
    setTotal(data.total || 0)
  }, [page, pageSize])

  React.useEffect(() => { fetchList() }, [fetchList])

  const handleChangePage = (_, newPage) => setPage(newPage)
  const handleChangeRowsPerPage = (e) => { setPageSize(parseInt(e.target.value, 10)); setPage(0) }

  const openCreate = () => { setEditing({ user_id: '', message: '' }); setSelectedUser(null); setUserQuery(''); setUserResults([]); setOpenEdit(true) }
  const openUpdate = (row) => { setEditing({ ...row }); setOpenEdit(true) }
  const closeEdit = () => setOpenEdit(false)
  const save = async () => {
    if (editing.id) {
      const payload = { user_id: Number(editing.user_id), message: editing.message, status: Number(editing.status ?? 0) }
      await axios.put(`/api/admin/notifications/${editing.id}`, payload, { headers: authHeader() })
    } else {
      const uid = selectedUser?.id || Number(editing.user_id)
      if (!uid || !editing.message) return
      const payload = { user_id: uid, message: editing.message }
      await axios.post(`/api/admin/notifications`, payload, { headers: authHeader() })
    }
    setOpenEdit(false)
    fetchList()
  }
  const del = async (row) => { if (!window.confirm('Delete notification?')) return; await axios.delete(`/api/admin/notifications/${row.id}`, { headers: authHeader() }); fetchList() }

  const searchUsers = async () => {
    const { data } = await axios.get(`/api/admin/users?search=${encodeURIComponent(userQuery)}&page=1&pageSize=10`, { headers: authHeader() })
    setUserResults(data?.data || [])
  }

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Notifications</Typography>
          <Button variant="outlined" onClick={openCreate}>Create</Button>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>User ID</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id} hover>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.user_id}</TableCell>
                <TableCell>{r.message}</TableCell>
                <TableCell>{Number(r.status) === 1 ? 'readed' : 'delivered'}</TableCell>
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
        <DialogTitle>{editing?.id ? 'Edit Notification' : 'Create Notification'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {!editing?.id && (
              <>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField label="Search user by name/email" value={userQuery} onChange={e => setUserQuery(e.target.value)} fullWidth />
                  <Button variant="contained" onClick={searchUsers}>Search</Button>
                </Stack>
                {userResults.length > 0 && (
                  <Paper variant="outlined" sx={{ maxHeight: 220, overflow: 'auto' }}>
                    {userResults.map(u => (
                      <Button key={u.id} fullWidth onClick={() => { setSelectedUser(u); setEditing(s => ({ ...s, user_id: u.id })); setUserResults([]) }} sx={{ justifyContent: 'flex-start' }}>
                        {u.full_name} — {u.email}
                      </Button>
                    ))}
                  </Paper>
                )}
                {selectedUser && (
                  <Typography variant="body2">Selected: {selectedUser.full_name} ({selectedUser.email})</Typography>
                )}
              </>
            )}
            {editing?.id && (
              <TextField label="User ID" type="number" value={editing?.user_id ?? ''} onChange={e => setEditing(s => ({ ...s, user_id: e.target.value }))} />
            )}
            <TextField label="Message" multiline minRows={2} value={editing?.message || ''} onChange={e => setEditing(s => ({ ...s, message: e.target.value }))} />
            {editing?.id && (
              <TextField label="Status (0 delivered, 1 readed)" type="number" value={editing?.status ?? 0} onChange={e => setEditing(s => ({ ...s, status: e.target.value }))} />
            )}
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


