import React, { useState, ComponentProps, useEffect, CSSProperties } from 'react';
import { classPrefix } from '../../utils/classPrefix';
import { clsx } from 'clsx';
import { StepperContext, useStepperContext, StepperContextValue } from './StepperContext';
import {
  StepperStepContext,
  StepperStepContextValue,
  useStepperStepContext,
} from './StepperStepContext';
import { CheckIcon } from '../Icon';
import { BoxDerived, type BoxDerivedProps } from '../Box';

//----------------------------------------------------------------
// Types
//----------------------------------------------------------------

type StepperVariant = 'base' | (string & {});

type StepperStepProp = string | null;

type StepperStepRegister = {
  id: string;
  isComplete: boolean;
  isActive: boolean;
  hasBeenVisited: boolean;
  isClickable: boolean;
};

type OwnStepperProps = {
  allowFutureNavigation?: boolean;
  variant?: StepperVariant;
  activeStep: string;
  passedSteps?: Set<string>;
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
  activeStep,
  passedSteps,
}: StepperProps) => {
  const [steps, setSteps] = useState<StepperStepRegister[]>([]);

  const keepPassedSteps = passedSteps != null;

  const ctxValue: StepperContextValue = {
    passedSteps,
    keepPassedSteps,
    activeStep,
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
} & BoxDerivedProps &
  ComponentProps<'div'>;

const StepperStep = ({ className, children, id, onClick, ...rest }: StepperStepProps) => {
  const {
    passedSteps,
    activeStep,
    steps,
    setSteps,
    allowFutureNavigation,
    variant,
    keepPassedSteps,
  } = useStepperContext();

  const Element = onClick ? 'button' : 'div';
  const isOnClick = typeof onClick !== 'undefined';

  const activeStepIndex = steps.findIndex((itm) => itm.id === activeStep);
  const currentStepIndex = steps.findIndex((itm) => itm.id === id);

  const previousStep = currentStepIndex <= 0 ? undefined : steps[currentStepIndex - 1];
  const nextStep = currentStepIndex >= steps.length - 1 ? undefined : steps[currentStepIndex + 1];
  const currentStep = steps[currentStepIndex];

  const isActive = id === activeStep;
  const isComplete =
    (keepPassedSteps ? passedSteps?.has(id) : currentStepIndex < activeStepIndex) || false;

  // const isClickable =
  //     (onClick &&
  //         !isActive &&
  //         (isComplete || currentStep?.hasBeenVisited || (!isComplete && allowFutureNavigation))) ||
  //     false;

  const isClickable =
    (!isActive &&
      (isComplete || currentStep?.hasBeenVisited || (!isComplete && allowFutureNavigation))) ||
    false;

  // console.log(steps);

  useEffect(() => {
    setSteps((prev) => {
      if (prev.some((step) => step.id === id)) {
        return prev;
      }

      return [...prev, { id, isComplete, isActive, hasBeenVisited: isActive, isClickable }];
    });

    return () => {
      setSteps((prev) => prev.filter((step) => step.id !== id));
    };
  }, []);

  useEffect(() => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === id
          ? {
              ...step,
              isComplete,
              isActive,
              hasBeenVisited: step.hasBeenVisited || isActive,
              isClickable,
            }
          : step,
      ),
    );
  }, [isComplete, isActive, isClickable]);

  const stepCtxValue: StepperStepContextValue = {
    currentStep,
    previousStep,
    nextStep,
    activeStepIndex,
    currentStepIndex,
  };

  return (
    <StepperStepContext.Provider value={stepCtxValue}>
      <BoxDerived
        {...rest}
        as={Element}
        tabIndex={isClickable && onClick ? 0 : -1}
        className={clsx(prefix('__step'), className)}
        key={id}
        data-clickable={(isClickable && isOnClick) || undefined}
        aria-current={isActive ? 'step' : undefined}
        onClick={
          isClickable && isOnClick
            ? (e: React.MouseEvent<HTMLDivElement>) => {
                onClick?.(e);
              }
            : undefined
        }
      >
        {children}
      </BoxDerived>
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
  const { currentStep } = useStepperStepContext();

  return (
    <div className={prefix('__row')}>
      <BoxDerived
        px={gap}
        className={prefix('__bar')}
        data-step-complete={currentStep?.isComplete || undefined}
        data-step-active={currentStep?.isActive || undefined}
      >
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
  const { previousStep, nextStep, currentStep } = useStepperStepContext();

  const { keepPassedSteps } = useStepperContext();

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
        data-step-complete={currentStep?.isComplete || undefined}
        data-step-active={currentStep?.isActive || undefined}
        data-step-has-previous={previousStep ? true : undefined}
        data-step-previous-active={previousStep?.isActive || undefined}
        data-step-previous-complete={previousStep?.isComplete || undefined}
      >
        <div />
      </div>

      {children}

      <div
        className={clsx(prefix('__connector'), prefix('__connector-right'))}
        data-step-complete={currentStep?.isComplete || undefined}
        data-step-active={currentStep?.isActive || undefined}
        data-step-has-next={nextStep ? true : undefined}
        data-step-next-active={nextStep?.isActive || undefined}
        data-step-next-complete={nextStep?.isComplete || undefined}
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
  const { previousStep, nextStep, currentStepIndex, currentStep } = useStepperStepContext();

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
      data-step-active={currentStep?.isActive || undefined}
      data-step-complete={currentStep?.isComplete || undefined}
      data-icon-only={iconOnly || undefined}
    >
      {currentStep?.isComplete ? finalCompleteIndicator : finalIndicator}
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

  const { currentStep } = ctx;

  return (
    <BoxDerived
      {...rest}
      className={clsx(prefix('__content'), className)}
      data-step-active={currentStep?.isActive || undefined}
      data-step-complete={currentStep?.isComplete || undefined}
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
  const { currentStep } = useStepperStepContext();

  return (
    <BoxDerived
      as="span"
      {...rest}
      lh={lh}
      fs={fs}
      className={clsx(prefix('__title'), className)}
      data-step-active={currentStep?.isActive || undefined}
      data-step-complete={currentStep?.isComplete || undefined}
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

export type { StepperVariant, StepperStepProp, StepperStepRegister, OwnStepperProps, StepperProps };
