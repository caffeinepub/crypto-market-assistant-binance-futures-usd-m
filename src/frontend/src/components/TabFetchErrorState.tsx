import { AlertTriangle, RefreshCw, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TabFetchErrorStateProps {
  error?: Error | null;
  onReload?: () => void;
  title?: string;
  description?: string;
}

export default function TabFetchErrorState({
  error,
  onReload,
  title = 'Unable to Load Data',
  description = 'There was an error loading the data for this tab.',
}: TabFetchErrorStateProps) {
  const handleReload = () => {
    if (onReload) {
      onReload();
    } else {
      window.location.reload();
    }
  };

  const isInterfaceMismatch =
    error?.message?.includes('interface mismatch') ||
    error?.message?.includes('not found') ||
    error?.message?.includes('Invalid snapshot');

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-lg w-full border-destructive/50 shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-destructive animate-pulse" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-base mt-2">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Details</AlertTitle>
              <AlertDescription className="text-xs font-mono break-all mt-2">
                {error.message}
              </AlertDescription>
            </Alert>
          )}

          {isInterfaceMismatch && (
            <Alert className="border-neon-cyan/40 bg-neon-cyan/10">
              <Info className="h-4 w-4 text-neon-cyan" />
              <AlertTitle className="text-neon-cyan">Possible PWA Cache Issue</AlertTitle>
              <AlertDescription className="text-sm text-muted-foreground">
                This error may be caused by a stale PWA cache after a deployment. Reloading the page
                should clear the cache and fetch the latest version.
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={handleReload} className="w-full" size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload Page
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
