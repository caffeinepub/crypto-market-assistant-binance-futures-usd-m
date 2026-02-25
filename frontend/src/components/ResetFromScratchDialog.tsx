import { useState } from 'react';
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
import { AlertTriangle, Loader2 } from 'lucide-react';
import { resetFromScratch, reloadApp } from '@/lib/resetFromScratch';
import { toast } from 'sonner';

interface ResetFromScratchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ResetFromScratchDialog({ open, onOpenChange }: ResetFromScratchDialogProps) {
  const [isResetting, setIsResetting] = useState(false);

  const handleConfirmReset = async () => {
    setIsResetting(true);

    try {
      const result = await resetFromScratch();

      if (result.success) {
        // Success - reload the app
        toast.success('Reset complete. Reloading app...', {
          duration: 2000,
        });
        
        // Give the toast time to show, then reload
        setTimeout(() => {
          reloadApp();
        }, 1000);
      } else {
        // Error during reset
        setIsResetting(false);
        toast.error('Reset failed', {
          description: result.error || 'An unknown error occurred during reset',
        });
      }
    } catch (error) {
      setIsResetting(false);
      toast.error('Reset failed', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-2 border-destructive/50 bg-card/95 backdrop-blur-sm">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-8 h-8 text-destructive animate-pulse" />
            <AlertDialogTitle className="text-2xl text-destructive">
              Reload from Scratch
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-3">
            <p className="font-semibold text-foreground">
              This action will permanently delete the following local data:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2 text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">AI Learning History:</span> All predictions, accuracy stats, and learned patterns
              </li>
              <li>
                <span className="font-semibold text-foreground">User Preferences:</span> Theme, alerts, favourite assets, and all settings
              </li>
              <li>
                <span className="font-semibold text-foreground">App Caches:</span> Cached market data and offline resources
              </li>
            </ul>
            <p className="text-destructive font-semibold mt-4">
              ⚠️ This action cannot be undone. The app will reload with a fresh state.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isResetting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmReset}
            disabled={isResetting}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isResetting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Resetting...
              </>
            ) : (
              'Confirm Reset'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
