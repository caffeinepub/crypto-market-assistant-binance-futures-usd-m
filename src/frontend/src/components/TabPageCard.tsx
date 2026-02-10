import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';

interface TabPageCardProps {
  icon?: ReactNode;
  title: string;
  description: string;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function TabPageCard({
  icon,
  title,
  description,
  badge,
  children,
  className = '',
}: TabPageCardProps) {
  return (
    <Card className={`border-2 border-neon-cyan/30 bg-card/60 backdrop-blur-sm shadow-neon-md ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <div>
              <CardTitle className="text-2xl text-neon-cyan neon-text">{title}</CardTitle>
              <CardDescription className="text-base mt-1">{description}</CardDescription>
            </div>
          </div>
          {badge}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
