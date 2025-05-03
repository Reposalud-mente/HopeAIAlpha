import { Metadata } from 'next';
import Link from 'next/link';
import { DemoNav } from './components/demo-nav';

export const metadata: Metadata = {
  title: 'Generador de Informes Clínicos con RAG',
  description: 'Demo del generador de informes clínicos basado en Retrieval-Augmented Generation (RAG)',
};

export default function RagReportDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-primary">HopeAI - Generador de Informes RAG</h1>
            <Link href="/" className="text-sm text-gray-500 hover:text-primary transition-colors">
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
      <main>
        <div className="container mx-auto py-4">
          <DemoNav />
          {children}
        </div>
      </main>
      <footer className="border-t mt-12">
        <div className="container mx-auto py-6 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} HopeAI - Psicología clínica simplificada
        </div>
      </footer>
    </div>
  );
}
