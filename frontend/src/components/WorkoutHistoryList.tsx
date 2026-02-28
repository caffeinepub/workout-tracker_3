import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import { Loader2, Calendar, Dumbbell, TrendingUp, Clock, StickyNote } from 'lucide-react';
import { format } from 'date-fns';
import { DayOfWeek, WeightUnit, WorkoutSession } from '../backend';
import { convertWeight, formatWeight } from '../utils/weightConversion';

export default function WorkoutHistoryList() {
  const { data: workouts, isLoading, error } = useWorkoutHistory();
  const { data: userProfile } = useGetCallerUserProfile();
  const weightUnit = userProfile?.weightUnit ?? WeightUnit.lbs;

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

  // Group workouts by day of the week
  const daysOrder = [
    DayOfWeek.monday,
    DayOfWeek.tuesday,
    DayOfWeek.wednesday,
    DayOfWeek.thursday,
    DayOfWeek.friday,
    DayOfWeek.saturday,
    DayOfWeek.sunday,
  ];

  const dayLabels: Record<DayOfWeek, string> = {
    [DayOfWeek.monday]: 'Monday',
    [DayOfWeek.tuesday]: 'Tuesday',
    [DayOfWeek.wednesday]: 'Wednesday',
    [DayOfWeek.thursday]: 'Thursday',
    [DayOfWeek.friday]: 'Friday',
    [DayOfWeek.saturday]: 'Saturday',
    [DayOfWeek.sunday]: 'Sunday',
  };

  const workoutsByDay = workouts.reduce((acc, workout) => {
    const day = workout.day;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(workout);
    return acc;
  }, {} as Record<DayOfWeek, WorkoutSession[]>);

  // Filter to only show days that have workouts
  const daysWithWorkouts = daysOrder.filter((day) => workoutsByDay[day] && workoutsByDay[day].length > 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {daysWithWorkouts.map((day) => (
        <Card key={day} className="overflow-hidden">
          <CardHeader className="bg-orange-50 dark:bg-orange-950/30 border-b">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <CardTitle className="text-xl">{dayLabels[day]}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {workoutsByDay[day].map((workout, index) => {
                const date = new Date(Number(workout.date) / 1_000_000);
                const storedLbs = Number(workout.weight);
                const displayedWeight = convertWeight(storedLbs, WeightUnit.lbs, weightUnit);
                const volume = Number(workout.sets) * Number(workout.reps) * displayedWeight;

                return (
                  <div key={index} className="p-6 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">{workout.exerciseName}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {format(date, 'MMMM d, yyyy')} at {format(date, 'h:mm a')}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {formatWeight(volume)} {weightUnit}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm mb-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Sets:</span>
                        <span className="font-bold text-orange-600 dark:text-orange-400 text-base">
                          {workout.sets.toString()}
                        </span>
                      </div>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Reps:</span>
                        <span className="font-bold text-orange-600 dark:text-orange-400 text-base">
                          {workout.reps.toString()}
                        </span>
                      </div>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Weight:</span>
                        <span className="font-bold text-orange-600 dark:text-orange-400 text-base">
                          {formatWeight(displayedWeight)} {weightUnit}
                        </span>
                      </div>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-bold text-orange-600 dark:text-orange-400 text-base">
                          {workout.duration.toString()} min
                        </span>
                      </div>
                    </div>

                    {workout.notes && (
                      <div className="bg-muted/50 rounded-lg p-3 border border-border">
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <StickyNote className="h-3 w-3" />
                          Notes
                        </p>
                        <p className="text-sm">{workout.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
