/**
 * Smart log hooks: route to backend when authenticated,
 * localStorage when not.
 */
import { useAuth } from "./useAuth";
import {
  useBackendLogs,
  useCreateBackendLog,
  useDeleteBackendLog,
  useMarkBackendLogComplete,
  useUpdateBackendLog,
} from "./useBackendLogs";
import {
  useDeleteLocalLog,
  useLocalLogs,
  useMarkLogComplete,
  useUpdateLocalLog,
} from "./useLocalLogs";

export function useSmartLogs() {
  const { isAuthenticated } = useAuth();
  const local = useLocalLogs();
  const backend = useBackendLogs();
  return isAuthenticated ? backend : local;
}

export function useSmartUpdateLog() {
  const { isAuthenticated } = useAuth();
  const local = useUpdateLocalLog();
  const backend = useUpdateBackendLog();
  return isAuthenticated ? backend : local;
}

export function useSmartMarkLogComplete() {
  const { isAuthenticated } = useAuth();
  const local = useMarkLogComplete();
  const backend = useMarkBackendLogComplete();
  return isAuthenticated ? backend : local;
}

export function useSmartDeleteLog() {
  const { isAuthenticated } = useAuth();
  const local = useDeleteLocalLog();
  const backend = useDeleteBackendLog();
  return isAuthenticated ? backend : local;
}

/**
 * Create a log entry for a newly created template.
 * - Authenticated: calls backend createWorkoutLog
 * - Not authenticated: no-op (localStorageTemplates.ts auto-creates local logs)
 */
export function useSmartCreateLog() {
  const { isAuthenticated } = useAuth();
  const backendCreate = useCreateBackendLog();

  if (isAuthenticated) {
    return backendCreate;
  }

  // Local path: logs are auto-created by localStorageTemplates.ts::createTemplate()
  return {
    ...backendCreate,
    mutateAsync: async (_args: {
      templateId: string;
      templateName: string;
      exercises: Array<{
        name: string;
        plannedSets: number;
        plannedReps: number;
        plannedWeight: number;
        plannedTime: number;
        actualSets: null;
        actualReps: null;
        actualWeight: null;
        actualTime: null;
        notes: string;
      }>;
    }) => "",
    isPending: false as const,
  };
}
