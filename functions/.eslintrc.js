module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "google",
    ],
    rules: {
        "quotes": ["error", "double"],
        "indent": ["error", 4],
        "max-len": ["error", 300],
        "require-jsdoc": 0,
    },
    parser: "@babel/eslint-parser",
    parserOptions: {
        requireConfigFile: false,
        sourceType: "module",
        ecmaVersion: 8,
    },
};
