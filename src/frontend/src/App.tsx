import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from './components/Header';
import Footer from './components/Footer';
import MarketOverview from './components/MarketOverview';
import TopRecommendations from './components/TopRecommendations';
import AssetResearch from './components/AssetResearch';
import RadarDashboard from './components/RadarDashboard';
import Opportunities from './components/Opportunities';
import InstitutionalOrders from './components/InstitutionalOrders';
import OrderBook from './components/OrderBook';
import InstallPrompt from './components/InstallPrompt';
import UserPreferences from './components/UserPreferences';
import DynamicAlerts from './components/DynamicAlerts';
import AIPerformancePanel from './components/AIPerformancePanel';
import DataStatusIndicator from './components/DataStatusIndicator';
import { ThemeProvider } from './components/ThemeProvider';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { useServiceWorkerUpdate } from './hooks/useServiceWorkerUpdate';
import { learningEngine } from './lib/learningEngine';
import { checkResetSuccess } from './lib/resetFromScratch';
import { toast } from 'sonner';
import { WifiOff } from 'lucide-react';

type TabValue = 'mercado' | 'radar' | 'recomendacoes' | 'opportunities' | 'institutional' | 'orderbook' | 'aprendizado' | 'pesquisa' | 'preferencias';

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

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered:', registration);
            
            // Check for updates periodically
            setInterval(() => {
              registration.update();
            }, 60000); // Check every minute
          })
          .catch((error) => {
            console.log('SW registration failed:', error);
          });
      });
    }
  }, []);

  // Handle manifest shortcuts - read tab from URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    
    if (tabParam) {
      const validTabs: TabValue[] = ['mercado', 'radar', 'recomendacoes', 'opportunities', 'institutional', 'orderbook', 'aprendizado', 'pesquisa', 'preferencias'];
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
              <TabsList className="grid w-full max-w-5xl mx-auto grid-cols-3 sm:grid-cols-9 mb-4 sm:mb-8 h-auto sm:h-10 gap-1 touch-manipulation">
                <TabsTrigger value="mercado" className="text-xs sm:text-sm px-2 py-2">Mercado</TabsTrigger>
                <TabsTrigger value="radar" className="text-xs sm:text-sm px-2 py-2">Radar</TabsTrigger>
                <TabsTrigger value="recomendacoes" className="text-xs sm:text-sm px-2 py-2">Recomendações</TabsTrigger>
                <TabsTrigger value="opportunities" className="text-xs sm:text-sm px-2 py-2">Opportunities</TabsTrigger>
                <TabsTrigger value="institutional" className="text-xs sm:text-sm px-2 py-2">Institutional</TabsTrigger>
                <TabsTrigger value="orderbook" className="text-xs sm:text-sm px-2 py-2">Order Book</TabsTrigger>
                <TabsTrigger value="aprendizado" className="text-xs sm:text-sm px-2 py-2">Aprendizado</TabsTrigger>
                <TabsTrigger value="pesquisa" className="text-xs sm:text-sm px-2 py-2">Pesquisa</TabsTrigger>
                <TabsTrigger value="preferencias" className="text-xs sm:text-sm px-2 py-2">Preferências</TabsTrigger>
              </TabsList>
              
              <TabsContent value="mercado" className="space-y-4 sm:space-y-6">
                <MarketOverview />
              </TabsContent>
              
              <TabsContent value="radar" className="space-y-4 sm:space-y-6">
                <RadarDashboard />
              </TabsContent>
              
              <TabsContent value="recomendacoes" className="space-y-4 sm:space-y-6 overflow-x-hidden">
                <TopRecommendations />
              </TabsContent>
              
              <TabsContent value="opportunities" className="space-y-4 sm:space-y-6">
                <Opportunities />
              </TabsContent>
              
              <TabsContent value="institutional" className="space-y-4 sm:space-y-6">
                <InstitutionalOrders />
              </TabsContent>
              
              <TabsContent value="orderbook" className="space-y-4 sm:space-y-6">
                <OrderBook />
              </TabsContent>
              
              <TabsContent value="aprendizado" className="space-y-4 sm:space-y-6">
                <AIPerformancePanel />
              </TabsContent>
              
              <TabsContent value="pesquisa" className="space-y-4 sm:space-y-6">
                <AssetResearch />
              </TabsContent>
              
              <TabsContent value="preferencias" className="space-y-4 sm:space-y-6">
                <UserPreferences />
              </TabsContent>
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
