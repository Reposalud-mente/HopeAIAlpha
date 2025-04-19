import React, { useState } from "react";
import { Calendar, Clock, Plus } from "lucide-react";
import SessionCreation from "./SessionCreation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SessionData {
  id: string;
  date: string;
  time: string;
  duration: string;
  type: string;
  provider: string;
  status: "completed" | "scheduled" | "cancelled" | "no-show";
  notes?: string;
}

interface PatientSessionsProps {
  patientId: string;
  patientName: string;
  onSelectSession?: (session: SessionData) => void;
}

const sessionData: SessionData[] = [
  {
    id: "S-001",
    date: "2023-10-15",
    time: "09:00 AM",
    duration: "60 min",
    type: "Consulta inicial",
    provider: "Dra. Sarah Johnson",
    status: "completed",
    notes: "El paciente reportó dolor crónico de espalda. Se prescribió fisioterapia y seguimiento en 2 semanas.",
  },
  {
    id: "S-002",
    date: "2023-10-29",
    time: "10:30 AM",
    duration: "30 min",
    type: "Seguimiento",
    provider: "Dra. Sarah Johnson",
    status: "completed",
    notes: "El paciente muestra mejoría con fisioterapia. Se continúa con el plan de tratamiento actual.",
  },
  {
    id: "S-003",
    date: "2023-11-12",
    time: "11:00 AM",
    duration: "30 min",
    type: "Seguimiento",
    provider: "Dr. Michael Chen",
    status: "completed",
    notes: "El dolor se redujo en un 40%. Se ajustó la dosis de medicación y se recomendó continuar la terapia física.",
  },
  {
    id: "S-004",
    date: "2023-12-05",
    time: "02:15 PM",
    duration: "45 min",
    type: "Sesión de terapia",
    provider: "Dra. Lisa Wong",
    status: "no-show",
  },
  {
    id: "S-005",
    date: "2024-01-10",
    time: "09:30 AM",
    duration: "30 min",
    type: "Seguimiento",
    provider: "Dra. Sarah Johnson",
    status: "completed",
    notes: "El paciente ahora está sin dolor. Se le dio de alta de la fisioterapia.",
  },
];

const PatientSessions: React.FC<PatientSessionsProps> = ({ patientId, patientName, onSelectSession }) => {
  // patientId will be used for API calls in the future
  const [showCreate, setShowCreate] = useState(false);
  return (
    <div className="space-y-6">
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Lista de sesiones</TabsTrigger>
          <TabsTrigger value="timeline">Línea de tiempo</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
  <div>
    <CardTitle>Sesiones para {patientName}</CardTitle>
    <CardDescription>Todas las sesiones clínicas para este paciente.</CardDescription>
  </div>
  <Button onClick={() => setShowCreate(true)} className="mt-2 md:mt-0" variant="default">
    <Plus className="h-4 w-4 mr-2" /> Nueva sesión
  </Button>
</CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Tipo</TableHead>

                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessionData.map(session => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-muted-foreground" />
                          {session.date}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-muted-foreground" />
                          {session.time}
                        </div>
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        {session.type}
                      </TableCell>

                      <TableCell>
                        <Badge variant={
                          session.status === "completed"
                            ? "default"
                            : session.status === "scheduled"
                            ? "secondary"
                            : session.status === "cancelled"
                            ? "destructive"
                            : "outline"
                        }>
                          {session.status === "completed" ? "Completada" : session.status === "scheduled" ? "Programada" : session.status === "cancelled" ? "Cancelada" : "No asistió"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSelectSession && onSelectSession(session)}
                        >
                          Ver detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                </TableBody>
              </Table>
              {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
                  <div className="max-w-3xl w-full">
                    <SessionCreation onSubmit={() => setShowCreate(false)} onCancel={() => setShowCreate(false)} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};


export default PatientSessions;
