import React from 'react'
import axios from 'axios'
import { Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, Stack, Button, Snackbar, Alert } from '@mui/material'

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function InventoryRequestsPage() {
  const [rows, setRows] = React.useState([])
  const [snack, setSnack] = React.useState({ open: false, message: '', severity: 'success' })

  const fetchHistory = React.useCallback(async () => {
    const { data } = await axios.get('/api/inventory/history', { headers: authHeader() })
    setRows(data || [])
  }, [])

  React.useEffect(() => { fetchHistory() }, [fetchHistory])

  const label = (s) => s === 1 ? 'Approved' : s === 2 ? 'Rejected' : s === 3 ? 'Returned' : 'Requested'

  const doReturn = async (row) => {
    try {
      await axios.put(`/api/inventory/${row.id}/returned`, {}, { headers: authHeader() })
      setSnack({ open: true, message: 'Returned', severity: 'success' })
      fetchHistory()
    } catch (e) {
      setSnack({ open: true, message: e?.response?.data?.message || 'Failed to return', severity: 'error' })
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
              <TableCell>No</TableCell>
              <TableCell>Item</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, idx) => (
              <TableRow key={r.id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{r.inventory_name}</TableCell>
                <TableCell>{r.quantity} {r.inventory_unit}</TableCell>
                <TableCell>{label(r.status)}</TableCell>
                <TableCell>
                  {r.status === 1 ? (
                    <Button size="small" variant="contained" onClick={() => doReturn(r)}>Return</Button>
                  ) : (
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>-</Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </Card>
  )
}


