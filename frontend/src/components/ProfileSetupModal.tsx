import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import { useSaveCallerUserProfile } from '../hooks/useSaveCallerUserProfile';
import { Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { WeightUnit } from '../backend';

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { mutate: saveProfile, isPending: isSaving } = useSaveCallerUserProfile();
  const [name, setName] = useState('');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(WeightUnit.lbs);

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    saveProfile(
      { name: name.trim(), weightUnit },
      {
        onSuccess: () => {
          toast.success('Welcome! Your profile has been created.');
          setName('');
        },
        onError: (error) => {
          toast.error('Failed to save profile. Please try again.');
          console.error('Profile save error:', error);
        },
      }
    );
  };

  return (
    <Dialog open={showProfileSetup} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mb-2">
            <User className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <DialogTitle className="text-center text-xl">Welcome to Workout Tracker!</DialogTitle>
          <DialogDescription className="text-center">
            Let's get started by setting up your profile. What should we call you?
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSaving}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Preferred Weight Unit</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWeightUnit(WeightUnit.lbs)}
                  disabled={isSaving}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                    weightUnit === WeightUnit.lbs
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                      : 'border-border bg-background text-muted-foreground hover:border-orange-300'
                  }`}
                >
                  lbs
                </button>
                <button
                  type="button"
                  onClick={() => setWeightUnit(WeightUnit.kg)}
                  disabled={isSaving}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                    weightUnit === WeightUnit.kg
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                      : 'border-border bg-background text-muted-foreground hover:border-orange-300'
                  }`}
                >
                  kg
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSaving || !name.trim()} className="w-full bg-orange-600 hover:bg-orange-700">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
