import React, { CSSProperties, forwardRef } from 'react';
import { AliasBox, AliasProps } from './AliasBox';
import { createPolymorphic } from '../../types/polymorphic';

type Size = number | string;
type Radius = CSSProperties['borderRadius'];

export type DerivedProps = {
    // transform
    tx?: string; // translateX
    ty?: string; // translateY
    scale?: string;
    scaleX?: string;
    scaleY?: string;
    rotate?: Size;
    flip?: boolean;
    flipX?: boolean;
    flipY?: boolean;

    // rounded
    roundedTop?: Radius;
    roundedBottom?: Radius;
    roundedLeft?: Radius;
    roundedRight?: Radius;

    // transition
    transD?: string; // duration
    transE?: string; // easing
    transP?: string; // property

    // grid
    grid?: boolean | Size;
    col?: Size;
    size?: Size;

    origin?: string;
    inset?: Size;

    center?: boolean;
    centerX?: boolean;
    centerY?: boolean;
    fill?: boolean;
    scrollY?: boolean;
    scrollX?: boolean;
    clickable?: boolean;
} & AliasProps;

type DerivedBoxProps = DerivedProps;

type ImplProps = DerivedProps & {
    children?: React.ReactNode;
    className?: string;
} & React.HTMLAttributes<HTMLElement>;

type DerivedEntry = [keyof AliasProps, AliasProps[keyof AliasProps]];

const DerivedBoxImpl = (
    {
        className,
        tx,
        ty,
        scale,
        scaleX,
        scaleY,
        rotate,
        flip,
        flipX,
        flipY,

        roundedTop,
        roundedBottom,
        roundedLeft,
        roundedRight,

        transD,
        transE,
        transP,
        grid,
        col,
        size,
        origin,
        inset,
        center,
        centerX,
        centerY,
        fill,
        scrollY,
        scrollX,
        clickable,
        ...rest
    }: ImplProps,
    ref: React.Ref<any>,
) => {
    // const derivedProps: Array<[keyof AliasProps, any]> = [];
    const derivedProps: DerivedEntry[] = [];

    // Rounded
    if (roundedTop != null) {
        derivedProps.push(['roundedTopLeft', roundedTop], ['roundedTopRight', roundedTop]);
    }
    if (roundedBottom != null) {
        derivedProps.push(
            ['roundedBottomLeft', roundedBottom],
            ['roundedBottomRight', roundedBottom],
        );
    }
    if (roundedLeft != null) {
        derivedProps.push(['roundedTopLeft', roundedLeft], ['roundedBottomLeft', roundedLeft]);
    }
    if (roundedRight != null) {
        derivedProps.push(['roundedTopRight', roundedRight], ['roundedBottomRight', roundedRight]);
    }

    if (grid) {
        const finalGrid = grid === true ? 12 : grid;

        if (rest.display == null && rest.d == null) {
            derivedProps.push(['display', 'grid']);
        }

        if (rest.gridTemplateColumns == null) {
            const value =
                typeof finalGrid === 'number' ? `repeat(${finalGrid}, minmax(0, 1fr))` : finalGrid;

            derivedProps.push(['gridTemplateColumns', value]);
        }
    }

    if (col != null && rest.gridCol == null && rest.gridColumn == null) {
        derivedProps.push(['gridCol', `span ${col}`]);
    }

    if (size != null && rest.width == null && rest.height == null) {
        derivedProps.push(['width', size as Size], ['height', size as Size]);
    }

    if (rest.transform == null) {
        const transforms: string[] = [];

        if (tx != null) transforms.push(`translateX(${tx})`);
        if (ty != null) transforms.push(`translateY(${ty})`);

        if (scale != null) transforms.push(`scale(${scale})`);

        const finalFlipX = flipX ?? flip;
        const finalFlipY = flipY ?? flip;

        // scaleX / flipX / flip
        if (scaleX != null) {
            transforms.push(`scaleX(${scaleX})`);
        } else if (finalFlipX) {
            transforms.push(`scaleX(-1)`);
        }

        // scaleY / flipY / flip
        if (scaleY != null) {
            transforms.push(`scaleY(${scaleY})`);
        } else if (finalFlipY) {
            transforms.push(`scaleY(-1)`);
        }

        if (rotate != null) {
            const value =
                typeof rotate === 'string' && /[a-z%]+$/i.test(rotate) ? rotate : `${rotate}deg`;

            transforms.push(`rotate(${value})`);
        }

        if (transforms.length > 0) {
            derivedProps.push(['transform', transforms.join(' ')]);
        }
    }

    if (rest.transition == null) {
        const transitionParts: string[] = [];

        if (transD != null) transitionParts.push(transD as string);
        if (transE != null) transitionParts.push(transE as string);

        if (transitionParts.length > 0) {
            const property = transP ?? 'all';
            derivedProps.push(['transition', `${property} ${transitionParts.join(' ')}`]);
        }
    }

    if (origin != null && rest.transformOrigin == null) {
        derivedProps.push(['transformOrigin', origin as string]);
    }

    if (fill && rest.position == null && rest.pos == null) {
        derivedProps.push(['position', 'absolute']);
    }

    const finalInset = inset ?? (fill ? 0 : undefined);
    if (finalInset != null) {
        const castInset = finalInset as Size;
        if (rest.top == null && rest.t == null) derivedProps.push(['top', castInset]);
        if (rest.right == null && rest.r == null) derivedProps.push(['right', castInset]);
        if (rest.bottom == null && rest.b == null) derivedProps.push(['bottom', castInset]);
        if (rest.left == null && rest.l == null) derivedProps.push(['left', castInset]);
    }

    const finalCenterX = center || centerX;
    const finalCenterY = center || centerY;

    if (finalCenterX || finalCenterY) {
        // ensure flex only if not already set
        if (rest.display == null && rest.d == null) {
            derivedProps.push(['display', 'flex']);
        }

        if (finalCenterX) {
            if (rest.justifyContent == null && rest.justify == null) {
                derivedProps.push(['justifyContent', 'center']);
            }
        }

        if (finalCenterY) {
            if (rest.alignItems == null && rest.align == null) {
                derivedProps.push(['alignItems', 'center']);
            }
        }
    }

    if (scrollY) {
        if (
            rest.overflow == null &&
            rest.ov == null &&
            rest.overflowY == null &&
            rest.ovY == null
        ) {
            derivedProps.push(['overflowY', 'auto']);
        }
    }

    if (scrollX) {
        if (
            rest.overflow == null &&
            rest.ov == null &&
            rest.overflowX == null &&
            rest.ovX == null
        ) {
            derivedProps.push(['overflowX', 'auto']);
        }
    }

    if (clickable) {
        if (rest.cursor == null) {
            derivedProps.push(['cursor', 'pointer']);
        }
    }

    const restProps = {
        ...rest,
        ...Object.fromEntries(derivedProps),
    } as AliasProps;

    return <AliasBox ref={ref} {...restProps} className={className} />;
};

export const DerivedBox = createPolymorphic<DerivedBoxProps, 'div'>(
    forwardRef(DerivedBoxImpl),
    'DerivedBox',
);
