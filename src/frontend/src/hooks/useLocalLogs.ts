import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type LogExercise,
  type WorkoutLog,
  deleteLog,
  getAllLogs,
  markLogComplete,
  updateLogActuals,
} from "../utils/localStorageLogs";

const QUERY_KEY = ["localWorkoutLogs"];

export function useLocalLogs() {
  return useQuery<WorkoutLog[]>({
    queryKey: QUERY_KEY,
    queryFn: () => getAllLogs(),
  });
}

export function useUpdateLocalLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      logId,
      exercises,
    }: {
      logId: string;
      exercises: LogExercise[];
    }) => {
      const result = updateLogActuals(logId, exercises);
      if (!result) throw new Error("Log not found");
      return Promise.resolve(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useMarkLogComplete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (logId: string) => {
      const result = markLogComplete(logId);
      if (!result) throw new Error("Log not found");
      return Promise.resolve(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteLocalLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const ok = deleteLog(id);
      if (!ok) throw new Error("Log not found");
      return Promise.resolve(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
