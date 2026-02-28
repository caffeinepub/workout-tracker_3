import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useCreateLocalTemplate } from '@/hooks/useLocalTemplates';
import { TemplateExercise } from '@/utils/localStorageTemplates';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface ExerciseForm {
  name: string;
  sets: string;
  reps: string;
  weight: string;
  durationValue: string;
  durationUnit: 'minutes' | 'seconds';
  notes: string;
}

const defaultExercise = (): ExerciseForm => ({
  name: '',
  sets: '',
  reps: '',
  weight: '',
  durationValue: '',
  durationUnit: 'minutes',
  notes: '',
});

interface Props {
  onCancel: () => void;
  onCreated?: () => void;
}

function safeInt(val: string, fallback = 0): number {
  const n = parseInt(val, 10);
  return isNaN(n) || n < 0 ? fallback : n;
}

export default function TemplateCreateForm({ onCancel, onCreated }: Props) {
  const [templateName, setTemplateName] = useState('');
  const [exercises, setExercises] = useState<ExerciseForm[]>([defaultExercise()]);
  const createTemplate = useCreateLocalTemplate();

  const updateExercise = (index: number, field: keyof ExerciseForm, value: string) => {
    setExercises(prev => prev.map((ex, i) => i === index ? { ...ex, [field]: value } : ex));
  };

  const addExercise = () => setExercises(prev => [...prev, defaultExercise()]);

  const removeExercise = (index: number) => {
    if (exercises.length === 1) return;
    setExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = templateName.trim();
    if (!name) {
      toast.error('Please enter a template name');
      return;
    }

    const validExercises = exercises.filter(ex => ex.name.trim());
    if (validExercises.length === 0) {
      toast.error('Please add at least one exercise with a name');
      return;
    }

    // Map to TemplateExercise shape (plannedSets, plannedReps, plannedWeight, plannedTime)
    const exercisesPayload: TemplateExercise[] = validExercises.map(ex => {
      const durationVal = safeInt(ex.durationValue, 0);
      const plannedTime = ex.durationUnit === 'minutes' ? durationVal * 60 : durationVal;
      return {
        name: ex.name.trim(),
        plannedSets: safeInt(ex.sets, 0),
        plannedReps: safeInt(ex.reps, 0),
        plannedWeight: safeInt(ex.weight, 0),
        plannedTime,
      };
    });

    try {
      await createTemplate.mutateAsync({ name, exercises: exercisesPayload });
      toast.success('Template created!');
      setTemplateName('');
      setExercises([defaultExercise()]);
      onCreated?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create template';
      toast.error(msg);
    }
  };

  const isPending = createTemplate.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="template-name">Template Name</Label>
        <Input
          id="template-name"
          value={templateName}
          onChange={e => setTemplateName(e.target.value)}
          placeholder="e.g. Push Day, Leg Day..."
          disabled={isPending}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Exercises</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addExercise}
            disabled={isPending}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Exercise
          </Button>
        </div>

        {exercises.map((ex, index) => (
          <div key={index} className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Exercise {index + 1}</span>
              {exercises.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => removeExercise(index)}
                  disabled={isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label>Exercise Name</Label>
              <Input
                value={ex.name}
                onChange={e => updateExercise(index, 'name', e.target.value)}
                placeholder="e.g. Bench Press"
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Sets</Label>
                <Input
                  type="number"
                  min="0"
                  value={ex.sets}
                  onChange={e => updateExercise(index, 'sets', e.target.value)}
                  placeholder="0"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label>Reps</Label>
                <Input
                  type="number"
                  min="0"
                  value={ex.reps}
                  onChange={e => updateExercise(index, 'reps', e.target.value)}
                  placeholder="0"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label>Weight</Label>
                <Input
                  type="number"
                  min="0"
                  value={ex.weight}
                  onChange={e => updateExercise(index, 'weight', e.target.value)}
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
                  value={ex.durationValue}
                  onChange={e => updateExercise(index, 'durationValue', e.target.value)}
                  placeholder="0"
                  disabled={isPending}
                  className="flex-1"
                />
                <Select
                  value={ex.durationUnit}
                  onValueChange={val => updateExercise(index, 'durationUnit', val)}
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
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending || !templateName.trim()}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Template'
          )}
        </Button>
      </div>
    </form>
  );
}
