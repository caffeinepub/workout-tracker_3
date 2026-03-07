import { useQuery } from "@tanstack/react-query";
import type { PhaseExercise, PhaseId } from "../backend";
import { useActor } from "./useActor";

export function useGetExercisesForPhase(phaseId: PhaseId | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PhaseExercise[]>({
    queryKey: ["exercises", phaseId?.toString()],
    queryFn: async () => {
      if (!actor || phaseId === null) return [];
      return actor.getExercisesForPhase(phaseId);
    },
    enabled: !!actor && !actorFetching && phaseId !== null,
  });
}
