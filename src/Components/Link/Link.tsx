import { Box, BoxComponentProps, type BoxProps } from '../Box';
import { createRestrictedPolymorphic } from '../../types';
import React, { forwardRef } from 'react';
import { classPrefix } from '../../utils/classPrefix';
import { clsx } from 'clsx';

//------------------------------------------------------------
// Types
//------------------------------------------------------------

type LinkUnderline = 'always' | 'hover' | 'never';

type LinkBuiltinIntent = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

type LinkAs = 'a' | React.JSXElementConstructor<any>;

type OwnLinkProps = {
  className?: string;
  children?: React.ReactNode;

  intent?: LinkBuiltinIntent | (string & {});

  underline?: LinkUnderline;

  disabled?: boolean;
  external?: boolean;
};

type LinkPolymorphicProps<E extends React.ElementType = 'a'> = Omit<
  BoxComponentProps<E>,
  keyof OwnLinkProps
> &
  OwnLinkProps;

type LinkProps = Omit<BoxProps, keyof OwnLinkProps> & OwnLinkProps;

type ImplLinkProps = LinkProps & {
  as?: LinkAs;
} & Omit<React.ComponentProps<'a'>, keyof LinkProps>;

//------------------------------------------------------------
// Helpers
//------------------------------------------------------------

export const prefix = (name: string = '') => {
  return classPrefix(`--link${name}`);
};

//------------------------------------------------------------
// Link Implementation
//------------------------------------------------------------

const ImplLink = (
  {
    className,
    as = 'a',
    external,
    disabled,
    underline,
    intent = 'primary',
    target,
    rel,
    href,
    onClick,
    onKeyDown,
    ...rest
  }: ImplLinkProps,
  ref: React.Ref<any>,
) => {
  const finalRel = external
    ? [...new Set([...(rel?.split(' ') ?? []), 'noopener', 'noreferrer'])].join(' ')
    : rel;

  return (
    <Box
      {...rest}
      className={clsx(prefix(), className)}
      ref={ref}
      as={as}
      href={disabled ? undefined : href}
      onClick={
        disabled
          ? (e: React.MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              e.stopPropagation();
            }
          : onClick
      }
      onKeyDown={
        disabled
          ? (e: React.KeyboardEvent<HTMLAnchorElement>) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
              }
            }
          : onKeyDown
      }
      target={external ? (target ?? '_blank') : target}
      rel={finalRel}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      role={disabled ? 'link' : undefined}
      data-intent={intent}
      data-underline={underline}
      data-disabled={disabled || undefined}
    />
  );
};

//------------------------------------------------------------
// Link
//------------------------------------------------------------

const Link = createRestrictedPolymorphic<LinkProps, 'a', LinkAs>(forwardRef(ImplLink), 'Link');

//------------------------------------------------------------
// Exports
//------------------------------------------------------------

export { Link };

export type { OwnLinkProps, LinkProps, LinkPolymorphicProps, LinkBuiltinIntent, LinkUnderline };
