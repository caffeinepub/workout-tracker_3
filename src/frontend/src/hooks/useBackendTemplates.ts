import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DurationUnit, UserRole } from "../backend";
import type { Exercise, UserWorkoutTemplateView } from "../backend";
import type {
  TemplateExercise,
  WorkoutTemplate,
} from "../utils/localStorageTemplates";
import { useActor } from "./useActor";
import { useAuth } from "./useAuth";

export const BACKEND_TEMPLATES_KEY = ["backendWorkoutTemplates"];

// ── Mapping helpers ──────────────────────────────────────────────────────────

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

// ── Ensure role is assigned ───────────────────────────────────────────────────

async function ensureUserRole(
  actor: {
    getCallerUserRole: () => Promise<UserRole>;
    assignCallerUserRole: (
      p: import("@icp-sdk/core/principal").Principal,
      r: UserRole,
    ) => Promise<void>;
  },
  principal: import("@icp-sdk/core/principal").Principal,
): Promise<void> {
  try {
    const role = await actor.getCallerUserRole();
    if (role === UserRole.guest) {
      await actor.assignCallerUserRole(principal, UserRole.user);
    }
  } catch {
    // If role check fails, try to assign role anyway
    try {
      await actor.assignCallerUserRole(principal, UserRole.user);
    } catch {
      // best effort — might already be assigned
    }
  }
}

// ── Hooks ────────────────────────────────────────────────────────────────────

export function useBackendTemplates() {
  const { actor, isFetching: actorFetching } = useActor();
  const { isAuthenticated, identity } = useAuth();

  return useQuery<WorkoutTemplate[]>({
    queryKey: BACKEND_TEMPLATES_KEY,
    queryFn: async () => {
      if (!actor || !identity) return [];
      try {
        await ensureUserRole(
          actor as Parameters<typeof ensureUserRole>[0],
          identity.getPrincipal(),
        );
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
      await ensureUserRole(
        actor as Parameters<typeof ensureUserRole>[0],
        identity.getPrincipal(),
      );
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
    mutationFn: async ({
      id,
      name,
    }: {
      id: string;
      name: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
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
      await actor.deleteTemplate(BigInt(id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BACKEND_TEMPLATES_KEY });
    },
  });
}

/**
 * Rebuilds the exercise list for a template:
 * deletes the old template and creates a new one with the updated exercises.
 * Returns the new template id.
 */
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

      // Delete the old template
      await actor.deleteTemplate(BigInt(id));

      // Recreate with updated exercises
      await actor.createWorkoutTemplate({
        name,
        exercises: exercises.map(mapToBackendExercise),
        days: [],
      });

      // Find the new template ID (most recently created)
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
