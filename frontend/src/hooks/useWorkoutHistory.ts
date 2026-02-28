import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { WorkoutSession } from '../backend';

export function useWorkoutHistory() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<WorkoutSession[]>({
    queryKey: ['workoutHistory'],
    queryFn: async () => {
      if (!actor) return [];
      const history = await actor.getOwnWorkoutHistory();
      // Sort in reverse chronological order
      return history.sort((a, b) => Number(b.date) - Number(a.date));
    },
    enabled: !!actor && !actorFetching,
  });
}
