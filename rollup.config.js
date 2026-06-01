import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'index.ts',
    output: [
        {
            file: 'dist/index.esm.js',
            format: 'es',
            sourcemap: true,
        },
        // {
        //     file: 'dist/index.cjs.js',
        //     format: 'cjs',
        //     sourcemap: true,
        //     exports: 'named',
        // },
    ],
    external: ['react', 'react-dom', '@headlessui/react', 'clsx'],
    plugins: [
        resolve({
            extensions: ['.js', '.ts', '.tsx'],
            browser: true,
            mainFields: ['module', 'main'], // ensures ESM entry points are preferred
        }),
        commonjs(),
        typescript({ tsconfig: './tsconfig.json' }),
        postcss({
            extensions: ['.scss', '.css'],
            inject: true,
            // extract: 'dist/index.css', // generates a CSS file
            minimize: false,
            sourceMap: true,
        }),
    ],
};
