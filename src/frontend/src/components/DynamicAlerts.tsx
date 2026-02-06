import { useEffect, useRef, useState } from 'react';
import { useRadarAlerts, useRecommendations } from '@/hooks/useQueries';
import { TrendingUp, Zap, AlertTriangle, X } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface AlertItem {
  id: string;
  type: 'radar' | 'recommendation';
  symbol: string;
  message: string;
  direction?: 'up' | 'down';
  confidence?: number;
  isFavourite: boolean;
  timestamp: number;
}

export default function DynamicAlerts() {
  const { data: radarAlerts } = useRadarAlerts();
  const { data: recommendations } = useRecommendations();
  const { theme } = useTheme();
  const previousRadarRef = useRef<Set<string>>(new Set());
  const previousRecsRef = useRef<Set<string>>(new Set());
  const [enableAlerts, setEnableAlerts] = useState(true);
  const [favouriteAssets, setFavouriteAssets] = useState<string[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<AlertItem[]>([]);

  // Load preferences
  useEffect(() => {
    const storedAlerts = localStorage.getItem('enable-alerts');
    setEnableAlerts(storedAlerts !== 'false');

    const storedFavourites = localStorage.getItem('favourite-assets');
    if (storedFavourites) {
      try {
        setFavouriteAssets(JSON.parse(storedFavourites));
      } catch (e) {
        console.error('Failed to parse favourite assets', e);
      }
    }
  }, []);

  // Auto-dismiss alerts after 6 seconds
  useEffect(() => {
    if (activeAlerts.length === 0) return;

    const timer = setInterval(() => {
      const now = Date.now();
      setActiveAlerts(prev => prev.filter(alert => now - alert.timestamp < 6000));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeAlerts]);

  const dismissAlert = (id: string) => {
    setActiveAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // Detect new radar alerts
  useEffect(() => {
    if (!enableAlerts || !radarAlerts) return;

    const currentSymbols = new Set(radarAlerts.map(a => a.symbol));
    const newSymbols: string[] = [];

    currentSymbols.forEach(symbol => {
      if (!previousRadarRef.current.has(symbol)) {
        newSymbols.push(symbol);
      }
    });

    if (newSymbols.length > 0) {
      newSymbols.forEach(symbol => {
        const alert = radarAlerts.find(a => a.symbol === symbol);
        if (alert) {
          const isFavourite = favouriteAssets.includes(symbol);
          const direction = alert.direction === 'up' ? 'alta' : 'baixa';
          
          const newAlert: AlertItem = {
            id: `radar-${symbol}-${Date.now()}`,
            type: 'radar',
            symbol,
            message: `Movimento de ${direction} detectado (${alert.percentChange.toFixed(2)}%)`,
            direction: alert.direction,
            isFavourite,
            timestamp: Date.now(),
          };

          setActiveAlerts(prev => [...prev, newAlert]);
        }
      });
    }

    previousRadarRef.current = currentSymbols;
  }, [radarAlerts, enableAlerts, favouriteAssets]);

  // Detect new high-confidence recommendations
  useEffect(() => {
    if (!enableAlerts || !recommendations) return;

    const highConfidenceRecs = recommendations.filter(r => r.confidence >= 0.8);
    const currentSymbols = new Set(highConfidenceRecs.map(r => r.symbol));
    const newSymbols: string[] = [];

    currentSymbols.forEach(symbol => {
      if (!previousRecsRef.current.has(symbol)) {
        newSymbols.push(symbol);
      }
    });

    if (newSymbols.length > 0) {
      newSymbols.forEach(symbol => {
        const rec = highConfidenceRecs.find(r => r.symbol === symbol);
        if (rec) {
          const isFavourite = favouriteAssets.includes(symbol);
          
          const newAlert: AlertItem = {
            id: `rec-${symbol}-${Date.now()}`,
            type: 'recommendation',
            symbol,
            message: `Alta confiança (${Math.round(rec.confidence * 100)}%)`,
            confidence: rec.confidence,
            isFavourite,
            timestamp: Date.now(),
          };

          setActiveAlerts(prev => [...prev, newAlert]);
        }
      });
    }

    previousRecsRef.current = currentSymbols;
  }, [recommendations, enableAlerts, favouriteAssets]);

  if (activeAlerts.length === 0) return null;

  return (
    <div className="fixed top-20 left-0 right-0 z-50 flex flex-col items-center gap-3 px-4 pointer-events-none">
      {activeAlerts.map((alert) => {
        const isRadar = alert.type === 'radar';
        const isBullish = alert.direction === 'up';
        const isBearish = alert.direction === 'down';
        
        // Determine alert color based on type and direction
        let alertColorClass = '';
        let iconColorClass = '';
        let borderColorClass = '';
        let glowClass = '';
        
        if (isRadar) {
          if (isBullish) {
            alertColorClass = 'text-neon-green';
            iconColorClass = 'text-neon-green';
            borderColorClass = 'border-neon-green/60';
            glowClass = 'neon-glow-bullish';
          } else if (isBearish) {
            alertColorClass = 'text-neon-red';
            iconColorClass = 'text-neon-red';
            borderColorClass = 'border-neon-red/60';
            glowClass = 'neon-glow-bearish';
          } else {
            alertColorClass = 'text-neon-orange';
            iconColorClass = 'text-neon-orange';
            borderColorClass = 'border-neon-orange/60';
            glowClass = 'shadow-radar-glow';
          }
        } else {
          alertColorClass = 'text-neon-green';
          iconColorClass = 'text-neon-green';
          borderColorClass = 'border-neon-green/60';
          glowClass = 'neon-glow-bullish';
        }

        return (
          <div
            key={alert.id}
            className={`
              pointer-events-auto
              relative
              w-full max-w-md
              bg-black/80 backdrop-blur-md
              border-2 ${borderColorClass}
              rounded-xl
              p-4
              ${glowClass}
              animate-fade-in-scale
              transition-all duration-300
            `}
            style={{
              animation: 'fadeInScale 0.3s ease-out, pulseGlow 2s ease-in-out infinite',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => dismissAlert(alert.id)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Fechar alerta"
            >
              <X className="w-4 h-4 text-white/60 hover:text-white" />
            </button>

            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {isRadar ? (
                  <div className="relative">
                    <AlertTriangle className={`w-6 h-6 ${iconColorClass}`} />
                    <img 
                      src="/assets/generated/radar-alert-icon-transparent.png" 
                      alt="" 
                      className="absolute inset-0 w-6 h-6 opacity-0"
                      onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <Zap className={`w-6 h-6 ${iconColorClass} fill-current`} />
                    <img 
                      src="/assets/generated/dynamic-alert-icon-transparent.png" 
                      alt="" 
                      className="absolute inset-0 w-6 h-6 opacity-0"
                      onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {alert.isFavourite && (
                    <span className="text-yellow-400 text-sm">⭐</span>
                  )}
                  <p className={`font-bold text-base ${alertColorClass} neon-text truncate`}>
                    {isRadar ? 'Radar' : 'Recomendação'}: {alert.symbol}
                  </p>
                </div>
                <p className="text-sm text-white/90">
                  {alert.message}
                </p>
              </div>

              {/* Direction indicator for radar alerts */}
              {isRadar && alert.direction && (
                <div className="flex-shrink-0">
                  {isBullish ? (
                    <TrendingUp className={`w-5 h-5 ${iconColorClass}`} />
                  ) : (
                    <TrendingUp className={`w-5 h-5 ${iconColorClass} rotate-180`} />
                  )}
                </div>
              )}
            </div>

            {/* Progress bar for auto-dismiss */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-xl overflow-hidden">
              <div
                className={`h-full ${
                  isBullish ? 'bg-neon-green' : isBearish ? 'bg-neon-red' : 'bg-neon-orange'
                }`}
                style={{
                  animation: 'progressBar 6s linear',
                  transformOrigin: 'left',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
