"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Bot } from "lucide-react"
import { AIAssistant } from "./ai-chat"

interface AIAssistanceCardProps {
  patientName: string
  question: string
}

export function AIAssistanceCard({ patientName, question }: AIAssistanceCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Card className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => setIsOpen(true)}>
        <CardContent className="flex items-start gap-4 p-6">
          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium">{question}</p>
        </CardContent>
      </Card>
      <AIAssistant
        patientName={patientName}
        initialQuestion={question}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  )
}

