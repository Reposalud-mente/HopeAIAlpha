import React from 'react';
import { WorkflowStep } from './DynamicReportWizard'; // Assuming WorkflowStep is exported

interface WizardStepperProps {
  steps: WorkflowStep[];
  activeStep: number;
}

/**
 * WizardStepper - A component to display the steps of the dynamic wizard with icons and connecting lines
 * 
 * This component renders a horizontal stepper that shows all steps in the wizard,
 * highlighting the active step and showing completed steps with different styling.
 * 
 * @component
 * @example
 * ```tsx
 * <WizardStepper steps={currentSteps} activeStep={formState.activeStep} />
 * ```
 */
const WizardStepper: React.FC<WizardStepperProps> = ({ steps, activeStep }) => {
  return (
    <div className="flex items-center">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              index === activeStep
                ? 'bg-blue-500 text-white'
                : index < activeStep
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-400'
            }`}
            title={step.label} // Add title for accessibility/hover      
          >
            {step.icon}
          </div>

          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-1 mx-2 ${
                index < activeStep ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default WizardStepper;
