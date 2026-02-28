import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { PhaseExercise, PhaseId } from '../backend';

export function useGetExercisesForPhase(phaseId: PhaseId | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PhaseExercise[]>({
    queryKey: ['exercises', phaseId?.toString()],
    queryFn: async () => {
      if (!actor || phaseId === null) return [];
      return actor.getExercisesForPhase(phaseId);
    },
    enabled: !!actor && !actorFetching && phaseId !== null,
  });
}
