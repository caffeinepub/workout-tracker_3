import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WorkoutSession } from '../backend';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Weight, Repeat, Activity } from 'lucide-react';

interface ProgressionChartProps {
  workouts: WorkoutSession[];
  exerciseName: string;
}

export default function ProgressionChart({ workouts, exerciseName }: ProgressionChartProps) {
  if (workouts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No data available for this exercise</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = workouts.map((workout) => {
    const date = new Date(Number(workout.date) / 1_000_000);
    const volume = Number(workout.sets) * Number(workout.reps) * Number(workout.weight);
    
    return {
      date: format(date, 'MMM d'),
      fullDate: format(date, 'MMM d, yyyy'),
      weight: Number(workout.weight),
      reps: Number(workout.reps),
      sets: Number(workout.sets),
      volume: volume,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">{payload[0].payload.fullDate}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-600" />
          {exerciseName} Progression
        </CardTitle>
        <CardDescription>Track your performance over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="volume" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="volume">
              <Activity className="h-4 w-4 mr-1.5" />
              Volume
            </TabsTrigger>
            <TabsTrigger value="weight">
              <Weight className="h-4 w-4 mr-1.5" />
              Weight
            </TabsTrigger>
            <TabsTrigger value="reps">
              <Repeat className="h-4 w-4 mr-1.5" />
              Reps
            </TabsTrigger>
            <TabsTrigger value="sets">Sets</TabsTrigger>
          </TabsList>

          <TabsContent value="volume" className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="volume" fill="oklch(var(--chart-1))" name="Total Volume (lbs)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="weight" className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="weight" stroke="oklch(var(--chart-2))" strokeWidth={3} name="Weight (lbs)" dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="reps" className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="reps" stroke="oklch(var(--chart-3))" strokeWidth={3} name="Reps" dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="sets" className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="sets" fill="oklch(var(--chart-4))" name="Sets" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
