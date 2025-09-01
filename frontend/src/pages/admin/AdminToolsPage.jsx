'use client'

import React from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, Typography, TextField, Button, Stack, Grid, MenuItem, Divider, Chip } from '@mui/material'

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function AdminToolsPage() {
  // Internal exec (predefined)
  const [stdout, setStdout] = React.useState('')
  const [stderr, setStderr] = React.useState('')
  const [running, setRunning] = React.useState(false)

  // External fetch (predefined /healtz)
  const [respStatus, setRespStatus] = React.useState('')
  const [respHeaders, setRespHeaders] = React.useState('')
  const [respBody, setRespBody] = React.useState('')
  const [fetching, setFetching] = React.useState(false)

  const runInternalCmd = async (cmd) => {
    setRunning(true)
    setStdout('')
    setStderr('')
    try {
      const json = JSON.stringify({ command: cmd })
      const payload = typeof btoa === 'function' ? btoa(json) : Buffer.from(json, 'utf8').toString('base64')
      const { data } = await axios.post('/api/admin/internals', { payload }, { headers: authHeader() })
      setStdout(data?.stdout || '')
      setStderr(data?.stderr || '')
    } catch (e) {
      setStderr(String(e?.response?.data?.message || e?.message || e))
    } finally {
      setRunning(false)
    }
  }

  const runExternal = async () => {
    setFetching(true)
    setRespStatus('')
    setRespHeaders('')
    setRespBody('')
    try {
      const payload = { url: '/healtz', method: 'GET', headers: {} }
      const { data } = await axios.post('/api/admin/external-fetch', payload, { headers: authHeader() })
      setRespStatus(`${data.status} (${data.elapsedMs}ms)`) 
      setRespHeaders(JSON.stringify(data.headers || {}, null, 2))
      setRespBody(data.body || '')
    } catch (e) {
      setRespBody(String(e?.response?.data?.message || e?.message || e))
    } finally {
      setFetching(false)
    }
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Fetch internal data" subheader="Execute predefined, read-only server commands" />
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label="Actions" size="small" />
                <Button size="small" variant="outlined" onClick={() => runInternalCmd('uptime')} disabled={running}>Run uptime</Button>
                <Button size="small" variant="outlined" onClick={() => runInternalCmd('ps aux')} disabled={running}>Run ps</Button>
              </Stack>
              <Divider>stdout</Divider>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>{stdout}</pre>
              <Divider>stderr</Divider>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, color: '#b71c1c' }}>{stderr}</pre>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="External fetch" subheader="Server-side request to predefined /healtz" />
          <CardContent>
            <Stack spacing={2}>
              <Button variant="contained" onClick={runExternal} disabled={fetching}>Fetch /healtz</Button>
              <Typography variant="body2">Status: {respStatus}</Typography>
              <Divider>Headers</Divider>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>{respHeaders}</pre>
              <Divider>Body</Divider>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>{respBody}</pre>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}


