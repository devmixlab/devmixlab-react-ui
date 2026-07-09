import React, { createContext, useContext } from 'react';
import { StepperStatus } from './Stepper';

export interface StepperStepContextValue {
  activeStepIndex: number;
  currentStepIndex: number;
  isActive: boolean;
  isComplete: boolean;
  status: StepperStatus;
  isFirstStep: boolean;
  isLastStep: boolean;
  isClickable: boolean;
  isLastShown: boolean;
  isLastComplete: boolean;
  isBeforeCurrent: boolean;
  isAfterCurrent: boolean;
}

export const StepperStepContext = createContext<StepperStepContextValue | null>(null);

export function useStepperStepContext() {
  const context = useContext(StepperStepContext);

  if (!context) {
    throw new Error('useStepperStepContext must be used within a <StepperStep> component.');
  }

  return context;
}
