import { useState } from 'react';
import { Plus, Trash2, ChevronRight, Dumbbell, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useLocalTemplates, useDeleteLocalTemplate } from '../hooks/useLocalTemplates';
import { WorkoutTemplate } from '../utils/localStorageTemplates';
import TemplateCreateForm from '../components/TemplateCreateForm';
import { toast } from 'sonner';

export default function LocalTemplatesPage() {
  const { data: templates = [], isLoading } = useLocalTemplates();
  const deleteMutation = useDeleteLocalTemplate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);

  const handleDelete = (id: string, name: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(`"${name}" deleted`);
        if (selectedTemplate?.id === id) setSelectedTemplate(null);
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
  if (selectedTemplate) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedTemplate(null)}
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{selectedTemplate.name}</h2>
            <p className="text-sm text-muted-foreground">
              Created{' '}
              {new Date(selectedTemplate.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-primary" />
              Exercises ({selectedTemplate.exercises.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedTemplate.exercises.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No exercises in this template.
              </p>
            ) : (
              selectedTemplate.exercises.map((ex, idx) => (
                <div
                  key={idx}
                  className="border border-border rounded-xl p-4 bg-muted/20"
                >
                  <p className="font-semibold mb-2">{ex.name}</p>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Sets</p>
                      <p className="font-bold">{ex.plannedSets}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Reps</p>
                      <p className="font-bold">{ex.plannedReps}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Weight</p>
                      <p className="font-bold">
                        {ex.plannedWeight > 0 ? `${ex.plannedWeight} lbs` : '—'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="font-bold">
                        {ex.plannedTime > 0 ? `${ex.plannedTime}m` : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="mt-4 flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Template
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Template?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{selectedTemplate.name}". This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => handleDelete(selectedTemplate.id, selectedTemplate.name)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Workout Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create templates to plan your sessions
          </p>
        </div>
        {!showCreateForm && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        )}
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Create New Template</CardTitle>
          </CardHeader>
          <CardContent>
            <TemplateCreateForm
              onSuccess={() => setShowCreateForm(false)}
              onCancel={() => setShowCreateForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {templates.length === 0 && !showCreateForm ? (
        <div className="text-center py-16 space-y-4">
          <div className="bg-muted/40 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <Dumbbell className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-lg">No templates yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first workout template to get started
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:border-primary/50 transition-colors group"
              onClick={() => setSelectedTemplate(template)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-primary/10 rounded-xl p-2.5 shrink-0">
                      <Dumbbell className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{template.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {new Date(template.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary">
                      {template.exercises.length} exercise{template.exercises.length !== 1 ? 's' : ''}
                    </Badge>
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
                          <AlertDialogTitle>Delete Template?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{template.name}". This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(template.id, template.name);
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
