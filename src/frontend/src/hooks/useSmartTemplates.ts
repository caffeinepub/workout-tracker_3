/**
 * Smart template hooks: route to backend when authenticated,
 * otherwise fall back to localStorage.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DurationUnit } from "../backend";
import type {
  TemplateExercise,
  WorkoutTemplate,
} from "../utils/localStorageTemplates";
import { useActor } from "./useActor";
import { useAuth } from "./useAuth";
import {
  BACKEND_TEMPLATES_KEY,
  useBackendTemplates,
  useCreateBackendTemplate,
  useDeleteBackendTemplate,
  useRebuildBackendTemplateExercises,
  useUpdateBackendTemplateName,
} from "./useBackendTemplates";
import {
  useCreateLocalTemplate,
  useDeleteLocalTemplate,
  useLocalTemplates,
  useUpdateLocalTemplate,
} from "./useLocalTemplates";

export function useSmartTemplates() {
  const { isAuthenticated } = useAuth();
  const local = useLocalTemplates();
  const backend = useBackendTemplates();
  return isAuthenticated ? backend : local;
}

export function useSmartCreateTemplate() {
  const { isAuthenticated } = useAuth();
  const localCreate = useCreateLocalTemplate();
  const backendCreate = useCreateBackendTemplate();
  return isAuthenticated ? backendCreate : localCreate;
}

export function useSmartUpdateTemplateName() {
  const { isAuthenticated } = useAuth();
  const localUpdate = useUpdateLocalTemplate();
  const backendUpdate = useUpdateBackendTemplateName();

  if (isAuthenticated) {
    return {
      ...backendUpdate,
      mutateAsync: (args: { id: string; updates: { name: string } }) =>
        backendUpdate.mutateAsync({ id: args.id, name: args.updates.name }),
    };
  }

  return localUpdate;
}

export function useSmartDeleteTemplate() {
  const { isAuthenticated } = useAuth();
  const localDelete = useDeleteLocalTemplate();
  const backendDelete = useDeleteBackendTemplate();
  return isAuthenticated ? backendDelete : localDelete;
}

/**
 * Add a single exercise to a template.
 * Local: updates the whole exercises array.
 * Backend: uses addExerciseToTemplate.
 */
export function useSmartAddExerciseToTemplate() {
  const { isAuthenticated } = useAuth();
  const { actor } = useActor();
  const localUpdate = useUpdateLocalTemplate();
  const queryClient = useQueryClient();

  // Always create both mutations to satisfy React's rules of hooks.
  const backendMutation = useMutation({
    mutationFn: async (args: {
      templateId: string;
      template: WorkoutTemplate;
      exercise: TemplateExercise;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      const seconds = args.exercise.plannedTime ?? 0;
      const useMins = seconds > 0 && seconds % 60 === 0;
      const backendExercise = {
        name: args.exercise.name,
        sets: BigInt(args.exercise.plannedSets),
        reps: BigInt(args.exercise.plannedReps),
        weight: BigInt(args.exercise.plannedWeight),
        duration: useMins
          ? { value: BigInt(seconds / 60), unit: DurationUnit.minutes }
          : { value: BigInt(seconds), unit: DurationUnit.seconds },
        notes: args.exercise.notes ?? "",
      };
      await actor.addExerciseToTemplate(
        BigInt(args.templateId),
        backendExercise,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BACKEND_TEMPLATES_KEY });
    },
  });

  if (isAuthenticated) {
    return backendMutation;
  }

  return {
    ...localUpdate,
    isPending: localUpdate.isPending,
    mutateAsync: async (args: {
      templateId: string;
      template: WorkoutTemplate;
      exercise: TemplateExercise;
    }) => {
      return localUpdate.mutateAsync({
        id: args.templateId,
        updates: { exercises: [...args.template.exercises, args.exercise] },
      });
    },
  };
}

/**
 * Update the exercise list for a template (supports edit, delete, reorder).
 * Local: updates exercises array in localStorage.
 * Backend: deletes and recreates the template (returns new id).
 */
export function useSmartUpdateTemplateExercises() {
  const { isAuthenticated } = useAuth();
  const localUpdate = useUpdateLocalTemplate();
  const backendRebuild = useRebuildBackendTemplateExercises();

  if (isAuthenticated) {
    return {
      ...backendRebuild,
      mutateAsync: async (args: {
        id: string;
        name: string;
        exercises: TemplateExercise[];
      }) => backendRebuild.mutateAsync(args),
    };
  }

  return {
    ...localUpdate,
    mutateAsync: async (args: {
      id: string;
      name: string;
      exercises: TemplateExercise[];
    }): Promise<{ newId: string }> => {
      await localUpdate.mutateAsync({
        id: args.id,
        updates: { exercises: args.exercises },
      });
      return { newId: args.id };
    },
  };
}
