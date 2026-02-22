import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import Layout from './components/Layout';
import WorkoutHistoryPage from './pages/WorkoutHistoryPage';
import AddWorkoutPage from './pages/AddWorkoutPage';
import ProgressionPage from './pages/ProgressionPage';
import ProfileSetupModal from './components/ProfileSetupModal';
import { Toaster } from '@/components/ui/sonner';

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Layout />
      <ProfileSetupModal />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: WorkoutHistoryPage,
});

const addWorkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/add',
  component: AddWorkoutPage,
});

const progressionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/progression',
  component: ProgressionPage,
});

const routeTree = rootRoute.addChildren([indexRoute, addWorkoutRoute, progressionRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
