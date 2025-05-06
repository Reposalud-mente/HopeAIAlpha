"use client"

import { motion, LayoutGroup } from "framer-motion"
import { Clock, Users, AlertCircle, ArrowRight, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import React from "react"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20
    }
  },
  hover: {
    y: -4,
    boxShadow: "0 10px 30px -5px rgba(0,0,0,0.1)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  }
}

interface Appointment {
  id: string
  patientName: string
  type: string
  time: string
  status: "pending" | "completed" | "cancelled"
  avatar?: string
}

interface MetricCard {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color: string
}

export default function DailyPulse() {
  const metrics: MetricCard[] = [
    {
      title: "Pacientes Activos",
      value: "24",
      change: 2,
      icon: <Users className="h-4 w-4" />,
      color: "text-blue-500",
    },
    {
      title: "Consultas Pendientes",
      value: "8",
      icon: <Clock className="h-4 w-4" />,
      color: "text-amber-500",
    },
    {
      title: "Casos Críticos",
      value: "3",
      change: -1,
      icon: <AlertCircle className="h-4 w-4" />,
      color: "text-red-500",
    },
  ]

  const appointments: Appointment[] = [
    {
      id: "1",
      patientName: "Juan Pérez",
      type: "Seguimiento",
      time: "10:00 AM",
      status: "pending",
      avatar: "https://placehold.co/32x32",
    },
    {
      id: "2",
      patientName: "María González",
      type: "Primera Consulta",
      time: "11:30 AM",
      status: "pending",
      avatar: "https://placehold.co/32x32",
    },
    {
      id: "3",
      patientName: "Carlos Ruiz",
      type: "Evaluación",
      time: "14:15 PM",
      status: "pending",
      avatar: "https://placehold.co/32x32",
    },
  ]

  return (
    <LayoutGroup>
      <motion.div 
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header Section */}
        <motion.div 
          className="flex items-center justify-between mb-4"
          variants={cardVariants}
        >
          <div>
            <motion.h2 
              className="text-2xl font-medium tracking-tight text-gray-900"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Daily Pulse
            </motion.h2>
            <motion.p 
              className="text-sm text-gray-500 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Vista general de tu día
            </motion.p>
          </div>
        </motion.div>

        {/* Metrics Cards */}
        <motion.div 
          className="grid gap-5 md:grid-cols-3"
          variants={containerVariants}
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              variants={cardVariants}
              whileHover="hover"
              layout
            >
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">{metric.title}</CardTitle>
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full",
                      metric.color === "text-blue-500" ? "bg-blue-100" : "",
                      metric.color === "text-amber-500" ? "bg-amber-100" : "",
                      metric.color === "text-red-500" ? "bg-red-100" : ""
                    )}
                  >
                    <div className={cn(metric.color)}>
                      {metric.icon}
                    </div>
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        type: "spring", 
                        delay: index * 0.15,
                        stiffness: 100,
                        damping: 20
                      }}
                      className="text-3xl font-bold text-gray-900"
                    >
                      {metric.value}
                    </motion.div>
                    
                    {metric.change && (
                      <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.15 }}
                        className={cn(
                          "ml-2 flex items-center text-xs",
                          metric.change > 0 ? "text-green-600" : "text-red-600"
                        )}
                      >
                        {metric.change > 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        <span>{Math.abs(metric.change)}</span>
                      </motion.div>
                    )}
                  </div>
                  
                  {metric.change && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.15 }}
                      className="text-xs text-gray-500 mt-1"
                    >
                      Comparado con ayer
                    </motion.p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="grid gap-5 md:grid-cols-2"
          variants={containerVariants}
        >
          {/* Clinical Progress */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-gray-900">Progreso Clínico</CardTitle>
                <CardDescription>Seguimiento de evaluaciones y consultas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Evaluaciones Completadas</span>
                    <span className="font-medium text-sm">8/12</span>
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded-full bg-blue-100">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "66%" }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Seguimientos Realizados</span>
                    <span className="font-medium text-sm">15/20</span>
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded-full bg-green-100">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "75%" }}
                        transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Schedule */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-gray-900">Agenda de Hoy</CardTitle>
                <CardDescription>Próximas consultas programadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <motion.div 
                      key={appointment.id} 
                      className="flex items-center p-3 rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-gray-200 transition-all duration-300"
                      whileHover={{ 
                        x: 3, 
                        boxShadow: "0 4px 12px -2px rgba(0,0,0,0.05)",
                        borderColor: "rgba(209, 213, 219, 0.8)"
                      }}
                    >
                      <Avatar className="h-10 w-10 mr-3 border-2 border-white shadow-sm">
                        <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                          {appointment.patientName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">{appointment.patientName}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-0.5">
                          <Clock className="h-3 w-3 mr-1 text-gray-400" />
                          <span>{appointment.time}</span>
                          <span className="mx-1.5 h-1 w-1 rounded-full bg-gray-300" />
                          <span>{appointment.type}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-4 px-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-sm border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-1"
                >
                  <span>Ver todas las citas</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </LayoutGroup>
  )
}