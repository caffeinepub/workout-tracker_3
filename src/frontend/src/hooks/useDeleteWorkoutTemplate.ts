import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useDeleteWorkoutTemplate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: bigint) => {
      if (!actor) throw new Error("Not connected to backend");
      const result = await actor.deleteTemplate(templateId);
      if (result !== null) {
        throw new Error(result);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allWorkoutTemplates"] });
    },
  });
}
