module.exports = {
  // 学习注释：ESLint 负责检查代码风格和潜在问题；这里使用 TypeScript 解析器。
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // 指向 tsconfig.json，让 ESLint 能理解项目里的 TypeScript 配置。
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  // 插件提供 TypeScript 专属规则。
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    // 推荐规则 + Prettier 集成，避免格式化规则和 ESLint 互相打架。
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    // 后端运行在 Node 环境，测试运行在 Jest 环境。
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    // 这些规则在教学项目里放宽，降低初学阶段的类型标注负担。
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
