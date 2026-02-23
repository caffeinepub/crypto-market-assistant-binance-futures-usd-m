import { useEffect, useState, lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from './components/Header';
import Footer from './components/Footer';
import InstallPrompt from './components/InstallPrompt';
import DynamicAlerts from './components/DynamicAlerts';
import DataStatusIndicator from './components/DataStatusIndicator';
import { ThemeProvider } from './components/ThemeProvider';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { useServiceWorkerUpdate } from './hooks/useServiceWorkerUpdate';
import { learningEngine } from './lib/learningEngine';
import { checkResetSuccess } from './lib/resetFromScratch';
import { toast } from 'sonner';
import { WifiOff, Loader2 } from 'lucide-react';

// Lazy load heavy components to reduce initial bundle size
const MarketOverview = lazy(() => import('./components/MarketOverview'));
const TopRecommendations = lazy(() => import('./components/TopRecommendations'));
const AssetResearch = lazy(() => import('./components/AssetResearch'));
const RadarDashboard = lazy(() => import('./components/RadarDashboard'));
const Opportunities = lazy(() => import('./components/Opportunities'));
const InstitutionalOrders = lazy(() => import('./components/InstitutionalOrders'));
const OrderBook = lazy(() => import('./components/OrderBook'));
const AIPerformancePanel = lazy(() => import('./components/AIPerformancePanel'));
const UserPreferences = lazy(() => import('./components/UserPreferences'));
const TradeMonitoring = lazy(() => import('./components/TradeMonitoring'));

type TabValue = 'mercado' | 'radar' | 'recomendacoes' | 'opportunities' | 'institutional' | 'orderbook' | 'monitoring' | 'aprendizado' | 'pesquisa' | 'preferencias';

// Loading fallback component
function TabLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<TabValue>('mercado');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Handle service worker updates
  const { isUpdateAvailable, updateAndReload } = useServiceWorkerUpdate();

  // Check for post-reset success flag and show toast
  useEffect(() => {
    if (checkResetSuccess()) {
      toast.success('Reset complete', {
        description: 'All local data has been cleared. Starting fresh!',
        duration: 5000,
      });
    }
  }, []);

  // Initialize learning engine and clean old data
  useEffect(() => {
    const initLearning = async () => {
      try {
        await learningEngine.initialize();
        // Clean predictions older than 30 days
        await learningEngine.clearOldPredictions(30);
      } catch (error) {
        console.error('Error initializing learning engine:', error);
      }
    };

    initLearning();
  }, []);

  // Register service worker for PWA - simplified to avoid deployment conflicts
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }
  }, []);

  // Handle manifest shortcuts - read tab from URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    
    if (tabParam) {
      const validTabs: TabValue[] = ['mercado', 'radar', 'recomendacoes', 'opportunities', 'institutional', 'orderbook', 'monitoring', 'aprendizado', 'pesquisa', 'preferencias'];
      if (validTabs.includes(tabParam as TabValue)) {
        setActiveTab(tabParam as TabValue);
      }
    }
  }, []);

  // Update URL when tab changes (optional - keeps URL in sync)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentTab = params.get('tab');
    
    if (currentTab !== activeTab) {
      const newUrl = `${window.location.pathname}?tab=${activeTab}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [activeTab]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show toast when update is available
  useEffect(() => {
    if (isUpdateAvailable) {
      toast.info('Nova versão disponível', {
        description: 'Clique para atualizar e recarregar o app',
        action: {
          label: 'Atualizar',
          onClick: updateAndReload,
        },
        duration: Infinity,
      });
    }
  }, [isUpdateAvailable, updateAndReload]);

  return (
    <AppErrorBoundary>
      <ThemeProvider>
        <div className="min-h-screen flex flex-col bg-background safe-area-inset">
          <Header />
          <InstallPrompt />
          <DataStatusIndicator />
          <DynamicAlerts />
          
          {/* Offline indicator */}
          {!isOnline && (
            <div className="bg-destructive/20 border-b border-destructive/30 px-4 py-2 flex items-center justify-center gap-2 text-sm">
              <WifiOff className="h-4 w-4" />
              <span>Modo offline - Alguns recursos podem estar limitados</span>
            </div>
          )}
          
          <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-8">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)} className="w-full">
              <TabsList className="grid w-full max-w-6xl mx-auto grid-cols-3 sm:grid-cols-10 mb-4 sm:mb-8 h-auto sm:h-10 gap-1 touch-manipulation">
                <TabsTrigger value="mercado" className="text-xs sm:text-sm px-2 py-2">Mercado</TabsTrigger>
                <TabsTrigger value="radar" className="text-xs sm:text-sm px-2 py-2">Radar</TabsTrigger>
                <TabsTrigger value="recomendacoes" className="text-xs sm:text-sm px-2 py-2">Recomendações</TabsTrigger>
                <TabsTrigger value="opportunities" className="text-xs sm:text-sm px-2 py-2">Opportunities</TabsTrigger>
                <TabsTrigger value="institutional" className="text-xs sm:text-sm px-2 py-2">Institutional</TabsTrigger>
                <TabsTrigger value="orderbook" className="text-xs sm:text-sm px-2 py-2">Order Book</TabsTrigger>
                <TabsTrigger value="monitoring" className="text-xs sm:text-sm px-2 py-2">Monitoring</TabsTrigger>
                <TabsTrigger value="aprendizado" className="text-xs sm:text-sm px-2 py-2">Aprendizado</TabsTrigger>
                <TabsTrigger value="pesquisa" className="text-xs sm:text-sm px-2 py-2">Pesquisa</TabsTrigger>
                <TabsTrigger value="preferencias" className="text-xs sm:text-sm px-2 py-2">Preferências</TabsTrigger>
              </TabsList>
              
              <Suspense fallback={<TabLoadingFallback />}>
                <TabsContent value="mercado" className="space-y-4 sm:space-y-6">
                  <MarketOverview />
                </TabsContent>
              </Suspense>
              
              <Suspense fallback={<TabLoadingFallback />}>
                <TabsContent value="radar" className="space-y-4 sm:space-y-6">
                  <RadarDashboard />
                </TabsContent>
              </Suspense>
              
              <Suspense fallback={<TabLoadingFallback />}>
                <TabsContent value="recomendacoes" className="space-y-4 sm:space-y-6 overflow-x-hidden">
                  <TopRecommendations />
                </TabsContent>
              </Suspense>
              
              <Suspense fallback={<TabLoadingFallback />}>
                <TabsContent value="opportunities" className="space-y-4 sm:space-y-6">
                  <Opportunities />
                </TabsContent>
              </Suspense>
              
              <Suspense fallback={<TabLoadingFallback />}>
                <TabsContent value="institutional" className="space-y-4 sm:space-y-6">
                  <InstitutionalOrders />
                </TabsContent>
              </Suspense>
              
              <Suspense fallback={<TabLoadingFallback />}>
                <TabsContent value="orderbook" className="space-y-4 sm:space-y-6">
                  <OrderBook />
                </TabsContent>
              </Suspense>
              
              <Suspense fallback={<TabLoadingFallback />}>
                <TabsContent value="monitoring" className="space-y-4 sm:space-y-6">
                  <TradeMonitoring />
                </TabsContent>
              </Suspense>
              
              <Suspense fallback={<TabLoadingFallback />}>
                <TabsContent value="aprendizado" className="space-y-4 sm:space-y-6">
                  <AIPerformancePanel />
                </TabsContent>
              </Suspense>
              
              <Suspense fallback={<TabLoadingFallback />}>
                <TabsContent value="pesquisa" className="space-y-4 sm:space-y-6">
                  <AssetResearch />
                </TabsContent>
              </Suspense>
              
              <Suspense fallback={<TabLoadingFallback />}>
                <TabsContent value="preferencias" className="space-y-4 sm:space-y-6">
                  <UserPreferences />
                </TabsContent>
              </Suspense>
            </Tabs>
          </main>
          <Footer />
          <Toaster />
        </div>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}

export default App;
