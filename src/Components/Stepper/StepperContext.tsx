import React, { createContext, useContext } from 'react';
import { StepperStepRegister, StepperStepProp, StepperVariant } from './Stepper';

export interface StepperContextValue {
  passedSteps?: Set<string>;
  activeStep: StepperStepProp;
  steps: StepperStepRegister[];
  setSteps: React.Dispatch<React.SetStateAction<StepperStepRegister[]>>;
  allowFutureNavigation: boolean;
  variant?: StepperVariant;
  keepPassedSteps: boolean;
}

export const StepperContext = createContext<StepperContextValue | null>(null);

export function useStepperContext() {
  const context = useContext(StepperContext);

  if (!context) {
    throw new Error('useStepperContext must be used within a <Stepper> component.');
  }

  return context;
}
