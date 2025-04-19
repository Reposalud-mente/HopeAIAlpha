import { Providers } from '@/contexts/providers';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
import { Toaster } from '@/components/ui/toaster';
import { DebugErrorBoundary } from '@/components/monitoring/ErrorBoundary';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { FloatingAIAssistant } from '@/components/ai/ai-assistance-card';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'HopeAI - Plataforma de Psicología Clínica',
  description: 'Plataforma de gestión para profesionales de la psicología clínica',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <DebugErrorBoundary>
            {children}
          </DebugErrorBoundary>
          {/* Feedback widget will only show when the feature flag is enabled */}
          <FeedbackWidget />
          {/* Global floating AI assistant for repetitive/bureaucratic tasks */}
          <FloatingAIAssistant />
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}