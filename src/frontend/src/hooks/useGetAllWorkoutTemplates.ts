import { useQuery } from "@tanstack/react-query";
import type { UserWorkoutTemplateView } from "../backend";
import { useActor } from "./useActor";

export function useGetAllWorkoutTemplates() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserWorkoutTemplateView[]>({
    queryKey: ["allWorkoutTemplates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllWorkoutTemplates();
    },
    enabled: !!actor && !actorFetching,
  });
}
