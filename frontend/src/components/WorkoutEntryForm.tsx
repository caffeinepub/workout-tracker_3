import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddWorkout } from '../hooks/useAddWorkout';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import { Loader2, Dumbbell, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { DayOfWeek, WeightUnit } from '../backend';
import { convertWeight } from '../utils/weightConversion';

export default function WorkoutEntryForm() {
  const { mutate: addWorkout, isPending } = useAddWorkout();
  const { data: userProfile } = useGetCallerUserProfile();
  const weightUnit = userProfile?.weightUnit ?? WeightUnit.lbs;

  const [formData, setFormData] = useState({
    day: '' as DayOfWeek | '',
    exerciseName: '',
    sets: '',
    reps: '',
    weight: '',
    duration: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDayChange = (value: string) => {
    setFormData({ ...formData, day: value as DayOfWeek });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.day) {
      toast.error('Please select a day of the week');
      return;
    }

    if (!formData.exerciseName.trim()) {
      toast.error('Please enter an exercise name');
      return;
    }

    const sets = parseInt(formData.sets);
    const reps = parseInt(formData.reps);
    const weightInput = parseFloat(formData.weight);
    const duration = parseInt(formData.duration);

    if (isNaN(sets) || sets < 0) {
      toast.error('Please enter a valid number of sets');
      return;
    }
    if (isNaN(reps) || reps < 0) {
      toast.error('Please enter a valid number of reps');
      return;
    }
    if (isNaN(weightInput) || weightInput < 0) {
      toast.error('Please enter a valid weight');
      return;
    }
    if (isNaN(duration) || duration < 0) {
      toast.error('Please enter a valid duration');
      return;
    }

    // Convert to lbs (base unit) before storing
    const weightInLbs = Math.round(convertWeight(weightInput, weightUnit, WeightUnit.lbs));

    addWorkout(
      {
        day: formData.day,
        date: BigInt(Date.now() * 1_000_000),
        exerciseName: formData.exerciseName.trim(),
        sets: BigInt(sets),
        reps: BigInt(reps),
        weight: BigInt(weightInLbs),
        duration: BigInt(duration),
        notes: formData.notes.trim(),
      },
      {
        onSuccess: () => {
          toast.success('Workout logged successfully! 💪');
          setFormData({
            day: '',
            exerciseName: '',
            sets: '',
            reps: '',
            weight: '',
            duration: '',
            notes: '',
          });
        },
        onError: (error) => {
          toast.error('Failed to log workout. Please try again.');
          console.error('Workout submission error:', error);
        },
      }
    );
  };

  const daysOfWeek = [
    { value: DayOfWeek.monday, label: 'Monday' },
    { value: DayOfWeek.tuesday, label: 'Tuesday' },
    { value: DayOfWeek.wednesday, label: 'Wednesday' },
    { value: DayOfWeek.thursday, label: 'Thursday' },
    { value: DayOfWeek.friday, label: 'Friday' },
    { value: DayOfWeek.saturday, label: 'Saturday' },
    { value: DayOfWeek.sunday, label: 'Sunday' },
  ];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-xl">
            <img src="/assets/generated/dumbbell-icon.dim_128x128.png" alt="" className="h-8 w-8" />
          </div>
          <div>
            <CardTitle className="text-2xl">Log Your Workout</CardTitle>
            <CardDescription>Track your exercise performance and progress</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="day" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Day of Week *
            </Label>
            <Select value={formData.day} onValueChange={handleDayChange} disabled={isPending}>
              <SelectTrigger id="day">
                <SelectValue placeholder="Select a day" />
              </SelectTrigger>
              <SelectContent>
                {daysOfWeek.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exerciseName">Exercise Name *</Label>
            <Input
              id="exerciseName"
              name="exerciseName"
              placeholder="e.g., Bench Press, Squats, Deadlift"
              value={formData.exerciseName}
              onChange={handleChange}
              disabled={isPending}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sets">Sets *</Label>
              <Input
                id="sets"
                name="sets"
                type="number"
                min="0"
                placeholder="0"
                value={formData.sets}
                onChange={handleChange}
                disabled={isPending}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reps">Reps *</Label>
              <Input
                id="reps"
                name="reps"
                type="number"
                min="0"
                placeholder="0"
                value={formData.reps}
                onChange={handleChange}
                disabled={isPending}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight ({weightUnit}) *</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                min="0"
                step="0.1"
                placeholder="0"
                value={formData.weight}
                onChange={handleChange}
                disabled={isPending}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (min) *</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min="0"
                placeholder="0"
                value={formData.duration}
                onChange={handleChange}
                disabled={isPending}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Add any notes about your workout..."
              value={formData.notes}
              onChange={handleChange}
              disabled={isPending}
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full bg-orange-600 hover:bg-orange-700 font-bold text-base h-12">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Logging Workout...
              </>
            ) : (
              <>
                <Dumbbell className="mr-2 h-5 w-5" />
                Log Workout
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
