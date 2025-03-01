"use client"

import { motion, LayoutGroup } from "framer-motion"
import { Clock, Users, AlertCircle, ArrowRight } from "lucide-react"
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
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  hover: {
    y: -3,
    transition: {
      type: "spring",
      stiffness: 400,
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
        className="space-y-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header Section */}
        <motion.div 
          className="flex items-center justify-between mb-2"
          variants={cardVariants}
        >
          <div>
            <motion.h2 
              className="text-xl font-bold tracking-tight"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Daily Pulse
            </motion.h2>
            <motion.p 
              className="text-sm text-muted-foreground"
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
          className="grid gap-4 md:grid-cols-3"
          variants={containerVariants}
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              variants={cardVariants}
              whileHover="hover"
              layout
            >
              <Card className="rounded-lg shadow-sm hover:shadow transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    className={cn("text-calm-primary", metric.color)}
                  >
                    {metric.icon}
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: index * 0.1 }}
                    className="text-2xl font-bold"
                  >
                    {metric.value}
                  </motion.div>
                  {metric.change && (
                    <motion.p
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                      className="text-xs text-muted-foreground"
                    >
                      {metric.change > 0 ? '+' : ''}{metric.change} desde ayer
                    </motion.p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="grid gap-4 md:grid-cols-2"
          variants={containerVariants}
        >
          {/* Clinical Progress */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
          >
            <Card className="rounded-lg shadow-sm hover:shadow transition-shadow">
              <CardHeader>
                <CardTitle className="text-base">Progreso Clínico</CardTitle>
                <CardDescription className="text-xs">Seguimiento de evaluaciones y consultas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground text-xs">Evaluaciones Completadas</span>
                    <span className="font-medium text-xs">8/12</span>
                  </div>
                  <Progress value={66} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground text-xs">Seguimientos Realizados</span>
                    <span className="font-medium text-xs">15/20</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Schedule */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
          >
            <Card className="rounded-lg shadow-sm hover:shadow transition-shadow">
              <CardHeader>
                <CardTitle className="text-base">Agenda de Hoy</CardTitle>
                <CardDescription className="text-xs">Próximas consultas programadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center rounded-lg bg-gray-50 p-2 hover:bg-gray-100 transition-colors">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback className="text-xs">
                          {appointment.patientName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{appointment.patientName}</p>
                        <p className="text-xs text-muted-foreground">{appointment.time} - {appointment.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </LayoutGroup>
  )
}


