import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle2, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMarkLogComplete, useUpdateLocalLog } from "../hooks/useLocalLogs";
import type { LogExercise, WorkoutLog } from "../utils/localStorageLogs";

interface Props {
  log: WorkoutLog;
  onBack: () => void;
}

export default function LogEntryForm({ log, onBack }: Props) {
  const [exercises, setExercises] = useState<LogExercise[]>(
    log.exercises.map((ex) => ({ ...ex, notes: ex.notes ?? "" })),
  );
  const updateMutation = useUpdateLocalLog();
  const completeMutation = useMarkLogComplete();

  // Sync if log prop changes (e.g. after save)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally sync on id change only
  useEffect(() => {
    setExercises(log.exercises.map((ex) => ({ ...ex, notes: ex.notes ?? "" })));
  }, [log.id]);

  const updateActual = (
    index: number,
    field: keyof Pick<
      LogExercise,
      "actualSets" | "actualReps" | "actualWeight" | "actualTime"
    >,
    value: string,
  ) => {
    setExercises((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value === "" ? null : Number(value),
      };
      return updated;
    });
  };

  const updateNotes = (index: number, value: string) => {
    setExercises((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], notes: value };
      return updated;
    });
  };

  const handleSave = () => {
    updateMutation.mutate(
      { logId: log.id, exercises },
      {
        onSuccess: () => toast.success("Progress saved!"),
        onError: (err) => toast.error(`Failed to save: ${err.message}`),
      },
    );
  };

  const handleComplete = () => {
    // Save actuals first, then mark complete
    updateMutation.mutate(
      { logId: log.id, exercises },
      {
        onSuccess: () => {
          completeMutation.mutate(log.id, {
            onSuccess: () => {
              toast.success("Workout marked as complete! 🎉");
              onBack();
            },
            onError: (err) => toast.error(`Failed to complete: ${err.message}`),
          });
        },
        onError: (err) => toast.error(`Failed to save: ${err.message}`),
      },
    );
  };

  const completedCount = exercises.filter(
    (ex) => ex.actualSets !== null && ex.actualReps !== null,
  ).length;

  const isCompleted = !!log.completedAt;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="mt-0.5 shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold truncate">{log.templateName}</h2>
            {isCompleted ? (
              <Badge className="bg-green-500 text-white border-0">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            ) : (
              <Badge variant="outline">In Progress</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date(log.createdAt).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {completedCount} / {exercises.length} exercises logged
          </p>
        </div>
      </div>

      {/* Exercise Table */}
      <div className="space-y-4">
        {exercises.map((ex, idx) => {
          const hasActuals = ex.actualSets !== null && ex.actualReps !== null;
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: exercises have no stable unique id
              key={idx}
              className={`border rounded-xl p-4 space-y-3 transition-colors ${
                hasActuals
                  ? "border-green-500/40 bg-green-500/5"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-sm">{ex.name}</h3>
                {hasActuals && (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                )}
              </div>

              {/* Planned vs Actual */}
              <div className="grid grid-cols-2 gap-4">
                {/* Planned */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Planned
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground">Sets</p>
                      <p className="font-bold">{ex.plannedSets}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground">Reps</p>
                      <p className="font-bold">{ex.plannedReps}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground">Weight</p>
                      <p className="font-bold">
                        {ex.plannedWeight > 0 ? `${ex.plannedWeight} lbs` : "—"}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="font-bold">
                        {ex.plannedTime > 0 ? `${ex.plannedTime}m` : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actual */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide">
                    Actual
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Sets</p>
                      <Input
                        type="number"
                        min={0}
                        placeholder=""
                        value={ex.actualSets ?? ""}
                        onChange={(e) =>
                          updateActual(idx, "actualSets", e.target.value)
                        }
                        disabled={isCompleted}
                        className="h-8 text-sm"
                        data-ocid={`log.exercise.sets.input.${idx + 1}`}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Reps</p>
                      <Input
                        type="number"
                        min={0}
                        placeholder=""
                        value={ex.actualReps ?? ""}
                        onChange={(e) =>
                          updateActual(idx, "actualReps", e.target.value)
                        }
                        disabled={isCompleted}
                        className="h-8 text-sm"
                        data-ocid={`log.exercise.reps.input.${idx + 1}`}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Weight
                      </p>
                      <Input
                        type="number"
                        min={0}
                        placeholder=""
                        value={ex.actualWeight ?? ""}
                        onChange={(e) =>
                          updateActual(idx, "actualWeight", e.target.value)
                        }
                        disabled={isCompleted}
                        className="h-8 text-sm"
                        data-ocid={`log.exercise.weight.input.${idx + 1}`}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Time (m)
                      </p>
                      <Input
                        type="number"
                        min={0}
                        placeholder=""
                        value={ex.actualTime ?? ""}
                        onChange={(e) =>
                          updateActual(idx, "actualTime", e.target.value)
                        }
                        disabled={isCompleted}
                        className="h-8 text-sm"
                        data-ocid={`log.exercise.time.input.${idx + 1}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <Input
                  placeholder="Session notes..."
                  value={ex.notes}
                  onChange={(e) => updateNotes(idx, e.target.value)}
                  disabled={isCompleted}
                  className="text-sm"
                  data-ocid={`log.exercise.notes.input.${idx + 1}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      {!isCompleted && (
        <div className="flex gap-3 justify-end pt-2">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={updateMutation.isPending || completeMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Progress
              </>
            )}
          </Button>
          <Button
            onClick={handleComplete}
            disabled={updateMutation.isPending || completeMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {completeMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark Complete
              </>
            )}
          </Button>
        </div>
      )}

      {isCompleted && (
        <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-4 text-center">
          <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-green-600 dark:text-green-400">
            Workout completed on{" "}
            {new Date(log.completedAt!).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      )}
    </div>
  );
}
