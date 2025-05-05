'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X, HelpCircle, FileText, User, ClipboardList, Edit, Sparkles } from 'lucide-react';
import { useWizard } from '@/contexts/WizardContext';

interface WizardHelpProps {
  step: string;
}

export default function WizardHelp({ step }: WizardHelpProps) {
  const { toggleHelp } = useWizard();

  // Help content based on the current step
  const getHelpContent = () => {
    switch (step) {
      case 'patient-selection':
        return {
          title: 'Selección de Paciente',
          icon: <User className="h-5 w-5 text-blue-600" />,
          content: (
            <div className="space-y-4">
              <p>
                En este paso, debes seleccionar el paciente para el cual deseas generar un informe psicológico.
              </p>
              
              <h3 className="font-medium text-gray-800">¿Cómo seleccionar un paciente?</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Utiliza el buscador para filtrar por nombre, apellido o número de identificación.</li>
                <li>Haz clic en el paciente deseado de la lista de resultados.</li>
                <li>Verifica que los datos del paciente seleccionado sean correctos.</li>
                <li>Una vez seleccionado, haz clic en "Siguiente" para continuar.</li>
              </ol>
              
              <h3 className="font-medium text-gray-800">Consejos útiles:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Puedes ordenar la lista de pacientes haciendo clic en los encabezados de columna.</li>
                <li>Si el paciente no aparece en la lista, verifica que esté registrado en el sistema.</li>
                <li>Asegúrate de seleccionar el centro clínico correcto antes de buscar al paciente.</li>
              </ul>
            </div>
          )
        };
      
      case 'clinical-info':
        return {
          title: 'Tipo de Informe',
          icon: <ClipboardList className="h-5 w-5 text-blue-600" />,
          content: (
            <div className="space-y-4">
              <p>
                En este paso, debes seleccionar el tipo de informe que deseas generar y completar la información clínica relevante.
              </p>
              
              <h3 className="font-medium text-gray-800">Tipos de informes disponibles:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Evaluación Psicológica:</strong> Informe completo de evaluación con diagnóstico y recomendaciones.</li>
                <li><strong>Seguimiento Terapéutico:</strong> Informe de progreso y evolución del paciente durante el tratamiento.</li>
                <li><strong>Evaluación Neuropsicológica:</strong> Evaluación detallada de funciones cognitivas y neuropsicológicas.</li>
                <li><strong>Informe Familiar/Sistémico:</strong> Evaluación de dinámicas familiares y sistemas de relación.</li>
                <li><strong>Informe Psicoeducativo:</strong> Evaluación para contextos educativos y adaptaciones curriculares.</li>
                <li><strong>Alta Terapéutica:</strong> Informe de cierre y finalización del proceso terapéutico.</li>
              </ul>
              
              <h3 className="font-medium text-gray-800">Consejos para completar la información:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Sé específico y conciso en tus descripciones.</li>
                <li>Incluye solo información relevante para el tipo de informe seleccionado.</li>
                <li>Utiliza terminología profesional apropiada.</li>
                <li>Revisa la información antes de continuar al siguiente paso.</li>
              </ul>
            </div>
          )
        };
      
      case 'report-preview':
        return {
          title: 'Previsualización y Edición',
          icon: <Edit className="h-5 w-5 text-blue-600" />,
          content: (
            <div className="space-y-4">
              <p>
                En este paso, puedes previsualizar y editar el borrador del informe generado por la IA.
              </p>
              
              <h3 className="font-medium text-gray-800">Opciones disponibles:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Vista Previa:</strong> Visualiza el informe completo en formato de documento.</li>
                <li><strong>Editar Secciones:</strong> Modifica secciones específicas del informe.</li>
                <li><strong>Mejorar:</strong> Aplica mejoras automáticas a secciones específicas.</li>
                <li><strong>Guardar:</strong> Guarda el borrador actual en el historial del paciente.</li>
                <li><strong>Descargar PDF:</strong> Genera y descarga el informe en formato PDF.</li>
              </ul>
              
              <h3 className="font-medium text-gray-800">Consejos para la edición:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Revisa cuidadosamente el contenido generado por la IA.</li>
                <li>Personaliza el informe según las necesidades específicas del caso.</li>
                <li>Utiliza la función "Mejorar" para refinar automáticamente secciones específicas.</li>
                <li>Verifica la coherencia y cohesión del texto completo.</li>
                <li>Asegúrate de que el informe cumple con los estándares profesionales y éticos.</li>
              </ul>
            </div>
          )
        };
      
      case 'report-generation':
        return {
          title: 'Redacción Final',
          icon: <Sparkles className="h-5 w-5 text-blue-600" />,
          content: (
            <div className="space-y-4">
              <p>
                En este paso final, puedes revisar, finalizar y exportar el informe psicológico.
              </p>
              
              <h3 className="font-medium text-gray-800">Opciones disponibles:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Vista Previa:</strong> Visualiza el informe final antes de exportarlo.</li>
                <li><strong>Guardar:</strong> Guarda el informe final en el historial del paciente.</li>
                <li><strong>Descargar PDF:</strong> Genera y descarga el informe final en formato PDF.</li>
                <li><strong>Imprimir:</strong> Envía el informe directamente a la impresora.</li>
                <li><strong>Compartir:</strong> Comparte el informe por correo electrónico u otros medios.</li>
              </ul>
              
              <h3 className="font-medium text-gray-800">Antes de finalizar:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Verifica que toda la información del paciente sea correcta.</li>
                <li>Asegúrate de que el diagnóstico y las recomendaciones sean apropiados.</li>
                <li>Revisa la ortografía y gramática del documento completo.</li>
                <li>Confirma que el formato del informe sea profesional y consistente.</li>
                <li>Verifica que el informe cumpla con los requisitos legales y éticos aplicables.</li>
              </ul>
            </div>
          )
        };
      
      case 'summary':
        return {
          title: 'Resumen y Confirmación',
          icon: <FileText className="h-5 w-5 text-blue-600" />,
          content: (
            <div className="space-y-4">
              <p>
                En este paso, puedes revisar un resumen de todas tus selecciones antes de generar el informe final.
              </p>
              
              <h3 className="font-medium text-gray-800">¿Qué debes verificar?</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Datos del paciente: nombre, fecha de nacimiento, género, etc.</li>
                <li>Tipo de informe seleccionado.</li>
                <li>Información clínica proporcionada.</li>
                <li>Profesional y centro clínico asociados al informe.</li>
              </ul>
              
              <h3 className="font-medium text-gray-800">Opciones disponibles:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Puedes volver a cualquier paso anterior para modificar la información.</li>
                <li>Una vez verificada toda la información, haz clic en "Generar Informe" para continuar.</li>
              </ul>
              
              <p className="text-gray-700">
                Este paso es crucial para asegurar la precisión y calidad del informe final.
              </p>
            </div>
          )
        };
      
      default:
        return {
          title: 'Ayuda General',
          icon: <HelpCircle className="h-5 w-5 text-blue-600" />,
          content: (
            <div className="space-y-4">
              <p>
                Bienvenido al asistente de generación de informes psicológicos. Este asistente te guiará a través del proceso de creación de informes profesionales para tus pacientes.
              </p>
              
              <h3 className="font-medium text-gray-800">Pasos del proceso:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li><strong>Selección de Paciente:</strong> Elige el paciente para el cual deseas generar un informe.</li>
                <li><strong>Tipo de Informe:</strong> Selecciona el tipo de informe y completa la información clínica relevante.</li>
                <li><strong>Previsualización y Edición:</strong> Revisa y edita el borrador generado por la IA.</li>
                <li><strong>Redacción Final:</strong> Finaliza y exporta el informe psicológico.</li>
              </ol>
              
              <h3 className="font-medium text-gray-800">Funcionalidades disponibles:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Guardar progreso para continuar más tarde.</li>
                <li>Editar secciones específicas del informe.</li>
                <li>Previsualizar el informe antes de finalizarlo.</li>
                <li>Descargar el informe en formato PDF.</li>
                <li>Guardar el informe en el historial del paciente.</li>
              </ul>
              
              <p className="text-gray-700">
                Para obtener ayuda específica sobre cada paso, haz clic en el icono de ayuda en cualquier momento durante el proceso.
              </p>
            </div>
          )
        };
    }
  };

  const helpContent = getHelpContent();

  return (
    <Card className="border border-blue-100 shadow-md">
      <CardHeader className="bg-blue-50 border-b border-blue-100 flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2 text-blue-700">
          {helpContent.icon}
          <span>Ayuda: {helpContent.title}</span>
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={toggleHelp} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="h-[400px] pr-4">
          {helpContent.content}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}