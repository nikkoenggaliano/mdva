import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles.css'
import './setupAxios'
import ThemeProvider from './ui/ThemeProvider'
import AppLayout from './ui/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import EventDetailPage from './pages/EventDetailPage'
import InventoryPage from './pages/InventoryPage'
import InventoryRequestsPage from './pages/InventoryRequestsPage'
import LeavePage from './pages/LeavePage'
import LeaveDetailPage from './pages/LeaveDetailPage'
import MessagesPage from './pages/MessagesPage'
import MessageDetailPage from './pages/MessageDetailPage'
import LandingPage from './pages/LandingPage'
import RequireAuth from './components/RequireAuth'
import RequireRole from './components/RequireRole'
import AdminLayout from './ui/AdminLayout'
import HRDLayout from './ui/HRDLayout'
import UserLayout from './ui/UserLayout'
import NotificationsPage from './pages/NotificationsPage'
import HRDLeaveRequestsPage from './pages/HRDLeaveRequestsPage'
import ProfilePage from './pages/ProfilePage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminEventsPage from './pages/admin/AdminEventsPage'
import AdminInventoryPage from './pages/admin/AdminInventoryPage'
import AdminInventoryRequestsPage from './pages/admin/AdminInventoryRequestsPage'
import AdminLeaveRequestsPage from './pages/admin/AdminLeaveRequestsPage'
import AdminLogsPage from './pages/admin/AdminLogsPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import AdminMessagesPage from './pages/admin/AdminMessagesPage'
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage'
import AdminApprovalLeavesPage from './pages/admin/AdminApprovalLeavesPage'
import AdminToolsPage from './pages/admin/AdminToolsPage'
import HRDApprovalLeavesPage from './pages/HRDApprovalLeavesPage'

const router = createBrowserRouter([
  { index: true, element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: 'dashboard', element: <RequireAuth><DashboardPage /></RequireAuth> },
      { path: 'events/:id', element: <RequireAuth><EventDetailPage /></RequireAuth> },
      { path: 'inventory', element: <RequireAuth><InventoryPage /></RequireAuth> },
      { path: 'inventory-requests', element: <RequireAuth><InventoryRequestsPage /></RequireAuth> },
      { path: 'leave', element: <RequireAuth><LeavePage /></RequireAuth> },
      { path: 'leave/:id', element: <RequireAuth><LeaveDetailPage /></RequireAuth> },
      { path: 'messages', element: <RequireAuth><MessagesPage /></RequireAuth> },
      { path: 'messages/:id', element: <RequireAuth><MessageDetailPage /></RequireAuth> },
      { path: 'notifications', element: <RequireAuth><NotificationsPage /></RequireAuth> },
      { path: 'profile', element: <RequireAuth><ProfilePage /></RequireAuth> },
    ]
  },
  {
    path: '/admin',
    element: <RequireRole role="admin"><AdminLayout /></RequireRole>,
    children: [
      { index: true, element: <RequireRole role="admin"><DashboardPage /></RequireRole> },
      { path: 'dashboard', element: <RequireRole role="admin"><DashboardPage /></RequireRole> },
      { path: 'users', element: <RequireRole role="admin"><AdminUsersPage /></RequireRole> },
      { path: 'events', element: <RequireRole role="admin"><AdminEventsPage /></RequireRole> },
      { path: 'inventory', element: <RequireRole role="admin"><AdminInventoryPage /></RequireRole> },
      { path: 'inventory-requests', element: <RequireRole role="admin"><AdminInventoryRequestsPage /></RequireRole> },
      { path: 'leave-requests', element: <RequireRole role="admin"><AdminLeaveRequestsPage /></RequireRole> },
      { path: 'approval-leaves', element: <RequireRole role="admin"><AdminApprovalLeavesPage /></RequireRole> },
      { path: 'settings', element: <RequireRole role="admin"><AdminSettingsPage /></RequireRole> },
      { path: 'notifications', element: <RequireRole role="admin"><AdminNotificationsPage /></RequireRole> },
      { path: 'logs', element: <RequireRole role="admin"><AdminLogsPage /></RequireRole> },
      { path: 'tools', element: <RequireRole role="admin"><AdminToolsPage /></RequireRole> },
      { path: 'messages', element: <RequireRole role="admin"><AdminMessagesPage /></RequireRole> },
      { path: 'messages/:id', element: <RequireRole role="admin"><MessageDetailPage /></RequireRole> },
    ]
  },
  {
    path: '/hrd',
    element: <RequireRole role="hrd"><HRDLayout /></RequireRole>,
    children: [
      { index: true, element: <RequireRole role="hrd"><DashboardPage /></RequireRole> },
      { path: 'dashboard', element: <RequireRole role="hrd"><DashboardPage /></RequireRole> },
      { path: 'inventory', element: <RequireRole role="hrd"><InventoryPage /></RequireRole> },
      { path: 'inventory-requests', element: <RequireRole role="hrd"><InventoryRequestsPage /></RequireRole> },
      { path: 'leave', element: <RequireRole role="hrd"><LeavePage /></RequireRole> },
      { path: 'leave/:id', element: <RequireRole role="hrd"><LeaveDetailPage /></RequireRole> },
      { path: 'leave-requests', element: <RequireRole role="hrd"><HRDLeaveRequestsPage /></RequireRole> },
      { path: 'approval-leaves', element: <RequireRole role="hrd"><HRDApprovalLeavesPage /></RequireRole> },
      { path: 'messages', element: <RequireRole role="hrd"><MessagesPage /></RequireRole> },
      { path: 'messages/:id', element: <RequireRole role="hrd"><MessageDetailPage /></RequireRole> },
      { path: 'notifications', element: <RequireRole role="hrd"><NotificationsPage /></RequireRole> },
      { path: 'profile', element: <RequireRole role="hrd"><ProfilePage /></RequireRole> },
    ]
  },
  {
    path: '/user',
    element: <RequireRole role="user"><UserLayout /></RequireRole>,
    children: [
      { index: true, element: <RequireRole role="user"><DashboardPage /></RequireRole> },
      { path: 'dashboard', element: <RequireRole role="user"><DashboardPage /></RequireRole> },
      { path: 'inventory', element: <RequireRole role="user"><InventoryPage /></RequireRole> },
      { path: 'inventory-requests', element: <RequireRole role="user"><InventoryRequestsPage /></RequireRole> },
      { path: 'leave', element: <RequireRole role="user"><LeavePage /></RequireRole> },
      { path: 'leave/:id', element: <RequireRole role="user"><LeaveDetailPage /></RequireRole> },
      { path: 'messages', element: <RequireRole role="user"><MessagesPage /></RequireRole> },
      { path: 'messages/:id', element: <RequireRole role="user"><MessageDetailPage /></RequireRole> },
      { path: 'notifications', element: <RequireRole role="user"><NotificationsPage /></RequireRole> },
      { path: 'profile', element: <RequireRole role="user"><ProfilePage /></RequireRole> },
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
)


