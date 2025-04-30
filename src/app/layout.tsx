import { Providers } from '@/contexts/providers';
import { montserrat } from '@/fonts/montserrat';
import '@/app/globals.css';
import { Toaster } from '@/components/ui/toaster';
import { DebugErrorBoundary } from '@/components/monitoring/ErrorBoundary';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { FloatingAIAssistant } from '@/components/ai/ai-assistance-card';



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
      <body className={`${montserrat.variable} font-montserrat-regular`}>
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