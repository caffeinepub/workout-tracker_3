import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Exercise, UserWorkoutTemplateView } from "../backend";
import { useActor } from "./useActor";

/**
 * Replaces the exercises array on a template by deleting and recreating it.
 * The backend has no direct "update exercises" endpoint, so we rebuild the template.
 */
export function useUpdateTemplateExercises() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      template,
      exercises,
    }: {
      template: UserWorkoutTemplateView;
      exercises: Exercise[];
    }) => {
      if (!actor) throw new Error("Not connected to backend");

      // Step 1: delete the existing template
      const deleteResult = await actor.deleteTemplate(template.id);
      if (deleteResult !== null) {
        throw new Error(deleteResult ?? "Failed to delete template");
      }

      // Step 2: recreate it with the updated exercises
      const success = await actor.createWorkoutTemplate({
        name: template.template.name,
        days: template.template.days,
        exercises,
      });
      if (!success) {
        throw new Error("Failed to recreate template with updated exercises");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allWorkoutTemplates"] });
    },
  });
}
