import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Dumbbell,
  Trash2,
  Filter,
  ClipboardList,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useLocalLogs, useDeleteLocalLog } from '../hooks/useLocalLogs';
import { WorkoutLog } from '../utils/localStorageLogs';
import LogEntryForm from '../components/LogEntryForm';
import { toast } from 'sonner';

type FilterType = 'all' | 'incomplete' | 'completed';

export default function WorkoutLogPage() {
  const { data: logs = [], isLoading } = useLocalLogs();
  const deleteMutation = useDeleteLocalLog();
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedLog, setSelectedLog] = useState<WorkoutLog | null>(null);

  // Always get the freshest version of the selected log from the query data
  const freshSelectedLog = selectedLog
    ? logs.find((l) => l.id === selectedLog.id) ?? selectedLog
    : null;

  const filteredLogs = logs.filter((log) => {
    if (filter === 'completed') return !!log.completedAt;
    if (filter === 'incomplete') return !log.completedAt;
    return true;
  });

  // Sort: incomplete first, then by date descending
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    if (!a.completedAt && b.completedAt) return -1;
    if (a.completedAt && !b.completedAt) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(`Log for "${name}" deleted`);
        if (selectedLog?.id === id) setSelectedLog(null);
      },
      onError: (err) => toast.error(`Failed to delete: ${err.message}`),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Detail view
  if (freshSelectedLog) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <LogEntryForm
          log={freshSelectedLog}
          onBack={() => setSelectedLog(null)}
        />
      </div>
    );
  }

  const completedCount = logs.filter((l) => !!l.completedAt).length;
  const incompleteCount = logs.filter((l) => !l.completedAt).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Workout Log</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your actual performance against your planned sessions
        </p>
      </div>

      {/* Stats */}
      {logs.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{logs.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-500">{completedCount}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-orange-500">{incompleteCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      {logs.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          {(['all', 'incomplete', 'completed'] as FilterType[]).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
      )}

      {/* Log List */}
      {sortedLogs.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="bg-muted/40 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <ClipboardList className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-lg">
              {logs.length === 0 ? 'No logs yet' : 'No logs match this filter'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {logs.length === 0
                ? 'Create a workout template to auto-generate your first log'
                : 'Try a different filter'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedLogs.map((log) => {
            const isCompleted = !!log.completedAt;
            const loggedCount = log.exercises.filter(
              (ex) => ex.actualSets !== null && ex.actualReps !== null
            ).length;

            return (
              <Card
                key={log.id}
                className={`cursor-pointer transition-colors group ${
                  isCompleted
                    ? 'border-green-500/30 hover:border-green-500/60'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedLog(log)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`rounded-xl p-2.5 shrink-0 ${
                          isCompleted
                            ? 'bg-green-500/10'
                            : 'bg-orange-500/10'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-orange-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{log.templateName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(log.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                          {isCompleted && log.completedAt && (
                            <span className="ml-2 text-green-500">
                              · Completed{' '}
                              {new Date(log.completedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right hidden sm:block">
                        <Badge
                          variant={isCompleted ? 'default' : 'outline'}
                          className={
                            isCompleted
                              ? 'bg-green-500 text-white border-0'
                              : ''
                          }
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Done
                            </>
                          ) : (
                            <>
                              <Dumbbell className="h-3 w-3 mr-1" />
                              {loggedCount}/{log.exercises.length}
                            </>
                          )}
                        </Badge>
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Log?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the log for "{log.templateName}". This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={(e) => handleDelete(log.id, log.templateName, e)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
