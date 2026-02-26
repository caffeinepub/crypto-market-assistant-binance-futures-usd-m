import React, { useState } from 'react';
import { Eye, EyeOff, Key, Shield, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBinanceAuth } from '../hooks/useBinanceAuth';

export default function BinanceCredentialsForm() {
  const { hasCredentials, saveCredentials, clearCredentials } = useBinanceAuth();
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!apiKey.trim() || !secretKey.trim()) {
      setError('Preencha ambos os campos.');
      return;
    }
    setError('');
    saveCredentials(apiKey.trim(), secretKey.trim());
    setApiKey('');
    setSecretKey('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClear = () => {
    clearCredentials();
    setApiKey('');
    setSecretKey('');
    setSaved(false);
  };

  return (
    <div className="space-y-4">
      {/* Warning */}
      <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-lg border border-border">
        <Shield className="w-4 h-4 text-[var(--trading-amber)] mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Suas chaves são armazenadas <strong className="text-foreground">apenas no localStorage do seu navegador</strong> e nunca são enviadas ao backend. Use chaves com permissão somente de leitura.
        </p>
      </div>

      {hasCredentials && (
        <div className="flex items-center gap-2 p-2 bg-[var(--trading-green)]/10 rounded border border-[var(--trading-green)]/30">
          <CheckCircle className="w-4 h-4 text-[var(--trading-green)]" />
          <span className="text-xs text-[var(--trading-green)] font-mono">Credenciais configuradas</span>
        </div>
      )}

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-mono text-muted-foreground">API Key</Label>
          <div className="relative">
            <Input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Sua Binance API Key"
              className="pr-10 font-mono text-xs bg-secondary border-border"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-mono text-muted-foreground">Secret Key</Label>
          <div className="relative">
            <Input
              type={showSecret ? 'text' : 'password'}
              value={secretKey}
              onChange={e => setSecretKey(e.target.value)}
              placeholder="Sua Binance Secret Key"
              className="pr-10 font-mono text-xs bg-secondary border-border"
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-destructive font-mono">{error}</p>}

        {saved && (
          <p className="text-xs text-[var(--trading-green)] font-mono flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Salvo com sucesso!
          </p>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            size="sm"
            className="flex-1 text-xs font-mono"
          >
            <Key className="w-3 h-3 mr-1" />
            Salvar Chaves
          </Button>
          {hasCredentials && (
            <Button
              onClick={handleClear}
              size="sm"
              variant="destructive"
              className="text-xs font-mono"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
