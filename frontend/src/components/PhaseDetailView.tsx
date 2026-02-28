import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Loader2, Dumbbell, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetExercisesForPhase } from '../hooks/useGetExercisesForPhase';
import { useAddExerciseToPhase } from '../hooks/useAddExerciseToPhase';
import { useRemoveExercise } from '../hooks/useRemoveExercise';
import ExerciseLogView from './ExerciseLogView';
import { PhaseId, ExerciseId } from '../backend';
import { toast } from 'sonner';

interface PhaseDetailViewProps {
  phaseId: PhaseId;
  phaseName: string;
  onBack: () => void;
}

export default function PhaseDetailView({ phaseId, phaseName, onBack }: PhaseDetailViewProps) {
  const { data: exercises, isLoading, isError } = useGetExercisesForPhase(phaseId);
  const addExercise = useAddExerciseToPhase();
  const removeExercise = useRemoveExercise();

  const [newExerciseName, setNewExerciseName] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<{ id: ExerciseId; name: string } | null>(null);

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newExerciseName.trim();
    if (!trimmed) return;

    try {
      await addExercise.mutateAsync({ phaseId, name: trimmed });
      setNewExerciseName('');
      toast.success(`"${trimmed}" added to phase.`);
    } catch {
      toast.error('Failed to add exercise. Please try again.');
    }
  };

  const handleRemoveExercise = async (exerciseId: ExerciseId, exerciseName: string) => {
    try {
      await removeExercise.mutateAsync({ exerciseId, phaseId });
      toast.success(`"${exerciseName}" removed.`);
    } catch {
      toast.error('Failed to remove exercise. Please try again.');
    }
  };

  if (selectedExercise) {
    return (
      <ExerciseLogView
        exerciseId={selectedExercise.id}
        exerciseName={selectedExercise.name}
        onBack={() => setSelectedExercise(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold">{phaseName}</h2>
          <p className="text-xs text-muted-foreground">
            {exercises ? `${exercises.length} exercise${exercises.length !== 1 ? 's' : ''}` : ''}
          </p>
        </div>
      </div>

      {/* Add Exercise Form */}
      <form onSubmit={handleAddExercise} className="flex gap-2">
        <Input
          placeholder="Exercise name (e.g. Bench Press)"
          value={newExerciseName}
          onChange={(e) => setNewExerciseName(e.target.value)}
          className="flex-1"
          disabled={addExercise.isPending}
        />
        <Button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
          disabled={addExercise.isPending || !newExerciseName.trim()}
        >
          {addExercise.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          <span className="ml-1 hidden sm:inline">Add</span>
        </Button>
      </form>

      {/* Exercise List */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive text-center py-4">
          Failed to load exercises. Please try again.
        </p>
      )}

      {!isLoading && !isError && exercises && exercises.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No exercises yet</p>
          <p className="text-xs mt-1">Add your first exercise above to get started.</p>
        </div>
      )}

      {!isLoading && !isError && exercises && exercises.length > 0 && (
        <div className="space-y-2">
          {exercises.map((exercise) => (
            <Card
              key={exercise.id.toString()}
              className="border border-border hover:border-orange-300 dark:hover:border-orange-700 transition-colors cursor-pointer group"
              onClick={() => setSelectedExercise({ id: exercise.id, name: exercise.name })}
            >
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-1.5 rounded-lg">
                    <Dumbbell className="h-4 w-4 text-orange-500" />
                  </div>
                  <span className="font-semibold text-sm">{exercise.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveExercise(exercise.id, exercise.name);
                    }}
                    disabled={removeExercise.isPending}
                  >
                    {removeExercise.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
