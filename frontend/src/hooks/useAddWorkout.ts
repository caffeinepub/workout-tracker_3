import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { WorkoutSession } from '../backend';

export function useAddWorkout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session: WorkoutSession) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addWorkout(session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutHistory'] });
    },
  });
}
