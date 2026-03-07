import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { WorkoutTemplateView } from "../backend";
import { useActor } from "./useActor";

export function useCreateWorkoutTemplate() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: WorkoutTemplateView) => {
      if (isFetching)
        throw new Error("Still connecting to backend, please try again");
      if (!actor)
        throw new Error(
          "Not connected to backend. Please ensure you are logged in and try again",
        );

      let result: boolean;
      try {
        result = await actor.createWorkoutTemplate(template);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("Unauthorized")) {
          throw new Error("You must be logged in to create templates");
        }
        throw new Error(`Backend error: ${msg}`);
      }

      if (!result) {
        throw new Error("Template was not saved. Please try again");
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allWorkoutTemplates"] });
    },
  });
}
