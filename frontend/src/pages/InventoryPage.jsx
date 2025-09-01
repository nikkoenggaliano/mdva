import React from 'react'
import axios from 'axios'
import { TextField, Button, Card, CardContent, Typography, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material'

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function InventoryPage() {
  const [items, setItems] = React.useState([])
  const [search, setSearch] = React.useState('')
  const [borrowOpen, setBorrowOpen] = React.useState(false)
  const [selected, setSelected] = React.useState(null)
  const [qty, setQty] = React.useState(1)
  const [snack, setSnack] = React.useState({ open: false, message: '', severity: 'success' })

  const fetchList = React.useCallback(() => {
    axios.get(`/api/inventory?search=${encodeURIComponent(search)}`, { headers: authHeader() })
      .then(({ data }) => setItems(data.data || []))
      .catch(() => {})
  }, [search])

  React.useEffect(() => { fetchList() }, [fetchList])

  const openBorrow = (item) => { setSelected(item); setQty(1); setBorrowOpen(true) }
  const submitBorrow = async () => {
    try {
      if (!selected) return
      if (qty <= 0 || qty > selected.quantity) { setSnack({ open: true, message: 'Invalid quantity', severity: 'error' }); return }
      await axios.post('/api/inventory', { inventory_id: selected.id, quantity: qty }, { headers: authHeader() })
      setSnack({ open: true, message: 'Borrow request submitted', severity: 'success' })
      setBorrowOpen(false)
    } catch (e) {
      setSnack({ open: true, message: e?.response?.data?.message || 'Failed to request', severity: 'error' })
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <Typography variant="h6">Inventory</Typography>
        <div className="flex items-center gap-2">
          <TextField size="small" placeholder="Search name" value={search} onChange={e => setSearch(e.target.value)} />
          <Button onClick={fetchList} variant="contained">Search</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map(it => (
          <Card key={it.id}>
            <CardContent>
              <Typography fontWeight={600}>{it.name}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>{it.description}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>Qty: {it.quantity} {it.unit}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button size="small" variant="contained" onClick={() => openBorrow(it)} disabled={it.quantity <= 0}>Borrow</Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={borrowOpen} onClose={() => setBorrowOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Borrow Quantity</DialogTitle>
        <DialogContent dividers>
          <TextField
            label={`Quantity (max ${selected?.quantity ?? 0})`}
            type="number"
            fullWidth
            value={qty}
            onChange={e => setQty(Number(e.target.value))}
            inputProps={{ min: 1, max: selected?.quantity ?? 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBorrowOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitBorrow}>Submit</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </div>
  )
}


