import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router'
import ChatPage from './pages/ChatPage'
import AuthPage from './pages/AuthPage'
import BotsPage from './pages/BotsPage'
import SettingsPage from './pages/SettingsPage'
import AdminPage from './pages/AdminPage'
import AppLayout from './components/AppLayout'

const rootRoute = createRootRoute({ component: () => <Outlet /> })

// '/' = Chat (main page, has its own sidebar)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ChatPage,
})

// Layout route for pages with shared sidebar (bots, tariffs, files)
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: AppLayout,
})

const botsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/bots',
  component: BotsPage,
})

const tariffsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/tariffs',
  component: () => (
    <div className="max-w-3xl mx-auto px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold mb-4">Тарифы</h1>
      <p className="text-[hsl(var(--muted-foreground))]">Скоро здесь появятся тарифные планы</p>
    </div>
  ),
})

const filesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/files',
  component: () => (
    <div className="max-w-3xl mx-auto px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold mb-4">Мои файлы</h1>
      <p className="text-[hsl(var(--muted-foreground))]">Скоро здесь появятся ваши файлы</p>
    </div>
  ),
})

// Auth pages (standalone, no sidebar)
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

const settingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/settings',
  component: SettingsPage,
})

const adminRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/admin',
  component: AdminPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  layoutRoute.addChildren([botsRoute, tariffsRoute, filesRoute, settingsRoute, adminRoute]),
  loginRoute,
  registerRoute,
  signupRoute,
  resetPasswordRoute,
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
