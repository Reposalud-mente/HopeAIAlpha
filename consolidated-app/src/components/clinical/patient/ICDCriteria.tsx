'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Info, Check, Search, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ICDCriteriaProps {
  criteriosCIE: string[];
  areasEvaluacion: string[]; // Areas selected in previous step
  onCriteriosChange: (criterios: string[]) => void;
  onComplete: () => void;
  realCodes?: any[];
}

// Mock data for ICD-11 Mental and Behavioral Disorders (Chapter 06)
const icdCategories = [
  {
    id: 'neurodevelopmental',
    name: 'Trastornos del neurodesarrollo',
    codes: [
      { id: '6A00', name: 'Trastornos del desarrollo intelectual', description: 'Un grupo de condiciones etiológicamente diversas que se originan durante el período del desarrollo' },
      { id: '6A01', name: 'Trastornos del espectro autista', description: 'Caracterizado por déficits persistentes en la capacidad de iniciar y mantener la interacción social recíproca y la comunicación social' },
      { id: '6A02', name: 'Trastornos del desarrollo del habla o lenguaje', description: 'Caracterizados por dificultades en la adquisición, comprensión, producción o uso del lenguaje' }
    ]
  },
  {
    id: 'schizophrenia',
    name: 'Esquizofrenia y otros trastornos psicóticos primarios',
    codes: [
      { id: '6A20', name: 'Esquizofrenia', description: 'Caracterizada por distorsiones de la percepción, el pensamiento, las emociones, el lenguaje, la conciencia de sí mismo y el comportamiento' },
      { id: '6A21', name: 'Trastorno esquizoafectivo', description: 'Trastorno episódico en el cual están presentes síntomas tanto de esquizofrenia como de un trastorno del humor' },
      { id: '6A22', name: 'Trastorno esquizotípico', description: 'Caracterizado por un patrón persistente de déficits en la interacción social, cognición y comportamiento anormal' }
    ]
  },
  {
    id: 'mood',
    name: 'Trastornos del estado de ánimo',
    codes: [
      { id: '6A70', name: 'Episodio depresivo', description: 'Caracterizado por un período de estado de ánimo deprimido o disminución del interés o placer' },
      { id: '6A71', name: 'Trastorno depresivo recurrente', description: 'Un trastorno caracterizado por episodios depresivos repetidos' },
      { id: '6A60', name: 'Trastorno bipolar tipo I', description: 'Caracterizado por episodios maníacos o mixtos, generalmente acompañados por episodios depresivos mayores' },
      { id: '6A61', name: 'Trastorno bipolar tipo II', description: 'Caracterizado por episodios hipomaníacos y depresivos' }
    ]
  },
  {
    id: 'anxiety',
    name: 'Trastornos de ansiedad y relacionados con el miedo',
    codes: [
      { id: '6B00', name: 'Trastorno de ansiedad generalizada', description: 'Caracterizado por ansiedad y preocupación generalizadas y persistentes no restringidas a circunstancias particulares' },
      { id: '6B01', name: 'Trastorno de pánico', description: 'Ataques de pánico recurrentes e inesperados' },
      { id: '6B04', name: 'Trastorno de ansiedad social', description: 'Marcado y excesivo temor o ansiedad que ocurre en una o más situaciones sociales' }
    ]
  },
  {
    id: 'trauma',
    name: 'Trastornos específicamente asociados con el estrés',
    codes: [
      { id: '6B40', name: 'Trastorno de estrés postraumático', description: 'Desarrollo de síntomas característicos después de la exposición a un evento estresante o traumático' },
      { id: '6B41', name: 'Trastorno de adaptación', description: 'Reacciones de mala adaptación a estresores identificables' }
    ]
  },
  {
    id: 'obsessive',
    name: 'Trastorno obsesivo-compulsivo y trastornos relacionados',
    codes: [
      { id: '6B20', name: 'Trastorno obsesivo-compulsivo', description: 'Presencia de obsesiones y/o compulsiones persistentes' },
      { id: '6B22', name: 'Trastorno dismórfico corporal', description: 'Preocupación por uno o más defectos o imperfecciones percibidos en la apariencia física' }
    ]
  },
  {
    id: 'personality',
    name: 'Trastornos de la personalidad',
    codes: [
      { id: '6D10', name: 'Trastorno de personalidad leve', description: 'Dificultades en muchas pero no todas las áreas del funcionamiento de la personalidad' },
      { id: '6D11', name: 'Trastorno de personalidad moderado', description: 'Problemas notables en múltiples áreas del funcionamiento de la personalidad' },
      { id: '6D12', name: 'Trastorno de personalidad severo', description: 'Graves problemas en el funcionamiento de la personalidad' }
    ]
  }
];

// Generate list of all codes for searching
const allCodes = icdCategories.flatMap(category => category.codes);

export default function ICDCriteria({
  criteriosCIE,
  areasEvaluacion,
  onCriteriosChange,
  onComplete,
  realCodes
}: ICDCriteriaProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('recommended');
  const [recommendedCodes, setRecommendedCodes] = useState<typeof allCodes>([]);

  // Map evaluation areas to recommended ICD categories
  const areaToICDCategoryMapping: Record<string, string[]> = {
    'cognitiva': ['neurodevelopmental'],
    'emocional': ['mood', 'anxiety'],
    'conductual': ['neurodevelopmental', 'obsessive'],
    'social': ['neurodevelopmental', 'schizophrenia'],
    'personalidad': ['personality'],
    'autoconcepto': ['personality', 'obsessive'],
    'trauma': ['trauma'],
    'estres': ['trauma', 'anxiety'],
    'familiar': ['mood', 'anxiety']
  };

  // Generate recommended codes based on selected areas
  useEffect(() => {
    const categoryIds = areasEvaluacion
      .flatMap(area => areaToICDCategoryMapping[area] || [])
      // Remove duplicates
      .filter((id, index, self) => self.indexOf(id) === index);

    const recommended = icdCategories
      .filter(category => categoryIds.includes(category.id))
      .flatMap(category => category.codes);

    setRecommendedCodes(recommended);
  }, [areasEvaluacion]);

  // Filter codes by search term
  const filteredCodes = searchTerm.trim()
    ? allCodes.filter(code =>
        code.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : recommendedCodes;

  // Handle criteria toggle selection
  const handleCriteriaToggle = (codeId: string) => {
    if (criteriosCIE.includes(codeId)) {
      onCriteriosChange(criteriosCIE.filter(id => id !== codeId));
    } else {
      onCriteriosChange([...criteriosCIE, codeId]);
    }
  };

  // Get code details by ID
  const getCodeById = (id: string) => {
    return allCodes.find(code => code.id === id);
  };

  // Display codes to show based on active tab
  const codesToShow = activeTab === 'all' ? allCodes : filteredCodes;

  return (
    <div className="space-y-6">
      <div>

        <p className="text-sm text-gray-500 mb-4">
          Seleccione los criterios diagnósticos de la CIE-11 aplicables a esta evaluación.
        </p>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar códigos CIE-11..."
            className="pl-10 bg-white text-gray-900 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Selected areas info */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">Áreas seleccionadas para evaluación:</p>
            <p className="text-sm text-blue-700 mt-1">
              {areasEvaluacion.map(areaId => {
                const area = defaultAreas.find(a => a.id === areaId);
                return area?.name;
              }).filter(Boolean).join(', ')}
            </p>
          </div>
        </div>

        {/* Tabs: Recommended vs All */}
        <Tabs defaultValue="recommended" className="mb-4" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recommended">Recomendados</TabsTrigger>
            <TabsTrigger value="all">Todos los códigos</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* API disclaimer */}
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-800 font-medium">Datos de prueba</p>
            <p className="text-sm text-yellow-700 mt-1">
              Esta versión utiliza datos de prueba. En la versión final se integrará con la API oficial de la OMS para CIE-11.
            </p>
          </div>
        </div>

        {/* ICD code list */}
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-3">
            {codesToShow.length > 0 ? (
              codesToShow.map((code) => (
                <Card
                  key={code.id}
                  className={`p-4 cursor-pointer transition-all ${
                    criteriosCIE.includes(code.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => handleCriteriaToggle(code.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex h-5 items-center">
                      <Checkbox
                        id={`code-${code.id}`}
                        checked={criteriosCIE.includes(code.id)}
                        onCheckedChange={() => {}}
                        className={criteriosCIE.includes(code.id) ? 'bg-blue-500' : ''}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Label
                          htmlFor={`code-${code.id}`}
                          className="text-base font-medium cursor-pointer"
                        >
                          {code.name}
                        </Label>
                        <span className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded-full">
                          {code.id}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{code.description}</p>
                    </div>
                    {criteriosCIE.includes(code.id) && (
                      <Check className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <div className="py-6 text-center">
                <p className="text-gray-500">No se encontraron criterios diagnósticos para esta búsqueda.</p>
                {searchTerm && (
                  <Button
                    variant="link"
                    onClick={() => setSearchTerm('')}
                    className="mt-2"
                  >
                    Mostrar criterios recomendados
                  </Button>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Selected codes display */}
      {criteriosCIE.length > 0 && (
        <div className="p-3 bg-gray-50 border rounded-md">
          <h3 className="text-sm font-medium mb-2">Criterios seleccionados ({criteriosCIE.length}):</h3>
          <div className="flex flex-wrap gap-2">
            {criteriosCIE.map(codeId => {
              const code = getCodeById(codeId);
              return code ? (
                <div
                  key={codeId}
                  className="text-xs bg-white px-2 py-1 rounded border flex items-center gap-1"
                >
                  <span>{code.id}: {code.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCriteriaToggle(codeId);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={onComplete}
          disabled={criteriosCIE.length === 0}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}

// Available evaluation areas - duplicate from EvaluationAreas for reference
const defaultAreas = [
  { id: 'cognitiva', name: 'Función Cognitiva' },
  { id: 'emocional', name: 'Regulación Emocional' },
  { id: 'conductual', name: 'Comportamiento' },
  { id: 'social', name: 'Funcionamiento Social' },
  { id: 'personalidad', name: 'Rasgos de Personalidad' },
  { id: 'autoconcepto', name: 'Autoconcepto' },
  { id: 'trauma', name: 'Trauma' },
  { id: 'estres', name: 'Estrés y Afrontamiento' },
  { id: 'familiar', name: 'Dinámica Familiar' },
];