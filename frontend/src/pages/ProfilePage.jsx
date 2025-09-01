import React from 'react'
import axios from 'axios'
import { Card, CardContent, Typography, Stack, TextField, Button, Tabs, Tab, Snackbar, Alert, Avatar, FormControl, InputLabel, Select, MenuItem } from '@mui/material'

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function ProfilePage() {
  const [tab, setTab] = React.useState(0)
  const [form, setForm] = React.useState({})
  const [passwords, setPasswords] = React.useState({ old_password: '', new_password: '', confirm_password: '' })
  const [snack, setSnack] = React.useState({ open: false, message: '', severity: 'success' })
  const user = React.useMemo(() => { try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null } }, [])
  const canEditCompensation = user && (user.role === 'admin' || user.role === 'hrd')
  const apiBase = import.meta.env.VITE_API_BASE || ''
  const pictureUrl = form.profile_picture ? `${apiBase}${form.profile_picture}` : ''

  const fetchProfile = React.useCallback(async () => {
    if (!user?.id) return
    const { data } = await axios.get(`/api/profile?id=${encodeURIComponent(user.id)}`, { headers: authHeader() })
    setForm(data)
  }, [user])

  React.useEffect(() => { fetchProfile() }, [fetchProfile])

  const saveProfile = async () => {
    try {
      await axios.put(`/api/profile/${user.id}`, form, { headers: authHeader() })
      setSnack({ open: true, message: 'Profile updated', severity: 'success' })
    } catch (e) {
      setSnack({ open: true, message: e?.response?.data?.message || 'Failed to update', severity: 'error' })
    }
  }

  const uploadPicture = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('picture', file)
    try {
      await axios.post(`/api/profile/picture`, fd, { headers: { ...authHeader() } })
      setSnack({ open: true, message: 'Picture updated', severity: 'success' })
      fetchProfile()
    } catch (er) {
      setSnack({ open: true, message: 'Failed to upload picture', severity: 'error' })
    }
  }

  const changePassword = async () => {
    try {
      await axios.post(`/api/profile/password`, passwords, { headers: authHeader() })
      setSnack({ open: true, message: 'Password updated', severity: 'success' })
      setPasswords({ old_password: '', new_password: '', confirm_password: '' })
    } catch (e) {
      setSnack({ open: true, message: e?.response?.data?.message || 'Failed to change password', severity: 'error' })
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>Profile</Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="My Profile" />
          <Tab label="Change Picture" />
          <Tab label="Change Password" />
        </Tabs>

        {tab === 0 && (
          <Stack spacing={2}>
            <TextField label="Full Name" value={form.full_name || ''} onChange={e => setForm(s => ({ ...s, full_name: e.target.value }))} />
            <TextField label="DOB" type="date" InputLabelProps={{ shrink: true }} value={form.dob || ''} onChange={e => setForm(s => ({ ...s, dob: e.target.value }))} />
            <FormControl>
              <InputLabel id="gender-label">Gender</InputLabel>
              <Select
                labelId="gender-label"
                label="Gender"
                value={form.gender || ''}
                onChange={e => setForm(s => ({ ...s, gender: e.target.value }))}
              >
                <MenuItem value=""><em>-</em></MenuItem>
                <MenuItem value="L">Laki-Laki</MenuItem>
                <MenuItem value="P">Perempuan</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Phone" value={form.phone || ''} onChange={e => setForm(s => ({ ...s, phone: e.target.value }))} />
            <TextField label="Address" multiline minRows={2} value={form.address || ''} onChange={e => setForm(s => ({ ...s, address: e.target.value }))} />
            <TextField label="Leave Balance" type="number" value={form.leave_balance ?? 0} onChange={e => setForm(s => ({ ...s, leave_balance: Number(e.target.value) }))} disabled={!canEditCompensation} />
            <TextField label="Salary" type="number" value={form.salary ?? 0} onChange={e => setForm(s => ({ ...s, salary: Number(e.target.value) }))} disabled={!canEditCompensation} />
            <TextField label="Email" value={form.email || ''} InputProps={{ readOnly: true }} />
            <TextField label="Role" value={form.role || ''} InputProps={{ readOnly: true }} />
            <TextField label="Status" value={form.status === 1 ? 'Active' : form.status === 2 ? 'Suspend' : 'Inactive'} InputProps={{ readOnly: true }} />
            <Button variant="contained" onClick={saveProfile}>Save</Button>
          </Stack>
        )}

        {tab === 1 && (
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={pictureUrl} sx={{ width: 64, height: 64 }} />
              <Button variant="outlined" component="label">Upload Picture<input type="file" accept="image/*" hidden onChange={uploadPicture} /></Button>
            </Stack>
          </Stack>
        )}

        {tab === 2 && (
          <Stack spacing={2}>
            <TextField label="Old Password" type="password" value={passwords.old_password} onChange={e => setPasswords(s => ({ ...s, old_password: e.target.value }))} />
            <TextField label="New Password" type="password" value={passwords.new_password} onChange={e => setPasswords(s => ({ ...s, new_password: e.target.value }))} />
            <TextField label="Confirm New Password" type="password" value={passwords.confirm_password} onChange={e => setPasswords(s => ({ ...s, confirm_password: e.target.value }))} />
            <Button variant="contained" onClick={changePassword}>Change Password</Button>
          </Stack>
        )}
      </CardContent>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </Card>
  )
}


