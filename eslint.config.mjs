import antfu from '@antfu/eslint-config';
import tailwindcss from 'eslint-plugin-tailwindcss';

const tailwindcssRecommended = tailwindcss.configs.recommended;

export default antfu({
  stylistic: false,
  vue: true,
  formatters: {
    css: 'prettier',
    html: 'prettier',
    markdown: 'prettier',
  },
  typescript: {
    tsconfigPath: 'tsconfig.app.json',
  },
  settings: {
    tailwindcss: {
      cssConfigPath: 'src/index.css',
      functions: ['clsx', 'classnames', 'cx', 'cn', 'cva'],
    },
  },
  plugins: {
    ...tailwindcssRecommended.plugins,
  },
  rules: {
    'tailwindcss/classnames-order': 'warn',
    'tailwindcss/enforces-negative-arbitrary-values': 'warn',
    'tailwindcss/enforces-shorthand': 'warn',
    'tailwindcss/no-arbitrary-value': 'off',
    'tailwindcss/no-custom-classname': 'off',
    'tailwindcss/no-contradicting-classname': 'error',
    'tailwindcss/no-unnecessary-arbitrary-value': 'warn',
    'antfu/curly': 'off',
    curly: ['error', 'all'],
  },
});
