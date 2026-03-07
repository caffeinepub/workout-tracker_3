import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ExerciseId, PhaseId } from "../backend";
import { useActor } from "./useActor";

export function useRemoveExercise() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      exerciseId,
    }: { exerciseId: ExerciseId; phaseId: PhaseId }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.removeExercise(exerciseId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["exercises", variables.phaseId.toString()],
      });
    },
  });
}
