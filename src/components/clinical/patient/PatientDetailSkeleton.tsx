import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCircle, Calendar, Mail, Phone, MapPin, Briefcase, Heart, GraduationCap, Shield, FileText, Plus, AlertCircle } from 'lucide-react';

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

      {/* Profile Card - Enhanced Skeleton */}
      <Card className="mb-6 overflow-hidden border-0 shadow-md">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-1"></div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Patient Avatar Skeleton */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                <UserCircle className="h-16 w-16 text-gray-300" />
              </div>
              <div className="mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 w-16 h-5" />
            </div>

            {/* Patient Information Skeleton */}
            <div className="flex-1 space-y-4 w-full">
              {/* Name and Basic Demographics */}
              <div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="flex items-center">
                    <div className="h-7 bg-gray-200 rounded w-56" />
                    <div className="h-5 bg-gray-200 rounded w-20 ml-2" />
                  </div>

                </div>
              </div>

              {/* Contact Information Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="flex items-center p-2 rounded-md bg-gray-50">
                    <div className="h-5 w-5 bg-gray-200 rounded-full mr-3" />
                    <div className="w-full">
                      <div className="h-3 bg-gray-200 rounded w-16 mb-1" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs Skeleton */}
      <div className="mb-6">
        <div className="flex space-x-4 mb-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-8 w-48 bg-gray-100 rounded" />
        </div>
        {/* Tab Content Skeleton */}
        <div className="space-y-6">
          {/* Main Information Card - Consolidated Skeleton */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-100">
              <div className="flex items-center">
                <div className="h-5 w-5 bg-gray-200 rounded-full mr-2" />
                <CardTitle className="h-6 bg-gray-200 rounded w-44" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                {/* Demographic Information Column Skeleton */}
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <FileText className="h-4 w-4 text-gray-300 mr-1" />
                    <div className="h-4 bg-gray-200 rounded w-32" />
                  </div>
                  <div className="space-y-3">
                    {[...Array(4)].map((_, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                        <div className="h-3 bg-gray-200 rounded w-28" />
                        <div className="h-4 bg-gray-200 rounded w-20" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emergency Contact Column Skeleton */}
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <div className="h-4 w-4 bg-gray-200 rounded-full mr-1" />
                    <div className="h-4 bg-gray-200 rounded w-40" />
                  </div>
                  <div className="space-y-3">
                    {[...Array(2)].map((_, idx) => (
                      <div key={idx} className="flex items-center bg-gray-50 p-3 rounded-md mt-2">
                        <div className="h-5 w-5 bg-gray-200 rounded-full mr-2" />
                        <div>
                          <div className="h-3 bg-gray-200 rounded w-16 mb-1" />
                          <div className="h-4 bg-gray-200 rounded w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Professional Information Column Skeleton */}
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <div className="h-4 w-4 bg-gray-200 rounded-full mr-1" />
                    <div className="h-4 bg-gray-200 rounded w-40" />
                  </div>
                  <div className="space-y-3">
                    {[...Array(2)].map((_, idx) => (
                      <div key={idx} className="flex items-center">
                        <div className="h-5 w-5 bg-gray-200 rounded-full mr-2" />
                        <div>
                          <div className="h-3 bg-gray-200 rounded w-24 mb-1" />
                          <div className="h-4 bg-gray-200 rounded w-32" />
                        </div>
                      </div>
                    ))}

                    {/* Insurance Information Skeleton */}
                    <div className="mt-4 pt-3 border-t border-dashed border-gray-200">
                      <div className="flex items-center mb-2">
                        <div className="h-4 w-4 bg-gray-200 rounded-full mr-1" />
                        <div className="h-3 bg-gray-200 rounded w-28" />
                      </div>
                      {[...Array(2)].map((_, idx) => (
                        <div key={idx} className="flex items-center mt-2">
                          <div className="h-5 w-5 bg-gray-200 rounded-full mr-2" />
                          <div>
                            <div className="h-3 bg-gray-200 rounded w-20 mb-1" />
                            <div className="h-4 bg-gray-200 rounded w-32" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information - Compact Skeleton */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-100 py-3">
              <div className="flex items-center">
                <div className="h-4 w-4 bg-gray-200 rounded-full mr-2" />
                <CardTitle className="h-4 bg-gray-200 rounded w-40" />
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className="h-5 w-5 bg-gray-200 rounded-full mr-2" />
                    <div>
                      <div className="h-3 bg-gray-200 rounded w-24 mb-1" />
                      <div className="h-4 bg-gray-200 rounded w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Assessment Card Skeleton */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between bg-gray-50 border-b border-gray-100">
              <div className="flex items-center">
                <div className="h-5 w-5 bg-gray-200 rounded-full mr-2" />
                <CardTitle className="h-6 bg-gray-200 rounded w-44" />
              </div>
              <div className="h-9 w-40 bg-gray-200 rounded" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {[...Array(2)].map((_, idx) => (
                  <div key={idx} className="p-4 flex justify-between items-center">
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-40 mb-2" />
                      <div className="h-3 bg-gray-100 rounded w-32" />
                    </div>
                    <div className="h-8 w-24 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
              <div className="text-center py-8 px-4 border-t border-gray-100">
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
  );
}
