import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = async () => {
    // Clear service worker caches before reload
    if ('caches' in window) {
      try {
        const names = await caches.keys();
        await Promise.all(names.map((name) => caches.delete(name)));
      } catch (error) {
        console.error('Failed to clear caches:', error);
      }
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const isInterfaceMismatch =
        this.state.error?.message?.includes('interface mismatch') ||
        this.state.error?.message?.includes('not found') ||
        this.state.error?.message?.includes('Invalid snapshot');

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-md w-full border-destructive/50 shadow-neon-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-16 w-16 text-destructive animate-pulse" />
              </div>
              <CardTitle className="text-2xl">Algo deu errado</CardTitle>
              <CardDescription className="text-base mt-2">
                O aplicativo encontrou um erro inesperado. Por favor, tente recarregar a página.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="p-3 bg-muted/50 rounded-md border border-border">
                  <p className="text-xs font-mono text-muted-foreground break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {isInterfaceMismatch && (
                <Alert className="border-neon-cyan/40 bg-neon-cyan/10">
                  <Info className="h-4 w-4 text-neon-cyan" />
                  <AlertTitle className="text-neon-cyan">Possível Problema de Cache PWA</AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground">
                    Este erro pode ser causado por um cache PWA desatualizado após uma atualização. 
                    O frontend e backend podem estar fora de sincronia. Recarregar a página deve 
                    limpar o cache e buscar a versão mais recente.
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={this.handleReload} className="w-full" size="lg">
                <RefreshCw className="mr-2 h-4 w-4" />
                Recarregar Aplicativo
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                O cache será limpo automaticamente ao recarregar
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
