import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { PhaseId } from '../backend';

export function useDeletePhase() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (phaseId: PhaseId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePhase(phaseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phases'] });
    },
  });
}
