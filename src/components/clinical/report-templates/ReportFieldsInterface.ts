// Interfaz base para todos los componentes de campos de informes
export interface ReportFieldsProps {
  // Propiedades comunes
  onComplete?: () => void;
  
  // Campos específicos para cada tipo de informe
  // Estos serán extendidos por cada componente específico
}

// Interfaz para el estado del formulario
export interface ReportFieldsState {
  // Esta interfaz será extendida por cada componente específico
  // para definir su propio estado
  [key: string]: any;
}
