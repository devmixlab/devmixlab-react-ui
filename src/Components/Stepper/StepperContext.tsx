import React, { createContext, useContext } from 'react';
import { StepperStep, StepperStepProp, StepperVariant } from './Stepper';

export interface StepperContextValue {
  activeStep: StepperStepProp;
  setActiveStep: React.Dispatch<React.SetStateAction<string>>;
  steps: StepperStep[];
  setSteps: React.Dispatch<React.SetStateAction<StepperStep[]>>;
  allowFutureNavigation: boolean;
  variant?: StepperVariant;
}

export const StepperContext = createContext<StepperContextValue | null>(null);

export function useStepperContext() {
  const context = useContext(StepperContext);

  if (!context) {
    throw new Error('useStepperContext must be used within a <Stepper> component.');
  }

  return context;
}
