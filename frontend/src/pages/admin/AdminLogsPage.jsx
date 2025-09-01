import React from 'react'
import axios from 'axios'
import { Card, CardContent, Typography, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Stack } from '@mui/material'

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function AdminLogsPage() {
  const [rows, setRows] = React.useState([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)
  const [search, setSearch] = React.useState('')

  const fetchList = React.useCallback(async () => {
    const p = page + 1
    const url = `/api/admin/logs?page=${p}&pageSize=${pageSize}` + (search ? `&search=${encodeURIComponent(search)}` : '')
    const { data } = await axios.get(url, { headers: authHeader() })
    setRows(data.data || [])
    setTotal(data.total || 0)
  }, [page, pageSize, search])

  React.useEffect(() => { fetchList() }, [fetchList])

  const handleChangePage = (_, newPage) => setPage(newPage)
  const handleChangeRowsPerPage = (e) => { setPageSize(parseInt(e.target.value, 10)); setPage(0) }

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Access Logs</Typography>
          <Stack direction="row" spacing={1}>
            <TextField size="small" placeholder="Search user/email/ip/ua/notes" value={search} onChange={e => setSearch(e.target.value)} />
            <Button variant="contained" onClick={() => { setPage(0); fetchList() }}>Search</Button>
          </Stack>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>IP</TableCell>
              <TableCell>UA</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id} hover>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.user_full_name}</TableCell>
                <TableCell>{r.user_email}</TableCell>
                <TableCell>{r.ip_address}</TableCell>
                <TableCell>{r.user_agent?.slice(0,64)}</TableCell>
                <TableCell>{r.notes}</TableCell>
                <TableCell>{r.created_at}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value,10)); setPage(0) }}
          rowsPerPageOptions={[10,25,50,100]}
        />
      </CardContent>
    </Card>
  )
}


