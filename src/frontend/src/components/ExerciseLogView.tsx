import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  BarChart2,
  Calendar,
  Dumbbell,
  Loader2,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type ExerciseId, WeightUnit } from "../backend";
import { useGetCallerUserProfile } from "../hooks/useGetCallerUserProfile";
import { useGetExerciseLogs } from "../hooks/useGetExerciseLogs";
import { useLogExercise } from "../hooks/useLogExercise";
import { convertWeight, formatWeight } from "../utils/weightConversion";

interface ExerciseLogViewProps {
  exerciseId: ExerciseId;
  exerciseName: string;
  onBack: () => void;
}

export default function ExerciseLogView({
  exerciseId,
  exerciseName,
  onBack,
}: ExerciseLogViewProps) {
  const { data: logs, isLoading, isError } = useGetExerciseLogs(exerciseId);
  const logExercise = useLogExercise();
  const { data: userProfile } = useGetCallerUserProfile();
  const weightUnit = userProfile?.weightUnit ?? WeightUnit.lbs;

  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const setsNum = Number.parseInt(sets, 10);
    const repsNum = Number.parseInt(reps, 10);
    const weightNum = Number.parseFloat(weight);

    if (
      !sets ||
      !reps ||
      !weight ||
      Number.isNaN(setsNum) ||
      Number.isNaN(repsNum) ||
      Number.isNaN(weightNum)
    ) {
      toast.error("Please fill in all fields with valid numbers.");
      return;
    }

    // Convert to lbs (base unit) before storing
    const weightInLbs = Math.round(
      convertWeight(weightNum, weightUnit, WeightUnit.lbs),
    );

    try {
      await logExercise.mutateAsync({
        exerciseId,
        sets: BigInt(setsNum),
        reps: BigInt(repsNum),
        weight: BigInt(weightInLbs),
      });
      setSets("");
      setReps("");
      setWeight("");
      toast.success("Log entry added!");
    } catch {
      toast.error("Failed to log exercise. Please try again.");
    }
  };

  const formatDate = (timestamp: bigint) => {
    const ms = Number(timestamp) / 1_000_000;
    return new Date(ms).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-orange-500" />
          <h2 className="text-xl font-bold">{exerciseName}</h2>
        </div>
      </div>

      {/* Log Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4 text-orange-500" />
            Log a Set
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="sets"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Sets
                </Label>
                <Input
                  id="sets"
                  type="number"
                  min="1"
                  placeholder="3"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  className="text-center font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="reps"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Reps
                </Label>
                <Input
                  id="reps"
                  type="number"
                  min="1"
                  placeholder="10"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className="text-center font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="weight"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Weight ({weightUnit})
                </Label>
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder={weightUnit === WeightUnit.kg ? "60" : "135"}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="text-center font-semibold"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              disabled={logExercise.isPending}
            >
              {logExercise.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Logging...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Log Entry
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Log History */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
          <BarChart2 className="h-4 w-4" />
          History
        </h3>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-sm text-destructive text-center py-4">
            Failed to load exercise logs. Please try again.
          </p>
        )}

        {!isLoading && !isError && logs && logs.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <BarChart2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No logs yet</p>
            <p className="text-xs mt-1">Add your first log entry above.</p>
          </div>
        )}

        {!isLoading && !isError && logs && logs.length > 0 && (
          <div className="space-y-3">
            {logs.map((log) => {
              const storedLbs = Number(log.weight);
              const displayedWeight = convertWeight(
                storedLbs,
                WeightUnit.lbs,
                weightUnit,
              );
              const volume =
                Number(log.sets) * Number(log.reps) * displayedWeight;
              return (
                <Card key={log.id.toString()} className="border border-border">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(log.date)}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-semibold">
                        <span className="text-foreground">
                          {log.sets.toString()} × {log.reps.toString()}
                        </span>
                        <span className="text-orange-500">
                          {formatWeight(displayedWeight)} {weightUnit}
                        </span>
                        <span className="text-xs text-muted-foreground font-normal">
                          Vol: {formatWeight(volume)} {weightUnit}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
