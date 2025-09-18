import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './pages/App'
import Login from './pages/Login'
import Register from './pages/Register'
import Doctors from './pages/Doctors'
import DoctorDetail from './pages/DoctorDetail'
import Dashboard from './pages/Dashboard'

const router = createBrowserRouter([
  { path: '/', element: <App/> },
  { path: '/login', element: <Login/> },
  { path: '/register', element: <Register/> },
  { path: '/doctors', element: <Doctors/> },
  { path: '/doctors/:id', element: <DoctorDetail/> },
  { path: '/dashboard', element: <Dashboard/> },
])

const qc = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
)
