import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DurationUnit } from "../backend";
import type { Exercise, UserWorkoutTemplateView } from "../backend";
import type {
  TemplateExercise,
  WorkoutTemplate,
} from "../utils/localStorageTemplates";
import { useActor } from "./useActor";
import { useAuth } from "./useAuth";

export const BACKEND_TEMPLATES_KEY = ["backendWorkoutTemplates"];

function mapBackendExercise(ex: Exercise): TemplateExercise {
  const durationSeconds =
    ex.duration.unit === DurationUnit.minutes
      ? Number(ex.duration.value) * 60
      : Number(ex.duration.value);
  return {
    name: ex.name,
    plannedSets: Number(ex.sets),
    plannedReps: Number(ex.reps),
    plannedWeight: Number(ex.weight),
    plannedTime: durationSeconds,
    notes: ex.notes,
  };
}

function mapToBackendExercise(ex: TemplateExercise): Exercise {
  const seconds = ex.plannedTime ?? 0;
  const useMins = seconds > 0 && seconds % 60 === 0;
  return {
    name: ex.name,
    sets: BigInt(ex.plannedSets),
    reps: BigInt(ex.plannedReps),
    weight: BigInt(ex.plannedWeight),
    duration: useMins
      ? { value: BigInt(seconds / 60), unit: DurationUnit.minutes }
      : { value: BigInt(seconds), unit: DurationUnit.seconds },
    notes: ex.notes ?? "",
  };
}

export function mapBackendTemplate(
  view: UserWorkoutTemplateView,
): WorkoutTemplate {
  return {
    id: view.id.toString(),
    name: view.template.name,
    exercises: view.template.exercises.map(mapBackendExercise),
    createdAt: new Date().toISOString(),
  };
}

// Ensure user is registered in the canister's access control.
// _initializeAccessControlWithSecret is idempotent: no-op if already registered.
// This fixes "not authenticated" errors after canister redeployment (state reset).
async function ensureRegistered(actor: {
  _initializeAccessControlWithSecret: (s: string) => Promise<void>;
}): Promise<void> {
  try {
    await actor._initializeAccessControlWithSecret("");
  } catch {
    // Already registered or transient error — proceed anyway
  }
}

export function useBackendTemplates() {
  const { actor, isFetching: actorFetching } = useActor();
  const { isAuthenticated } = useAuth();

  return useQuery<WorkoutTemplate[]>({
    queryKey: BACKEND_TEMPLATES_KEY,
    queryFn: async () => {
      if (!actor) return [];
      try {
        await ensureRegistered(actor as Parameters<typeof ensureRegistered>[0]);
        const views = await actor.getAllWorkoutTemplates();
        return views.map(mapBackendTemplate);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });
}

export function useCreateBackendTemplate() {
  const { actor } = useActor();
  const { identity } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      exercises,
    }: {
      name: string;
      exercises: TemplateExercise[];
    }) => {
      if (!actor || !identity) throw new Error("Not authenticated");
      await ensureRegistered(actor as Parameters<typeof ensureRegistered>[0]);
      const ok = await actor.createWorkoutTemplate({
        name,
        exercises: exercises.map(mapToBackendExercise),
        days: [],
      });
      if (!ok) throw new Error("Backend did not confirm template creation");
      return ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BACKEND_TEMPLATES_KEY });
    },
  });
}

export function useUpdateBackendTemplateName() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      if (!actor) throw new Error("Not authenticated");
      await ensureRegistered(actor as Parameters<typeof ensureRegistered>[0]);
      await actor.updateTemplateName(BigInt(id), name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BACKEND_TEMPLATES_KEY });
    },
  });
}

export function useDeleteBackendTemplate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not authenticated");
      await ensureRegistered(actor as Parameters<typeof ensureRegistered>[0]);
      await actor.deleteTemplate(BigInt(id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BACKEND_TEMPLATES_KEY });
    },
  });
}

export function useRebuildBackendTemplateExercises() {
  const { actor } = useActor();
  const { identity } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      exercises,
    }: {
      id: string;
      name: string;
      exercises: TemplateExercise[];
    }): Promise<{ newId: string }> => {
      if (!actor || !identity) throw new Error("Not authenticated");
      await ensureRegistered(actor as Parameters<typeof ensureRegistered>[0]);

      await actor.deleteTemplate(BigInt(id));

      await actor.createWorkoutTemplate({
        name,
        exercises: exercises.map(mapToBackendExercise),
        days: [],
      });

      const views = await actor.getAllWorkoutTemplates();
      const newest = views.find((v) => v.template.name === name);
      const newId = newest ? newest.id.toString() : id;

      return { newId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BACKEND_TEMPLATES_KEY });
    },
  });
}
