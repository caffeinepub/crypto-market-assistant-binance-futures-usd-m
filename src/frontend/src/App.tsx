import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { Suspense, lazy, useEffect, useState } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { ThemeProvider } from "./components/ThemeProvider";
import { useAIPaperTradingEngine } from "./hooks/useAIPaperTradingEngine";

// Lazy-loaded page components
const MarketOverview = lazy(() => import("./components/MarketOverview"));
const TopRecommendations = lazy(
  () => import("./components/TopRecommendations"),
);
const AIPaperTrading = lazy(() => import("./components/AIPaperTrading"));
const AssetResearch = lazy(() => import("./components/AssetResearch"));
const InstitutionalOrders = lazy(
  () => import("./components/InstitutionalOrders"),
);
const UserPreferences = lazy(() => import("./components/UserPreferences"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      gcTime: 120000,
    },
  },
});

type TabId =
  | "market"
  | "recommendations"
  | "ai-paper-trading"
  | "research"
  | "institutional"
  | "preferences";

const TABS: { id: TabId; label: string; shortLabel: string }[] = [
  { id: "market", label: "Mercado", shortLabel: "Mercado" },
  { id: "recommendations", label: "Recomendações", shortLabel: "Rec." },
  { id: "ai-paper-trading", label: "AI Paper Trading", shortLabel: "AI Trade" },
  { id: "research", label: "Pesquisa", shortLabel: "Pesq." },
  { id: "institutional", label: "Institucional", shortLabel: "Inst." },
  { id: "preferences", label: "Preferências", shortLabel: "Pref." },
];

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>("market");

  // Initialize AI Paper Trading Engine at app level
  useAIPaperTradingEngine();

  // Initialize learning engine
  useEffect(() => {
    import("./lib/learningEngine").then(({ learningEngine }) => {
      learningEngine.initialize().catch(() => {});
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      {/* Tab Navigation */}
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/60">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex min-w-max px-2 py-1 gap-0.5">
            {TABS.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                }`}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-3 py-4 max-w-7xl">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          {activeTab === "market" && <MarketOverview />}
          {activeTab === "recommendations" && <TopRecommendations />}
          {activeTab === "ai-paper-trading" && <AIPaperTrading />}
          {activeTab === "research" && <AssetResearch />}
          {activeTab === "institutional" && <InstitutionalOrders />}
          {activeTab === "preferences" && <UserPreferences />}
        </Suspense>
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
