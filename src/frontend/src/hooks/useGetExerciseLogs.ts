import { useQuery } from "@tanstack/react-query";
import type { ExerciseId, PhaseExerciseLog } from "../backend";
import { useActor } from "./useActor";

export function useGetExerciseLogs(exerciseId: ExerciseId | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PhaseExerciseLog[]>({
    queryKey: ["exerciseLogs", exerciseId?.toString()],
    queryFn: async () => {
      if (!actor || exerciseId === null) return [];
      const logs = await actor.getExerciseLogs(exerciseId);
      // Sort by date descending
      return [...logs].sort((a, b) => Number(b.date) - Number(a.date));
    },
    enabled: !!actor && !actorFetching && exerciseId !== null,
  });
}
