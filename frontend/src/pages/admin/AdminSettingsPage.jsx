import React from 'react'
import axios from 'axios'
import { Card, CardContent, Typography, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, Stack, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function AdminSettingsPage() {
  const [rows, setRows] = React.useState([])
  const [openEdit, setOpenEdit] = React.useState(false)
  const [editing, setEditing] = React.useState(null)

  const fetchList = React.useCallback(async () => {
    const { data } = await axios.get(`/api/admin/settings`, { headers: authHeader() })
    setRows(data || [])
  }, [])

  React.useEffect(() => { fetchList() }, [fetchList])

  const openCreate = () => { setEditing({ key: '', value: '' }); setOpenEdit(true) }
  const openUpdate = (row) => { setEditing({ ...row }); setOpenEdit(true) }
  const closeEdit = () => setOpenEdit(false)
  const save = async () => {
    if (editing.id) await axios.put(`/api/admin/settings/${editing.id}`, { key: editing.key, value: editing.value }, { headers: authHeader() })
    else await axios.post(`/api/admin/settings`, { key: editing.key, value: editing.value }, { headers: authHeader() })
    setOpenEdit(false)
    fetchList()
  }
  const del = async (row) => { if (!window.confirm('Delete setting?')) return; await axios.delete(`/api/admin/settings/${row.id}`, { headers: authHeader() }); fetchList() }

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Settings</Typography>
          <Button variant="outlined" onClick={openCreate}>Create</Button>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Key</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id} hover>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.key}</TableCell>
                <TableCell>{r.value}</TableCell>
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
      </CardContent>

      <Dialog open={openEdit} onClose={closeEdit} fullWidth maxWidth="sm">
        <DialogTitle>{editing?.id ? 'Edit Setting' : 'Create Setting'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Key" value={editing?.key || ''} onChange={e => setEditing(s => ({ ...s, key: e.target.value }))} />
            <TextField label="Value" value={editing?.value || ''} onChange={e => setEditing(s => ({ ...s, value: e.target.value }))} />
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


