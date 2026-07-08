import React, { createContext, useContext } from 'react';
import { StepperStep, StepperStepProp, StepperVariant, StepperLastShownStep } from './Stepper';

export interface StepperContextValue {
  lastShown: StepperLastShownStep | null;
  setLastShown: React.Dispatch<React.SetStateAction<StepperLastShownStep | null>>;
  passedSteps: Set<string>;
  setPassedSteps: React.Dispatch<React.SetStateAction<Set<string>>>;
  activeStep: StepperStepProp;
  setActiveStep: React.Dispatch<React.SetStateAction<string>>;
  steps: StepperStep[];
  setSteps: React.Dispatch<React.SetStateAction<StepperStep[]>>;
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
