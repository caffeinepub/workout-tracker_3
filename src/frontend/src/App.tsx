import { Toaster } from "@/components/ui/sonner";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import Layout from "./components/Layout";
import ProfileSetupModal from "./components/ProfileSetupModal";
import AddWorkoutPage from "./pages/AddWorkoutPage";
import LocalTemplatesPage from "./pages/LocalTemplatesPage";
import PhasesPage from "./pages/PhasesPage";
import ProgressionPage from "./pages/ProgressionPage";
import TemplateLibraryPage from "./pages/TemplateLibraryPage";
import WorkoutHistoryPage from "./pages/WorkoutHistoryPage";
import WorkoutLogPage from "./pages/WorkoutLogPage";

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
  path: "/",
  component: WorkoutHistoryPage,
});

const addWorkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/add",
  component: AddWorkoutPage,
});

const progressionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/progression",
  component: ProgressionPage,
});

const templatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/templates",
  component: TemplateLibraryPage,
});

const phasesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/phases",
  component: PhasesPage,
});

const workoutTemplatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/workout-templates",
  component: LocalTemplatesPage,
});

const workoutLogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/workout-log",
  component: WorkoutLogPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  addWorkoutRoute,
  progressionRoute,
  templatesRoute,
  phasesRoute,
  workoutTemplatesRoute,
  workoutLogRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
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
