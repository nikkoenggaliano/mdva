import React from 'react'
import axios from 'axios'
import { IconButton, Badge, Menu, MenuItem, ListItemText } from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [items, setItems] = React.useState([])
  const open = Boolean(anchorEl)

  const fetchItems = React.useCallback(async () => {
    try {
      const { data } = await axios.get('/api/notification/unread', { headers: authHeader() })
      setItems(data || [])
    } catch {}
  }, [])

  React.useEffect(() => { fetchItems() }, [fetchItems])

  const handleOpen = (e) => { setAnchorEl(e.currentTarget); fetchItems() }
  const handleClose = () => setAnchorEl(null)

  const unreadCount = items.filter(i => Number(i.status) === 2).length

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen} aria-label="Open notifications">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        {items.length === 0 && <MenuItem disabled>No notifications</MenuItem>}
        {items.slice(0, 10).map(n => (
          <MenuItem key={n.id} onClick={async () => { try { await axios.put(`/api/notification/${n.id}/read`, {}, { headers: authHeader() }); fetchItems(); } catch {}; handleClose() }}>
            <ListItemText primary={n.message} secondary={n.created_at || ''} />
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}


