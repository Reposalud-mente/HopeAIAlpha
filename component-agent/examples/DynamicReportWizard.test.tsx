import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DynamicReportWizard from './DynamicReportWizard';

// Mock de los componentes UI que podrían no estar disponibles en el entorno de prueba
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant }: any) => (
    <button onClick={onClick} data-variant={variant || 'default'}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardFooter: ({ children }: any) => <div data-testid="card-footer">{children}</div>,
  CardTitle: ({ children }: any) => <h2 data-testid="card-title">{children}</h2>,
}));

jest.mock('@/components/ui/stepper', () => ({
  Stepper: ({ children, activeStep }: any) => (
    <div data-testid="stepper" data-active-step={activeStep}>
      {children}
    </div>
  ),
  Step: ({ children, completed, disabled, onClick }: any) => (
    <div 
      data-testid="step" 
      data-completed={completed} 
      data-disabled={disabled}
      onClick={onClick}
    >
      {children}
    </div>
  ),
  StepLabel: ({ children }: any) => <span data-testid="step-label">{children}</span>,
}));

describe('DynamicReportWizard', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    mockOnComplete.mockClear();
  });

  test('renders the first step by default', () => {
    render(<DynamicReportWizard onComplete={mockOnComplete} />);
    
    expect(screen.getByText('Selección de Paciente')).toBeInTheDocument();
    expect(screen.getByLabelText('Seleccione un paciente')).toBeInTheDocument();
  });

  test('shows validation error when trying to proceed without selecting a patient', async () => {
    render(<DynamicReportWizard onComplete={mockOnComplete} />);
    
    // Click next without selecting a patient
    fireEvent.click(screen.getByText('Siguiente'));
    
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText('Se requiere seleccionar un paciente')).toBeInTheDocument();
    });
  });

  test('navigates to the next step when a patient is selected', async () => {
    render(<DynamicReportWizard onComplete={mockOnComplete} />);
    
    // Select a patient
    fireEvent.change(screen.getByLabelText('Seleccione un paciente'), { target: { value: '1' } });
    
    // Click next
    fireEvent.click(screen.getByText('Siguiente'));
    
    // Check that we're on the template selection step
    await waitFor(() => {
      expect(screen.getByText('Selección de Plantilla')).toBeInTheDocument();
    });
  });

  test('completes the wizard and calls onComplete with all data', async () => {
    const user = userEvent.setup();
    render(<DynamicReportWizard onComplete={mockOnComplete} />);
    
    // Step 1: Select a patient
    await user.selectOptions(screen.getByLabelText('Seleccione un paciente'), '1');
    await user.click(screen.getByText('Siguiente'));
    
    // Step 2: Select a template
    await waitFor(() => {
      expect(screen.getByText('Selección de Plantilla')).toBeInTheDocument();
    });
    
    await user.click(screen.getByLabelText('Evaluación Psicológica'));
    await user.click(screen.getByText('Siguiente'));
    
    // Step 3: Enter clinical info
    await waitFor(() => {
      expect(screen.getByText('Información Clínica')).toBeInTheDocument();
    });
    
    await user.type(screen.getByLabelText('Información clínica relevante'), 'El paciente presenta síntomas de ansiedad y estrés.');
    await user.click(screen.getByText('Siguiente'));
    
    // Step 4: Summary and submit
    await waitFor(() => {
      expect(screen.getByText('Resumen del Informe')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Generar Informe'));
    
    // Check that onComplete was called with the correct data
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
    expect(mockOnComplete).toHaveBeenCalledWith(expect.objectContaining({
      patientId: '1',
      templateId: '1',
      clinicalInfo: 'El paciente presenta síntomas de ansiedad y estrés.',
      completed: true
    }));
  });

  test('allows navigation back to previous steps', async () => {
    const user = userEvent.setup();
    render(<DynamicReportWizard onComplete={mockOnComplete} />);
    
    // Step 1: Select a patient
    await user.selectOptions(screen.getByLabelText('Seleccione un paciente'), '1');
    await user.click(screen.getByText('Siguiente'));
    
    // Step 2: Select a template
    await waitFor(() => {
      expect(screen.getByText('Selección de Plantilla')).toBeInTheDocument();
    });
    
    // Go back to step 1
    await user.click(screen.getByText('Anterior'));
    
    // Check that we're back on the patient selection step
    await waitFor(() => {
      expect(screen.getByText('Selección de Paciente')).toBeInTheDocument();
    });
  });

  test('preserves data when navigating between steps', async () => {
    const user = userEvent.setup();
    render(<DynamicReportWizard onComplete={mockOnComplete} />);
    
    // Step 1: Select a patient
    await user.selectOptions(screen.getByLabelText('Seleccione un paciente'), '1');
    await user.click(screen.getByText('Siguiente'));
    
    // Step 2: Select a template
    await waitFor(() => {
      expect(screen.getByText('Selección de Plantilla')).toBeInTheDocument();
    });
    
    await user.click(screen.getByLabelText('Evaluación Psicológica'));
    
    // Go back to step 1
    await user.click(screen.getByText('Anterior'));
    
    // Check that patient selection is preserved
    await waitFor(() => {
      const select = screen.getByLabelText('Seleccione un paciente') as HTMLSelectElement;
      expect(select.value).toBe('1');
    });
    
    // Go forward to step 2 again
    await user.click(screen.getByText('Siguiente'));
    
    // Check that template selection is preserved
    await waitFor(() => {
      const radio = screen.getByLabelText('Evaluación Psicológica') as HTMLInputElement;
      expect(radio.checked).toBe(true);
    });
  });

  test('initializes with provided data', async () => {
    const initialData = {
      patientId: '2',
      templateId: '3'
    };
    
    render(<DynamicReportWizard initialData={initialData} onComplete={mockOnComplete} />);
    
    // Check that patient selection is initialized
    const select = screen.getByLabelText('Seleccione un paciente') as HTMLSelectElement;
    expect(select.value).toBe('2');
    
    // Navigate to template selection
    fireEvent.click(screen.getByText('Siguiente'));
    
    // Check that template selection is initialized
    await waitFor(() => {
      const radio = screen.getByLabelText('Seguimiento Terapéutico') as HTMLInputElement;
      expect(radio.checked).toBe(true);
    });
  });
});
