import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useLocalTemplates, useDeleteLocalTemplate, useUpdateLocalTemplate } from '@/hooks/useLocalTemplates';
import TemplateCreateForm from '@/components/TemplateCreateForm';
import LocalTemplateDetailView from '@/components/LocalTemplateDetailView';
import { Plus, Trash2, Dumbbell, Calendar, ChevronRight, Pencil } from 'lucide-react';

type View = 'list' | 'create' | 'detail';

export default function LocalTemplatesPage() {
  const [view, setView] = useState<View>('list');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Inline edit state
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Delete confirmation state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  const { data: templates = [], isLoading } = useLocalTemplates();
  const deleteTemplate = useDeleteLocalTemplate();
  const updateTemplate = useUpdateLocalTemplate();

  const selectedTemplate = selectedTemplateId
    ? templates.find(t => t.id === selectedTemplateId) ?? null
    : null;

  const startEditing = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setEditingTemplateId(id);
    setEditingName(name);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const cancelEditing = () => {
    setEditingTemplateId(null);
    setEditingName('');
  };

  const commitEdit = async (id: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      cancelEditing();
      return;
    }
    const original = templates.find(t => t.id === id)?.name;
    if (trimmed === original) {
      cancelEditing();
      return;
    }
    try {
      await updateTemplate.mutateAsync({ id, updates: { name: trimmed } });
    } catch {
      // silently ignore for local storage
    } finally {
      setEditingTemplateId(null);
      setEditingName('');
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEdit(id);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const openDeleteDialog = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setDeleteTargetId(id);
    setDeleteTargetName(name);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteTemplate.mutateAsync(deleteTargetId);
      toast.success('Template deleted');
      if (selectedTemplateId === deleteTargetId) {
        setSelectedTemplateId(null);
        setView('list');
      }
    } catch {
      toast.error('Failed to delete template');
    } finally {
      setDeleteTargetId(null);
      setDeleteTargetName('');
    }
  };

  const handleCreated = () => {
    setView('list');
  };

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    setView('detail');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-muted-foreground">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {view === 'create' && (
        <Card>
          <CardHeader>
            <CardTitle>New Workout Template</CardTitle>
          </CardHeader>
          <CardContent>
            <TemplateCreateForm
              onCancel={() => setView('list')}
              onCreated={handleCreated}
            />
          </CardContent>
        </Card>
      )}

      {view === 'detail' && selectedTemplate && (
        <Card>
          <CardContent className="pt-6">
            <LocalTemplateDetailView
              template={selectedTemplate}
              onBack={() => {
                setView('list');
                setSelectedTemplateId(null);
              }}
            />
          </CardContent>
        </Card>
      )}

      {view === 'list' && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Workout Templates</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {templates.length} template{templates.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button onClick={() => setView('create')}>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>

          {templates.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Dumbbell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No templates yet</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Create your first workout template to get started.
                </p>
                <Button onClick={() => setView('create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {templates.map(template => {
                const isEditing = editingTemplateId === template.id;

                return (
                  <Card
                    key={template.id}
                    className="hover:border-primary/50 transition-colors group"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <div
                                className="flex items-center gap-2 flex-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Input
                                  ref={editInputRef}
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  onKeyDown={(e) => handleEditKeyDown(e, template.id)}
                                  onBlur={() => commitEdit(template.id)}
                                  className="h-8 text-sm font-semibold"
                                />
                              </div>
                            ) : (
                              <>
                                <h3
                                  className="font-semibold truncate cursor-pointer"
                                  onClick={() => handleSelectTemplate(template.id)}
                                >
                                  {template.name}
                                </h3>
                                <button
                                  onClick={(e) => startEditing(e, template.id, template.name)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted shrink-0"
                                  title="Edit name"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                                </button>
                                <Badge variant="secondary" className="shrink-0">
                                  {template.exercises.length} exercise{template.exercises.length !== 1 ? 's' : ''}
                                </Badge>
                              </>
                            )}
                          </div>
                          {!isEditing && (
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(template.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-3 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => openDeleteDialog(e, template.id, template.name)}
                            title="Delete template"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <button
                            onClick={() => {
                              if (!isEditing) handleSelectTemplate(template.id);
                            }}
                            className="p-1"
                            title="View template"
                          >
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTargetId(null);
            setDeleteTargetName('');
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete "{deleteTargetName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
