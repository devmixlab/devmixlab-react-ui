import React, {
    forwardRef,
    useState,
    useRef,
    useImperativeHandle,
    useCallback,
    HTMLAttributes,
    CSSProperties,
} from 'react';
import { createPolymorphic, PolymorphicProps } from '../../types/polymorphic';
import { Box } from '../Box';
import type { BoxProps } from '../Box';
import clsx from 'clsx';
import { Info, Warning, Success, Close } from '../../Icon';
import { classPrefix } from '../../utils/classPrefix';
import { TextProps, Text } from '../Text';
import { usePresence } from '../../hooks';

//-----------------------------------------------------------
// Types
//-----------------------------------------------------------

// interface AlertRef {
//     runAttention(attention?: AlertAttention): void;
// }

const alertAttentions = [
    'shake',
    'pulse',
    'bounce',
    'wiggle',
    'flash',
    'heartbeat',
    'jello',
    'rubber-band',
    'swing',
    'tada',
] as const;

type AlertAttention = (typeof alertAttentions)[number];

type AlertRef = {
    runAttention: (attention?: AlertAttention) => void;
};

const attentionDurations: Record<AlertAttention, number> = {
    shake: 500,
    pulse: 500,
    bounce: 500,
    wiggle: 500,
    flash: 500,
    heartbeat: 700,
    jello: 700,
    'rubber-band': 700,
    swing: 700,
    tada: 800,
};

const alertAnimations = [
    'none',
    'fade',
    'slide-down',
    'slide-up',
    'slide-left',
    'slide-right',
    'scale',
    'scale-fade',
    'collapse',
] as const;

type AlertAnimation = (typeof alertAnimations)[number];

const alertIntents = ['primary', 'secondary', 'success', 'warning', 'danger', 'info'] as const;

type SemanticAlertIntent = (typeof alertIntents)[number];

type AlertIntent = SemanticAlertIntent | (string & {});

const alertVariants = ['solid', 'outlined', 'subtle'] as const;

type AlertVariant = (typeof alertVariants)[number] | (string & {});

const alertSizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

type AlertSize = (typeof alertSizes)[number];

const alertAccents = ['left', 'top'] as const;

type AlertAccent = (typeof alertAccents)[number];

type OwnAlertProps = {
    intent?: AlertIntent;
    variant?: AlertVariant;
    size?: AlertSize;
    icon?: boolean | React.ReactNode;

    accent?: AlertAccent;

    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;

    animation?: AlertAnimation;
    attention?: AlertAttention;
    attentionExit?: AlertAnimation;

    /**
     * Duration (ms) of the enter animations.
     * @default 200
     */
    animationEnterDuration?: number;
    /**
     * Duration (ms) of the exit animations.
     * The modal stays mounted for this long after `opened` becomes false so the
     * exit animation can finish before the DOM node is removed.
     * @default 200
     */
    animationExitDuration?: number;

    enterAnimationEasing?: string;
    exitAnimationEasing?: string;

    /** Called when the modal has fully entered (animation complete). */
    onAnimationEntered?: () => void;
    /** Called when the modal has fully exited (animation complete, just before unmount). */
    onAnimationExited?: () => void;

    onMount?: () => void;
    onUnmount?: () => void;

    onDismiss?: () => void;
};

type AlertProps = OwnAlertProps & Omit<BoxProps, 'size'>;

type ImplAlertProps = PolymorphicProps<'div', AlertProps>;

type AlertComponent = ReturnType<typeof createPolymorphic<AlertProps, 'div'>> & {
    Title: typeof AlertTitle;
    Description: typeof AlertDescription;
    Actions: typeof AlertActions;
};

//-----------------------------------------------------------
// Helpers
//-----------------------------------------------------------
export const prefix = (name: string = '') => {
    return classPrefix(`--alert${name}`);
};

//-----------------------------------------------------------
// Icons Map
//-----------------------------------------------------------

const defaultIcons: Record<SemanticAlertIntent, React.ReactNode> = {
    primary: null,
    secondary: null,
    success: <Success />,
    warning: <Warning />,
    danger: <Warning />,
    info: <Info />,
};

const DEFAULT_ENTER_DURATION = 120;

//-----------------------------------------------------------
// Implementation of component
//-----------------------------------------------------------
const AlertImpl = (
    {
        children,
        className,
        style,

        intent = 'danger',
        variant = 'solid',
        size = 'md',

        rounded = 'md',

        accent,

        icon,

        open,
        defaultOpen = true,
        onOpenChange,
        onDismiss,

        animation = 'scale-fade',
        attention,
        attentionExit,

        animationEnterDuration: animationEnterDurationProp,
        animationExitDuration = 120,
        enterAnimationEasing = 'cubic-bezier(0.4, 0, 0.2, 1)',
        exitAnimationEasing = 'cubic-bezier(0.4, 0, 1, 1)',

        onAnimationEntered,
        onAnimationExited,

        onMount,
        onUnmount,

        ...rest
    }: ImplAlertProps,
    // ref: React.Ref<any>,
    ref: React.Ref<AlertRef>,
) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const [internalOpen, setInternalOpen] = useState(defaultOpen);

    const [runningAttention, setRunningAttention] = useState<AlertAttention | undefined>();

    const isControlled = open !== undefined;
    const visible = isControlled ? open : internalOpen;

    const isDismissible = onDismiss !== undefined || onOpenChange !== undefined || !isControlled;

    const defaultEnterDuration = attention ? attentionDurations[attention] : DEFAULT_ENTER_DURATION;

    const animationEnterDuration = animationEnterDurationProp ?? defaultEnterDuration;

    useImperativeHandle(
        ref,
        () => ({
            runAttention(nextAttention) {
                const resolvedAttention = nextAttention ?? attention;

                if (!resolvedAttention) {
                    return;
                }

                setRunningAttention(undefined);

                requestAnimationFrame(() => {
                    setRunningAttention(resolvedAttention);
                });
            },
        }),
        [attention],
    );

    const resolvedIcon =
        icon === true
            ? (defaultIcons[intent as keyof typeof defaultIcons] ?? null)
            : (icon ?? null);

    const handleDismiss = () => {
        if (!isControlled) {
            setInternalOpen(false);
        }

        onOpenChange?.(false);
        onDismiss?.();
    };

    const { isMounted, state: animationState } = usePresence({
        present: visible,
        enterDuration: animation === 'none' ? 0 : animationEnterDuration,
        exitDuration: animation === 'none' ? 0 : animationExitDuration,
        onEntered: onAnimationEntered,
        onExited: onAnimationExited,
        onMount,
        onUnmount,
    });

    if (!isMounted) {
        return null;
    }

    return (
        <Box
            {...rest}
            ref={rootRef}
            className={clsx(prefix(), className)}
            rounded={rounded}
            data-intent={intent}
            data-variant={variant}
            data-size={size}
            data-accent={accent ?? undefined}
            data-has-icon={!!resolvedIcon || undefined}
            data-animation={animation && !attention ? animation : undefined}
            data-attention={attention ?? undefined}
            data-attention-exit={attentionExit ?? undefined}
            data-running-attention={runningAttention}
            data-animation-state={animationState}
            style={
                {
                    ...style,
                    '--animation-enter-duration': `${animationEnterDuration}ms`,
                    '--animation-exit-duration': `${animationExitDuration}ms`,
                    '--animation-enter-easing': enterAnimationEasing,
                    '--animation-exit-easing': exitAnimationEasing,

                    '--running-attention-duration': runningAttention
                        ? `${attentionDurations[runningAttention]}ms`
                        : undefined,
                } as CSSProperties
            }
            onAnimationEnd={(e) => {
                // console.log('animation finished');
                if (!e.animationName.startsWith('alert-')) {
                    return;
                }

                if (runningAttention) {
                    setRunningAttention(undefined);
                }
            }}
        >
            {resolvedIcon != null && <Box className={prefix('__icon')}>{resolvedIcon}</Box>}

            <Box className={prefix('__content')}>{children}</Box>

            {isDismissible && (
                <Box className={prefix('__dismiss')}>
                    <Box
                        as="button"
                        type="button"
                        className={prefix('__dismiss-button')}
                        onClick={handleDismiss}
                    >
                        <Close />
                    </Box>
                </Box>
            )}
        </Box>
    );
};

//-----------------------------------------------------------
// AlertTitle component
//-----------------------------------------------------------
type AlertTitleProps = TextProps & HTMLAttributes<HTMLDivElement>;
const AlertTitle = ({ className, ...rest }: AlertTitleProps) => (
    // <Box {...rest} className={clsx(prefix('__title'), className)} />
    <Text
        {...rest}
        variant="body-md"
        emphasis="strong"
        className={clsx(prefix('__title'), className)}
    />
);

//-----------------------------------------------------------
// AlertDescription component
//-----------------------------------------------------------
type AlertDescriptionProps = TextProps & HTMLAttributes<HTMLDivElement>;
const AlertDescription = ({ className, ...rest }: AlertDescriptionProps) => (
    <Text
        {...rest}
        variant="body-sm"
        emphasis="muted"
        className={clsx(prefix('__description'), className)}
    />
);

//-----------------------------------------------------------
// AlertActions component
//-----------------------------------------------------------
type AlertActionsProps = {} & BoxProps & HTMLAttributes<HTMLDivElement>;
const AlertActions = ({ className, ...rest }: AlertActionsProps) => (
    <Box {...rest} className={clsx(prefix('__actions'), className)} />
);

//-----------------------------------------------------------
// Polymorphic component
//-----------------------------------------------------------
const Alert = createPolymorphic<AlertProps, 'div'>(
    forwardRef(AlertImpl),
    'Alert',
) as AlertComponent;

Alert.Title = AlertTitle;
Alert.Description = AlertDescription;
Alert.Actions = AlertActions;

export { Alert };

export type {
    AlertRef,
    SemanticAlertIntent,
    AlertAnimation,
    AlertAttention,
    AlertIntent,
    AlertVariant,
    AlertSize,
    AlertAccent,
    OwnAlertProps,
    AlertProps,
};

export { alertAttentions, alertAnimations, alertIntents, alertVariants, alertSizes, alertAccents };
