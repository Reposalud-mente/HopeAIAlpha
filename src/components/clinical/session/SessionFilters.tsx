'use client';

import React, { useState } from 'react';
import { X, Filter, Calendar, Clock, UserRound, Tag, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SessionStatus } from '@prisma/client';
import { DatePicker } from '@/components/ui/date-picker';

export interface SessionFilters {
  dateFrom?: Date;
  dateTo?: Date;
  status?: SessionStatus[];
  type?: string[];
  clinicianId?: string[];
  patientId?: string[];
}

interface SessionFiltersProps {
  filters: SessionFilters;
  onFilterChange: (filters: SessionFilters) => void;
  onClearFilters: () => void;
  clinicians?: { id: string; name: string }[];
  patients?: { id: string; name: string }[];
  sessionTypes?: string[];
}

const SessionFilters: React.FC<SessionFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  clinicians = [],
  patients = [],
  sessionTypes = ['Evaluación inicial', 'Seguimiento', 'Sesión terapéutica', 'Consulta', 'Intervención en crisis'],
}) => {
  const [open, setOpen] = useState(false);

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.status && filters.status.length > 0) count++;
    if (filters.type && filters.type.length > 0) count++;
    if (filters.clinicianId && filters.clinicianId.length > 0) count++;
    if (filters.patientId && filters.patientId.length > 0) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Handle filter changes
  const handleDateFromChange = (date: Date | undefined) => {
    onFilterChange({ ...filters, dateFrom: date });
  };

  const handleDateToChange = (date: Date | undefined) => {
    onFilterChange({ ...filters, dateTo: date });
  };

  const handleStatusChange = (status: SessionStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    onFilterChange({ ...filters, status: newStatuses });
  };

  const handleTypeChange = (type: string) => {
    const currentTypes = filters.type || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    onFilterChange({ ...filters, type: newTypes });
  };

  const handleClinicianChange = (clinicianId: string) => {
    const currentClinicians = filters.clinicianId || [];
    const newClinicians = currentClinicians.includes(clinicianId)
      ? currentClinicians.filter(id => id !== clinicianId)
      : [...currentClinicians, clinicianId];
    onFilterChange({ ...filters, clinicianId: newClinicians });
  };

  const handlePatientChange = (patientId: string) => {
    const currentPatients = filters.patientId || [];
    const newPatients = currentPatients.includes(patientId)
      ? currentPatients.filter(id => id !== patientId)
      : [...currentPatients, patientId];
    onFilterChange({ ...filters, patientId: newPatients });
  };

  // Status options
  const statusOptions = [
    { value: SessionStatus.COMPLETED, label: 'Completada' },
    { value: SessionStatus.SCHEDULED, label: 'Programada' },
    { value: SessionStatus.IN_PROGRESS, label: 'En progreso' },
    { value: SessionStatus.CANCELLED, label: 'Cancelada' },
    { value: SessionStatus.NO_SHOW, label: 'No asistió' },
    { value: SessionStatus.TRANSFERRED, label: 'Transferida' },
    { value: SessionStatus.DRAFT, label: 'Borrador' },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={activeFilterCount > 0 ? "default" : "outline"}
          size="sm"
          className="h-9 gap-1"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filtros</h4>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={onClearFilters}
              >
                <X className="h-3 w-3 mr-1" />
                Limpiar filtros
              </Button>
            )}
          </div>

          {/* Date range filter */}
          <div className="space-y-2">
            <Label className="text-xs font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Rango de fechas
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <DatePicker
                  placeholder="Desde"
                  date={filters.dateFrom}
                  onSelect={handleDateFromChange}
                  className="w-full"
                />
              </div>
              <div>
                <DatePicker
                  placeholder="Hasta"
                  date={filters.dateTo}
                  onSelect={handleDateToChange}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Status filter */}
          <div className="space-y-2">
            <Label className="text-xs font-medium flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Estado
            </Label>
            <div className="flex flex-wrap gap-1">
              {statusOptions.map((status) => (
                <Badge
                  key={status.value}
                  variant={filters.status?.includes(status.value as SessionStatus) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleStatusChange(status.value as SessionStatus)}
                >
                  {status.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Session type filter */}
          <div className="space-y-2">
            <Label className="text-xs font-medium flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Tipo de sesión
            </Label>
            <div className="flex flex-wrap gap-1">
              {sessionTypes.map((type) => (
                <Badge
                  key={type}
                  variant={filters.type?.includes(type) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTypeChange(type)}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          {/* Clinician filter */}
          {clinicians.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-1">
                <UserRound className="h-3 w-3" />
                Profesional
              </Label>
              <Select
                value={filters.clinicianId?.length === 1 ? filters.clinicianId[0] : ""}
                onValueChange={handleClinicianChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar profesional" />
                </SelectTrigger>
                <SelectContent>
                  {clinicians.map((clinician) => (
                    <SelectItem key={clinician.id} value={clinician.id}>
                      {clinician.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filters.clinicianId && filters.clinicianId.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {filters.clinicianId.map((id) => {
                    const clinician = clinicians.find(c => c.id === id);
                    return (
                      <Badge key={id} variant="secondary" className="gap-1">
                        {clinician?.name || 'Desconocido'}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handleClinicianChange(id)}
                        />
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Patient filter */}
          {patients.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-1">
                <UserRound className="h-3 w-3" />
                Paciente
              </Label>
              <Select
                value={filters.patientId?.length === 1 ? filters.patientId[0] : ""}
                onValueChange={handlePatientChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filters.patientId && filters.patientId.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {filters.patientId.map((id) => {
                    const patient = patients.find(p => p.id === id);
                    return (
                      <Badge key={id} variant="secondary" className="gap-1">
                        {patient?.name || 'Desconocido'}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handlePatientChange(id)}
                        />
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <Button size="sm" onClick={() => setOpen(false)}>
              Aplicar filtros
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SessionFilters;
