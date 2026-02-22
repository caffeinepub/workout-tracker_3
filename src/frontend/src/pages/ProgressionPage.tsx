import { useState, useMemo } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import ExerciseSelector from '../components/ExerciseSelector';
import ProgressionChart from '../components/ProgressionChart';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, TrendingUp, Loader2 } from 'lucide-react';

export default function ProgressionPage() {
  const { identity, login } = useInternetIdentity();
  const { data: workouts, isLoading } = useWorkoutHistory();
  const [selectedExercise, setSelectedExercise] = useState<string>('');

  const isAuthenticated = !!identity;

  const exercises = useMemo(() => {
    if (!workouts) return [];
    const uniqueExercises = Array.from(new Set(workouts.map((w) => w.exerciseName)));
    return uniqueExercises.sort();
  }, [workouts]);

  const filteredWorkouts = useMemo(() => {
    if (!workouts || !selectedExercise) return [];
    return workouts
      .filter((w) => w.exerciseName === selectedExercise)
      .sort((a, b) => Number(a.date) - Number(b.date));
  }, [workouts, selectedExercise]);

  // Auto-select first exercise when exercises load
  useMemo(() => {
    if (exercises.length > 0 && !selectedExercise) {
      setSelectedExercise(exercises[0]);
    }
  }, [exercises, selectedExercise]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <div className="bg-orange-100 dark:bg-orange-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Track Your Progress</h2>
            <p className="text-muted-foreground mb-6">
              Please log in to view your workout progression and performance analytics.
            </p>
            <Button onClick={login} className="bg-orange-600 hover:bg-orange-700 font-bold">
              <LogIn className="mr-2 h-4 w-4" />
              Login to View Progress
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      </div>
    );
  }

  if (!workouts || workouts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <div className="bg-orange-100 dark:bg-orange-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No workout data yet</h3>
            <p className="text-muted-foreground">
              Start logging workouts to see your progression charts and track your improvements over time!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Progression Analytics</h1>
        <p className="text-muted-foreground">Visualize your performance trends and improvements</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6">
            <ExerciseSelector
              exercises={exercises}
              selectedExercise={selectedExercise}
              onSelectExercise={setSelectedExercise}
            />
          </CardContent>
        </Card>

        {selectedExercise && (
          <ProgressionChart workouts={filteredWorkouts} exerciseName={selectedExercise} />
        )}
      </div>
    </div>
  );
}
