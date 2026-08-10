module.exports = {
    root: true,

    env: {
        browser: true,
        es6: true,
        node: true,
    },

    // Lets ESLint understand .vue single-file components.
    parser: 'vue-eslint-parser',

    parserOptions: {
        parser: 'babel-eslint',
        ecmaVersion: 2018,
        sourceType: 'module',
    },

    extends: [
        'eslint:recommended',
        'plugin:vue/recommended',
    ],

    globals: {
        // Registered on window in resources/js/bootstrap.js and vueStore.js
        // rather than imported, so ESLint needs to be told they exist.
        Vue: 'readonly',
        axios: 'readonly',
        _: 'readonly',
        depot: 'readonly',
        sorter: 'readonly',
        TweenMax: 'readonly',
        TimelineMax: 'readonly',
        // GSAP 2 registers its easing objects globally when TweenMax loads.
        Power1: 'readonly',
        Power2: 'readonly',
        Power3: 'readonly',
        Power4: 'readonly',
        Sine: 'readonly',
        Back: 'readonly',
        Elastic: 'readonly',
        Bounce: 'readonly',
        Expo: 'readonly',
        Circ: 'readonly',
    },

    rules: {
        // The project's original style used an 8-space step, which pushed
        // deeply nested templates far off to the right. Two spaces is the Vue
        // style guide default and keeps nesting readable.
        indent: ['error', 2, { SwitchCase: 1 }],
        'vue/html-indent': ['error', 2],
        'vue/script-indent': ['error', 2, { baseIndent: 1 }],

        // Leftover debug statements are tracked as a Phase 4 cleanup item;
        // warn rather than error so linting stays green until they are gone.
        'no-console': 'warn',

        // This is a retro-OS portfolio, not a component library: single-word
        // component names like Home and OS are intentional.
        'vue/multi-word-component-names': 'off',

        // Template formatting is largely a matter of taste here, and the
        // defaults would rewrite nearly every element in the project.
        'vue/max-attributes-per-line': 'off',
        'vue/singleline-html-element-content-newline': 'off',
        'vue/multiline-html-element-content-newline': 'off',
    },

    overrides: [
        {
            // script blocks inside .vue files carry one extra level of
            // indentation from the surrounding <script> tag.
            files: ['*.vue'],
            rules: {
                indent: 'off',
            },
        },
    ],
};
