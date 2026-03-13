import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  LogExercise as BackendLogExercise,
  WorkoutLogView,
} from "../backend";
import type { LogExercise, WorkoutLog } from "../utils/localStorageLogs";
import { useActor } from "./useActor";
import { useAuth } from "./useAuth";

export const BACKEND_LOGS_KEY = ["backendWorkoutLogs"];

function nanosToIso(ns: bigint): string {
  return new Date(Number(ns / 1_000_000n)).toISOString();
}

function mapBackendExercise(ex: BackendLogExercise): LogExercise {
  return {
    name: ex.name,
    plannedSets: Number(ex.plannedSets),
    plannedReps: Number(ex.plannedReps),
    plannedWeight: Number(ex.plannedWeight),
    plannedTime: Number(ex.plannedTime),
    actualSets: ex.actualSets !== undefined ? Number(ex.actualSets) : null,
    actualReps: ex.actualReps !== undefined ? Number(ex.actualReps) : null,
    actualWeight:
      ex.actualWeight !== undefined ? Number(ex.actualWeight) : null,
    actualTime: ex.actualTime !== undefined ? Number(ex.actualTime) : null,
    notes: ex.notes,
  };
}

function mapToBackendExercise(ex: LogExercise): BackendLogExercise {
  return {
    name: ex.name,
    plannedSets: BigInt(ex.plannedSets),
    plannedReps: BigInt(ex.plannedReps),
    plannedWeight: BigInt(ex.plannedWeight),
    plannedTime: BigInt(ex.plannedTime),
    actualSets: ex.actualSets !== null ? BigInt(ex.actualSets) : undefined,
    actualReps: ex.actualReps !== null ? BigInt(ex.actualReps) : undefined,
    actualWeight:
      ex.actualWeight !== null ? BigInt(ex.actualWeight) : undefined,
    actualTime: ex.actualTime !== null ? BigInt(ex.actualTime) : undefined,
    notes: ex.notes,
  };
}

function mapBackendLog(view: WorkoutLogView): WorkoutLog {
  return {
    id: view.id.toString(),
    templateId: view.templateId,
    templateName: view.templateName,
    createdAt: nanosToIso(view.createdAt),
    completedAt:
      view.completedAt !== undefined ? nanosToIso(view.completedAt) : null,
    exercises: view.exercises.map(mapBackendExercise),
  };
}

export function useBackendLogs() {
  const { actor, isFetching: actorFetching } = useActor();
  const { isAuthenticated } = useAuth();

  return useQuery<WorkoutLog[]>({
    queryKey: BACKEND_LOGS_KEY,
    queryFn: async () => {
      if (!actor) return [];
      const views = await actor.getAllWorkoutLogs();
      return views.map(mapBackendLog);
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });
}

export function useCreateBackendLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      templateName,
      exercises,
    }: {
      templateId: string;
      templateName: string;
      exercises: LogExercise[];
    }) => {
      if (!actor) throw new Error("Not authenticated");
      const logId = await actor.createWorkoutLog(
        templateId,
        templateName,
        exercises.map(mapToBackendExercise),
      );
      return logId.toString();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BACKEND_LOGS_KEY });
    },
  });
}

export function useUpdateBackendLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      logId,
      exercises,
    }: {
      logId: string;
      exercises: LogExercise[];
    }) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.updateWorkoutLogActuals(
        BigInt(logId),
        exercises.map(mapToBackendExercise),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BACKEND_LOGS_KEY });
    },
  });
}

export function useMarkBackendLogComplete() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logId: string) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.markWorkoutLogComplete(BigInt(logId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BACKEND_LOGS_KEY });
    },
  });
}

export function useDeleteBackendLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logId: string) => {
      if (!actor) throw new Error("Not authenticated");
      const ok = await actor.deleteWorkoutLog(BigInt(logId));
      if (!ok) throw new Error("Log not found");
      return logId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BACKEND_LOGS_KEY });
    },
  });
}
