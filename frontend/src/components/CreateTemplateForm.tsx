import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateWorkoutTemplate } from '../hooks/useCreateWorkoutTemplate';
import { toast } from 'sonner';

interface CreateTemplateFormProps {
  onCancel: () => void;
}

export default function CreateTemplateForm({ onCancel }: CreateTemplateFormProps) {
  const [templateName, setTemplateName] = useState('');
  const createTemplate = useCreateWorkoutTemplate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    try {
      await createTemplate.mutateAsync({
        name: templateName.trim(),
        exercises: [],
        days: [],
      });
      toast.success('Template created successfully');
      setTemplateName('');
      onCancel();
    } catch (error) {
      console.error('Failed to create template:', error);
      toast.error('Failed to create template');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Template</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="templateName">Template Name</Label>
            <Input
              id="templateName"
              type="text"
              placeholder="e.g., Phase 1 Day 1 – Heavy Lower"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              disabled={createTemplate.isPending}
              autoFocus
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={createTemplate.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={createTemplate.isPending}
            >
              {createTemplate.isPending ? 'Creating...' : 'Create Template'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
