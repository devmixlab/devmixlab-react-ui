import React, { useState, ComponentProps, useEffect } from 'react';
import { classPrefix } from '../../utils/classPrefix';
import { clsx } from 'clsx';
import { StepperContext, useStepperContext, StepperContextValue } from './StepperContext';
import { CheckIcon, DotIcon } from '../Icon';
import { Box } from '../Box';

//----------------------------------------------------------------
// Types
//----------------------------------------------------------------

type StepperVariant = 'base' | 'icon-only' | 'bars-only' | (string & {});

type StepperStepProp = string | null;

type StepperStatus = 'complete' | 'current' | 'upcoming';

type StepperTitlePlacement = 'below' | 'above';

type StepperStep = {
  title?: string;
  id: string;
  active: boolean;
  status: StepperStatus;
};

type OwnStepperProps = {
  indicator?: React.ReactNode;
  completeIndicator?: React.ReactNode;
  allowFutureNavigation?: boolean;
  variant?: StepperVariant;
  titlePlacement?: StepperTitlePlacement;
  activeStep: string;
};

type StepperProps = OwnStepperProps & ComponentProps<'div'>;

//----------------------------------------------------------------
// Helpers
//----------------------------------------------------------------

const prefix = (name: string = '') => {
  return classPrefix(`--stepper${name}`);
};

//----------------------------------------------------------------
// Stepper
//----------------------------------------------------------------

const Stepper = ({
  className,
  children,
  indicator,
  completeIndicator,
  allowFutureNavigation = false,
  variant = 'base',
  titlePlacement = 'below',
  activeStep: activeStepProp,
}: StepperProps) => {
  const [activeStep, setActiveStep] = useState<string>(activeStepProp);
  const [steps, setSteps] = useState<StepperStep[]>([]);

  useEffect(() => {
    setActiveStep(activeStepProp);
  }, [activeStepProp]);

  const finalCompleteIndicator = completeIndicator ?? <CheckIcon />;

  const ctxValue: StepperContextValue = {
    activeStep,
    setActiveStep,
    steps,
    setSteps,
    completeIndicator: finalCompleteIndicator,
    indicator,
    allowFutureNavigation,
    variant,
    titlePlacement,
  };

  return (
    <StepperContext.Provider value={ctxValue}>
      <nav aria-label="Progress">
        <div className={clsx(prefix(), className)} data-variant={variant}>
          {children}
        </div>
      </nav>
    </StepperContext.Provider>
  );
};

Stepper.displayName = 'Stepper';

//----------------------------------------------------------------
// StepperStep
//----------------------------------------------------------------

type StepperStepProps = {
  id: string;
  children?: string;
  completeIndicator?: React.ReactNode;
  indicator?: React.ReactNode;
  onClick?: (e: MouseEvent) => void;
} & Omit<ComponentProps<'div'>, 'children'>;

const StepperStep = ({
  className,
  children,
  id,
  completeIndicator,
  indicator,
  onClick,
  ...rest
}: StepperStepProps) => {
  const {
    activeStep,
    setActiveStep,
    steps,
    setSteps,
    completeIndicator: ctxCompleteIndicator,
    indicator: ctxIndicator,
    allowFutureNavigation,
    variant,
    titlePlacement,
  } = useStepperContext();

  const Element = onClick ? 'button' : 'div';

  const finalCompleteIndicator = completeIndicator ?? ctxCompleteIndicator;
  const resolvedIndicator = indicator ?? ctxIndicator;

  const isActive = id === activeStep;

  const activeStepIndex = steps.findIndex((itm) => itm.id === activeStep);
  const currentStepIndex = steps.findIndex((itm) => itm.id === id);

  const finalIndicator =
    resolvedIndicator ??
    (variant == 'icon-only' ? (
      <Box size={35}>
        <DotIcon style={{ width: '100%', height: '100%' }} />
      </Box>
    ) : (
      currentStepIndex + 1
    ));

  const status: StepperStatus =
    currentStepIndex === -1 || activeStepIndex === -1
      ? 'upcoming'
      : currentStepIndex < activeStepIndex
        ? 'complete'
        : currentStepIndex === activeStepIndex
          ? 'current'
          : 'upcoming';

  useEffect(() => {
    setSteps((prev) => {
      const isInSteps = prev.findIndex((itm) => itm.id === id);

      if (isInSteps >= 0) {
        return prev;
      }

      return [
        ...prev,
        {
          title: children,
          id,
          active: isActive,
          status,
        },
      ];
    });
  }, []);

  // setSteps((prev) => {
  //   const isInSteps = prev.findIndex((itm) => itm.id === id);
  //
  //   if (isInSteps >= 0) {
  //     return prev;
  //   }
  //
  //   return [
  //     ...prev,
  //     {
  //       title: children,
  //       id,
  //       active,
  //       status,
  //     },
  //   ];
  // });

  const isFirstStep = steps[0]?.id === id;
  const isLastStep = steps[steps.length - 1]?.id === id;
  const isClickable =
    onClick && (status === 'complete' || (status === 'upcoming' && allowFutureNavigation));

  return (
    <Box
      {...rest}
      as={Element}
      tabIndex={isClickable ? 0 : -1}
      className={clsx(prefix('__step'), className)}
      key={id}
      data-clickable={isClickable || undefined}
      data-step-status={status}
      onClick={
        isClickable
          ? (e: React.MouseEvent<HTMLDivElement>) => {
              onClick(e);
            }
          : undefined
      }
    >
      {titlePlacement == 'above' && children && (
        <div className={prefix('__content')} data-step-status={status}>
          <span className={prefix('__title')}>{children}</span>
        </div>
      )}

      <div className={prefix('__row')}>
        <div
          className={clsx(prefix('__connector'), prefix('__connector-left'))}
          data-connector-hidden={isFirstStep || undefined}
          data-step-status={status}
        >
          <div />
        </div>

        <div className={prefix('__indicator')} data-step-status={status}>
          {status === 'complete' ? finalCompleteIndicator : finalIndicator}
        </div>

        <div
          className={clsx(prefix('__connector'), prefix('__connector-right'))}
          data-connector-hidden={isLastStep || undefined}
          data-step-status={status}
        >
          <div />
        </div>
      </div>

      {titlePlacement == 'below' && children && (
        <div className={prefix('__content')} data-step-status={status}>
          <span className={prefix('__title')}>
            {children} - {status}
          </span>
        </div>
      )}
    </Box>
  );
};

StepperStep.displayName = 'StepperStep';

Stepper.Step = StepperStep;

//----------------------------------------------------------------
// Exports
//----------------------------------------------------------------

export { Stepper };

export type {
  StepperVariant,
  StepperStepProp,
  StepperStatus,
  StepperStep,
  OwnStepperProps,
  StepperProps,
  StepperTitlePlacement,
};
