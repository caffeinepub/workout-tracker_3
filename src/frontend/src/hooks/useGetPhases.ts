import { useQuery } from "@tanstack/react-query";
import type { Phase } from "../backend";
import { useActor } from "./useActor";

export function useGetPhases() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Phase[]>({
    queryKey: ["phases"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPhases();
    },
    enabled: !!actor && !actorFetching,
  });
}
