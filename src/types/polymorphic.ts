import React from 'react';

// type PolymorphicRef<C extends React.ElementType> = React.ComponentPropsWithRef<C>['ref'];
//
// type PolymorphicProps<C extends React.ElementType, Props> = Props & {
//     as?: C;
// } & Omit<React.ComponentPropsWithRef<C>, keyof Props | 'as'>;
//
// export type PolymorphicComponent<Props, Default extends React.ElementType = 'div'> = {
//     <C extends React.ElementType = Default>(
//         props: PolymorphicProps<C, Props> & {
//             ref?: PolymorphicRef<C>;
//         },
//     ): React.ReactElement | null;
//
//     displayName?: string;
// };
//
// export function createPolymorphic<Props, Default extends React.ElementType = 'div'>(
//     component: React.ForwardRefExoticComponent<
//         React.PropsWithoutRef<Props> & React.RefAttributes<any>
//     >,
//     displayName?: string,
// ) {
//     const result = component as unknown as PolymorphicComponent<Props, Default>;
//
//     (result as any).displayName = displayName ?? component.displayName ?? component.name;
//
//     return result;
// }

/**
 * Polymorphic props with ref support
 */
export type PolymorphicProps<C extends React.ElementType, Props> = Props & {
    as?: C;
} & Omit<React.ComponentPropsWithRef<C>, keyof Props | 'as'>;

/**
 * Polymorphic component type with ref
 */
export type PolymorphicComponent<Props, Default extends React.ElementType = 'div'> = {
    <C extends React.ElementType = Default>(
        props: PolymorphicProps<C, Props> & {
            ref?: React.ComponentPropsWithRef<C>['ref'];
        },
    ): React.ReactElement | null;

    displayName?: string;
};

/**
 * Factory
 */
export function createPolymorphic<Props, Default extends React.ElementType = 'div'>(
    component: React.ForwardRefExoticComponent<any> & {
        displayName?: string;
    },
    // component: React.ForwardRefExoticComponent<any> & {
    //     displayName?: string;
    // },
    displayName?: string,
) {
    const result = component as unknown as PolymorphicComponent<Props, Default>;

    (result as any).displayName = displayName ?? component.displayName ?? component.name;

    return result;
}
