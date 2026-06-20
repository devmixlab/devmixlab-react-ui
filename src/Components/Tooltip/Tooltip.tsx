import React, { forwardRef, useState } from 'react';
import { Popover } from '../Popover';
import type { Placement } from '@floating-ui/react';
import { mergeRefs } from '../../utils/mergeRefs';
import { Box, BoxProps } from '../Box';

export type TooltipDensity = 'sm' | 'md' | 'lg';

type TooltipDensityStyles = {
    px: string;
    py: string;
};

export type TooltipProps = {
    children: React.ReactElement;
    content: React.ReactNode;
    disabled?: boolean;
    placement?: Placement;
    openDelay?: number;
    closeDelay?: number;
    offset?: number;
    multiline?: boolean;
    maxLines?: number;

    shadow?: BoxProps['shadow'];
    rounded?: BoxProps['rounded'];
    maxWidth?: BoxProps['maxWidth'];
    maxW?: BoxProps['maxW'];

    density?: TooltipDensity;
};

const centeredArrowPlacements = ['top', 'bottom', 'left', 'right'] as const;

const densityMap: Record<TooltipDensity, TooltipDensityStyles> = {
    sm: { px: 'sm', py: 'xs' },
    md: { px: 'md', py: 'sm' },
    lg: { px: 'lg', py: 'md' },
};

export const Tooltip = forwardRef<HTMLElement, TooltipProps>(
    (
        {
            children,
            content,
            disabled = false,
            placement = 'top',
            openDelay = 500,
            closeDelay = 0,
            offset = 8,
            density = 'md',
            multiline = true,
            maxLines,

            shadow = 'sm',
            rounded = 'sm',
            maxWidth,
            maxW,
        },
        ref,
    ) => {
        const [resolvedPlacement, setResolvedPlacement] = useState<Placement>(placement);

        const isCentered = centeredArrowPlacements.includes(
            resolvedPlacement as (typeof centeredArrowPlacements)[number],
        );

        const { px, py } = densityMap[density];

        const isOverflowHidden = (multiline && maxLines != null) || !multiline;

        if (disabled) {
            return children;
        }

        return (
            <Popover
                onPlacementChange={setResolvedPlacement}
                trigger="hover"
                interactive={false}
                placement={placement}
                openDelay={openDelay}
                closeDelay={closeDelay}
                offset={offset}
                arrow
                arrowSize={10}
                arrowInset={!isCentered ? 12 : undefined}
                arrowCenter={isCentered ? true : undefined}
            >
                <Popover.Trigger
                    render={({ triggerProps }) =>
                        React.cloneElement(children, {
                            ...triggerProps,
                            ref: mergeRefs(triggerProps.ref, ref, (children as any).ref),
                        })
                    }
                />

                <Popover.Panel role="tooltip" shadow={shadow} rounded={rounded}>
                    <Box
                        rounded={rounded}
                        py={py}
                        px={px}
                        maxWidth={maxWidth}
                        maxW={maxW}
                        textOverflow={multiline ? undefined : 'ellipsis'}
                        lineClamp={multiline ? maxLines : undefined}
                        overflow={isOverflowHidden ? 'hidden' : undefined}
                        whiteSpace={multiline ? 'normal' : 'nowrap'}
                    >
                        {content}
                    </Box>
                </Popover.Panel>
            </Popover>
        );
    },
);

Tooltip.displayName = 'Tooltip';
