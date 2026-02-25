import { AlertCircle, CheckCircle, Clock, RefreshCw, Wifi } from 'lucide-react';
import { useDataStatus } from '@/hooks/useQueries';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DataStatusIndicator() {
  const status = useDataStatus();

  // Don't show anything if everything is fine and not fetching
  if (!status.isStale && !status.hasError && !status.isFetching) {
    return null;
  }

  const handleRetry = () => {
    window.location.reload();
  };

  const getLastUpdateText = () => {
    if (!status.lastUpdate) return 'Never';
    
    const ageMs = Date.now() - status.lastUpdate;
    const ageSeconds = Math.floor(ageMs / 1000);
    
    if (ageSeconds < 60) return `${ageSeconds}s ago`;
    const ageMinutes = Math.floor(ageSeconds / 60);
    if (ageMinutes < 60) return `${ageMinutes}m ago`;
    const ageHours = Math.floor(ageMinutes / 60);
    return `${ageHours}h ago`;
  };

  // Check if error is a blocked/restricted error
  const isBlockedError = status.errorMessage?.toLowerCase().includes('blocked') || 
                         status.errorMessage?.toLowerCase().includes('restricted');

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4">
      <Alert
        variant={status.hasError ? 'destructive' : 'default'}
        className="backdrop-blur-md bg-background/90 border-2 shadow-lg"
      >
        <div className="flex items-start gap-3">
          {status.hasError ? (
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          ) : status.isStale ? (
            <Clock className="h-5 w-5 mt-0.5 flex-shrink-0" />
          ) : (
            <Wifi className="h-5 w-5 mt-0.5 flex-shrink-0 animate-pulse" />
          )}
          <div className="flex-1 space-y-2">
            <AlertDescription className="text-sm font-medium">
              {status.hasError ? (
                <>
                  {isBlockedError ? (
                    <>
                      <strong>Binance access blocked.</strong> {status.errorMessage || 'Service unavailable from restricted location.'}
                    </>
                  ) : (
                    <>
                      <strong>Live data unavailable.</strong> {status.errorMessage || 'Unable to fetch market data from Binance.'}
                    </>
                  )}
                </>
              ) : status.isStale ? (
                <>
                  <strong>Data may be stale.</strong> Last update was {getLastUpdateText()}. Attempting to refresh...
                </>
              ) : (
                <>
                  <strong>Fetching live data...</strong> Updating market information from Binance.
                </>
              )}
            </AlertDescription>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                <Wifi className="w-3 h-3 mr-1" />
                Provider: {status.provider}
              </Badge>
              {status.lastUpdate && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Last update: {getLastUpdateText()}
                </Badge>
              )}
              {status.isStale && (
                <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                  Stale
                </Badge>
              )}
              {isBlockedError && (
                <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-500/30">
                  Blocked
                </Badge>
              )}
            </div>
          </div>
          {status.hasError && (
            <Button
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="ml-2 flex-shrink-0"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
      </Alert>
    </div>
  );
}
