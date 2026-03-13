import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw, Wallet } from "lucide-react";
import React from "react";
import { useBinanceAccount } from "../hooks/useBinanceAccount";

export default function BinanceAccountSummary() {
  const { data, isLoading, error, refetch, isFetching } = useBinanceAccount();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (error) {
    const err = error as { code?: number; msg?: string; httpStatus?: number };
    const isAuthError =
      err?.httpStatus === 401 || err?.httpStatus === 403 || err?.code === -2015;
    return (
      <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded border border-destructive/30">
        <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
        <div>
          <p className="text-xs text-destructive font-mono font-bold">
            {isAuthError
              ? "Chave inválida ou sem permissão"
              : "Erro ao buscar conta"}
          </p>
          <p className="text-2xs text-muted-foreground font-mono mt-0.5">
            {err?.msg ?? "Verifique suas credenciais"}
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const pnlPositive = data.totalUnrealizedProfit >= 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-mono text-muted-foreground">
            Conta Futures
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-6 w-6 p-0"
        >
          <RefreshCw
            className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-secondary/50 rounded p-2">
          <p className="text-2xs text-muted-foreground font-mono">
            Saldo Total
          </p>
          <p className="text-sm font-mono font-bold text-foreground">
            {data.totalWalletBalance.toFixed(2)}
          </p>
          <p className="text-2xs text-muted-foreground font-mono">USDT</p>
        </div>
        <div className="bg-secondary/50 rounded p-2">
          <p className="text-2xs text-muted-foreground font-mono">Disponível</p>
          <p className="text-sm font-mono font-bold text-foreground">
            {data.availableBalance.toFixed(2)}
          </p>
          <p className="text-2xs text-muted-foreground font-mono">USDT</p>
        </div>
        <div className="bg-secondary/50 rounded p-2">
          <p className="text-2xs text-muted-foreground font-mono">
            PnL Não Real.
          </p>
          <p
            className={`text-sm font-mono font-bold ${pnlPositive ? "text-[var(--trading-green)]" : "text-[var(--trading-red)]"}`}
          >
            {pnlPositive ? "+" : ""}
            {data.totalUnrealizedProfit.toFixed(2)}
          </p>
          <p className="text-2xs text-muted-foreground font-mono">USDT</p>
        </div>
      </div>
    </div>
  );
}
