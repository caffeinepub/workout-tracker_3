import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useCreateWorkoutTemplate } from "../hooks/useCreateWorkoutTemplate";

interface CreateTemplateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateTemplateForm({
  onSuccess,
  onCancel,
}: CreateTemplateFormProps) {
  const [name, setName] = useState("");
  const createTemplate = useCreateWorkoutTemplate();
  const { actor, isFetching: actorLoading } = useActor();

  const isReady = !!actor && !actorLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Please enter a template name");
      return;
    }

    if (!isReady) {
      toast.error(
        "Still connecting to backend, please wait a moment and try again",
      );
      return;
    }

    try {
      await createTemplate.mutateAsync({
        name: trimmedName,
        exercises: [],
        days: [],
      });
      toast.success(`Template "${trimmedName}" created successfully!`);
      setName("");
      onSuccess?.();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="template-name">Template Name</Label>
        <Input
          id="template-name"
          type="text"
          placeholder="e.g. Push Day, Leg Day..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={createTemplate.isPending}
          autoFocus
        />
      </div>

      {actorLoading && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          Connecting to backend…
        </p>
      )}

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={createTemplate.isPending}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={createTemplate.isPending || !isReady || !name.trim()}
        >
          {createTemplate.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating…
            </>
          ) : (
            "Create Template"
          )}
        </Button>
      </div>
    </form>
  );
}
