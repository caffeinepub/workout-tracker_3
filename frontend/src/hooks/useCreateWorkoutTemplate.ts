import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { WorkoutTemplateView } from '../backend';

export function useCreateWorkoutTemplate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: WorkoutTemplateView) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.createWorkoutTemplate(template);
      if (!result) {
        throw new Error('Failed to create template. Please try again.');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allWorkoutTemplates'] });
    },
  });
}
