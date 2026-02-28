import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { WorkoutTemplate, TemplateExercise } from '@/utils/localStorageTemplates';
import { useUpdateLocalTemplate } from '@/hooks/useLocalTemplates';
import { Loader2, Plus, ChevronDown, ChevronUp, Dumbbell } from 'lucide-react';

interface Props {
  template: WorkoutTemplate;
  onBack: () => void;
}

interface ExerciseForm {
  name: string;
  sets: string;
  reps: string;
  weight: string;
  durationValue: string;
  durationUnit: 'minutes' | 'seconds';
}

const defaultExerciseForm = (): ExerciseForm => ({
  name: '',
  sets: '',
  reps: '',
  weight: '',
  durationValue: '',
  durationUnit: 'minutes',
});

function safeInt(val: string, fallback = 0): number {
  const n = parseInt(val, 10);
  return isNaN(n) || n < 0 ? fallback : n;
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

export default function LocalTemplateDetailView({ template, onBack }: Props) {
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [form, setForm] = useState<ExerciseForm>(defaultExerciseForm());
  const updateTemplate = useUpdateLocalTemplate();

  const updateField = (field: keyof ExerciseForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Exercise name is required');
      return;
    }

    const durationVal = safeInt(form.durationValue, 0);
    const plannedTime = form.durationUnit === 'minutes' ? durationVal * 60 : durationVal;

    const newExercise: TemplateExercise = {
      name: form.name.trim(),
      plannedSets: safeInt(form.sets, 0),
      plannedReps: safeInt(form.reps, 0),
      plannedWeight: safeInt(form.weight, 0),
      plannedTime,
    };

    try {
      await updateTemplate.mutateAsync({
        id: template.id,
        updates: { exercises: [...template.exercises, newExercise] },
      });
      toast.success('Exercise added!');
      setForm(defaultExerciseForm());
      setShowAddExercise(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add exercise';
      toast.error(msg);
    }
  };

  const isPending = updateTemplate.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <h2 className="text-xl font-bold">{template.name}</h2>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-primary" />
          Exercises ({template.exercises.length})
        </h3>

        {template.exercises.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">
            No exercises yet. Add your first exercise below.
          </p>
        ) : (
          <div className="space-y-2">
            {template.exercises.map((ex, idx) => (
              <div
                key={idx}
                className="border border-border rounded-lg p-3 bg-muted/20"
              >
                <div className="font-medium">{ex.name}</div>
                <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-3">
                  {ex.plannedSets > 0 && <span>{ex.plannedSets} sets</span>}
                  {ex.plannedReps > 0 && <span>{ex.plannedReps} reps</span>}
                  {ex.plannedWeight > 0 && <span>{ex.plannedWeight} lbs</span>}
                  {ex.plannedTime > 0 && <span>{formatDuration(ex.plannedTime)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
          onClick={() => setShowAddExercise(v => !v)}
        >
          <span className="font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Exercise
          </span>
          {showAddExercise ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAddExercise && (
          <form onSubmit={handleAddExercise} className="p-4 border-t border-border space-y-4 bg-muted/10">
            <div className="space-y-2">
              <Label>Exercise Name *</Label>
              <Input
                value={form.name}
                onChange={e => updateField('name', e.target.value)}
                placeholder="e.g. Squat"
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Sets</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.sets}
                  onChange={e => updateField('sets', e.target.value)}
                  placeholder="0"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label>Reps</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.reps}
                  onChange={e => updateField('reps', e.target.value)}
                  placeholder="0"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label>Weight</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.weight}
                  onChange={e => updateField('weight', e.target.value)}
                  placeholder="0"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  value={form.durationValue}
                  onChange={e => updateField('durationValue', e.target.value)}
                  placeholder="0"
                  disabled={isPending}
                  className="flex-1"
                />
                <Select
                  value={form.durationUnit}
                  onValueChange={val => updateField('durationUnit', val)}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">minutes</SelectItem>
                    <SelectItem value="seconds">seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddExercise(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !form.name.trim()}>
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Exercise'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
