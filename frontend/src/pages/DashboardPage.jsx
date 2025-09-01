import React from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import { Card, CardContent, Typography, Button } from '@mui/material'

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function DashboardPage() {
  const [events, setEvents] = React.useState([])

  React.useEffect(() => {
    axios.get('/api/events', { headers: authHeader() }).then(({ data }) => setEvents(data)).catch(() => {})
  }, [])

  return (
    <Card elevation={1}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>Events</Typography>
        {events.length > 0 && (
          <Carousel showThumbs={false} showStatus={false} infiniteLoop>
            {events.map(e => (
              <div key={e.id}>
                <img alt={e.title} src={e.image || 'https://picsum.photos/1200/300'} />
                <p className="legend">
                  <Button size="small" variant="contained" component={Link} to={`/events/${e.id}`}>
                    View: {e.title}
                  </Button>
                </p>
              </div>
            ))}
          </Carousel>
        )}
      </CardContent>
    </Card>
  )
}


