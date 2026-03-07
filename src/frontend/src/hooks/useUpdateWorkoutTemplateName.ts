import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useUpdateWorkoutTemplateName() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      newName,
    }: { templateId: bigint; newName: string }) => {
      if (!actor) throw new Error("Not connected to backend");
      const result = await actor.updateTemplateName(templateId, newName);
      if (result !== null) {
        throw new Error(result);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allWorkoutTemplates"] });
    },
  });
}
