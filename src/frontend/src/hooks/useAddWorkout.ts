import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { WorkoutSession } from "../backend";
import { useActor } from "./useActor";

export function useAddWorkout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session: WorkoutSession) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addWorkout(session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workoutHistory"] });
    },
  });
}
