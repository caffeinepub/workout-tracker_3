import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PhaseId } from "../backend";
import { useActor } from "./useActor";

export function useAddExerciseToPhase() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      phaseId,
      name,
    }: { phaseId: PhaseId; name: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addExerciseToPhase(phaseId, name);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["exercises", variables.phaseId.toString()],
      });
    },
  });
}
