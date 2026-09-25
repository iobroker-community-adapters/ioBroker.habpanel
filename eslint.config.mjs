import config from '@iobroker/eslint-config';

export default [
    ...config,
    {
        languageOptions: {
            parserOptions: {
                allowDefaultProject: {
                    allow: ['*.js', '*.mjs'],
                },
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        // disable temporary the rule 'jsdoc/require-param' and enable 'jsdoc/require-jsdoc'
        rules: {
            'jsdoc/require-jsdoc': 'off',
            'jsdoc/require-param': 'off',
        },
    },
    {
        ignores: [
            'build/**/*',
            'lib/**/*',
            'admin/**/*',
            'test/**/*',
            'src-editor/**/*',
            'src-chart/**/*',
            'src-preview/**/*',
            'src-widgets/**/*',
            // Like the other sub-apps: has its own build, no lint script of its own. Without
            // this the root lint also parses src-devices/build/ (multi-MB generated bundles),
            // which hangs the run and overflows the formatter (RangeError: Invalid string length).
            'src-devices/**/*',
            'widgets/**/*',
            'node_modules/**/*',
            'eslint.config.mjs',
            'prettier.config.mjs',
            '*.js',
            'www/**/*',
            'bower_components/**/*',
            // The AngularJS app: ES5, CRLF, never formatted with prettier. Linting it emits
            // so many findings that the stylish formatter dies on its own output. Bringing it
            // under the shared config is its own task.
            'src/**/*',
        ],
    },
];
