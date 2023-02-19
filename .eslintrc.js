module.exports = {
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser

    parserOptions: {
        ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features

        sourceType: 'module', // Allows for the use of imports
    },

    extends: [
        'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
        'prettier/@typescript-eslint', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
        'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    ],

    rules: {
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        // e.g. "@typescript-eslint/explicit-function-return-type": "off",
        'no-console': 0,
        'no-underscore-dangle': 0,
        'no-unused-vars': [
            'warn',
            {
                argsIgnorePattern: 'next',
            },
        ],
        'no-use-before-define': [
            'error',
            {
                variables: false,
            },
        ],
        'no-multi-str': 0,
        indent: [
            'warn',
            4,
            {
                SwitchCase: 1,
            },
        ],
        'comma-dangle': 'off',
        'object-curly-newline': 'off',
        'arrow-parens': 'off',
        'max-len': 'off',
        'function-paren-newline': 'off',
        '@typescript-eslint/no-this-alias': 'off',
    },
};
