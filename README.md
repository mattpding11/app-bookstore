# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.


## Run tests


 ✓ src/store/catalogSlice.test.ts (7 tests) 31ms
 ✓ src/store/cartSlice.test.ts (11 tests) 89ms
 ✓ src/utils/secureStorage.test.ts (5 tests) 31ms
 ✓ src/components/ProductList.test.tsx (6 tests) 663ms

 Test Files  4 passed (4)
      Tests  29 passed (29)
   Start at  13:22:32
   Duration  6.83s (environment 72%, setup 14%, tests 4%, transform 4%, import 3%, worker 2%)

 % Coverage report from v8
----------------------------|---------|----------|---------|---------|-------------------
File                        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------------------|---------|----------|---------|---------|-------------------
All files                   |   25.99 |     9.13 |      32 |   26.55 |
 src                        |       0 |      100 |       0 |       0 |
  App.tsx                   |       0 |      100 |       0 |       0 | 8
 src/components             |    9.03 |     9.37 |   20.51 |    9.09 |
  Modal.tsx                 |       0 |        0 |       0 |       0 | 5-10
  PaymentModal.tsx          |       0 |        0 |       0 |       0 | 19-413
  ProductDetail.tsx         |       0 |        0 |       0 |       0 | 19-176
  ProductList.tsx           |     100 |      100 |     100 |     100 |
 src/pages                  |       0 |        0 |       0 |       0 |
  SummaryPage.tsx           |       0 |        0 |       0 |       0 | 8-68
 src/services               |       0 |        0 |       0 |       0 |
  api.ts                    |       0 |        0 |       0 |       0 | 43-69
  purchaseSummaryStorage.ts |       0 |        0 |       0 |       0 | 4-35
  wompi.ts                  |       0 |        0 |       0 |       0 | 1-46
 src/store                  |   55.55 |     37.5 |   47.22 |   62.66 |
  cartSelectors.ts          |       0 |      100 |       0 |       0 | 4-10
  cartSlice.ts              |     100 |      100 |     100 |     100 |
  catalogSelectors.ts       |      60 |      100 |   33.33 |      80 | 10
  catalogSlice.ts           |     100 |       50 |     100 |     100 | 40
  hooks.ts                  |     100 |      100 |     100 |     100 |
  store.ts                  |       0 |        0 |       0 |       0 | 6-28
  transactionSelectors.ts   |       0 |      100 |       0 |       0 | 4-6
  transactionSlice.ts       |   41.17 |        0 |   16.66 |   41.17 | 27,36-38,44-53
 src/utils                  |   77.77 |        0 |    87.5 |   76.92 |
  cardBrand.ts              |       0 |        0 |       0 |       0 | 5-15
  secureStorage.ts          |     100 |      100 |     100 |     100 |
----------------------------|---------|----------|---------|---------|-------------------
ERROR: Coverage for lines (26.55%) does not meet global threshold (80%)
ERROR: Coverage for functions (32%) does not meet global threshold (80%)
ERROR: Coverage for statements (25.99%) does not meet global threshold (80%)
ERROR: Coverage for branches (9.13%) does not meet global threshold (80%)
[ELIFECYCLE] Command failed with exit code 1.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
