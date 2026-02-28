import { useState } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateLocalTemplate } from '../hooks/useLocalTemplates';
import { TemplateExercise } from '../utils/localStorageTemplates';
import { toast } from 'sonner';

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const emptyExercise = (): TemplateExercise => ({
  name: '',
  plannedSets: 3,
  plannedReps: 10,
  plannedWeight: 0,
  plannedTime: 0,
});

export default function TemplateCreateForm({ onSuccess, onCancel }: Props) {
  const [templateName, setTemplateName] = useState('');
  const [exercises, setExercises] = useState<TemplateExercise[]>([emptyExercise()]);
  const createMutation = useCreateLocalTemplate();

  const updateExercise = (
    index: number,
    field: keyof TemplateExercise,
    value: string | number
  ) => {
    setExercises((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addExercise = () => setExercises((prev) => [...prev, emptyExercise()]);

  const removeExercise = (index: number) =>
    setExercises((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    const validExercises = exercises.filter((ex) => ex.name.trim());
    if (validExercises.length === 0) {
      toast.error('Please add at least one exercise with a name');
      return;
    }
    createMutation.mutate(
      { name: templateName.trim(), exercises: validExercises },
      {
        onSuccess: () => {
          toast.success('Template created and log generated!');
          onSuccess?.();
        },
        onError: (err) => {
          toast.error(`Failed to create template: ${err.message}`);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="template-name">Template Name</Label>
        <Input
          id="template-name"
          placeholder="e.g. Push Day, Leg Day..."
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Exercises</Label>
          <Button type="button" variant="outline" size="sm" onClick={addExercise}>
            <Plus className="h-4 w-4 mr-1" />
            Add Exercise
          </Button>
        </div>

        {exercises.map((ex, idx) => (
          <div
            key={idx}
            className="border border-border rounded-xl p-4 space-y-3 bg-muted/30"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-muted-foreground">
                Exercise {idx + 1}
              </span>
              {exercises.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => removeExercise(idx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div>
              <Label className="text-xs">Exercise Name</Label>
              <Input
                placeholder="e.g. Bench Press"
                value={ex.name}
                onChange={(e) => updateExercise(idx, 'name', e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">Sets</Label>
                <Input
                  type="number"
                  min={0}
                  value={ex.plannedSets}
                  onChange={(e) =>
                    updateExercise(idx, 'plannedSets', Number(e.target.value))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Reps</Label>
                <Input
                  type="number"
                  min={0}
                  value={ex.plannedReps}
                  onChange={(e) =>
                    updateExercise(idx, 'plannedReps', Number(e.target.value))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Weight (lbs)</Label>
                <Input
                  type="number"
                  min={0}
                  value={ex.plannedWeight}
                  onChange={(e) =>
                    updateExercise(idx, 'plannedWeight', Number(e.target.value))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Time (min)</Label>
                <Input
                  type="number"
                  min={0}
                  value={ex.plannedTime}
                  onChange={(e) =>
                    updateExercise(idx, 'plannedTime', Number(e.target.value))
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-end pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
