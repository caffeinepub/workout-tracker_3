import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserWorkoutTemplateView } from '../backend';

export function useGetAllWorkoutTemplates() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserWorkoutTemplateView[]>({
    queryKey: ['allWorkoutTemplates'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllWorkoutTemplates();
    },
    enabled: !!actor && !actorFetching,
  });
}
