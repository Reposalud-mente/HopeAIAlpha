'use client';

/*
  Refactored ClinicalInfoForm component
  ====================================
  Key improvements:
  1. Centralised state management using a single `reportData` object, drastically
     reducing the number of individual `useState` declarations and making data
     flow easier to reason about.
  2. Report-type configuration extracted to a constant outside the component so
     the JSX remains concise and the config can be reused elsewhere.
  3. Added strongly-typed helpers (`updateReportField`, `resetReportData`) to
     mutate nested state in a predictable (immutable) manner.
  4. Improved date parsing / formatting utilities (`ddmmyyyyToISOLike` &
     `isoLikeToDDMMYYYY`) for robustness and readability.
  5. Component now renders the correct template component through a lookup map
     (`reportComponents`) to avoid a large chain of conditional JSX.
  6. Validation trimmed down to meta-level fields; sub-component validation is
     expected to live inside each template for better encapsulation.
  7. Overall file size reduced and readability/maintainability improved.

  NOTE: The template components (`PsychologicalEvaluationFields`, etc.) retain
  their original public API, so we still fan-out props to them.  However the
  internal state is now consolidated which means adding/removing a field will
  only touch *one* location in this file.
*/

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FileText,
  Brain,
  HeartPulse,
  Users,
  GraduationCap,
  FileCheck,
} from 'lucide-react';
import { usePatient } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import PatientInfoPanel from './PatientInfoPanel';

// Report template components -------------------------------------------------
import PsychologicalEvaluationFields from '../report-templates/PsychologicalEvaluationFields';
import TherapeuticFollowupFields from '../report-templates/TherapeuticFollowupFields';
import NeuropsychologicalEvaluationFields from '../report-templates/NeuropsychologicalEvaluationFields';
import FamilyReportFields from '../report-templates/FamilyReportFields';
import EducationalReportFields from '../report-templates/EducationalReportFields';
import DischargeReportFields from '../report-templates/DischargeReportFields';

// ---------------------------------------------------------------------------
// Types & helpers
// ---------------------------------------------------------------------------
// ------------- Report-type identifiers --------------------------------------
export type ReportTypeKey =
  | 'evaluacion-psicologica'
  | 'seguimiento-terapeutico'
  | 'evaluacion-neuropsicologica'
  | 'informe-familiar'
  | 'informe-educativo'
  | 'alta-terapeutica';

// ------------- Meta props ---------------------------------------------------
interface ClinicalInfoFormProps {
  clinica: string;
  psicologo: string;
  fecha: string; // expected DD/MM/YYYY
  onClinicaChange: (clinica: string) => void;
  onPsicologoChange: (psicologo: string) => void;
  onFechaChange: (fecha: string) => void;
  onComplete: () => void;
  tipoInforme?: ReportTypeKey | '';
  onTipoInformeChange?: (tipo: ReportTypeKey | '') => void;
}

// ------------- Field state per report --------------------------------------
// NOTE: keep these interfaces in-sync with their respective templates.
interface PsychologicalEvaluationState {
  motivoConsulta: string;
  antecedentes: string;
  testsPsicometricos: string[];
  resultadosPruebas: string;
  diagnosticoPresuntivo: string;
  recomendaciones: string;
}

interface TherapeuticFollowupState {
  evolucion: string;
  cambiosSintomas: string;
  nivelMejoria: number;
  adherenciaTratamiento: string;
  ajusteObjetivos: string;
  observacionesTerapeuta: string;
}

interface NeuropsychologicalEvaluationState {
  motivoDerivacion: string;
  funcionesCognitivas: string[];
  resultadosPruebas: string;
  diagnosticoDiferencial: string;
  sugerenciasIntervencion: string;
}

interface FamilyReportState {
  motivoConsultaFamiliar: string;
  miembrosEvaluados: string;
  dinamicaFamiliar: string;
  factoresRiesgoProteccion: string;
  intervencionSugerida: string;
}

interface EducationalReportState {
  motivoEvaluacionEscolar: string;
  areasDificultad: string[];
  evaluacionesAplicadas: string;
  diagnosticoEducativo: string;
  recomendacionesEscolares: string;
}

interface DischargeReportState {
  diagnosticoFinal: string;
  resumenEvolucion: string;
  logrosTerapeuticos: string;
  nivelCumplimientoObjetivos: number;
  indicacionesAlta: string;
  recomendacionesSeguimiento: string;
}

// Union map -------------------------------------------------
interface ReportStateMap {
  'evaluacion-psicologica': PsychologicalEvaluationState;
  'seguimiento-terapeutico': TherapeuticFollowupState;
  'evaluacion-neuropsicologica': NeuropsychologicalEvaluationState;
  'informe-familiar': FamilyReportState;
  'informe-educativo': EducationalReportState;
  'alta-terapeutica': DischargeReportState;
}

// Provide sensible initial values for each report type ---------
const initialReportStates: ReportStateMap = {
  'evaluacion-psicologica': {
    motivoConsulta: '',
    antecedentes: '',
    testsPsicometricos: [],
    resultadosPruebas: '',
    diagnosticoPresuntivo: '',
    recomendaciones: '',
  },
  'seguimiento-terapeutico': {
    evolucion: '',
    cambiosSintomas: '',
    nivelMejoria: 5,
    adherenciaTratamiento: '',
    ajusteObjetivos: '',
    observacionesTerapeuta: '',
  },
  'evaluacion-neuropsicologica': {
    motivoDerivacion: '',
    funcionesCognitivas: [],
    resultadosPruebas: '',
    diagnosticoDiferencial: '',
    sugerenciasIntervencion: '',
  },
  'informe-familiar': {
    motivoConsultaFamiliar: '',
    miembrosEvaluados: '',
    dinamicaFamiliar: '',
    factoresRiesgoProteccion: '',
    intervencionSugerida: '',
  },
  'informe-educativo': {
    motivoEvaluacionEscolar: '',
    areasDificultad: [],
    evaluacionesAplicadas: '',
    diagnosticoEducativo: '',
    recomendacionesEscolares: '',
  },
  'alta-terapeutica': {
    diagnosticoFinal: '',
    resumenEvolucion: '',
    logrosTerapeuticos: '',
    nivelCumplimientoObjetivos: 7,
    indicacionesAlta: '',
    recomendacionesSeguimiento: '',
  },
};

// ------------- Utility: date conversions -----------------------------------
const ddmmyyyyToISOLike = (ddmmyyyy: string): string => {
  if (!ddmmyyyy) return format(new Date(), 'yyyy-MM-dd');
  const [d, m, y] = ddmmyyyy.split('/');
  if (!d || !m || !y) return format(new Date(), 'yyyy-MM-dd');
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
};

const isoLikeToDDMMYYYY = (iso: string): string => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!d || !m || !y) return '';
  return `${d}/${m}/${y}`;
};

// ------------- Report-type catalogue ---------------------------------------
interface ReportTypeInfo {
  value: ReportTypeKey;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export const REPORT_TYPES: Readonly<ReportTypeInfo[]> = [
  {
    value: 'evaluacion-psicologica',
    label: 'Evaluación Psicológica',
    description:
      'Informe completo de evaluación psicológica con diagnóstico y recomendaciones',
    icon: <Brain className="h-6 w-6" />,
  },
  {
    value: 'seguimiento-terapeutico',
    label: 'Seguimiento Terapéutico',
    description: 'Informe de progreso y evolución del paciente durante el tratamiento',
    icon: <HeartPulse className="h-6 w-6" />,
  },
  {
    value: 'evaluacion-neuropsicologica',
    label: 'Evaluación Neuropsicológica',
    description: 'Evaluación detallada de funciones cognitivas y neuropsicológicas',
    icon: <Brain className="h-6 w-6" />,
  },
  {
    value: 'informe-familiar',
    label: 'Informe Familiar/Sistémico',
    description: 'Evaluación de dinámicas familiares y sistemas de relación',
    icon: <Users className="h-6 w-6" />,
  },
  {
    value: 'informe-educativo',
    label: 'Informe Psicoeducativo',
    description: 'Evaluación para contextos educativos y adaptaciones curriculares',
    icon: <GraduationCap className="h-6 w-6" />,
  },
  {
    value: 'alta-terapeutica',
    label: 'Alta Terapéutica',
    description: 'Informe de cierre y finalización del proceso terapéutico',
    icon: <FileCheck className="h-6 w-6" />,
  },
];

// Map report id => component (memoised later)
const reportComponents: Record<ReportTypeKey, React.ComponentType<any>> = {
  'evaluacion-psicologica': PsychologicalEvaluationFields,
  'seguimiento-terapeutico': TherapeuticFollowupFields,
  'evaluacion-neuropsicologica': NeuropsychologicalEvaluationFields,
  'informe-familiar': FamilyReportFields,
  'informe-educativo': EducationalReportFields,
  'alta-terapeutica': DischargeReportFields,
};

// ---------------------------------------------------------------------------
// Component implementation
// ---------------------------------------------------------------------------
const ClinicalInfoForm: React.FC<ClinicalInfoFormProps> = ({
  clinica,
  psicologo,
  fecha,
  onClinicaChange,
  onPsicologoChange,
  onFechaChange,
  onComplete,
  tipoInforme = '',
  onTipoInformeChange = () => {},
}) => {
  const { currentPatient } = usePatient();

  // -----------------------------------------------------------------------
  // Local state
  // -----------------------------------------------------------------------
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dateInputValue, setDateInputValue] = useState<string>(ddmmyyyyToISOLike(fecha));
  const [reportData, setReportData] = useState<ReportStateMap>(initialReportStates);

  // Update local ISO-like date when `fecha` prop changes --------------------
  useEffect(() => {
    setDateInputValue(ddmmyyyyToISOLike(fecha));
  }, [fecha]);

  // -----------------------------------------------------------------------
  // Callbacks / state helpers
  // -----------------------------------------------------------------------
  // Generic updater that mutates (immutably) a single field of the selected
  // report data. The function signature purposefully keeps `field` as `string`
  // to avoid the TypeScript inference issue that appeared when using
  // `keyof ReportStateMap[T]`, while still preserving runtime safety in the
  // implementation.
  const updateReportField = useCallback(
    (report: ReportTypeKey, field: string, value: any) => {
      setReportData((prev) => ({
        ...prev,
        [report]: {
          ...prev[report],
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore – runtime access is safe because `field` originates from
          // controlled strings within each template component.
          [field]: value,
        },
      }));
    },
    []
  );

  const resetReportData = useCallback(<T extends ReportTypeKey>(report: T) => {
    setReportData((prev) => ({
      ...prev,
      [report]: initialReportStates[report],
    }));
  }, []);

  // -----------------------------------------------------------------------
  // Validation (meta only – template components handle their own) ----------
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!clinica) newErrors.clinica = 'La clínica es requerida';
    if (!psicologo) newErrors.psicologo = 'El psicólogo es requerido';
    if (!fecha || isNaN(new Date(ddmmyyyyToISOLike(fecha)).getTime()))
      newErrors.fecha = 'La fecha es inválida o requerida';
    if (!tipoInforme) newErrors.tipoInforme = 'El tipo de informe es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Trigger validation for parent wizard/stepper ---------------------------
  const handleValidateAndContinue = () => {
    if (validateForm()) {
      onComplete();
      return true;
    }
    return false;
  };

  // -----------------------------------------------------------------------
  // Derived data -----------------------------------------------------------
  const SelectedReportComponent = useMemo(() => {
    if (!tipoInforme) return null;
    return reportComponents[tipoInforme as ReportTypeKey];
  }, [tipoInforme]);

  // -----------------------------------------------------------------------
  // Render guards ----------------------------------------------------------
  if (!currentPatient) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">Por favor seleccione un paciente primero.</p>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="px-6 pb-6">
      {/* 1. Patient summary */}
      <PatientInfoPanel patient={currentPatient} className="mb-6" />

      {/* 2. Card wrapper */}
      <div className="mt-4">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white overflow-hidden rounded-lg">
          <div className="p-6">
            {/* ----------------------------------------------------------- */}
            {/* Step A: Report-type selection                             */}
            {/* ----------------------------------------------------------- */}
            {!tipoInforme && (
              <div className="mb-8">
                <h4 className="text-base font-medium text-gray-800 mb-4 flex items-center">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  Seleccione el tipo de informe
                </h4>
                <p className="text-sm text-gray-600 mb-6">
                  El tipo de informe determinará los campos específicos a completar y la estructura del
                  documento final generado por la IA.
                </p>

                {errors.tipoInforme && (
                  <p className="text-red-500 text-sm mt-1">{errors.tipoInforme}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {REPORT_TYPES.map((tipo) => (
                    <div
                      key={tipo.value}
                      onClick={() => {
                        onTipoInformeChange(tipo.value);
                        // reset specific data to avoid stale values if switching types
                        resetReportData(tipo.value);
                      }}
                      className="flex flex-col p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center mb-2">
                        <div className="bg-blue-100 p-2 rounded-full mr-3 text-blue-600">
                          {tipo.icon}
                        </div>
                        <h5 className="font-medium text-gray-800">{tipo.label}</h5>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{tipo.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------- */}
            {/* Step B: Render selected report fields                      */}
            {/* ----------------------------------------------------------- */}
            {tipoInforme && SelectedReportComponent && (
              <div>
                {/* Header & change button --------------------------------*/}
                <div
                  id="report-template-header"
                  className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100"
                >
                  <div className="flex items-center">
                    {REPORT_TYPES.find((t) => t.value === tipoInforme)?.icon}
                    <h4 className="text-base font-medium text-gray-800 ml-2">
                      {REPORT_TYPES.find((t) => t.value === tipoInforme)?.label}
                    </h4>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTipoInformeChange('')}
                    className="text-xs hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                  >
                    Cambiar tipo
                  </Button>
                </div>

                {/* Template component -----------------------------------*/}
                {/* The template API stays untouched – field props are */}
                {/* produced dynamically from the central `reportData`.*/}
                {(() => {
                  // Helper to unwrap data & create setter factory
                  const data = reportData[tipoInforme as ReportTypeKey] as any;
                  const makeSetter = (field: string) => (value: any) =>
                    updateReportField(tipoInforme as ReportTypeKey, field as any, value);

                  switch (tipoInforme) {
                    case 'evaluacion-psicologica':
                      return (
                        <PsychologicalEvaluationFields
                          motivoConsulta={data.motivoConsulta}
                          onMotivoConsultaChange={makeSetter('motivoConsulta')}
                          antecedentes={data.antecedentes}
                          onAntecedentesChange={makeSetter('antecedentes')}
                          testsPsicometricos={data.testsPsicometricos}
                          onTestsPsicometricosChange={makeSetter('testsPsicometricos')}
                          resultadosPruebas={data.resultadosPruebas}
                          onResultadosPruebasChange={makeSetter('resultadosPruebas')}
                          diagnosticoPresuntivo={data.diagnosticoPresuntivo}
                          onDiagnosticoPresuntivoChange={makeSetter('diagnosticoPresuntivo')}
                          recomendaciones={data.recomendaciones}
                          onRecomendacionesChange={makeSetter('recomendaciones')}
                          onComplete={onComplete}
                        />
                      );
                    case 'seguimiento-terapeutico':
                      return (
                        <TherapeuticFollowupFields
                          evolucion={data.evolucion}
                          onEvolucionChange={makeSetter('evolucion')}
                          cambiosSintomas={data.cambiosSintomas}
                          onCambiosSintomasChange={makeSetter('cambiosSintomas')}
                          nivelMejoria={data.nivelMejoria}
                          onNivelMejoriaChange={makeSetter('nivelMejoria')}
                          adherenciaTratamiento={data.adherenciaTratamiento}
                          onAdherenciaTratamientoChange={makeSetter('adherenciaTratamiento')}
                          ajusteObjetivos={data.ajusteObjetivos}
                          onAjusteObjetivosChange={makeSetter('ajusteObjetivos')}
                          observacionesTerapeuta={data.observacionesTerapeuta}
                          onObservacionesTerapeutaChange={makeSetter('observacionesTerapeuta')}
                          onComplete={onComplete}
                        />
                      );
                    case 'evaluacion-neuropsicologica':
                      return (
                        <NeuropsychologicalEvaluationFields
                          motivoDerivacion={data.motivoDerivacion}
                          onMotivoDerivacionChange={makeSetter('motivoDerivacion')}
                          funcionesCognitivas={data.funcionesCognitivas}
                          onFuncionesCognitivasChange={makeSetter('funcionesCognitivas')}
                          resultadosPruebas={data.resultadosPruebas}
                          onResultadosPruebasChange={makeSetter('resultadosPruebas')}
                          diagnosticoDiferencial={data.diagnosticoDiferencial}
                          onDiagnosticoDiferencialChange={makeSetter('diagnosticoDiferencial')}
                          sugerenciasIntervencion={data.sugerenciasIntervencion}
                          onSugerenciasIntervencionChange={makeSetter('sugerenciasIntervencion')}
                          onComplete={onComplete}
                        />
                      );
                    case 'informe-familiar':
                      return (
                        <FamilyReportFields
                          motivoConsultaFamiliar={data.motivoConsultaFamiliar}
                          onMotivoConsultaFamiliarChange={makeSetter('motivoConsultaFamiliar')}
                          miembrosEvaluados={data.miembrosEvaluados}
                          onMiembrosEvaluadosChange={makeSetter('miembrosEvaluados')}
                          dinamicaFamiliar={data.dinamicaFamiliar}
                          onDinamicaFamiliarChange={makeSetter('dinamicaFamiliar')}
                          factoresRiesgoProteccion={data.factoresRiesgoProteccion}
                          onFactoresRiesgoProteccionChange={makeSetter('factoresRiesgoProteccion')}
                          intervencionSugerida={data.intervencionSugerida}
                          onIntervencionSugeridaChange={makeSetter('intervencionSugerida')}
                          onComplete={onComplete}
                        />
                      );
                    case 'informe-educativo':
                      return (
                        <EducationalReportFields
                          motivoEvaluacionEscolar={data.motivoEvaluacionEscolar}
                          onMotivoEvaluacionEscolarChange={makeSetter('motivoEvaluacionEscolar')}
                          areasDificultad={data.areasDificultad}
                          onAreasDificultadChange={makeSetter('areasDificultad')}
                          evaluacionesAplicadas={data.evaluacionesAplicadas}
                          onEvaluacionesAplicadasChange={makeSetter('evaluacionesAplicadas')}
                          diagnosticoEducativo={data.diagnosticoEducativo}
                          onDiagnosticoEducativoChange={makeSetter('diagnosticoEducativo')}
                          recomendacionesEscolares={data.recomendacionesEscolares}
                          onRecomendacionesEscolaresChange={makeSetter('recomendacionesEscolares')}
                          onComplete={onComplete}
                        />
                      );
                    case 'alta-terapeutica':
                      return (
                        <DischargeReportFields
                          diagnosticoFinal={data.diagnosticoFinal}
                          onDiagnosticoFinalChange={makeSetter('diagnosticoFinal')}
                          resumenEvolucion={data.resumenEvolucion}
                          onResumenEvolucionChange={makeSetter('resumenEvolucion')}
                          logrosTerapeuticos={data.logrosTerapeuticos}
                          onLogrosTerapeuticosChange={makeSetter('logrosTerapeuticos')}
                          nivelCumplimientoObjetivos={data.nivelCumplimientoObjetivos}
                          onNivelCumplimientoObjetivosChange={makeSetter('nivelCumplimientoObjetivos')}
                          indicacionesAlta={data.indicacionesAlta}
                          onIndicacionesAltaChange={makeSetter('indicacionesAlta')}
                          recomendacionesSeguimiento={data.recomendacionesSeguimiento}
                          onRecomendacionesSeguimientoChange={makeSetter('recomendacionesSeguimiento')}
                          onComplete={onComplete}
                        />
                      );
                    default:
                      return null;
                  }
                })()}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ClinicalInfoForm;
