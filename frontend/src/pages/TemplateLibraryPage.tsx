import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, LayoutTemplate, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import CreateTemplateForm from '../components/CreateTemplateForm';
import TemplateDetailView from '../components/TemplateDetailView';
import { useGetAllWorkoutTemplates } from '../hooks/useGetAllWorkoutTemplates';
import { UserWorkoutTemplateView } from '../backend';

export default function TemplateLibraryPage() {
  const { identity } = useInternetIdentity();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<bigint | null>(null);

  const { data: templates, isLoading } = useGetAllWorkoutTemplates();

  const isAuthenticated = !!identity;

  // Always derive the selected template from the latest fetched data so the
  // detail view reflects updates (e.g. newly added exercises) without needing
  // a separate state copy.
  const selectedTemplate: UserWorkoutTemplateView | null =
    selectedTemplateId !== null
      ? (templates?.find((t) => t.id === selectedTemplateId) ?? null)
      : null;

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
            <h1 className="text-3xl font-bold tracking-tight">Template Library</h1>
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
              Create your first workout template to start organizing your training sessions.
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
            {templates.map((userTemplate) => (
              <button
                key={userTemplate.id.toString()}
                onClick={() => setSelectedTemplateId(userTemplate.id)}
                className="w-full text-left"
              >
                <Card className="hover:border-orange-400 hover:shadow-md transition-all cursor-pointer group">
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-orange-100 dark:bg-orange-900/30 p-2.5">
                        <LayoutTemplate className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-base">{userTemplate.template.name}</p>
                        <CardDescription className="mt-0.5">
                          {userTemplate.template.exercises.length === 0
                            ? 'No exercises added'
                            : `${userTemplate.template.exercises.length} exercise${userTemplate.template.exercises.length !== 1 ? 's' : ''}`}
                          {userTemplate.template.days.length > 0 && (
                            <span className="ml-2">
                              · {userTemplate.template.days.map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ')}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {userTemplate.template.exercises.length > 0 && (
                        <Badge variant="secondary" className="hidden sm:inline-flex">
                          {userTemplate.template.exercises.length} exercises
                        </Badge>
                      )}
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
