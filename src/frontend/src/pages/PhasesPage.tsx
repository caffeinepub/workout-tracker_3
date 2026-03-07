import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronRight,
  Layers,
  Loader2,
  Lock,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { PhaseId } from "../backend";
import PhaseDetailView from "../components/PhaseDetailView";
import { useCreatePhase } from "../hooks/useCreatePhase";
import { useDeletePhase } from "../hooks/useDeletePhase";
import { useGetPhases } from "../hooks/useGetPhases";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function PhasesPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: phases, isLoading, isError } = useGetPhases();
  const createPhase = useCreatePhase();
  const deletePhase = useDeletePhase();

  const [newPhaseName, setNewPhaseName] = useState("");
  const [selectedPhase, setSelectedPhase] = useState<{
    id: PhaseId;
    name: string;
  } | null>(null);

  const handleCreatePhase = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newPhaseName.trim();
    if (!trimmed) return;

    try {
      await createPhase.mutateAsync(trimmed);
      setNewPhaseName("");
      toast.success(`Phase "${trimmed}" created!`);
    } catch {
      toast.error("Failed to create phase. Please try again.");
    }
  };

  const handleDeletePhase = async (phaseId: PhaseId, phaseName: string) => {
    try {
      await deletePhase.mutateAsync(phaseId);
      toast.success(`Phase "${phaseName}" deleted.`);
    } catch {
      toast.error("Failed to delete phase. Please try again.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-full mb-4">
          <Lock className="h-8 w-8 text-orange-500" />
        </div>
        <h2 className="text-xl font-bold mb-2">Login Required</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Please log in to view and manage your training phases.
        </p>
      </div>
    );
  }

  if (selectedPhase) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <PhaseDetailView
          phaseId={selectedPhase.id}
          phaseName={selectedPhase.name}
          onBack={() => setSelectedPhase(null)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Layers className="h-6 w-6 text-orange-500" />
          Training Phases
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Organize your exercises into training phases and track your progress.
        </p>
      </div>

      {/* Create Phase Form */}
      <form onSubmit={handleCreatePhase} className="flex gap-2 mb-8">
        <Input
          placeholder="New phase name (e.g. Strength Block)"
          value={newPhaseName}
          onChange={(e) => setNewPhaseName(e.target.value)}
          className="flex-1"
          disabled={createPhase.isPending}
        />
        <Button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
          disabled={createPhase.isPending || !newPhaseName.trim()}
        >
          {createPhase.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          <span className="ml-1 hidden sm:inline">Create</span>
        </Button>
      </form>

      {/* Phases List */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive text-center py-4">
          Failed to load phases. Please try again.
        </p>
      )}

      {!isLoading && !isError && phases && phases.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Layers className="h-14 w-14 mx-auto mb-4 opacity-30" />
          <p className="font-semibold">No phases yet</p>
          <p className="text-xs mt-1">
            Create your first training phase above.
          </p>
        </div>
      )}

      {!isLoading && !isError && phases && phases.length > 0 && (
        <div className="space-y-3">
          {phases.map((phase) => (
            <Card
              key={phase.id.toString()}
              className="border border-border hover:border-orange-300 dark:hover:border-orange-700 transition-colors cursor-pointer group"
              onClick={() =>
                setSelectedPhase({ id: phase.id, name: phase.name })
              }
            >
              <CardContent className="py-4 px-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-xl">
                    <Layers className="h-5 w-5 text-orange-500" />
                  </div>
                  <span className="font-bold">{phase.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePhase(phase.id, phase.name);
                    }}
                    disabled={deletePhase.isPending}
                  >
                    {deletePhase.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
