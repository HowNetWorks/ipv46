module.exports = {
    "extends": [
        "eslint:recommended"
    ],
    "parserOptions": {
        "sourceType": "module",
        "ecmaVersion": 2015
    },
    "rules": {
        // Stylistic Issues
        "indent": ["error", 4],
        "linebreak-style": ["error", "unix"],
        "quotes": ["error", "double"],
        "semi": ["error", "always"],
        "no-trailing-spaces": "error",
        "eol-last": "error",
        "no-multiple-empty-lines": ["error", {"max": 1, "maxBOF": 0}],

        // Possible Errors
        "no-unsafe-negation": "error",

        // Best Practices
        "no-multi-spaces": "error",

        // ECMAScript 6
        "no-var": "error",
        "prefer-const": "error"
    }
};
