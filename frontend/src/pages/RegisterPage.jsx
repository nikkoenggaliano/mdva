import React from 'react'
import { Container, Box, TextField, Button, Typography, Alert } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function RegisterPage() {
  const [fullName, setFullName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [retype, setRetype] = React.useState('')
  const [error, setError] = React.useState('')
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await axios.post('/api/auth/register', {
        full_name: fullName,
        email,
        password,
        retype_password: retype,
        role: 'user'
      })
      navigate('/login')
    } catch (err) {
      setError(err?.response?.data?.message || 'Register failed')
    }
  }

  return (
    <Container maxWidth="xs" sx={{ mt: 10 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Register</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={onSubmit}>
        <TextField label="Full Name" fullWidth margin="normal" value={fullName} onChange={e => setFullName(e.target.value)} />
        <TextField label="Email" type="email" fullWidth margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
        <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
        <TextField label="Retype Password" type="password" fullWidth margin="normal" value={retype} onChange={e => setRetype(e.target.value)} />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Register</Button>
      </Box>
    </Container>
  )
}


