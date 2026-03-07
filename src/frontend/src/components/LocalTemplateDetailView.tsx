import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateLocalTemplate } from "@/hooks/useLocalTemplates";
import type {
  TemplateExercise,
  WorkoutTemplate,
} from "@/utils/localStorageTemplates";
import {
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
  durationUnit: "minutes" | "seconds";
}

const defaultExerciseForm = (): ExerciseForm => ({
  name: "",
  sets: "",
  reps: "",
  weight: "",
  durationValue: "",
  durationUnit: "minutes",
});

function safeInt(val: string, fallback = 0): number {
  const n = Number.parseInt(val, 10);
  return Number.isNaN(n) || n < 0 ? fallback : n;
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

function exerciseToForm(ex: TemplateExercise): ExerciseForm {
  // Convert stored seconds back to display form
  const totalSeconds = ex.plannedTime ?? 0;
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  if (totalSeconds === 0) {
    return {
      name: ex.name,
      sets: ex.plannedSets > 0 ? ex.plannedSets.toString() : "",
      reps: ex.plannedReps > 0 ? ex.plannedReps.toString() : "",
      weight: ex.plannedWeight > 0 ? ex.plannedWeight.toString() : "",
      durationValue: "",
      durationUnit: "minutes",
    };
  }

  // Prefer minutes if evenly divisible, otherwise use seconds
  if (secs === 0 && mins > 0) {
    return {
      name: ex.name,
      sets: ex.plannedSets > 0 ? ex.plannedSets.toString() : "",
      reps: ex.plannedReps > 0 ? ex.plannedReps.toString() : "",
      weight: ex.plannedWeight > 0 ? ex.plannedWeight.toString() : "",
      durationValue: mins.toString(),
      durationUnit: "minutes",
    };
  }

  return {
    name: ex.name,
    sets: ex.plannedSets > 0 ? ex.plannedSets.toString() : "",
    reps: ex.plannedReps > 0 ? ex.plannedReps.toString() : "",
    weight: ex.plannedWeight > 0 ? ex.plannedWeight.toString() : "",
    durationValue: totalSeconds.toString(),
    durationUnit: "seconds",
  };
}

export default function LocalTemplateDetailView({ template, onBack }: Props) {
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [form, setForm] = useState<ExerciseForm>(defaultExerciseForm());

  // Delete state
  const [deleteTargetIndex, setDeleteTargetIndex] = useState<number | null>(
    null,
  );

  // Edit state
  const [editTargetIndex, setEditTargetIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ExerciseForm>(defaultExerciseForm());
  const [editFormError, setEditFormError] = useState<string | null>(null);

  const updateTemplate = useUpdateLocalTemplate();

  const updateField = (field: keyof ExerciseForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateEditField = (field: keyof ExerciseForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    setEditFormError(null);
  };

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Exercise name is required");
      return;
    }

    const durationVal = safeInt(form.durationValue, 0);
    const plannedTime =
      form.durationUnit === "minutes" ? durationVal * 60 : durationVal;

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
      toast.success("Exercise added!");
      setForm(defaultExerciseForm());
      setShowAddExercise(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add exercise";
      toast.error(msg);
    }
  };

  const handleDeleteExercise = async () => {
    if (deleteTargetIndex === null) return;
    const updatedExercises = template.exercises.filter(
      (_, i) => i !== deleteTargetIndex,
    );
    try {
      await updateTemplate.mutateAsync({
        id: template.id,
        updates: { exercises: updatedExercises },
      });
      toast.success("Exercise removed");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to remove exercise";
      toast.error(msg);
    } finally {
      setDeleteTargetIndex(null);
    }
  };

  const openEditDialog = (index: number) => {
    setEditTargetIndex(index);
    setEditForm(exerciseToForm(template.exercises[index]));
    setEditFormError(null);
  };

  const closeEditDialog = () => {
    setEditTargetIndex(null);
    setEditForm(defaultExerciseForm());
    setEditFormError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      setEditFormError("Exercise name is required.");
      return;
    }
    if (editTargetIndex === null) return;

    const durationVal = safeInt(editForm.durationValue, 0);
    const plannedTime =
      editForm.durationUnit === "minutes" ? durationVal * 60 : durationVal;

    const updatedExercise: TemplateExercise = {
      name: editForm.name.trim(),
      plannedSets: safeInt(editForm.sets, 0),
      plannedReps: safeInt(editForm.reps, 0),
      plannedWeight: safeInt(editForm.weight, 0),
      plannedTime,
    };

    const updatedExercises = template.exercises.map((ex, i) =>
      i === editTargetIndex ? updatedExercise : ex,
    );

    try {
      await updateTemplate.mutateAsync({
        id: template.id,
        updates: { exercises: updatedExercises },
      });
      toast.success("Exercise updated");
      closeEditDialog();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update exercise";
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
          <p
            className="text-muted-foreground text-sm py-4 text-center"
            data-ocid="exercise.empty_state"
          >
            No exercises yet. Add your first exercise below.
          </p>
        ) : (
          <div className="space-y-2">
            {template.exercises.map((ex, idx) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: exercises have no stable unique id
                key={idx}
                className="border border-border rounded-lg p-3 bg-muted/20 flex items-start justify-between gap-2"
                data-ocid={`exercise.item.${idx + 1}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{ex.name}</div>
                  <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-3">
                    {ex.plannedSets > 0 && <span>{ex.plannedSets} sets</span>}
                    {ex.plannedReps > 0 && <span>{ex.plannedReps} reps</span>}
                    {ex.plannedWeight > 0 && (
                      <span>{ex.plannedWeight} lbs</span>
                    )}
                    {ex.plannedTime > 0 && (
                      <span>{formatDuration(ex.plannedTime)}</span>
                    )}
                  </div>
                </div>
                {/* Action buttons — always visible */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => openEditDialog(idx)}
                    title="Edit exercise"
                    disabled={isPending}
                    data-ocid={`exercise.edit_button.${idx + 1}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTargetIndex(idx)}
                    title="Remove exercise"
                    disabled={isPending}
                    data-ocid={`exercise.delete_button.${idx + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
          onClick={() => setShowAddExercise((v) => !v)}
        >
          <span className="font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Exercise
          </span>
          {showAddExercise ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showAddExercise && (
          <form
            onSubmit={handleAddExercise}
            className="p-4 border-t border-border space-y-4 bg-muted/10"
          >
            <div className="space-y-2">
              <Label>Exercise Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
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
                  onChange={(e) => updateField("sets", e.target.value)}
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
                  onChange={(e) => updateField("reps", e.target.value)}
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
                  onChange={(e) => updateField("weight", e.target.value)}
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
                  onChange={(e) => updateField("durationValue", e.target.value)}
                  placeholder="0"
                  disabled={isPending}
                  className="flex-1"
                />
                <Select
                  value={form.durationUnit}
                  onValueChange={(val) => updateField("durationUnit", val)}
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
                  "Add Exercise"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* ── Delete exercise confirmation dialog ─────────────────────────────── */}
      <AlertDialog
        open={deleteTargetIndex !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetIndex(null);
        }}
      >
        <AlertDialogContent data-ocid="exercise.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Exercise</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              {deleteTargetIndex !== null &&
              template.exercises[deleteTargetIndex]
                ? `"${template.exercises[deleteTargetIndex].name}"`
                : "this exercise"}{" "}
              from the template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="exercise.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteExercise}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="exercise.delete.confirm_button"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Edit exercise modal ──────────────────────────────────────────────── */}
      <Dialog
        open={editTargetIndex !== null}
        onOpenChange={(open) => {
          if (!open) closeEditDialog();
        }}
      >
        <DialogContent data-ocid="exercise.edit.modal" className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Exercise Name *</Label>
              <Input
                value={editForm.name}
                onChange={(e) => updateEditField("name", e.target.value)}
                placeholder="e.g. Squat"
                disabled={isPending}
              />
              {editFormError && (
                <p className="text-xs text-destructive">{editFormError}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Sets</Label>
                <Input
                  type="number"
                  min="0"
                  value={editForm.sets}
                  onChange={(e) => updateEditField("sets", e.target.value)}
                  placeholder="0"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label>Reps</Label>
                <Input
                  type="number"
                  min="0"
                  value={editForm.reps}
                  onChange={(e) => updateEditField("reps", e.target.value)}
                  placeholder="0"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label>Weight</Label>
                <Input
                  type="number"
                  min="0"
                  value={editForm.weight}
                  onChange={(e) => updateEditField("weight", e.target.value)}
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
                  value={editForm.durationValue}
                  onChange={(e) =>
                    updateEditField("durationValue", e.target.value)
                  }
                  placeholder="0"
                  disabled={isPending}
                  className="flex-1"
                />
                <Select
                  value={editForm.durationUnit}
                  onValueChange={(val) => updateEditField("durationUnit", val)}
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

            <div className="flex gap-3 justify-end pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={closeEditDialog}
                disabled={isPending}
                data-ocid="exercise.edit.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || !editForm.name.trim()}
                data-ocid="exercise.edit.save_button"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
