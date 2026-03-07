import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronRight,
  LayoutTemplate,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { UserWorkoutTemplateView } from "../backend";
import CreateTemplateForm from "../components/CreateTemplateForm";
import TemplateDetailView from "../components/TemplateDetailView";
import { useDeleteWorkoutTemplate } from "../hooks/useDeleteWorkoutTemplate";
import { useGetAllWorkoutTemplates } from "../hooks/useGetAllWorkoutTemplates";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useUpdateWorkoutTemplateName } from "../hooks/useUpdateWorkoutTemplateName";

export default function TemplateLibraryPage() {
  const { identity } = useInternetIdentity();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<bigint | null>(
    null,
  );

  // Inline edit state
  const [editingTemplateId, setEditingTemplateId] = useState<bigint | null>(
    null,
  );
  const [editingName, setEditingName] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  // Delete confirmation state
  const [deleteTargetId, setDeleteTargetId] = useState<bigint | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");

  const { data: templates, isLoading } = useGetAllWorkoutTemplates();
  const updateName = useUpdateWorkoutTemplateName();
  const deleteTemplate = useDeleteWorkoutTemplate();

  const isAuthenticated = !!identity;

  const selectedTemplate: UserWorkoutTemplateView | null =
    selectedTemplateId !== null
      ? (templates?.find((t) => t.id === selectedTemplateId) ?? null)
      : null;

  const startEditing = (
    e: React.MouseEvent,
    template: UserWorkoutTemplateView,
  ) => {
    e.stopPropagation();
    setEditingTemplateId(template.id);
    setEditingName(template.template.name);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const cancelEditing = () => {
    setEditingTemplateId(null);
    setEditingName("");
  };

  const commitEdit = async (templateId: bigint) => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      cancelEditing();
      return;
    }
    const original = templates?.find((t) => t.id === templateId)?.template.name;
    if (trimmed === original) {
      cancelEditing();
      return;
    }
    try {
      await updateName.mutateAsync({ templateId, newName: trimmed });
      toast.success("Template name updated");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update template name",
      );
    } finally {
      setEditingTemplateId(null);
      setEditingName("");
    }
  };

  const handleEditKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    templateId: bigint,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit(templateId);
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  const openDeleteDialog = (
    e: React.MouseEvent,
    template: UserWorkoutTemplateView,
  ) => {
    e.stopPropagation();
    setDeleteTargetId(template.id);
    setDeleteTargetName(template.template.name);
  };

  const confirmDelete = async () => {
    if (deleteTargetId === null) return;
    try {
      await deleteTemplate.mutateAsync(deleteTargetId);
      toast.success("Template deleted");
      if (selectedTemplateId === deleteTargetId) {
        setSelectedTemplateId(null);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete template",
      );
    } finally {
      setDeleteTargetId(null);
      setDeleteTargetName("");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please log in to access your workout templates.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show template detail view
  if (selectedTemplate) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <TemplateDetailView
            template={selectedTemplate}
            onBack={() => setSelectedTemplateId(null)}
          />
        </div>
      </div>
    );
  }

  // Show create form
  if (showCreateForm) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <CreateTemplateForm onCancel={() => setShowCreateForm(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Template Library
            </h1>
            <p className="text-muted-foreground mt-1">
              Organize your training with reusable workout templates
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!templates || templates.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-muted p-5 mb-4">
              <LayoutTemplate className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No templates yet</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Create your first workout template to start organizing your
              training sessions.
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Template
            </Button>
          </div>
        )}

        {/* Template list */}
        {!isLoading && templates && templates.length > 0 && (
          <div className="space-y-3">
            {templates.map((userTemplate) => {
              const isEditing = editingTemplateId === userTemplate.id;
              const isUpdating =
                updateName.isPending && editingTemplateId === userTemplate.id;

              return (
                <Card
                  key={userTemplate.id.toString()}
                  className="hover:border-orange-400 hover:shadow-md transition-all group"
                >
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="rounded-lg bg-orange-100 dark:bg-orange-900/30 p-2.5 shrink-0">
                        <LayoutTemplate className="h-5 w-5 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            role="presentation"
                          >
                            <Input
                              ref={editInputRef}
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) =>
                                handleEditKeyDown(e, userTemplate.id)
                              }
                              onBlur={() => commitEdit(userTemplate.id)}
                              className="h-8 text-sm font-semibold"
                              disabled={isUpdating}
                            />
                            {isUpdating && (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-base truncate">
                              {userTemplate.template.name}
                            </p>
                            <button
                              type="button"
                              onClick={(e) => startEditing(e, userTemplate)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted"
                              title="Edit name"
                            >
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                          </div>
                        )}
                        <CardDescription className="mt-0.5">
                          {userTemplate.template.exercises.length === 0
                            ? "No exercises added"
                            : `${userTemplate.template.exercises.length} exercise${userTemplate.template.exercises.length !== 1 ? "s" : ""}`}
                          {userTemplate.template.days.length > 0 && (
                            <span className="ml-2">
                              ·{" "}
                              {userTemplate.template.days
                                .map(
                                  (d) =>
                                    d.charAt(0).toUpperCase() + d.slice(1, 3),
                                )
                                .join(", ")}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-3 shrink-0">
                      {userTemplate.template.exercises.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="hidden sm:inline-flex mr-1"
                        >
                          {userTemplate.template.exercises.length} exercises
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => openDeleteDialog(e, userTemplate)}
                        title="Delete template"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!isEditing)
                            setSelectedTemplateId(userTemplate.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            if (!isEditing)
                              setSelectedTemplateId(userTemplate.id);
                          }
                        }}
                        className="p-1"
                        title="View template"
                      >
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTargetId(null);
            setDeleteTargetName("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete "{deleteTargetName}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTemplate.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
