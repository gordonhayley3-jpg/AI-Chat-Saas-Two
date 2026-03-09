import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router'
import ChatPage from './pages/ChatPage'
import AuthPage from './pages/AuthPage'
import BotsPage from './pages/BotsPage'
import SettingsPage from './pages/SettingsPage'
import AdminPage from './pages/AdminPage'

const rootRoute = createRootRoute({ component: () => <Outlet /> })

// '/' = Chat (main page)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ChatPage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => <AuthPage mode="login" />,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: () => <AuthPage mode="signup" />,
})

// Legacy routes
const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: () => <AuthPage mode="signup" />,
})

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reset-password',
  component: () => <AuthPage mode="reset" />,
})

const botsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bots',
  component: BotsPage,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
})

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  signupRoute,
  resetPasswordRoute,
  botsRoute,
  settingsRoute,
  adminRoute,
])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default function App() {
  return <RouterProvider router={router} />
}
