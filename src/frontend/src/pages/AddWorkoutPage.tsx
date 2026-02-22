import { useInternetIdentity } from '../hooks/useInternetIdentity';
import WorkoutEntryForm from '../components/WorkoutEntryForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, Plus } from 'lucide-react';

export default function AddWorkoutPage() {
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <div className="bg-orange-100 dark:bg-orange-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Ready to Log a Workout?</h2>
            <p className="text-muted-foreground mb-6">
              Please log in to start tracking your workouts and progress.
            </p>
            <Button onClick={login} className="bg-orange-600 hover:bg-orange-700 font-bold">
              <LogIn className="mr-2 h-4 w-4" />
              Login to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Add Workout</h1>
        <p className="text-muted-foreground">Log your latest workout session</p>
      </div>
      <WorkoutEntryForm />
    </div>
  );
}
