import { useEffect, useState, useRef } from 'react';
import { X, TrendingUp, Zap } from 'lucide-react';
import { useRadarAlerts, useRecommendations } from '@/hooks/useQueries';
import { useRadarSensitivity } from '@/hooks/useRadarSensitivity';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  type: 'radar' | 'recommendation';
  symbol: string;
  message: string;
  timestamp: number;
}

export default function DynamicAlerts() {
  const { data: radarAlerts } = useRadarAlerts();
  const { data: recommendations } = useRecommendations();
  const { policy } = useRadarSensitivity();
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const processedRadarRef = useRef<Map<string, number>>(new Map());
  const processedRecommendationsRef = useRef<Set<string>>(new Set());
  const [enableAlerts, setEnableAlerts] = useState(true);

  // Check if alerts are enabled
  useEffect(() => {
    const enabled = localStorage.getItem('enable-alerts') !== 'false';
    setEnableAlerts(enabled);
  }, []);

  // Process radar alerts with sensitivity-aware cooldown
  useEffect(() => {
    if (!radarAlerts || !enableAlerts) return;

    const now = Date.now();

    radarAlerts.forEach((alert) => {
      // Check if alert meets notification confidence threshold
      if (alert.confidence < policy.minConfidenceForNotification) {
        return;
      }

      const key = alert.symbol;
      const lastNotified = processedRadarRef.current.get(key) || 0;
      
      // Apply cooldown from sensitivity policy
      if (now - lastNotified < policy.notificationCooldownMs) {
        return;
      }

      processedRadarRef.current.set(key, now);

      // Build message with primary reason
      const primaryReason = alert.reasons[0] || 'Anomaly detected';
      const additionalCount = alert.reasons.length - 1;
      const message = additionalCount > 0
        ? `${primaryReason} (+${additionalCount} more)`
        : primaryReason;

      const newAlert: Alert = {
        id: `radar-${key}-${now}`,
        type: 'radar',
        symbol: alert.symbol,
        message,
        timestamp: now,
      };

      setActiveAlerts((prev) => [...prev, newAlert]);

      // Auto-dismiss after 8 seconds
      setTimeout(() => {
        setActiveAlerts((prev) => prev.filter((a) => a.id !== newAlert.id));
      }, 8000);
    });

    // Clean up old entries (keep last 50)
    if (processedRadarRef.current.size > 100) {
      const entries = Array.from(processedRadarRef.current.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50);
      processedRadarRef.current = new Map(entries);
    }
  }, [radarAlerts, enableAlerts, policy]);

  // Process recommendations
  useEffect(() => {
    if (!recommendations || !enableAlerts) return;

    recommendations.forEach((rec) => {
      const key = `${rec.symbol}-${Math.floor(rec.timestamp / 60000)}`;
      
      if (!processedRecommendationsRef.current.has(key) && rec.confidence > 0.7) {
        processedRecommendationsRef.current.add(key);

        const newAlert: Alert = {
          id: `rec-${key}`,
          type: 'recommendation',
          symbol: rec.symbol,
          message: `High confidence signal: ${(rec.confidence * 100).toFixed(0)}% confidence`,
          timestamp: Date.now(),
        };

        setActiveAlerts((prev) => [...prev, newAlert]);

        // Auto-dismiss after 8 seconds
        setTimeout(() => {
          setActiveAlerts((prev) => prev.filter((a) => a.id !== newAlert.id));
        }, 8000);
      }
    });

    // Clean up old entries
    if (processedRecommendationsRef.current.size > 100) {
      const entries = Array.from(processedRecommendationsRef.current);
      processedRecommendationsRef.current = new Set(entries.slice(-50));
    }
  }, [recommendations, enableAlerts]);

  const dismissAlert = (id: string) => {
    setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  if (!enableAlerts || activeAlerts.length === 0) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-none">
      <div className="space-y-2 pointer-events-auto">
        {activeAlerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              'relative overflow-hidden rounded-lg border backdrop-blur-md shadow-lg animate-fadeInScale',
              alert.type === 'radar'
                ? 'bg-primary/10 border-primary/30'
                : 'bg-green-500/10 border-green-500/30'
            )}
          >
            {/* Progress bar */}
            <div
              className={cn(
                'absolute bottom-0 left-0 h-1 animate-progressBar',
                alert.type === 'radar' ? 'bg-primary' : 'bg-green-500'
              )}
              style={{ animationDuration: '8s' }}
            />

            <div className="p-4 pr-12">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'rounded-full p-2 mt-0.5',
                    alert.type === 'radar' ? 'bg-primary/20' : 'bg-green-500/20'
                  )}
                >
                  {alert.type === 'radar' ? (
                    <Zap className="h-4 w-4 text-primary" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm mb-1">{alert.symbol}</div>
                  <div className="text-xs text-muted-foreground break-words">
                    {alert.message}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => dismissAlert(alert.id)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-background/20 transition-colors"
              aria-label="Dismiss alert"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
