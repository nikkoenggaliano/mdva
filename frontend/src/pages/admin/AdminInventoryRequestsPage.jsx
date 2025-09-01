import React from 'react'
import axios from 'axios'
import { Card, CardContent, Typography, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Stack, Snackbar, Alert } from '@mui/material'

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function AdminInventoryRequestsPage() {
  const [rows, setRows] = React.useState([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)
  const [snack, setSnack] = React.useState({ open: false, message: '', severity: 'success' })

  const fetchList = React.useCallback(async () => {
    const p = page + 1
    const { data } = await axios.get(`/api/admin/inventory-requests?page=${p}&pageSize=${pageSize}`, { headers: authHeader() })
    setRows(data.data || [])
    setTotal(data.total || 0)
  }, [page, pageSize])

  React.useEffect(() => { fetchList() }, [fetchList])

  const handleChangePage = (_, newPage) => setPage(newPage)
  const handleChangeRowsPerPage = (e) => { setPageSize(parseInt(e.target.value, 10)); setPage(0) }

  const approve = async (r) => {
    try {
      await axios.put(`/api/admin/inventory-requests/${r.id}/approve`, {}, { headers: authHeader() })
      setSnack({ open: true, message: 'Approved', severity: 'success' })
      fetchList()
    } catch (e) {
      setSnack({ open: true, message: e?.response?.data?.message || 'Failed to approve', severity: 'error' })
    }
  }
  const reject = async (r) => {
    try {
      await axios.put(`/api/admin/inventory-requests/${r.id}/reject`, {}, { headers: authHeader() })
      setSnack({ open: true, message: 'Rejected', severity: 'success' })
      fetchList()
    } catch (e) {
      setSnack({ open: true, message: e?.response?.data?.message || 'Failed to reject', severity: 'error' })
    }
  }

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Inventory Requests</Typography>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Inventory</TableCell>
              <TableCell>Qty</TableCell>
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
                <TableCell>{r.inventory_name}</TableCell>
                <TableCell>{r.quantity}</TableCell>
                <TableCell>{r.status === 0 ? 'Requested' : r.status === 1 ? 'Approved' : r.status === 2 ? 'Rejected' : r.status === 3 ? 'Returned' : ''}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" onClick={() => approve(r)}>Approve</Button>
                    <Button size="small" color="error" onClick={() => reject(r)}>Reject</Button>
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
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </Card>
  )
}


