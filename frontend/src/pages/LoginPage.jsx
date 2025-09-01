import React from 'react'
import { Container, Box, TextField, Button, Typography, Alert } from '@mui/material'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

export default function LoginPage() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await axios.post('/api/auth/login', { email, password })
      if (data.token) {
        localStorage.setItem('token', data.token)
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user))
        const role = data?.user?.role
        if (role === 'admin') navigate('/admin/dashboard')
        else if (role === 'hrd') navigate('/hrd/dashboard')
        else navigate('/dashboard')
      } else {
        setError('Unexpected response')
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <Container maxWidth="xs" sx={{ mt: 10 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Login</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={onSubmit}>
        <TextField label="Email" type="email" fullWidth margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
        <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Login</Button>
        <Button component={Link} to="/register" fullWidth sx={{ mt: 1 }}>Register</Button>
      </Box>
    </Container>
  )
}


