import React, { forwardRef, useState } from 'react';
import { Popover } from '../Popover';
import type { Placement } from '@floating-ui/react';
import { mergeRefs } from '../../utils/mergeRefs';

export type TooltipProps = {
    children: React.ReactElement;
    content: React.ReactNode;
    disabled?: boolean;
    placement?: Placement;
    openDelay?: number;
    closeDelay?: number;
    offset?: number;

    arrow?: boolean;
    arrowSize?: number;
    arrowInset?: number | string;
    arrowShift?: number | string;
    arrowCenter?: boolean;
};

const centeredArrowPlacements = ['top', 'bottom', 'left', 'right'] as const;

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

            // Arrow props
            // arrow = true,
            // arrowSize,
            // arrowInset,
            // arrowShift,
            // arrowCenter = true,
        },
        ref,
    ) => {
        const [resolvedPlacement, setResolvedPlacement] = useState<Placement>(placement);

        if (disabled) {
            return children;
        }

        const isCentered = centeredArrowPlacements.includes(
            resolvedPlacement as (typeof centeredArrowPlacements)[number],
        );

        return (
            <Popover
                onPlacementChange={setResolvedPlacement}
                trigger="hover"
                placement={placement}
                openDelay={openDelay}
                closeDelay={closeDelay}
                offset={offset}
                arrow
                arrowSize={10}
                arrowInset={!isCentered ? 12 : undefined}
                // arrowShift={arrowShift}
                arrowCenter={isCentered ? true : undefined}
                // arrowInset="50%"
                // arrowShift="-50%"
                onOpenChange={() => {
                    console.log(434343);
                }}
            >
                {/*<Popover.Trigger*/}
                {/*    render={({ triggerProps }) =>*/}
                {/*        React.cloneElement(children, {*/}
                {/*            ...triggerProps,*/}
                {/*            ref,*/}
                {/*        })*/}
                {/*    }*/}
                {/*/>*/}

                <Popover.Trigger
                    render={({ triggerProps }) =>
                        React.cloneElement(children, {
                            ...triggerProps,
                            ref: mergeRefs(triggerProps.ref, ref, (children as any).ref),
                        })
                    }
                />

                <Popover.Panel role="tooltip" shadow="sm" rounded="sm" py="xs" px="sm">
                    {content} asdf asd
                </Popover.Panel>
            </Popover>
        );
    },
);

Tooltip.displayName = 'Tooltip';
