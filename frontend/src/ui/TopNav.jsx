import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, IconButton, Typography, Tooltip, Menu, MenuItem, useTheme } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import NotificationBell from '../components/NotificationBell'
import { ColorModeContext } from './ThemeProvider'

export default function TopNav({ onToggleSidebar, profilePathPrefix = '' }) {
  const theme = useTheme()
  const colorCtx = React.useContext(ColorModeContext)
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)

  const user = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const profilePath = `${profilePathPrefix || ''}/profile`

  return (
    <AppBar position="fixed" color="transparent" enableColorOnDark sx={{ backdropFilter: 'blur(8px)', backgroundColor: theme.palette.mode === 'dark' ? 'rgba(10,16,28,0.7)' : 'rgba(255,255,255,0.7)', borderBottom: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
      <Toolbar>
        <IconButton color="inherit" edge="start" onClick={onToggleSidebar}>
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
        <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => { setAnchorEl(null); navigate(profilePath) }}>My Profile</MenuItem>
          <MenuItem onClick={() => { setAnchorEl(null); handleLogout() }}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}


