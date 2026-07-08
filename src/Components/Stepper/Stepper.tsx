import React, { useState, ComponentProps, useEffect, CSSProperties } from 'react';
import { classPrefix } from '../../utils/classPrefix';
import { clsx } from 'clsx';
import { StepperContext, useStepperContext, StepperContextValue } from './StepperContext';
import {
  StepperStepContext,
  StepperStepContextValue,
  useStepperStepContext,
} from './StepperStepContext';
import { CheckIcon, DotIcon } from '../Icon';
import { Box, BoxDerived, type BoxProps, type BoxDerivedProps } from '../Box';

//----------------------------------------------------------------
// Types
//----------------------------------------------------------------

type StepperVariant = 'base' | (string & {});

type StepperStepProp = string | null;

type StepperStatus = 'complete' | 'current' | 'upcoming';

type StepperStep = {
  id: string;
  active: boolean;
  status: StepperStatus;
};

type StepperLastShownStep = {
  id: string;
  index: number;
};

type OwnStepperProps = {
  allowFutureNavigation?: boolean;
  variant?: StepperVariant;
  activeStep: string;
  passedSteps?: Set<string>;
  // keepStatus?: boolean;
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
  allowFutureNavigation = false,
  variant = 'base',
  activeStep: activeStepProp,
  passedSteps: passedStepsProp,
  // keepPassedStepsStatus = true,
}: StepperProps) => {
  const [lastComplete, setLastComplete] = useState<StepperLastShownStep | null>(null);
  const [lastShown, setLastShown] = useState<StepperLastShownStep | null>(null);
  const [passedSteps, setPassedSteps] = useState<Set<string>>(passedStepsProp ?? new Set());
  const [activeStep, setActiveStep] = useState<string>(activeStepProp);
  const [steps, setSteps] = useState<StepperStep[]>([]);

  const keepPassedSteps = passedStepsProp != null;

  useEffect(() => {
    setActiveStep(activeStepProp);
  }, [activeStepProp]);

  useEffect(() => {
    setPassedSteps((v) => new Set(passedStepsProp));
  }, [passedStepsProp]);

  const ctxValue: StepperContextValue = {
    lastComplete,
    setLastComplete,
    lastShown,
    setLastShown,
    passedSteps,
    setPassedSteps,
    keepPassedSteps,
    activeStep,
    setActiveStep,
    steps,
    setSteps,
    allowFutureNavigation,
    variant,
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
  onClick?: (e: MouseEvent) => void;
} & ComponentProps<'div'>;

const StepperStep = ({ className, children, id, onClick, ...rest }: StepperStepProps) => {
  const {
    lastComplete,
    setLastComplete,
    lastShown,
    setLastShown,
    passedSteps,
    activeStep,
    setActiveStep,
    steps,
    setSteps,
    allowFutureNavigation,
    variant,
    keepPassedSteps,
  } = useStepperContext();

  const Element = onClick ? 'button' : 'div';

  const isActive = id === activeStep;

  const activeStepIndex = steps.findIndex((itm) => itm.id === activeStep);
  const currentStepIndex = steps.findIndex((itm) => itm.id === id);

  // const status: StepperStatus =
  //   currentStepIndex === -1 || activeStepIndex === -1
  //     ? 'upcoming'
  //     : currentStepIndex < activeStepIndex
  //       ? 'complete'
  //       : currentStepIndex === activeStepIndex
  //         ? 'current'
  //         : 'upcoming';
  const isComplete = keepPassedSteps ? passedSteps.has(id) : currentStepIndex < activeStepIndex;
  const isCurrent = currentStepIndex === activeStepIndex;

  const isBeforeCurrent = activeStepIndex > currentStepIndex;
  const isAfterCurrent = activeStepIndex < currentStepIndex;

  // console.log(keepPassedSteps);
  // console.log(isComplete);
  // console.log(isComplete);

  const status: StepperStatus =
    currentStepIndex === -1 || activeStepIndex === -1
      ? 'upcoming'
      : isCurrent
        ? 'current'
        : isComplete
          ? 'complete'
          : 'upcoming';

  // const status: StepperStatus =
  //   currentStepIndex === -1 || activeStepIndex === -1
  //     ? 'upcoming'
  //     : (keepPassedSteps ? passedSteps.has(id) : currentStepIndex < activeStepIndex)
  //       ? 'complete'
  //       : currentStepIndex === activeStepIndex
  //         ? 'current'
  //         : 'upcoming';

  useEffect(() => {
    setSteps((prev) => {
      const isInSteps = prev.findIndex((itm) => itm.id === id);

      if (isInSteps >= 0) {
        return prev;
      }

      return [
        ...prev,
        {
          id,
          active: isActive,
          status,
        },
      ];
    });
  }, []);

  if (
    (lastShown == null && isActive) ||
    (isActive && lastShown?.id !== id && (lastShown?.index ?? -1) < currentStepIndex)
  ) {
    if (currentStepIndex >= 0) setLastShown({ id: id, index: currentStepIndex });
  }

  if (
    (lastComplete == null && isComplete) ||
    (isComplete && lastComplete?.id !== id && (lastComplete?.index ?? -1) < currentStepIndex)
  ) {
    if (currentStepIndex >= 0) setLastComplete({ id: id, index: currentStepIndex });
  }

  const isLastComplete = lastComplete?.id === id;
  const isLastShown = lastShown?.id === id;
  const isFirstStep = steps[0]?.id === id;
  const isLastStep = steps[steps.length - 1]?.id === id;
  const isClickable =
    (onClick && (status === 'complete' || (status === 'upcoming' && allowFutureNavigation))) ||
    false;

  console.log(isLastShown, id);

  const stepCtxValue: StepperStepContextValue = {
    activeStepIndex,
    currentStepIndex,
    isActive,
    status,
    isFirstStep,
    isLastStep,
    isClickable,
    isLastShown,
    isLastComplete,
    isBeforeCurrent,
    isAfterCurrent,
  };

  return (
    <StepperStepContext.Provider value={stepCtxValue}>
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
                onClick?.(e);
              }
            : undefined
        }
      >
        {children}
      </Box>
    </StepperStepContext.Provider>
  );
};

StepperStep.displayName = 'StepperStep';

Stepper.Step = StepperStep;

//----------------------------------------------------------------
// StepperStepBarRow
//----------------------------------------------------------------

type StepperStepBarProps = {
  gap?: string | number;
  rounded?: BoxDerivedProps['rounded'];
} & ComponentProps<'div'>;

const StepperStepBar = ({ gap = 10, rounded = '9999px' }: StepperStepBarProps) => {
  const { status } = useStepperStepContext();

  return (
    <div className={prefix('__row')}>
      <BoxDerived px={gap} className={prefix('__bar')} data-step-status={status}>
        <BoxDerived rounded={rounded} />
      </BoxDerived>
    </div>
  );
};

StepperStepBar.displayName = 'StepperStepBar';

Stepper.Bar = StepperStepBar;

//----------------------------------------------------------------
// StepperStepIndicatorRow
//----------------------------------------------------------------

type StepperStepTrackProps = {
  connectorGap?: string | number;
} & ComponentProps<'div'>;

const StepperStepTrack = ({ children, className, style, connectorGap }: StepperStepTrackProps) => {
  const {
    status,
    isFirstStep,
    isLastStep,
    isLastShown,
    isLastComplete,
    isBeforeCurrent,
    isAfterCurrent,
  } = useStepperStepContext();

  const {
    // lastShown,
    // setLastShown,
    // passedSteps,
    // activeStep,
    // setActiveStep,
    // steps,
    // setSteps,
    // allowFutureNavigation,
    // variant,
    keepPassedSteps,
  } = useStepperContext();

  const placedToActive = isBeforeCurrent ? 'before' : isAfterCurrent ? 'after' : 'current';

  return (
    <div
      className={clsx(prefix('__row'), className)}
      style={
        {
          ...style,
          '--connector-gap': typeof connectorGap === 'number' ? `${connectorGap}px` : connectorGap,
        } as CSSProperties
      }
    >
      <div
        className={clsx(prefix('__connector'), prefix('__connector-left'))}
        data-connector-hidden={isFirstStep || undefined}
        data-step-status={status}
        data-step-last-shown={isLastShown || undefined}
        data-step-last-complete={isLastComplete || undefined}
        data-keep-passed-steps={keepPassedSteps || undefined}
        data-placed-to-active={placedToActive}
      >
        <div />
      </div>

      {children}

      <div
        className={clsx(prefix('__connector'), prefix('__connector-right'))}
        data-connector-hidden={isLastStep || undefined}
        data-step-status={status}
        data-step-last-shown={isLastShown || undefined}
        data-step-last-complete={isLastComplete || undefined}
        data-keep-passed-steps={keepPassedSteps || undefined}
        data-placed-to-active={placedToActive}
      >
        <div />
      </div>
    </div>
  );
};

StepperStepTrack.displayName = 'StepperStepTrack';

Stepper.Track = StepperStepTrack;

//----------------------------------------------------------------
// StepperStepIndicator
//----------------------------------------------------------------

type StepperStepIndicatorProps = {
  indicator?: React.ReactNode;
  completeIndicator?: React.ReactNode;
  iconOnly?: boolean;
  svgSize?: number | string;
} & BoxDerivedProps &
  Omit<ComponentProps<'div'>, 'children'>;

const StepperStepIndicator = ({
  className,
  style,
  indicator,
  completeIndicator,
  iconOnly = false,
  svgSize = '60%',
  ...rest
}: StepperStepIndicatorProps) => {
  const { status, isLastStep, isFirstStep, currentStepIndex } = useStepperStepContext();

  const finalIndicator = indicator ?? currentStepIndex + 1;
  const finalCompleteIndicator = completeIndicator ?? <CheckIcon />;

  return (
    <BoxDerived
      {...rest}
      className={clsx(prefix('__indicator'), className)}
      style={
        {
          ...style,

          '--indicator-svg-size': typeof svgSize === 'number' ? `${svgSize}px` : svgSize,
        } as CSSProperties
      }
      data-step-status={status}
      data-icon-only={iconOnly || undefined}
    >
      {status === 'complete' ? finalCompleteIndicator : finalIndicator}
    </BoxDerived>
  );
};

StepperStepIndicator.displayName = 'StepperStepIndicator';

Stepper.Indicator = StepperStepIndicator;

//----------------------------------------------------------------
// StepperStepContent
//----------------------------------------------------------------

type StepperStepContentProps = {
  render?: (value: StepperStepContextValue) => React.ReactNode;
} & BoxDerivedProps &
  ComponentProps<'div'>;

const StepperStepContent = ({ children, className, render, ...rest }: StepperStepContentProps) => {
  const ctx = useStepperStepContext();

  return (
    <BoxDerived
      {...rest}
      className={clsx(prefix('__content'), className)}
      data-step-status={ctx.status}
    >
      {render ? render(ctx) : children}
    </BoxDerived>
  );
};

StepperStepContent.displayName = 'StepperStepContent';

Stepper.Content = StepperStepContent;

//----------------------------------------------------------------
// StepperStepTitle
//----------------------------------------------------------------

type StepperStepTitleProps = {} & BoxDerivedProps & ComponentProps<'span'>;

const StepperStepTitle = ({
  children,
  className,
  lh = 1.4,
  fs = '.875rem',
  ...rest
}: StepperStepTitleProps) => {
  const { status } = useStepperStepContext();

  return (
    <BoxDerived
      as="span"
      {...rest}
      lh={lh}
      fs={fs}
      className={clsx(prefix('__title'), className)}
      data-step-status={status}
    >
      {children}
    </BoxDerived>
  );
};

StepperStepTitle.displayName = 'StepperStepTitle';

Stepper.Title = StepperStepTitle;

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
  StepperLastShownStep,
};
