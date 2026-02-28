import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ExerciseSelectorProps {
  exercises: string[];
  selectedExercise: string;
  onSelectExercise: (exercise: string) => void;
}

export default function ExerciseSelector({ exercises, selectedExercise, onSelectExercise }: ExerciseSelectorProps) {
  if (exercises.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="exercise-select">Select Exercise</Label>
      <Select value={selectedExercise} onValueChange={onSelectExercise}>
        <SelectTrigger id="exercise-select" className="w-full">
          <SelectValue placeholder="Choose an exercise" />
        </SelectTrigger>
        <SelectContent>
          {exercises.map((exercise) => (
            <SelectItem key={exercise} value={exercise}>
              {exercise}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
