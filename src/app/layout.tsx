import { Providers } from '@/contexts/providers';
import { montserrat } from '@/fonts/montserrat';
import '@/app/globals.css';
import { Toaster } from '@/components/ui/toaster';
import { DebugErrorBoundary } from '@/components/monitoring/ErrorBoundary';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { ConditionalAIAssistant } from '@/components/ai/conditional-ai-assistant';



export const metadata = {
  title: 'HopeAI - Plataforma de Psicología Clínica',
  description: 'Plataforma de gestión para profesionales de la psicología clínica',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
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
          {/* Global floating AI assistant with Gemini integration - only shows for authenticated users */}
          <ConditionalAIAssistant />
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}