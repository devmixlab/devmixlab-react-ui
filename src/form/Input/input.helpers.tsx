// import { CLASS_PREFIX } from '../../constants';
// import React from 'react';
//
// export const prefix = (name: string = '') => {
//     return `${CLASS_PREFIX}--input${name}`;
// };
//
// export const renderGroupItem = (content: React.ReactNode) => (
//     <span className={prefix('__group-item')}>{content}</span>
// );
//
// export const getCount = (node: React.ReactNode): number => {
//     if (!node) return 0;
//
//     const children = React.Children.toArray(node);
//
//     return children.reduce<number>((acc, child) => {
//         if (React.isValidElement(child)) {
//             if (child.props?.children) {
//                 return acc + getCount(child.props.children);
//             }
//             return acc + 1;
//         }
//         return acc;
//     }, 0);
// };
