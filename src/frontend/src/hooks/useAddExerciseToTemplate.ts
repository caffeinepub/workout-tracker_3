import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Exercise } from "../backend";
import { useActor } from "./useActor";

export function useAddExerciseToTemplate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      exercise,
    }: { templateId: bigint; exercise: Exercise }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.addExerciseToTemplate(templateId, exercise);
      if (!result) {
        throw new Error(
          "Failed to add exercise. Template not found or unauthorized.",
        );
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allWorkoutTemplates"] });
    },
  });
}
