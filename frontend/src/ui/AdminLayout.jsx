import React from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemText, Box, Container, useTheme, Tooltip, useMediaQuery, Menu, MenuItem } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import EventIcon from '@mui/icons-material/Event'
import InventoryIcon from '@mui/icons-material/Inventory2'
import AssignmentIcon from '@mui/icons-material/Assignment'
import PeopleIcon from '@mui/icons-material/People'
import SettingsIcon from '@mui/icons-material/Settings'
import ListAltIcon from '@mui/icons-material/ListAlt'
import BuildIcon from '@mui/icons-material/Build'
import NotificationsIcon from '@mui/icons-material/Notifications'
import NotificationBell from '../components/NotificationBell'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { ColorModeContext } from './ThemeProvider'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'

function useAuth() {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  return { token, user: user ? JSON.parse(user) : null }
}

export default function AdminLayout() {
  const [open, setOpen] = React.useState(() => {
    try { return localStorage.getItem('mdva:sidebar-open') !== 'false' } catch { return true }
  })
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const theme = useTheme()
  const colorCtx = React.useContext(ColorModeContext)
  const base = '/admin'
  const drawerWidth = 240
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [anchorEl, setAnchorEl] = React.useState(null)
  const menuOpen = Boolean(anchorEl)

  React.useEffect(() => {
    if (!token) navigate('/login')
  }, [token, navigate])

  React.useEffect(() => {
    if (isMobile) setOpen(false)
  }, [isMobile])

  const menu = [
    { to: `${base}/dashboard`, label: 'Dashboard', icon: <ListAltIcon /> },
    { to: `${base}/events`, label: 'Events', icon: <EventIcon /> },
    { to: `${base}/inventory`, label: 'Inventory', icon: <InventoryIcon /> },
    { to: `${base}/inventory-requests`, label: 'Inventory Requests', icon: <AssignmentIcon /> },
    { to: `${base}/leave-requests`, label: 'Leave Requests', icon: <AssignmentIcon /> },
    { to: `${base}/users`, label: 'Users', icon: <PeopleIcon /> },
    { to: `${base}/notifications`, label: 'Notifications', icon: <NotificationsIcon /> },
    { to: `${base}/approval-leaves`, label: 'Approval Leaves', icon: <AssignmentIcon /> },
    { to: `${base}/settings`, label: 'Settings', icon: <SettingsIcon /> },
    { to: `${base}/logs`, label: 'Log Access', icon: <ListAltIcon /> },
    { to: `${base}/tools`, label: 'Tools', icon: <BuildIcon /> },
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
      <AppBar position="fixed" color="transparent" enableColorOnDark sx={{ backdropFilter: 'blur(8px)', backgroundColor: theme.palette.mode === 'dark' ? 'rgba(10,16,28,0.7)' : 'rgba(255,255,255,0.7)', borderBottom: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={toggleSidebar}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>MDVA</Typography>
          <NotificationBell />
          <Tooltip title={theme.palette.mode === 'dark' ? 'Switch to light' : 'Switch to dark'}>
            <IconButton color="inherit" onClick={colorCtx.toggle} sx={{ mr: 1 }}>
              {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          <Typography sx={{ mr: 1 }}>{user?.full_name}</Typography>
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <AccountCircleIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={menuOpen} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/admin/profile') }}>My Profile</MenuItem>
            <MenuItem onClick={() => { setAnchorEl(null); handleLogout() }}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

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
                {m.icon}
                <ListItemText primary={m.label} sx={{ ml: 1 }} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, mt: 8, ml: !isMobile && open ? `${drawerWidth}px` : 0, transition: 'margin 225ms ease' }}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  )
}


