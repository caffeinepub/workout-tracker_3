import { useState } from 'react';
import { UserWorkoutTemplateView } from '../backend';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Dumbbell, Calendar, ClipboardList, Plus, X, Loader2 } from 'lucide-react';
import { useAddExerciseToTemplate } from '../hooks/useAddExerciseToTemplate';
import { toast } from 'sonner';

interface TemplateDetailViewProps {
  template: UserWorkoutTemplateView;
  onBack: () => void;
  onTemplateUpdated?: (updatedTemplates: UserWorkoutTemplateView[]) => void;
}

interface ExerciseFormState {
  name: string;
  sets: string;
  reps: string;
  weight: string;
  duration: string;
  notes: string;
}

const defaultFormState: ExerciseFormState = {
  name: '',
  sets: '',
  reps: '',
  weight: '',
  duration: '',
  notes: '',
};

function formatDay(day: string): string {
  return day.charAt(0).toUpperCase() + day.slice(1);
}

export default function TemplateDetailView({ template, onBack }: TemplateDetailViewProps) {
  const { name, exercises, days } = template.template;
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<ExerciseFormState>(defaultFormState);
  const [formError, setFormError] = useState<string | null>(null);

  const addExerciseMutation = useAddExerciseToTemplate();

  function handleChange(field: keyof ExerciseFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Exercise name is required.');
      return;
    }

    try {
      await addExerciseMutation.mutateAsync({
        templateId: template.id,
        exercise: {
          name: form.name.trim(),
          sets: BigInt(form.sets ? parseInt(form.sets, 10) : 0),
          reps: BigInt(form.reps ? parseInt(form.reps, 10) : 0),
          weight: BigInt(form.weight ? parseInt(form.weight, 10) : 0),
          duration: BigInt(form.duration ? parseInt(form.duration, 10) : 0),
          notes: form.notes.trim(),
        },
      });
      toast.success(`"${form.name.trim()}" added to template!`);
      setForm(defaultFormState);
      setShowAddForm(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add exercise.';
      toast.error(message);
    }
  }

  function handleCancel() {
    setForm(defaultFormState);
    setFormError(null);
    setShowAddForm(false);
  }

  return (
    <div className="space-y-6">
      {/* Back button + title */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
          <p className="text-sm text-muted-foreground">Workout Template</p>
        </div>
      </div>

      {/* Days badges */}
      {days.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              Scheduled Days
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 pt-0">
            {days.map((day) => (
              <Badge key={day} variant="secondary" className="capitalize">
                {formatDay(day)}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Exercises */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-orange-500" />
                Exercises
              </CardTitle>
              <CardDescription className="mt-1">
                {exercises.length === 0
                  ? 'No exercises have been added to this template yet.'
                  : `${exercises.length} exercise${exercises.length !== 1 ? 's' : ''} in this template`}
              </CardDescription>
            </div>
            {!showAddForm && (
              <Button
                size="sm"
                onClick={() => setShowAddForm(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Exercise
              </Button>
            )}
          </div>
        </CardHeader>

        {exercises.length > 0 && (
          <CardContent className="pt-0 space-y-3">
            {exercises.map((exercise, index) => (
              <div key={index}>
                {index > 0 && <Separator className="mb-3" />}
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-orange-100 dark:bg-orange-900/30 p-2 mt-0.5 shrink-0">
                    <Dumbbell className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base">{exercise.name}</p>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {Number(exercise.sets) > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {exercise.sets.toString()} sets
                        </Badge>
                      )}
                      {Number(exercise.reps) > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {exercise.reps.toString()} reps
                        </Badge>
                      )}
                      {Number(exercise.weight) > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {exercise.weight.toString()} kg
                        </Badge>
                      )}
                      {Number(exercise.duration) > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {exercise.duration.toString()} min
                        </Badge>
                      )}
                    </div>
                    {exercise.notes && (
                      <p className="text-sm text-muted-foreground mt-1.5 italic">
                        {exercise.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        )}

        {exercises.length === 0 && !showAddForm && (
          <CardContent className="pt-0">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-4 mb-3">
                <Dumbbell className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                This template has no exercises yet.
              </p>
            </div>
          </CardContent>
        )}

        {/* Add Exercise Form */}
        {showAddForm && (
          <CardContent className="pt-0">
            {exercises.length > 0 && <Separator className="mb-4" />}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">New Exercise</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  className="h-7 w-7"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Exercise Name */}
              <div className="space-y-1.5">
                <Label htmlFor="exercise-name">Exercise Name *</Label>
                <Input
                  id="exercise-name"
                  placeholder="e.g. Bench Press"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  disabled={addExerciseMutation.isPending}
                />
              </div>

              {/* Sets / Reps / Weight / Duration */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="space-y-1.5">
                  <Label htmlFor="exercise-sets">Sets</Label>
                  <Input
                    id="exercise-sets"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.sets}
                    onChange={(e) => handleChange('sets', e.target.value)}
                    disabled={addExerciseMutation.isPending}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="exercise-reps">Reps</Label>
                  <Input
                    id="exercise-reps"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.reps}
                    onChange={(e) => handleChange('reps', e.target.value)}
                    disabled={addExerciseMutation.isPending}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="exercise-weight">Weight (kg)</Label>
                  <Input
                    id="exercise-weight"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    disabled={addExerciseMutation.isPending}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="exercise-duration">Duration (min)</Label>
                  <Input
                    id="exercise-duration"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.duration}
                    onChange={(e) => handleChange('duration', e.target.value)}
                    disabled={addExerciseMutation.isPending}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="exercise-notes">Notes</Label>
                <Textarea
                  id="exercise-notes"
                  placeholder="Optional notes about this exercise..."
                  value={form.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  disabled={addExerciseMutation.isPending}
                  rows={2}
                />
              </div>

              {/* Validation error */}
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button
                  type="submit"
                  disabled={addExerciseMutation.isPending}
                  className="bg-orange-500 hover:bg-orange-600 text-white flex-1"
                >
                  {addExerciseMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding…
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Exercise
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={addExerciseMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Back button at bottom */}
      <Button variant="outline" onClick={onBack} className="w-full">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Templates
      </Button>
    </div>
  );
}
