import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  ImagePlus,
  X,
  Upload,
  Trash2,
  FileText,
  Clock,
  Save,
  AlertCircle,
  CheckCircle2,
  Paperclip,
  FileSpreadsheet,
  ChevronRight,
  Clipboard,
  CalendarDays,
  FileBarChart2,
  Stethoscope,
  PenLine,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Hooks
import { SessionAttachment } from './types';

interface UseFileUploadProps {
  onUpload?: (file: File, attachment: SessionAttachment) => void;
  accept?: string;
  maxSize?: number;
}

async function uploadFile(file: File): Promise<SessionAttachment | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/uploads', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload file');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

function useFileUpload({ onUpload, accept = "*/*", maxSize = 10 }: UseFileUploadProps = {}) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files || []);
      if (selectedFiles.length === 0) return;

      setUploading(true);

      // Validate files
      const newFiles: File[] = [];
      const newErrors: string[] = [];
      const newPreviews: string[] = [];

      for (const file of selectedFiles) {
        // Check file size
        if (maxSize && file.size > maxSize * 1024 * 1024) {
          newErrors.push(`${file.name}: File size must be less than ${maxSize}MB`);
          continue;
        }

        // Check file type if accept is specified
        if (accept !== "*/*") {
          const acceptTypes = accept.split(",").map(type => type.trim());
          const isAccepted = acceptTypes.some(type => {
            if (type.endsWith("/*")) {
              return file.type.startsWith(type.replace("/*", "/"));
            }
            return file.type === type;
          });

          if (!isAccepted) {
            newErrors.push(`${file.name}: Invalid file type`);
            continue;
          }
        }

        try {
          // Upload the file
          const attachment = await uploadFile(file);

          if (!attachment) {
            newErrors.push(`${file.name}: Failed to upload file`);
            continue;
          }

          newFiles.push(file);
          newPreviews.push(URL.createObjectURL(file));

          if (onUpload) {
            onUpload(file, attachment);
          }
        } catch (error) {
          console.error('Error processing file:', error);
          newErrors.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      setFiles((prev) => [...prev, ...newFiles]);
      setPreviews((prev) => [...prev, ...newPreviews]);
      setErrors((prev) => [...prev, ...newErrors]);
      setUploading(false);

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [accept, maxSize, onUpload]
  );

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    files,
    previews,
    errors,
    uploading,
    fileInputRef,
    handleFileChange,
    removeFile,
  };
}

// Main Session Creation Component
import { SessionFormData, validateSessionForm, formDataToSessionInput } from '@/lib/validations/session-form';

interface SessionCreationProps {
  patientId: string;
  patientName?: string;
  onSubmit: (data: SessionFormData) => void;
  onCancel: () => void;
  initialData?: Partial<SessionFormData>;
}

function SessionCreation({ patientId, patientName, onSubmit, onCancel, initialData }: SessionCreationProps) {
  // Refs for focus management
  const formRef = useRef<HTMLFormElement>(null);
  const initialFocusRef = useRef<HTMLButtonElement>(null);

  // Form state
  const [form, setForm] = useState<SessionFormData>({
    type: initialData?.type || "none",
    status: initialData?.status || "draft",
    notes: initialData?.notes || "",
    objectives: initialData?.objectives || "",
    activities: initialData?.activities || "",
    aiSuggestions: initialData?.aiSuggestions || "",
    attachments: initialData?.attachments || [],
    selectedNotes: initialData?.selectedNotes || [],
    selectedPastSessions: initialData?.selectedPastSessions || [],
    selectedReports: initialData?.selectedReports || [],
  });

  // Track uploaded attachments separately
  const [uploadedAttachments, setUploadedAttachments] = useState<SessionAttachment[]>([]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Partial<Record<keyof SessionFormData, string>>>({});
  const [activeTab, setActiveTab] = useState("details");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // File upload
  const upload = useFileUpload({
    onUpload: (file, attachment) => {
      // Add the attachment to the uploadedAttachments state
      setUploadedAttachments(prev => [...prev, attachment]);

      // Also update the form state to include the file reference
      setForm(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), attachment]
      }));
    },
    accept: "application/pdf,image/*,.doc,.docx,.txt",
    maxSize: 10,
  });

  // Simulate fetching notes, sessions, reports
  const notes = ["Evaluación inicial", "Nota de progreso", "Resumen de alta"];
  const pastSessions = ["Sesión 1 - 2024-01-01", "Sesión 2 - 2024-02-01"];
  const reports = ["Informe de resonancia magnética", "Resultados de laboratorio", "Carta de consulta"];

  // Focus management
  useEffect(() => {
    // Set initial focus when component mounts
    const timer = setTimeout(() => {
      initialFocusRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to cancel
      if (e.key === "Escape" && !isSubmitting) {
        onCancel();
      }

      // Ctrl+Enter to submit
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !isSubmitting) {
        formRef.current?.requestSubmit();
      }

      // Tab navigation with numbers
      if (e.altKey && e.key === "1") {
        setActiveTab("details");
      } else if (e.altKey && e.key === "2") {
        setActiveTab("attachments");
      } else if (e.altKey && e.key === "3") {
        setActiveTab("resources");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onCancel]);

  // Reset success message after showing
  useEffect(() => {
    if (submitStatus === "success") {
      setShowSuccessMessage(true);
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  // Clear validation errors when form changes
  useEffect(() => {
    setErrors({});
  }, [form]);

  // Handlers
  const handleChange = useCallback((field: keyof SessionFormData, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const validateForm = (): boolean => {
    const result = validateSessionForm(form);

    if (!result.success && result.errors) {
      setErrors(result.errors);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      // If there are errors in the details tab, switch to it
      if (errors.type || errors.notes || errors.objectives || errors.activities) {
        setActiveTab("details");
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Convert form data to session input format
      const sessionInput = formDataToSessionInput(form);

      // Add patient ID and attachments to the session data
      const sessionData = {
        ...sessionInput,
        patientId,
        // Include the uploaded attachments
        attachments: JSON.stringify(uploadedAttachments),
        // Let the backend set clinicianId from the authenticated user
      };

      // Make actual API call
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create session');
      }

      const createdSession = await response.json();
      console.log('Session created:', createdSession);

      setSubmitStatus("success");
      onSubmit(form);
    } catch (error) {
      setSubmitStatus("error");
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Check if form has been modified
    const isFormModified =
      form.type !== (initialData?.type || "none") ||
      form.status !== (initialData?.status || "draft") ||
      form.notes !== (initialData?.notes || "") ||
      form.objectives !== (initialData?.objectives || "") ||
      form.activities !== (initialData?.activities || "") ||
      (upload.files.length > 0);

    if (isFormModified) {
      setShowConfirmDialog(true);
    } else {
      onCancel();
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case "initial_assessment":
        return <Clipboard className="h-4 w-4" />;
      case "follow_up":
        return <CalendarDays className="h-4 w-4" />;
      case "therapy_session":
        return <Stethoscope className="h-4 w-4" />;
      case "consultation":
        return <FileText className="h-4 w-4" />;
      case "crisis_intervention":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <PenLine className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline" className="bg-gray-100 text-gray-700">Borrador</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-100 text-blue-700">En progreso</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-700">Completada</Badge>;
      case "canceled":
        return <Badge variant="outline" className="bg-red-100 text-red-700">Cancelada</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  return (
    <div className="relative flex flex-col h-full max-h-[90vh] min-w-[600px] md:min-w-[800px] w-full bg-white dark:bg-gray-950 rounded-lg shadow-xl overflow-hidden">
      {/* Success notification */}
      {showSuccessMessage && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-50 dark:bg-green-900/80 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-5 duration-300">
          <CheckCircle2 className="w-5 h-5 mr-2" />
          <span>Sesión creada con éxito</span>
        </div>
      )}

      {/* Confirmation dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-3xl w-full max-w-3xl min-h-[500px]">
          <DialogHeader>
            <DialogTitle>¿Descartar cambios?</DialogTitle>
            <DialogDescription>
              Tienes cambios sin guardar. ¿Estás seguro de que deseas salir sin guardar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Continuar editando
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setShowConfirmDialog(false);
                onCancel();
              }}
            >
              Descartar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="p-6 border-b flex items-center justify-between bg-white dark:bg-gray-950">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Nueva sesión
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Registra los detalles de la sesión con el paciente
          </p>
        </div>
        <Button
          ref={initialFocusRef}
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Form */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col h-full overflow-hidden"
      >
        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          {/* Sidebar navigation for larger screens */}
          <div className="hidden md:flex flex-col w-56 border-r p-4 bg-gray-50 dark:bg-gray-900">
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === "details"
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
                aria-current={activeTab === "details" ? "page" : undefined}
              >
                <FileText className="h-5 w-5" />
                <span>Detalles</span>
                {Object.keys(errors).some(key => ["type", "notes", "objectives", "activities"].includes(key)) && (
                  <Badge variant="destructive" className="ml-auto">!</Badge>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("attachments")}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === "attachments"
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
                aria-current={activeTab === "attachments" ? "page" : undefined}
              >
                <Paperclip className="h-5 w-5" />
                <span>Archivos</span>
                {upload.files.length > 0 && (
                  <Badge className="ml-auto">{upload.files.length}</Badge>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("resources")}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === "resources"
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
                aria-current={activeTab === "resources" ? "page" : undefined}
              >
                <FileBarChart2 className="h-5 w-5" />
                <span>Recursos</span>
                {(form.selectedNotes?.length || 0) + (form.selectedPastSessions?.length || 0) + (form.selectedReports?.length || 0) > 0 && (
                  <Badge className="ml-auto">
                    {(form.selectedNotes?.length || 0) + (form.selectedPastSessions?.length || 0) + (form.selectedReports?.length || 0)}
                  </Badge>
                )}
              </button>
            </nav>

            <div className="mt-auto pt-6">
              <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Atajos de teclado
                </h3>
                <div className="mt-2 text-xs text-blue-700 dark:text-blue-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Alt + 1-3</span>
                    <span>Cambiar pestaña</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ctrl + Enter</span>
                    <span>Guardar</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Esc</span>
                    <span>Cancelar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab navigation for mobile */}
          <div className="md:hidden border-b">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-between">
                <TabsTrigger
                  value="details"
                  className="flex-1 relative"
                >
                  <span className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Detalles
                  </span>
                  {Object.keys(errors).some(key => ["type", "notes", "objectives", "activities"].includes(key)) && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-2 w-2 p-0" />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="attachments"
                  className="flex-1 relative"
                >
                  <span className="flex items-center">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Archivos
                  </span>
                  {upload.files.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                      {upload.files.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="resources"
                  className="flex-1 relative"
                >
                <span className="flex items-center">
                  <FileBarChart2 className="h-4 w-4 mr-2" />
                  Recursos
                </span>
                {(form.selectedNotes?.length || 0) + (form.selectedPastSessions?.length || 0) + (form.selectedReports?.length || 0) > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                    {(form.selectedNotes?.length || 0) + (form.selectedPastSessions?.length || 0) + (form.selectedReports?.length || 0)}
                  </Badge>
                )}
              </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                {activeTab === "details" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="type" className="text-sm font-medium">
                            Tipo de sesión <span className="text-red-500">*</span>
                          </Label>
                          {errors.type && (
                            <span className="text-xs text-red-500 font-medium flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Campo requerido
                            </span>
                          )}
                        </div>
                        <Select
                          value={form.type}
                          onValueChange={(value) => handleChange("type", value)}
                          required
                        >
                          <SelectTrigger
                            id="type"
                            className={cn(
                              "w-full",
                              errors.type ? "border-red-500 ring-red-500" : ""
                            )}
                            aria-invalid={!!errors.type}
                          >
                            <SelectValue placeholder="Seleccione un tipo de sesión" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none" disabled>
                              Selecciona el tipo de sesión...
                            </SelectItem>
                            <SelectItem value="initial_assessment" className="flex items-center">
                              <div className="flex items-center">
                                <Clipboard className="h-4 w-4 mr-2 text-blue-500" />
                                Evaluación inicial
                              </div>
                            </SelectItem>
                            <SelectItem value="follow_up">
                              <div className="flex items-center">
                                <CalendarDays className="h-4 w-4 mr-2 text-green-500" />
                                Seguimiento
                              </div>
                            </SelectItem>
                            <SelectItem value="therapy_session">
                              <div className="flex items-center">
                                <Stethoscope className="h-4 w-4 mr-2 text-purple-500" />
                                Sesión terapéutica
                              </div>
                            </SelectItem>
                            <SelectItem value="consultation">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-amber-500" />
                                Consulta
                              </div>
                            </SelectItem>
                            <SelectItem value="crisis_intervention">
                              <div className="flex items-center">
                                <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                                Intervención en crisis
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-medium">
                          Estado
                        </Label>
                        <Select
                          value={form.status}
                          onValueChange={(value) => handleChange("status", value)}
                        >
                          <SelectTrigger id="status" className="w-full">
                            <SelectValue placeholder="Selecciona el estado..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">
                              <div className="flex items-center">
                                <PenLine className="h-4 w-4 mr-2 text-gray-500" />
                                Borrador
                              </div>
                            </SelectItem>
                            <SelectItem value="in_progress">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                                En progreso
                              </div>
                            </SelectItem>
                            <SelectItem value="completed">
                              <div className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                Completada
                              </div>
                            </SelectItem>
                            <SelectItem value="canceled">
                              <div className="flex items-center">
                                <X className="h-4 w-4 mr-2 text-red-500" />
                                Cancelada
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notes" className="text-sm font-medium">
                          Notas de la sesión <span className="text-red-500">*</span>
                        </Label>
                        {errors.notes && (
                          <span className="text-xs text-red-500 font-medium flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Campo requerido
                          </span>
                        )}
                      </div>
                      <Textarea
                        id="notes"
                        placeholder="Escribe aquí las notas detalladas de la sesión..."
                        value={form.notes}
                        onChange={(e) => handleChange("notes", e.target.value)}
                        className={cn(
                          "min-h-[150px] resize-none",
                          errors.notes ? "border-red-500 ring-red-500" : ""
                        )}
                        aria-invalid={!!errors.notes}
                      />
                      <p className="text-xs text-muted-foreground">
                        Incluye observaciones clínicas, comportamiento del paciente, y cualquier información relevante.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="objectives" className="text-sm font-medium">
                          Objetivos <span className="text-red-500">*</span>
                        </Label>
                        {errors.objectives && (
                          <span className="text-xs text-red-500 font-medium flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Campo requerido
                          </span>
                        )}
                      </div>
                      <Textarea
                        id="objectives"
                        placeholder="Describe los objetivos de la sesión..."
                        value={form.objectives}
                        onChange={(e) => handleChange("objectives", e.target.value)}
                        className={cn(
                          "min-h-[100px] resize-none",
                          errors.objectives ? "border-red-500 ring-red-500" : ""
                        )}
                        aria-invalid={!!errors.objectives}
                      />
                      <p className="text-xs text-muted-foreground">
                        Define los objetivos terapéuticos específicos para esta sesión.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="activities" className="text-sm font-medium">
                        Actividades / Intervenciones
                      </Label>
                      <Textarea
                        id="activities"
                        placeholder="Describe las actividades o intervenciones realizadas..."
                        value={form.activities}
                        onChange={(e) => handleChange("activities", e.target.value)}
                        className="min-h-[100px] resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        Detalla las técnicas, ejercicios o intervenciones aplicadas durante la sesión.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "attachments" && (
                  <div className="space-y-6">
                    <div className="flex flex-col space-y-2">
                      <h2 className="text-lg font-medium">Archivos adjuntos</h2>
                      <p className="text-sm text-muted-foreground">
                        Adjunta documentos relevantes para esta sesión, como evaluaciones, ejercicios o material de apoyo.
                      </p>
                    </div>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center justify-center text-center p-6 border-2 border-dashed rounded-lg">
                          {upload.uploading ? (
                            <>
                              <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                              <h3 className="text-lg font-medium mb-1">Subiendo archivos...</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Por favor espera mientras se suben los archivos
                              </p>
                            </>
                          ) : (
                            <>
                              <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                              <h3 className="text-lg font-medium mb-1">Arrastra archivos aquí</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                O haz clic para seleccionar archivos
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => upload.fileInputRef.current?.click()}
                                className="flex items-center"
                                disabled={upload.uploading}
                              >
                                <Paperclip className="w-4 h-4 mr-2" /> Seleccionar archivos
                              </Button>
                              <input
                                ref={upload.fileInputRef}
                                type="file"
                                multiple
                                accept="application/pdf,image/*,.doc,.docx,.txt"
                                className="hidden"
                                onChange={upload.handleFileChange}
                                aria-label="Subir archivos"
                                disabled={upload.uploading}
                              />
                              <p className="text-xs text-muted-foreground mt-4">
                                PDF, imágenes, documentos Word o archivos de texto (máx. 10MB)
                              </p>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {upload.errors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-600" role="alert">
                        <div className="font-medium flex items-center mb-2">
                          <AlertCircle className="w-4 h-4 mr-2" /> Errores de carga
                        </div>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {upload.errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {upload.files.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">Archivos seleccionados</h3>
                          <Badge variant="outline">{upload.files.length} archivo(s)</Badge>
                        </div>
                        <div className="space-y-2">
                          {upload.files.map((file, index) => {
                            const isImage = file.type.startsWith("image/");
                            const isPdf = file.type === "application/pdf";
                            const isDoc = file.type.includes("word") || file.name.endsWith(".doc") || file.name.endsWith(".docx");

                            return (
                              <div
                                key={index}
                                className="flex items-center gap-3 p-3 rounded-md bg-gray-50 dark:bg-gray-800 border"
                              >
                                <div className="flex items-center justify-center w-10 h-10 rounded-md bg-white dark:bg-gray-700 border">
                                  {isImage && <ImagePlus className="w-5 h-5 text-blue-500" />}
                                  {isPdf && <FileText className="w-5 h-5 text-red-500" />}
                                  {isDoc && <FileSpreadsheet className="w-5 h-5 text-blue-600" />}
                                  {!isImage && !isPdf && !isDoc && <Paperclip className="w-5 h-5 text-gray-500" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => upload.removeFile(index)}
                                  aria-label={`Eliminar ${file.name}`}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "resources" && (
                  <div className="space-y-6">
                    <div className="flex flex-col space-y-2">
                      <h2 className="text-lg font-medium">Recursos clínicos</h2>
                      <p className="text-sm text-muted-foreground">
                        Selecciona recursos existentes para vincular a esta sesión.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <ResourceSection
                        title="Notas clínicas"
                        icon={<FileText className="h-5 w-5 text-blue-500" />}
                        items={notes}
                        selectedItems={form.selectedNotes || []}
                        onChange={(selected) => handleChange("selectedNotes", selected)}
                        emptyMessage="No hay notas clínicas disponibles"
                      />

                      <Separator />

                      <ResourceSection
                        title="Sesiones anteriores"
                        icon={<Clock className="h-5 w-5 text-green-500" />}
                        items={pastSessions}
                        selectedItems={form.selectedPastSessions || []}
                        onChange={(selected) => handleChange("selectedPastSessions", selected)}
                        emptyMessage="No hay sesiones anteriores disponibles"
                      />

                      <Separator />

                      <ResourceSection
                        title="Informes médicos"
                        icon={<FileBarChart2 className="h-5 w-5 text-red-500" />}
                        items={reports}
                        selectedItems={form.selectedReports || []}
                        onChange={(selected) => handleChange("selectedReports", selected)}
                        emptyMessage="No hay informes médicos disponibles"
                      />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer with actions */}
        <div className="p-6 border-t bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center min-h-[32px]">
              {submitStatus === "success" && (
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2" /> ¡Sesión creada con éxito!
                </p>
              )}
              {submitStatus === "error" && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" /> Error al guardar. Por favor, revisa los campos.
                </p>
              )}
              {isSubmitting && (
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <Clock className="h-5 w-5 mr-2 animate-spin" /> Guardando...
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="order-1 sm:order-none"
              >
                Cancelar
              </Button>

              {/* Mobile navigation buttons */}
              <div className="flex gap-2 sm:hidden order-3">
                {activeTab !== "details" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (activeTab === "attachments") setActiveTab("details");
                      if (activeTab === "resources") setActiveTab("attachments");
                    }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}

                {activeTab !== "resources" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (activeTab === "details") setActiveTab("attachments");
                      if (activeTab === "attachments") setActiveTab("resources");
                    }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="order-2 sm:order-none"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Guardando..." : "Guardar sesión"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// ResourceSection component for the Resources tab
interface ResourceSectionProps {
  title: string;
  icon: React.ReactNode;
  items: string[];
  selectedItems: string[];
  onChange: (selected: string[]) => void;
  emptyMessage: string;
}

const ResourceSection: React.FC<ResourceSectionProps> = ({
  title,
  icon,
  items,
  selectedItems,
  onChange,
  emptyMessage
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <Badge variant="outline">
          {selectedItems.length}/{items.length}
        </Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            </div>
          ) : (
            <div className="divide-y">
              {items.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={selectedItems.includes(item)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        onChange(
                          checked
                            ? [...selectedItems, item]
                            : selectedItems.filter((i) => i !== item)
                        );
                      }}
                      aria-label={item}
                    />
                  </div>
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionCreation;