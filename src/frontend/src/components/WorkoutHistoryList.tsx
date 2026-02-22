import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { Loader2, Calendar, Dumbbell, TrendingUp, Clock, StickyNote } from 'lucide-react';
import { format } from 'date-fns';

export default function WorkoutHistoryList() {
  const { data: workouts, isLoading, error } = useWorkoutHistory();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-12 text-center">
          <p className="text-destructive">Failed to load workout history. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  if (!workouts || workouts.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-12 text-center">
          <div className="bg-orange-100 dark:bg-orange-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No workouts yet</h3>
          <p className="text-muted-foreground mb-4">Start tracking your fitness journey by logging your first workout!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {workouts.map((workout, index) => {
        const date = new Date(Number(workout.date) / 1_000_000);
        const volume = Number(workout.sets) * Number(workout.reps) * Number(workout.weight);

        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-1">{workout.exerciseName}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(date, 'MMMM d, yyyy')} at {format(date, 'h:mm a')}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {volume.toLocaleString()} lbs total
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Sets</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{workout.sets.toString()}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Reps</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{workout.reps.toString()}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Weight</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{workout.weight.toString()}<span className="text-sm ml-1">lbs</span></p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Duration
                  </p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{workout.duration.toString()}<span className="text-sm ml-1">min</span></p>
                </div>
              </div>
              {workout.notes && (
                <div className="bg-muted/30 rounded-lg p-3 border border-border">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <StickyNote className="h-3 w-3" />
                    Notes
                  </p>
                  <p className="text-sm">{workout.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
