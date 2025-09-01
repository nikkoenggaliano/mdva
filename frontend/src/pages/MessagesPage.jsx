import React from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Link as MuiLink
} from '@mui/material'
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import BoldIcon from '@mui/icons-material/FormatBold'
import ItalicIcon from '@mui/icons-material/FormatItalic'
import UnderlineIcon from '@mui/icons-material/FormatUnderlined'
import ListIcon from '@mui/icons-material/FormatListBulleted'
import AttachFileIcon from '@mui/icons-material/AttachFile'

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function MessagesPage() {
  const navigate = useNavigate()
  const [users, setUsers] = React.useState([])
  const [search, setSearch] = React.useState('')
  const [messages, setMessages] = React.useState([])
  const [tab, setTab] = React.useState(0)
  const [toUser, setToUser] = React.useState(null)
  const [messageHtml, setMessageHtml] = React.useState('')
  const [file, setFile] = React.useState(null)
  const [snack, setSnack] = React.useState({ open: false, message: '', severity: 'success' })
  const user = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  }, [])
  const editorRef = React.useRef(null)

  const fetchMessages = React.useCallback(() => {
    axios.get('/api/messages', { headers: authHeader() }).then(({ data }) => setMessages(data)).catch(() => {})
  }, [])

  React.useEffect(() => { fetchMessages() }, [fetchMessages])

  const searchUsers = () => {
    axios.get(`/api/messages/users?name=${encodeURIComponent(search)}`, { headers: authHeader() })
      .then(({ data }) => {
        setUsers(data)
        setSnack({ open: true, message: data && data.length ? `Found ${data.length} user(s). Please select recipient.` : 'No users found.', severity: data && data.length ? 'success' : 'warning' })
      })
      .catch(() => setSnack({ open: true, message: 'Failed to search users', severity: 'error' }))
  }

  const send = async () => {
    if (!toUser?.id) return
    const html = messageHtml || (editorRef.current ? editorRef.current.innerHTML : '')
    const form = new FormData()
    form.append('to_user_id', String(toUser.id))
    form.append('message', html)
    if (file) form.append('attachment', file)
    try {
      await axios.post('/api/messages', form, { headers: { ...authHeader() } })
      setSnack({ open: true, message: 'Message sent successfully', severity: 'success' })
      setMessageHtml('')
      if (editorRef.current) editorRef.current.innerHTML = ''
      setFile(null)
      setToUser(null)
      fetchMessages()
    } catch (e) {
      setSnack({ open: true, message: 'Failed to send message', severity: 'error' })
    }
  }

  const openMessage = async (row) => {
    navigate(`/messages/${row.id}`)
  }

  const exec = (cmd) => {
    document.execCommand(cmd, false, null)
    setMessageHtml(editorRef.current?.innerHTML || '')
  }

  const renderStatus = (s) => s === 1 ? 'Read' : 'Delivered'

  return (
    <div>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">Messages</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField size="small" placeholder="Search user" value={search} onChange={e => setSearch(e.target.value)} />
          <Button onClick={searchUsers} variant="outlined">Search</Button>
        </Stack>
      </Stack>

      <Typography fontWeight={600} sx={{ mb: 1 }}>Compose</Typography>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack spacing={1}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 260 }}>
                <InputLabel id="to-user-label" shrink>Recipient</InputLabel>
                <Select
                  labelId="to-user-label"
                  label="Recipient"
                  value={toUser?.id || ''}
                  onChange={(e) => {
                    const id = e.target.value
                    const found = users.find(u => u.id === id) || users.find(u => String(u.id) === String(id))
                    setToUser(found || null)
                  }}
                  displayEmpty
                  renderValue={(value) => {
                    const found = users.find(u => u.id === value || String(u.id) === String(value))
                    return found ? `${found.full_name} (${found.email})` : 'Select recipient'
                  }}
                >
                  <MenuItem value=""><em>Select recipient</em></MenuItem>
                  {users.map(u => (
                    <MenuItem key={u.id} value={u.id}>{u.full_name} ({u.email})</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <div style={{ flex: 1 }} />
              <Stack direction="row" spacing={1}>
                <Tooltip title="Bold"><IconButton size="small" onClick={() => exec('bold')}><BoldIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Italic"><IconButton size="small" onClick={() => exec('italic')}><ItalicIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Underline"><IconButton size="small" onClick={() => exec('underline')}><UnderlineIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Bulleted list"><IconButton size="small" onClick={() => exec('insertUnorderedList')}><ListIcon fontSize="small" /></IconButton></Tooltip>
              </Stack>
            </Stack>
            <div
              ref={editorRef}
              contentEditable
              onInput={() => setMessageHtml(editorRef.current?.innerHTML || '')}
              style={{ minHeight: 220, border: '1px solid rgba(0,0,0,0.2)', borderRadius: 6, padding: 8 }}
            />
            <Stack direction="row" spacing={1} alignItems="center">
              <Button variant="outlined" component="label" startIcon={<AttachFileIcon />}>
                Attachment
                <input hidden type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
              </Button>
              {file && <Typography variant="body2">{file.name}</Typography>}
              <div style={{ flex: 1 }} />
              <Button variant="contained" onClick={send} disabled={!toUser}>Send</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1 }}>
        <Tab label="Inbox" />
        <Tab label="Sent" />
      </Tabs>
      <Card>
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {messages
                .filter(m => !user ? true : (tab === 0 ? m.to_user_id === user.id : m.from_user_id === user.id))
                .map(m => (
                <TableRow key={m.id} hover>
                  <TableCell>{m.from_name} ({m.from_email})</TableCell>
                  <TableCell>{m.to_name} ({m.to_email})</TableCell>
                  <TableCell>{renderStatus(m.status)}</TableCell>
                  <TableCell><Button size="small" onClick={() => openMessage(m)}>Open</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          severity={snack.severity}
          sx={{ width: '100%' }}
        >
          {snack.message}
        </MuiAlert>
      </Snackbar>
    </div>
  )
}


