import React from 'react';
import { Metadata } from 'next';
import SessionsPage from '@/components/clinical/session/SessionsPage';

export const metadata: Metadata = {
  title: 'Administración de Sesiones | HopeAI',
  description: 'Gestiona todas las sesiones terapéuticas de tus pacientes',
};

export default function SessionsRoute() {
  return <SessionsPage />;
}
