import React, { createContext, useContext } from 'react';
import { StepperStep, StepperStepProp, StepperVariant, StepperTitlePlacement } from './Stepper';

export interface StepperContextValue {
  activeStep: StepperStepProp;
  setActiveStep: React.Dispatch<React.SetStateAction<string>>;
  steps: StepperStep[];
  setSteps: React.Dispatch<React.SetStateAction<StepperStep[]>>;
  completeIndicator: React.ReactNode;
  indicator: React.ReactNode;
  allowFutureNavigation: boolean;
  variant: StepperVariant;
  titlePlacement: StepperTitlePlacement;
}

export const StepperContext = createContext<StepperContextValue | null>(null);

export function useStepperContext() {
  const context = useContext(StepperContext);

  if (!context) {
    throw new Error('useStepperContext must be used within a <Stepper> component.');
  }

  return context;
}
