import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PhaseId } from "../backend";
import { useActor } from "./useActor";

export function useDeletePhase() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (phaseId: PhaseId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deletePhase(phaseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phases"] });
    },
  });
}
