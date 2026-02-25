import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm mt-auto safe-bottom">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="text-center text-xs sm:text-sm text-muted-foreground">
          © 2025. Feito com{' '}
          <Heart className="inline w-3 h-3 sm:w-4 sm:h-4 text-chart-1 fill-chart-1" />{' '}
          usando{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-chart-2 hover:text-chart-1 transition-colors font-medium touch-manipulation"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
