import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle, Calendar, Mail, Phone, MapPin, Briefcase, Heart, GraduationCap, Shield, FileText, Plus } from 'lucide-react';

export default function PatientDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-9 w-36 bg-gray-200 rounded" />
        <div className="flex space-x-2">
          <div className="h-9 w-28 bg-gray-200 rounded" />
          <div className="h-9 w-32 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <UserCircle className="h-16 w-16 text-gray-300" />
          </div>
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="h-7 bg-gray-200 rounded w-56 mb-1" />
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-gray-400">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <div className="h-4 bg-gray-200 rounded w-28" />
                </div>
                <div className="flex items-center">
                  <UserCircle className="h-4 w-4 mr-1" />
                  <div className="h-4 bg-gray-200 rounded w-20" />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-2 mt-3 text-gray-400">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                <div className="h-4 bg-gray-200 rounded w-36" />
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                <div className="h-4 bg-gray-200 rounded w-28" />
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <div className="h-4 bg-gray-200 rounded w-48" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="mb-6">
        <div className="flex space-x-4 mb-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-8 w-48 bg-gray-100 rounded" />
        </div>
        {/* Tab Content Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info Card Skeletons */}
          <div className="space-y-6">
            {/* Información Personal */}
            <Card>
              <CardHeader>
                <CardTitle className="h-6 bg-gray-200 rounded w-44 mb-4" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(5)].map((_, idx) => (
                  <div key={idx} className="flex items-start">
                    <div className="h-5 w-5 bg-gray-200 rounded-full mr-2" />
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-36 mb-1" />
                      <div className="h-4 bg-gray-100 rounded w-48" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            {/* Contacto de Emergencia */}
            <Card>
              <CardHeader>
                <CardTitle className="h-6 bg-gray-200 rounded w-44 mb-4" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(2)].map((_, idx) => (
                  <div key={idx} className="flex items-start">
                    <div className="h-5 w-5 bg-gray-200 rounded-full mr-2" />
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                      <div className="h-4 bg-gray-100 rounded w-40" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            {/* Información de Seguro */}
            <Card>
              <CardHeader>
                <CardTitle className="h-6 bg-gray-200 rounded w-44 mb-4" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(2)].map((_, idx) => (
                  <div key={idx} className="flex items-start">
                    <div className="h-5 w-5 bg-gray-200 rounded-full mr-2" />
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                      <div className="h-4 bg-gray-100 rounded w-40" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            {/* Información del Sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="h-6 bg-gray-200 rounded w-44 mb-4" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="flex items-start">
                    <div className="h-5 w-5 bg-gray-200 rounded-full mr-2" />
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                      <div className="h-4 bg-gray-100 rounded w-40" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          {/* Assessment Card Skeleton */}
          <div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="h-6 bg-gray-200 rounded w-44 mb-4" />
                <div className="h-9 w-40 bg-gray-200 rounded" />
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {[...Array(2)].map((_, idx) => (
                    <div key={idx} className="py-4 flex justify-between items-center">
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-40 mb-2" />
                        <div className="h-3 bg-gray-100 rounded w-32" />
                      </div>
                      <div className="h-8 w-24 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <div className="h-5 bg-gray-200 rounded w-44 mx-auto mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-64 mx-auto mb-6" />
                  <div className="flex justify-center">
                    <div className="h-9 w-44 bg-gray-200 rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
