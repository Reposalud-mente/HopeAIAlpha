'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Patient } from '@/contexts/PatientContext';
import { format } from 'date-fns';

interface PatientFormProps {
  patient?: Partial<Patient>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function PatientForm({ patient, onSubmit, onCancel, isEditing = false }: PatientFormProps) {
  const [formData, setFormData] = useState({
    firstName: patient?.firstName || '',
    lastName: patient?.lastName || '',
    dateOfBirth: patient?.dateOfBirth ? format(patient.dateOfBirth, 'yyyy-MM-dd') : '',
    gender: patient?.gender || '',
    contactEmail: patient?.contactEmail || '',
    contactPhone: patient?.contactPhone || '',
    address: patient?.address || '',
    emergencyContactName: patient?.emergencyContactName || '',
    emergencyContactPhone: patient?.emergencyContactPhone || '',
    occupation: patient?.occupation || '',
    maritalStatus: patient?.maritalStatus || '',
    insuranceProvider: patient?.insuranceProvider || '',
    insuranceNumber: patient?.insuranceNumber || '',
    educationLevel: patient?.educationLevel || '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es requerido';
    if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es requerido';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'La fecha de nacimiento es requerida';
    if (!formData.contactEmail.trim()) newErrors.contactEmail = 'El email es requerido';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.contactEmail && !emailRegex.test(formData.contactEmail)) {
      newErrors.contactEmail = 'El email no es válido';
    }
    
    // Phone validation (optional field)
    if (formData.contactPhone) {
      const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
      if (!phoneRegex.test(formData.contactPhone)) {
        newErrors.contactPhone = 'El teléfono no es válido';
      }
    }
    
    // Emergency phone validation (optional field)
    if (formData.emergencyContactPhone) {
      const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
      if (!phoneRegex.test(formData.emergencyContactPhone)) {
        newErrors.emergencyContactPhone = 'El teléfono de emergencia no es válido';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convert date string to Date object
      const processedData = {
        ...formData,
        dateOfBirth: new Date(formData.dateOfBirth),
      };
      
      onSubmit(processedData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8 px-1" aria-label="Formulario de Paciente">
      <div className="overflow-y-auto max-h-[55vh] pb-24 pr-1">

      {/* Personal Information Section */}
      <section className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Información Personal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName">Nombre <span className="text-red-500">*</span></Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={!!errors.firstName}
              className={errors.firstName ? 'border-red-500' : ''}
            />
            {errors.firstName && <p className="text-xs text-red-500" role="alert">{errors.firstName}</p>}
          </div>
          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName">Apellido <span className="text-red-500">*</span></Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={!!errors.lastName}
              className={errors.lastName ? 'border-red-500' : ''}
            />
            {errors.lastName && <p className="text-xs text-red-500" role="alert">{errors.lastName}</p>}
          </div>
          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Fecha de Nacimiento <span className="text-red-500">*</span></Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={!!errors.dateOfBirth}
              aria-describedby="dateOfBirth-error"
              className={errors.dateOfBirth ? 'border-red-500' : ''}
            />
            <span className="text-xs text-gray-400">Selecciona o escribe la fecha</span>
            {errors.dateOfBirth && <p className="text-xs text-red-500" role="alert">{errors.dateOfBirth}</p>}
          </div>
          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">Género</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleSelectChange('gender', value)}
            >
              <SelectTrigger id="gender" className={errors.gender ? 'border-red-500' : ''}>
                <SelectValue placeholder="Seleccionar género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Femenino">Femenino</SelectItem>
                <SelectItem value="No binario">No binario</SelectItem>
                <SelectItem value="Prefiero no decir">Prefiero no decir</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-xs text-red-500" role="alert">{errors.gender}</p>}
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Contacto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email <span className="text-red-500">*</span></Label>
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={!!errors.contactEmail}
              className={errors.contactEmail ? 'border-red-500' : ''}
            />
            {errors.contactEmail && <p className="text-xs text-red-500" role="alert">{errors.contactEmail}</p>}
          </div>
          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Teléfono</Label>
            <Input
              id="contactPhone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              aria-invalid={!!errors.contactPhone}
              className={errors.contactPhone ? 'border-red-500' : ''}
            />
            {errors.contactPhone && <p className="text-xs text-red-500" role="alert">{errors.contactPhone}</p>}
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Información Adicional</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              aria-invalid={!!errors.address}
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && <p className="text-xs text-red-500" role="alert">{errors.address}</p>}
          </div>
          {/* Occupation */}
          <div className="space-y-2">
            <Label htmlFor="occupation">Ocupación</Label>
            <Input
              id="occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              aria-invalid={!!errors.occupation}
              className={errors.occupation ? 'border-red-500' : ''}
            />
            {errors.occupation && <p className="text-xs text-red-500" role="alert">{errors.occupation}</p>}
          </div>
          {/* Marital Status */}
          <div className="space-y-2">
            <Label htmlFor="maritalStatus">Estado Civil</Label>
            <Select
              value={formData.maritalStatus}
              onValueChange={(value) => handleSelectChange('maritalStatus', value)}
            >
              <SelectTrigger id="maritalStatus" className={errors.maritalStatus ? 'border-red-500' : ''}>
                <SelectValue placeholder="Seleccionar estado civil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Soltero/a">Soltero/a</SelectItem>
                <SelectItem value="Casado/a">Casado/a</SelectItem>
                <SelectItem value="Divorciado/a">Divorciado/a</SelectItem>
                <SelectItem value="Viudo/a">Viudo/a</SelectItem>
                <SelectItem value="Unión libre">Unión libre</SelectItem>
              </SelectContent>
            </Select>
            {errors.maritalStatus && <p className="text-xs text-red-500" role="alert">{errors.maritalStatus}</p>}
          </div>
          {/* Education Level */}
          <div className="space-y-2">
            <Label htmlFor="educationLevel">Nivel Educativo</Label>
            <Select
              value={formData.educationLevel}
              onValueChange={(value) => handleSelectChange('educationLevel', value)}
            >
              <SelectTrigger id="educationLevel" className={errors.educationLevel ? 'border-red-500' : ''}>
                <SelectValue placeholder="Seleccionar nivel educativo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Primaria">Primaria</SelectItem>
                <SelectItem value="Secundaria">Secundaria</SelectItem>
                <SelectItem value="Técnico">Técnico</SelectItem>
                <SelectItem value="Universidad">Universidad</SelectItem>
                <SelectItem value="Postgrado">Postgrado</SelectItem>
              </SelectContent>
            </Select>
            {errors.educationLevel && <p className="text-xs text-red-500" role="alert">{errors.educationLevel}</p>}
          </div>
        </div>
      </section>

      {/* Emergency Information Section */}
      <section className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Emergencia</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Emergency Contact Name */}
          <div className="space-y-2">
            <Label htmlFor="emergencyContactName">Nombre de Contacto de Emergencia</Label>
            <Input
              id="emergencyContactName"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleChange}
              aria-invalid={!!errors.emergencyContactName}
              className={errors.emergencyContactName ? 'border-red-500' : ''}
            />
            {errors.emergencyContactName && <p className="text-xs text-red-500" role="alert">{errors.emergencyContactName}</p>}
          </div>
          {/* Emergency Contact Phone */}
          <div className="space-y-2">
            <Label htmlFor="emergencyContactPhone">Teléfono de Contacto de Emergencia</Label>
            <Input
              id="emergencyContactPhone"
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={handleChange}
              aria-invalid={!!errors.emergencyContactPhone}
              className={errors.emergencyContactPhone ? 'border-red-500' : ''}
            />
            {errors.emergencyContactPhone && <p className="text-xs text-red-500" role="alert">{errors.emergencyContactPhone}</p>}
          </div>
        </div>
      </section>

      {/* Insurance Section */}
      <section className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Seguro</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Insurance Provider */}
          <div className="space-y-2">
            <Label htmlFor="insuranceProvider">Proveedor de Seguro</Label>
            <Input
              id="insuranceProvider"
              name="insuranceProvider"
              value={formData.insuranceProvider}
              onChange={handleChange}
              aria-invalid={!!errors.insuranceProvider}
              className={errors.insuranceProvider ? 'border-red-500' : ''}
            />
            {errors.insuranceProvider && <p className="text-xs text-red-500" role="alert">{errors.insuranceProvider}</p>}
          </div>
          {/* Insurance Number */}
          <div className="space-y-2">
            <Label htmlFor="insuranceNumber">Número de Póliza</Label>
            <Input
              id="insuranceNumber"
              name="insuranceNumber"
              value={formData.insuranceNumber}
              onChange={handleChange}
              aria-invalid={!!errors.insuranceNumber}
              className={errors.insuranceNumber ? 'border-red-500' : ''}
            />
            {errors.insuranceNumber && <p className="text-xs text-red-500" role="alert">{errors.insuranceNumber}</p>}
          </div>
        </div>
      </section>

      </div>
      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-4 sticky bottom-0 bg-white z-20 border-t-2 shadow-lg">
        <Button type="button" variant="outline" onClick={onCancel} aria-label="Cancelar">
          Cancelar
        </Button>
        <Button
          type="submit"
          aria-label={isEditing ? 'Actualizar Paciente' : 'Crear Paciente'}
          variant="default"
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {isEditing ? 'Actualizar Paciente' : 'Crear Paciente'}
        </Button>
      </div>
    </form>
  );
}
