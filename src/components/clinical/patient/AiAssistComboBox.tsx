import * as React from "react";
import { Check, ChevronsUpDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const aiTasks = [
  { value: "objetivos", label: "Sugerir objetivos para la sesión" },
  { value: "resumen", label: "Resumir historia clínica relevante" },
  { value: "preguntas", label: "Proponer preguntas o actividades" },
];

export function AiAssistComboBox() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-blue-600 transition flex items-center"
          aria-label="AI puede asistir en la preparación"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0">
        <Command>
          <CommandInput placeholder="Selecciona tarea AI..." />
          <CommandEmpty>No hay tareas AI</CommandEmpty>
          <CommandGroup>
            {aiTasks.map((task) => (
              <CommandItem
                key={task.value}
                value={task.value}
                onSelect={() => {
                  setValue(task.value);
                  setOpen(false);
                  // Placeholder: trigger AI task here
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === task.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {task.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
