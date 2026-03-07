import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ExerciseId } from "../backend";
import { useActor } from "./useActor";

export function useLogExercise() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      exerciseId,
      sets,
      reps,
      weight,
    }: {
      exerciseId: ExerciseId;
      sets: bigint;
      reps: bigint;
      weight: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.logExercise(exerciseId, sets, reps, weight);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["exerciseLogs", variables.exerciseId.toString()],
      });
    },
  });
}
