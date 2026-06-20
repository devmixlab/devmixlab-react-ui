import React, { forwardRef } from 'react';
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
};

export const Tooltip = forwardRef<HTMLElement, TooltipProps>(
    (
        { children, content, disabled = false, placement = 'top', openDelay = 500, closeDelay = 0 },
        ref,
    ) => {
        if (disabled) {
            return children;
        }

        return (
            <Popover
                trigger="hover"
                placement={placement}
                openDelay={openDelay}
                closeDelay={closeDelay}
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

                <Popover.Panel role="tooltip" shadow="sm" rounded="sm" padding="xs">
                    {content} asdf asd
                </Popover.Panel>
            </Popover>
        );
    },
);

Tooltip.displayName = 'Tooltip';
