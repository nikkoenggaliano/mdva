import React from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function EventDetailPage() {
  const { id } = useParams()
  const [event, setEvent] = React.useState(null)

  React.useEffect(() => {
    axios.get(`/api/events/${id}`, { headers: authHeader() }).then(({ data }) => setEvent(data)).catch(() => {})
  }, [id])

  if (!event) return null
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">{event.title}</h2>
      <img alt={event.title} src={event.image || 'https://picsum.photos/1200/300'} className="mb-4" />
      <div className="text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: event.description || '' }}></div>
    </div>
  )
}


