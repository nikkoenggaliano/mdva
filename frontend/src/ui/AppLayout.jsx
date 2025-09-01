import React from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemText, Box, Container, useTheme, Tooltip, useMediaQuery, ListItemIcon } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import TopNav from './TopNav'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { ColorModeContext } from './ThemeProvider'
import NotificationBell from '../components/NotificationBell'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { Menu, MenuItem, Avatar } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import InventoryIcon from '@mui/icons-material/Inventory2'
import AssignmentIcon from '@mui/icons-material/Assignment'
import ChatIcon from '@mui/icons-material/Chat'
import NotificationsIcon from '@mui/icons-material/Notifications'

function useAuth() {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  return { token, user: user ? JSON.parse(user) : null }
}

export default function AppLayout() {
  const [open, setOpen] = React.useState(() => {
    try { return localStorage.getItem('mdva:sidebar-open') !== 'false' } catch { return true }
  })
  const navigate = useNavigate()
  const location = useLocation()
  const { token, user } = useAuth()
  const theme = useTheme()
  const colorCtx = React.useContext(ColorModeContext)
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const drawerWidth = 240
  const [anchorEl, setAnchorEl] = React.useState(null)
  const menuOpen = Boolean(anchorEl)

  React.useEffect(() => {
    if (!token) navigate('/login')
  }, [token, navigate])

  // No forced redirect; root app uses role to render menu only

  React.useEffect(() => {
    if (isMobile) {
      setOpen(false)
    }
  }, [isMobile])

  const base = user?.role === 'admin' ? '/admin' : user?.role === 'hrd' ? '/hrd' : ''
  const menu = [
    { to: `${base}/dashboard`, label: 'Dashboard', icon: <DashboardIcon /> },
    { to: `${base}/inventory`, label: 'Inventory', icon: <InventoryIcon /> },
    { to: `${base}/inventory-requests`, label: 'Inventory Requests', icon: <AssignmentIcon /> },
    { to: `${base}/leave`, label: 'Leave Request', icon: <AssignmentIcon /> },
    { to: `${base}/messages`, label: 'Messages', icon: <ChatIcon /> },
    { to: `${base}/notifications`, label: 'Notifications', icon: <NotificationsIcon /> },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const toggleSidebar = () => {
    const next = !open
    setOpen(next)
    try { localStorage.setItem('mdva:sidebar-open', String(next)) } catch {}
  }

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <TopNav onToggleSidebar={toggleSidebar} profilePathPrefix={''} />

      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={open}
        onClose={() => setOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
      >
        <Box sx={{ width: drawerWidth }} role="presentation">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 1, py: 1 }}>
            <IconButton onClick={() => setOpen(false)} aria-label="Close sidebar">
              <ChevronLeftIcon />
            </IconButton>
          </Box>
          <List>
            {menu.map(m => (
              <ListItem button component={Link} to={m.to} key={m.to}>
                <ListItemIcon>
                  {m.icon}
                </ListItemIcon>
                <ListItemText primary={m.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, mt: 8, ml: !isMobile && open ? `${drawerWidth}px` : 0, transition: 'margin 225ms ease' }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  )
}


