import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Phase } from '../backend';

export function useGetPhases() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Phase[]>({
    queryKey: ['phases'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPhases();
    },
    enabled: !!actor && !actorFetching,
  });
}
