import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Plus,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserWorkoutTemplateView } from "../backend";
import { DurationUnit } from "../backend";
import type { Exercise } from "../backend";
import { useAddExerciseToTemplate } from "../hooks/useAddExerciseToTemplate";

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

export default function TemplateDetailView({
  template,
  onBack,
}: TemplateDetailViewProps) {
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

  const isPending = addExerciseMutation.isPending;

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
                  </div>
                </div>
              );
            })}
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
    </div>
  );
}
