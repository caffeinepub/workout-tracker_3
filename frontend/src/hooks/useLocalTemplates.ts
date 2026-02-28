import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  WorkoutTemplate,
  TemplateExercise,
} from '../utils/localStorageTemplates';

const QUERY_KEY = ['localWorkoutTemplates'];

export function useLocalTemplates() {
  return useQuery<WorkoutTemplate[]>({
    queryKey: QUERY_KEY,
    queryFn: () => getAllTemplates(),
  });
}

export function useCreateLocalTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      exercises,
    }: {
      name: string;
      exercises: TemplateExercise[];
    }) => {
      try {
        const template = createTemplate(name, exercises);
        return Promise.resolve(template);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unexpected error during template creation';
        return Promise.reject(new Error(message));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['localWorkoutLogs'] });
    },
  });
}

export function useUpdateLocalTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Pick<WorkoutTemplate, 'name' | 'exercises'>>;
    }) => {
      try {
        const result = updateTemplate(id, updates);
        if (!result) throw new Error('Template not found');
        return Promise.resolve(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unexpected error updating template';
        return Promise.reject(new Error(message));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteLocalTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      try {
        const ok = deleteTemplate(id);
        if (!ok) throw new Error('Template not found');
        return Promise.resolve(id);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unexpected error deleting template';
        return Promise.reject(new Error(message));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
