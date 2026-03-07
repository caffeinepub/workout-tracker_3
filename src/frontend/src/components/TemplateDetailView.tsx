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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  Dumbbell,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Exercise, UserWorkoutTemplateView } from "../backend";
import { DurationUnit } from "../backend";
import { useAddExerciseToTemplate } from "../hooks/useAddExerciseToTemplate";
import { useUpdateTemplateExercises } from "../hooks/useUpdateTemplateExercises";

interface TemplateDetailViewProps {
  template: UserWorkoutTemplateView;
  onBack: () => void;
}

interface ExerciseFormState {
  name: string;
  sets: string;
  reps: string;
  weight: string;
  durationValue: string;
  durationUnit: "minutes" | "seconds";
  notes: string;
}

const defaultFormState: ExerciseFormState = {
  name: "",
  sets: "",
  reps: "",
  weight: "",
  durationValue: "",
  durationUnit: "minutes",
  notes: "",
};

function formatDay(day: string): string {
  return day.charAt(0).toUpperCase() + day.slice(1);
}

function formatDuration(duration: { value: bigint; unit: string }): string {
  const val = Number(duration.value);
  if (val === 0) return "";
  if (duration.unit === "seconds") return `${val}s`;
  if (duration.unit === "minutes") return `${val}m`;
  return `${val}`;
}

function safeInt(val: string, fallback = 0): number {
  const n = Number.parseInt(val, 10);
  return Number.isNaN(n) || n < 0 ? fallback : n;
}

function exerciseToFormState(exercise: Exercise): ExerciseFormState {
  const durVal = Number(exercise.duration.value);
  return {
    name: exercise.name,
    sets: Number(exercise.sets) > 0 ? exercise.sets.toString() : "",
    reps: Number(exercise.reps) > 0 ? exercise.reps.toString() : "",
    weight: Number(exercise.weight) > 0 ? exercise.weight.toString() : "",
    durationValue: durVal > 0 ? durVal.toString() : "",
    durationUnit:
      exercise.duration.unit === DurationUnit.seconds ? "seconds" : "minutes",
    notes: exercise.notes ?? "",
  };
}

export default function TemplateDetailView({
  template,
  onBack,
}: TemplateDetailViewProps) {
  const { name, exercises, days } = template.template;
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<ExerciseFormState>(defaultFormState);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete exercise state
  const [deleteTargetIndex, setDeleteTargetIndex] = useState<number | null>(
    null,
  );

  // Edit exercise state
  const [editTargetIndex, setEditTargetIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ExerciseFormState>(defaultFormState);
  const [editFormError, setEditFormError] = useState<string | null>(null);

  const addExerciseMutation = useAddExerciseToTemplate();
  const updateExercisesMutation = useUpdateTemplateExercises();

  function handleChange(field: keyof ExerciseFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  }

  function handleEditChange(field: keyof ExerciseFormState, value: string) {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    setEditFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError("Exercise name is required.");
      return;
    }

    const durationVal = safeInt(form.durationValue, 0);

    const exercise: Exercise = {
      name: form.name.trim(),
      sets: BigInt(safeInt(form.sets, 0)),
      reps: BigInt(safeInt(form.reps, 0)),
      weight: BigInt(safeInt(form.weight, 0)),
      duration: {
        value: BigInt(durationVal),
        unit:
          form.durationUnit === "minutes"
            ? DurationUnit.minutes
            : DurationUnit.seconds,
      },
      notes: form.notes.trim(),
    };

    try {
      await addExerciseMutation.mutateAsync({
        templateId: template.id,
        exercise,
      });
      toast.success(`"${form.name.trim()}" added to template!`);
      setForm(defaultFormState);
      setShowAddForm(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to add exercise.";
      toast.error(message);
    }
  }

  function handleCancel() {
    setForm(defaultFormState);
    setFormError(null);
    setShowAddForm(false);
  }

  // ── Delete exercise ──────────────────────────────────────────────────────────
  async function handleDeleteExercise() {
    if (deleteTargetIndex === null) return;
    const updatedExercises = exercises.filter(
      (_, i) => i !== deleteTargetIndex,
    );
    try {
      await updateExercisesMutation.mutateAsync({
        template,
        exercises: updatedExercises,
      });
      toast.success("Exercise removed");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to remove exercise";
      toast.error(message);
    } finally {
      setDeleteTargetIndex(null);
    }
  }

  // ── Edit exercise ────────────────────────────────────────────────────────────
  function openEditDialog(index: number) {
    setEditTargetIndex(index);
    setEditForm(exerciseToFormState(exercises[index]));
    setEditFormError(null);
  }

  function closeEditDialog() {
    setEditTargetIndex(null);
    setEditForm(defaultFormState);
    setEditFormError(null);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editForm.name.trim()) {
      setEditFormError("Exercise name is required.");
      return;
    }
    if (editTargetIndex === null) return;

    const durVal = safeInt(editForm.durationValue, 0);
    const updatedExercise: Exercise = {
      name: editForm.name.trim(),
      sets: BigInt(safeInt(editForm.sets, 0)),
      reps: BigInt(safeInt(editForm.reps, 0)),
      weight: BigInt(safeInt(editForm.weight, 0)),
      duration: {
        value: BigInt(durVal),
        unit:
          editForm.durationUnit === "minutes"
            ? DurationUnit.minutes
            : DurationUnit.seconds,
      },
      notes: editForm.notes.trim(),
    };

    const updatedExercises = exercises.map((ex, i) =>
      i === editTargetIndex ? updatedExercise : ex,
    );

    try {
      await updateExercisesMutation.mutateAsync({
        template,
        exercises: updatedExercises,
      });
      toast.success("Exercise updated");
      closeEditDialog();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update exercise";
      toast.error(message);
    }
  }

  const isPending = addExerciseMutation.isPending;
  const isUpdating = updateExercisesMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Back button + title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0"
        >
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
                  ? "No exercises have been added to this template yet."
                  : `${exercises.length} exercise${exercises.length !== 1 ? "s" : ""} in this template`}
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
            {exercises.map((exercise, index) => {
              const durationLabel = formatDuration(exercise.duration);
              return (
                // biome-ignore lint/suspicious/noArrayIndexKey: exercises have no stable unique id
                <div key={index}>
                  {index > 0 && <Separator className="mb-3" />}
                  <div
                    className="flex items-start gap-3"
                    data-ocid={`exercise.item.${index + 1}`}
                  >
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
                            {exercise.weight.toString()} lbs
                          </Badge>
                        )}
                        {durationLabel && (
                          <Badge variant="outline" className="text-xs">
                            {durationLabel}
                          </Badge>
                        )}
                      </div>
                      {exercise.notes && (
                        <p className="text-sm text-muted-foreground mt-1.5 italic">
                          {exercise.notes}
                        </p>
                      )}
                    </div>
                    {/* Action buttons — always visible */}
                    <div className="flex items-center gap-1 shrink-0 mt-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openEditDialog(index)}
                        title="Edit exercise"
                        disabled={isUpdating}
                        data-ocid={`exercise.edit_button.${index + 1}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTargetIndex(index)}
                        title="Remove exercise"
                        disabled={isUpdating}
                        data-ocid={`exercise.delete_button.${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        )}

        {exercises.length === 0 && !showAddForm && (
          <CardContent className="pt-0">
            <div
              className="flex flex-col items-center justify-center py-8 text-center"
              data-ocid="exercise.empty_state"
            >
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
                <p className="text-sm font-semibold text-foreground">
                  New Exercise
                </p>
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
              <div>
                <Label className="text-xs">Exercise Name *</Label>
                <Input
                  placeholder="e.g. Bench Press"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="mt-1"
                  disabled={isPending}
                />
                {formError && (
                  <p className="text-xs text-destructive mt-1">{formError}</p>
                )}
              </div>

              {/* Sets / Reps / Weight */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Sets</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={form.sets}
                    onChange={(e) => handleChange("sets", e.target.value)}
                    className="mt-1"
                    disabled={isPending}
                  />
                </div>
                <div>
                  <Label className="text-xs">Reps</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={form.reps}
                    onChange={(e) => handleChange("reps", e.target.value)}
                    className="mt-1"
                    disabled={isPending}
                  />
                </div>
                <div>
                  <Label className="text-xs">Weight</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={form.weight}
                    onChange={(e) => handleChange("weight", e.target.value)}
                    className="mt-1"
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <Label className="text-xs mb-1 block">Duration</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={form.durationValue}
                    onChange={(e) =>
                      handleChange("durationValue", e.target.value)
                    }
                    className="flex-1"
                    disabled={isPending}
                  />
                  <Select
                    value={form.durationUnit}
                    onValueChange={(val) => handleChange("durationUnit", val)}
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

              {/* Notes */}
              <div>
                <Label className="text-xs">Notes</Label>
                <Textarea
                  placeholder="Optional notes..."
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  className="mt-1 resize-none"
                  rows={2}
                  disabled={isPending}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending || !form.name.trim()}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Exercise"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

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
              {deleteTargetIndex !== null && exercises[deleteTargetIndex]
                ? `"${exercises[deleteTargetIndex].name}"`
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
              disabled={isUpdating}
            >
              {isUpdating ? (
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
            <div>
              <Label className="text-xs">Exercise Name *</Label>
              <Input
                placeholder="e.g. Bench Press"
                value={editForm.name}
                onChange={(e) => handleEditChange("name", e.target.value)}
                className="mt-1"
                disabled={isUpdating}
              />
              {editFormError && (
                <p className="text-xs text-destructive mt-1">{editFormError}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Sets</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={editForm.sets}
                  onChange={(e) => handleEditChange("sets", e.target.value)}
                  className="mt-1"
                  disabled={isUpdating}
                />
              </div>
              <div>
                <Label className="text-xs">Reps</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={editForm.reps}
                  onChange={(e) => handleEditChange("reps", e.target.value)}
                  className="mt-1"
                  disabled={isUpdating}
                />
              </div>
              <div>
                <Label className="text-xs">Weight</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={editForm.weight}
                  onChange={(e) => handleEditChange("weight", e.target.value)}
                  className="mt-1"
                  disabled={isUpdating}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs mb-1 block">Duration</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={editForm.durationValue}
                  onChange={(e) =>
                    handleEditChange("durationValue", e.target.value)
                  }
                  className="flex-1"
                  disabled={isUpdating}
                />
                <Select
                  value={editForm.durationUnit}
                  onValueChange={(val) => handleEditChange("durationUnit", val)}
                  disabled={isUpdating}
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

            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea
                placeholder="Optional notes..."
                value={editForm.notes}
                onChange={(e) => handleEditChange("notes", e.target.value)}
                className="mt-1 resize-none"
                rows={2}
                disabled={isUpdating}
              />
            </div>

            <div className="flex gap-3 justify-end pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={closeEditDialog}
                disabled={isUpdating}
                data-ocid="exercise.edit.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isUpdating || !editForm.name.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white"
                data-ocid="exercise.edit.save_button"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
